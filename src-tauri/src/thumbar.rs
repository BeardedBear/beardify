// Windows thumbnail toolbar: prev / play-pause / next buttons under the
// taskbar window preview, implemented via ITaskbarList3 (Win32).
//
// Threading model
// ---------------
// ITaskbarList3 must be called from the thread that created the window (STA).
// `update_play_icon` is called from a Tauri command thread, so it posts
// WM_UPDATE_THUMBAR (WM_APP+1) to the HWND instead of touching the COM object
// directly. The WndProc picks it up on the window thread and calls
// ThumbBarUpdateButtons there.
//
// Icons
// -----
// Buttons ship without custom HICONs (tooltips identify them). To add real
// icons, populate `hIcon` in `build_buttons` and add `THB_ICON` to `dwMask`.

use std::sync::{Mutex, OnceLock};

use tauri::{AppHandle, Emitter, WebviewWindow};
use windows::core::w;
use windows::Win32::Foundation::{HWND, LPARAM, LRESULT, WPARAM};
use windows::Win32::System::Com::{
    CoCreateInstance, CoInitializeEx, CLSCTX_INPROC_SERVER, COINIT_APARTMENTTHREADED,
};
use windows::Win32::UI::Shell::{
    ITaskbarList3, TaskbarList, THBF_ENABLED, THB_FLAGS, THB_TOOLTIP, THUMBBUTTON,
};
use windows::Win32::UI::WindowsAndMessaging::{
    CallWindowProcW, PostMessageW, RegisterWindowMessageW, SetWindowLongPtrW, GWLP_WNDPROC,
    WM_APP, WM_COMMAND, WNDPROC,
};

const ID_PREV: u32 = 1001;
const ID_PLAY: u32 = 1002;
const ID_NEXT: u32 = 1003;
const THBN_CLICKED: u16 = 0x1800;
const WM_UPDATE_THUMBAR: u32 = WM_APP + 1;

// ITaskbarList3 wraps a COM pointer (NonNull<c_void>) which is !Send.
// We manually mark it Send because:
// - all COM calls happen on the window thread via WndProc
// - the Mutex ensures exclusive access
struct TaskbarSend(ITaskbarList3);
unsafe impl Send for TaskbarSend {}

static APP_HANDLE: OnceLock<Mutex<Option<AppHandle>>> = OnceLock::new();
static TASKBAR: OnceLock<Mutex<Option<TaskbarSend>>> = OnceLock::new();
static MAIN_HWND: OnceLock<Mutex<Option<isize>>> = OnceLock::new();
static ORIGINAL_WND_PROC: OnceLock<Mutex<Option<isize>>> = OnceLock::new();
static TASKBAR_BUTTON_CREATED_MSG: OnceLock<u32> = OnceLock::new();
static IS_PLAYING: OnceLock<Mutex<bool>> = OnceLock::new();

fn store_app_handle(h: AppHandle) {
    APP_HANDLE
        .get_or_init(|| Mutex::new(None))
        .lock()
        .map(|mut g| *g = Some(h))
        .ok();
}

fn store_hwnd(hwnd: HWND) {
    MAIN_HWND
        .get_or_init(|| Mutex::new(None))
        .lock()
        .map(|mut g| *g = Some(hwnd.0 as isize))
        .ok();
}

fn get_hwnd() -> Option<HWND> {
    MAIN_HWND
        .get()
        .and_then(|m| m.lock().ok())
        .and_then(|g| *g)
        .map(|raw| HWND(raw as *mut _))
}

fn store_original_wnd_proc(raw: isize) {
    ORIGINAL_WND_PROC
        .get_or_init(|| Mutex::new(None))
        .lock()
        .map(|mut g| *g = Some(raw))
        .ok();
}

fn get_original_wnd_proc() -> Option<WNDPROC> {
    ORIGINAL_WND_PROC
        .get()
        .and_then(|m| m.lock().ok())
        .and_then(|g| *g)
        .map(|raw| unsafe { std::mem::transmute::<isize, WNDPROC>(raw) })
}

fn set_is_playing(v: bool) {
    IS_PLAYING
        .get_or_init(|| Mutex::new(false))
        .lock()
        .map(|mut g| *g = v)
        .ok();
}

fn get_is_playing() -> bool {
    IS_PLAYING
        .get()
        .and_then(|m| m.lock().ok())
        .map(|g| *g)
        .unwrap_or(false)
}

fn emit_action(action: &str) {
    if let Some(h) = APP_HANDLE
        .get()
        .and_then(|m| m.lock().ok())
        .and_then(|g| g.clone())
    {
        let _ = h.emit("thumbar-action", action);
    }
}

fn make_button(id: u32, tooltip: &str) -> THUMBBUTTON {
    let mut btn = THUMBBUTTON {
        dwMask: THB_TOOLTIP | THB_FLAGS,
        iId: id,
        iBitmap: 0,
        hIcon: Default::default(),
        szTip: [0; 260],
        dwFlags: THBF_ENABLED,
    };
    for (i, ch) in tooltip.encode_utf16().enumerate().take(259) {
        btn.szTip[i] = ch;
    }
    btn
}

fn build_buttons() -> [THUMBBUTTON; 3] {
    [
        make_button(ID_PREV, "Previous"),
        make_button(ID_PLAY, if get_is_playing() { "Pause" } else { "Play" }),
        make_button(ID_NEXT, "Next"),
    ]
}

fn init_taskbar_buttons(hwnd: HWND) -> windows::core::Result<()> {
    unsafe {
        let _ = CoInitializeEx(None, COINIT_APARTMENTTHREADED);
        let taskbar: ITaskbarList3 =
            CoCreateInstance(&TaskbarList, None, CLSCTX_INPROC_SERVER)?;
        taskbar.HrInit()?;
        taskbar.ThumbBarAddButtons(hwnd, &build_buttons())?;

        TASKBAR
            .get_or_init(|| Mutex::new(None))
            .lock()
            .map(|mut g| *g = Some(TaskbarSend(taskbar)))
            .ok();
    }
    Ok(())
}

fn refresh_thumbar(hwnd: HWND) {
    let Some(cell) = TASKBAR.get() else { return };
    let Ok(guard) = cell.lock() else { return };
    let Some(ref ts) = *guard else { return };
    unsafe {
        let _ = ts.0.ThumbBarUpdateButtons(hwnd, &build_buttons());
    }
}

pub fn install(window: &WebviewWindow, app: AppHandle) -> windows::core::Result<()> {
    let hwnd = window.hwnd().map_err(|_| windows::core::Error::from_win32())?;
    store_app_handle(app);
    store_hwnd(hwnd);

    unsafe {
        let msg_id = RegisterWindowMessageW(w!("TaskbarButtonCreated"));
        let _ = TASKBAR_BUTTON_CREATED_MSG.set(msg_id);

        let original = SetWindowLongPtrW(hwnd, GWLP_WNDPROC, wnd_proc as *const () as isize);
        store_original_wnd_proc(original);
    }

    Ok(())
}

// Called from a Tauri command thread: post a message so the update
// happens on the window thread (STA-safe).
pub fn update_play_icon(is_playing: bool) -> windows::core::Result<()> {
    set_is_playing(is_playing);
    if let Some(hwnd) = get_hwnd() {
        unsafe {
            let _ = PostMessageW(Some(hwnd), WM_UPDATE_THUMBAR, WPARAM(0), LPARAM(0));
        }
    }
    Ok(())
}

unsafe extern "system" fn wnd_proc(
    hwnd: HWND,
    msg: u32,
    wparam: WPARAM,
    lparam: LPARAM,
) -> LRESULT {
    // TaskbarButtonCreated — shell is ready, install the buttons.
    if let Some(&created) = TASKBAR_BUTTON_CREATED_MSG.get() {
        if msg == created {
            let _ = init_taskbar_buttons(hwnd);
        }
    }

    // Custom message from update_play_icon (posted cross-thread).
    if msg == WM_UPDATE_THUMBAR {
        refresh_thumbar(hwnd);
    }

    // Button clicks arrive as WM_COMMAND with HIWORD(wParam) = THBN_CLICKED.
    if msg == WM_COMMAND {
        let hi = ((wparam.0 >> 16) & 0xFFFF) as u16;
        let lo = (wparam.0 & 0xFFFF) as u32;
        if hi == THBN_CLICKED {
            match lo {
                ID_PREV => emit_action("previous"),
                ID_PLAY => emit_action("play-pause"),
                ID_NEXT => emit_action("next"),
                _ => {}
            }
        }
    }

    match get_original_wnd_proc() {
        Some(proc) => CallWindowProcW(proc, hwnd, msg, wparam, lparam),
        None => LRESULT(0),
    }
}
