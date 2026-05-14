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
// Glyphs from Segoe MDL2 Assets (built-in on Windows 10/11) are rendered to
// HICONs via GDI on first use and cached in ICONS.

use std::sync::{Mutex, OnceLock};

use tauri::{AppHandle, Emitter, WebviewWindow};
use windows::core::{w, BOOL};
use windows::Win32::Foundation::{COLORREF, HWND, LPARAM, LRESULT, RECT, WPARAM};
use windows::Win32::Graphics::Gdi::{
    BACKGROUND_MODE, BITMAPINFO, BITMAPINFOHEADER, CreateBitmap, CreateCompatibleDC,
    CreateDIBSection, CreateFontW, DeleteDC, DeleteObject, DIB_RGB_COLORS, DrawTextW, DT_CENTER,
    DT_SINGLELINE, DT_VCENTER, FONT_CHARSET, FONT_CLIP_PRECISION, FONT_OUTPUT_PRECISION,
    FONT_QUALITY, GetDC, HFONT, HGDIOBJ, RGBQUAD, ReleaseDC, SelectObject, SetBkMode, SetTextColor,
};
use windows::Win32::System::Com::{
    CoCreateInstance, CoInitializeEx, CLSCTX_INPROC_SERVER, COINIT_APARTMENTTHREADED,
};
use windows::Win32::UI::Shell::{
    ITaskbarList3, TaskbarList, THBF_ENABLED, THB_FLAGS, THB_ICON, THB_TOOLTIP, THUMBBUTTON,
};
use windows::Win32::UI::WindowsAndMessaging::{
    CallWindowProcW, ChangeWindowMessageFilterEx, CreateIconIndirect, HICON, ICONINFO,
    MSGFLT_ALLOW, PostMessageW, RegisterWindowMessageW, SetWindowLongPtrW, GWLP_WNDPROC, WM_APP,
    WM_COMMAND, WNDPROC,
};

const ID_PREV: u32 = 1001;
const ID_PLAY: u32 = 1002;
const ID_NEXT: u32 = 1003;
const THBN_CLICKED: u16 = 0x1800;
const WM_UPDATE_THUMBAR: u32 = WM_APP + 1;
const WM_TRY_INIT_THUMBAR: u32 = WM_APP + 2;

// Segoe MDL2 Assets codepoints
const GLYPH_PREV: u16 = 0xE892;
const GLYPH_PLAY: u16 = 0xE768;
const GLYPH_PAUSE: u16 = 0xE769;
const GLYPH_NEXT: u16 = 0xE893;
const ICON_SIZE: i32 = 20;
const BK_TRANSPARENT: BACKGROUND_MODE = BACKGROUND_MODE(1);

// ITaskbarList3 wraps a COM pointer which is !Send.
// All COM calls happen on the window thread via WndProc; Mutex ensures exclusivity.
struct TaskbarSend(ITaskbarList3);
unsafe impl Send for TaskbarSend {}

struct Icons {
    next: HICON,
    pause: HICON,
    play: HICON,
    prev: HICON,
}
unsafe impl Send for Icons {}
unsafe impl Sync for Icons {}

static APP_HANDLE: OnceLock<Mutex<Option<AppHandle>>> = OnceLock::new();
static TASKBAR: OnceLock<Mutex<Option<TaskbarSend>>> = OnceLock::new();
static MAIN_HWND: OnceLock<Mutex<Option<isize>>> = OnceLock::new();
static ORIGINAL_WND_PROC: OnceLock<Mutex<Option<isize>>> = OnceLock::new();
static TASKBAR_BUTTON_CREATED_MSG: OnceLock<u32> = OnceLock::new();
static IS_PLAYING: OnceLock<Mutex<bool>> = OnceLock::new();
static ICONS: OnceLock<Icons> = OnceLock::new();

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

fn post_to_window(msg: u32) {
    if let Some(hwnd) = get_hwnd() {
        unsafe {
            let _ = PostMessageW(Some(hwnd), msg, WPARAM(0), LPARAM(0));
        }
    }
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

// Renders a Segoe MDL2 Assets glyph into a 32bpp HICON with pre-multiplied alpha.
// White glyph on transparent background — works on any button background color.
unsafe fn glyph_to_hicon(glyph: u16, font: HFONT) -> HICON {
    let screen_dc = GetDC(None);
    let hdc = CreateCompatibleDC(Some(screen_dc));
    ReleaseDC(None, screen_dc);

    let bmi = BITMAPINFO {
        bmiHeader: BITMAPINFOHEADER {
            biSize: std::mem::size_of::<BITMAPINFOHEADER>() as u32,
            biWidth: ICON_SIZE,
            biHeight: -ICON_SIZE, // negative = top-down
            biPlanes: 1,
            biBitCount: 32,
            biCompression: 0, // BI_RGB
            biSizeImage: 0,
            biXPelsPerMeter: 0,
            biYPelsPerMeter: 0,
            biClrUsed: 0,
            biClrImportant: 0,
        },
        bmiColors: [RGBQUAD::default()],
    };

    let mut bits_ptr = std::ptr::null_mut();
    let color_bmp = match CreateDIBSection(Some(hdc), &bmi, DIB_RGB_COLORS, &mut bits_ptr, None, 0) {
        Ok(b) => b,
        Err(_) => {
            let _ = DeleteDC(hdc);
            return HICON::default();
        }
    };

    let old_bmp = SelectObject(hdc, HGDIOBJ(color_bmp.0));

    // GDI does not guarantee zero-init; alpha must start at 0 so transparent
    // pixels are not mistakenly composited.
    std::ptr::write_bytes(bits_ptr as *mut u8, 0, (ICON_SIZE * ICON_SIZE * 4) as usize);

    let old_font = SelectObject(hdc, HGDIOBJ(font.0));

    SetBkMode(hdc, BK_TRANSPARENT);
    SetTextColor(hdc, COLORREF(0x00FFFFFF)); // white

    let mut glyph_buf = [glyph];
    let mut rect = RECT { left: 0, top: 0, right: ICON_SIZE, bottom: ICON_SIZE };
    DrawTextW(hdc, &mut glyph_buf, &mut rect, DT_CENTER | DT_SINGLELINE | DT_VCENTER);

    // Convert GDI RGB output to pre-multiplied ARGB.
    // GDI writes BGR (alpha=0); we derive alpha from luminance so antialiased
    // edges are semi-transparent. For a white glyph: r=g=b, so alpha = r.
    let pixels = std::slice::from_raw_parts_mut(bits_ptr as *mut u32, (ICON_SIZE * ICON_SIZE) as usize);
    for px in pixels.iter_mut() {
        if *px != 0 {
            let b = (*px & 0xFF) as u8;
            let g = ((*px >> 8) & 0xFF) as u8;
            let r = ((*px >> 16) & 0xFF) as u8;
            let a = r.max(g).max(b) as u32;
            *px = a * 0x01010101; // BGRA = (a,a,a,a) pre-multiplied white
        }
    }

    SelectObject(hdc, old_bmp);
    SelectObject(hdc, old_font);
    let _ = DeleteDC(hdc);

    // Monochrome AND mask — all zeros means "use color bitmap fully"
    let mask_bmp = CreateBitmap(ICON_SIZE, ICON_SIZE, 1, 1, None);
    let icon_info = ICONINFO {
        fIcon: BOOL(1),
        xHotspot: 0,
        yHotspot: 0,
        hbmMask: mask_bmp,
        hbmColor: color_bmp,
    };
    let hicon = CreateIconIndirect(&icon_info).unwrap_or_default();

    let _ = DeleteObject(HGDIOBJ(color_bmp.0));
    let _ = DeleteObject(HGDIOBJ(mask_bmp.0));

    hicon
}

fn get_or_create_icons() -> &'static Icons {
    ICONS.get_or_init(|| unsafe {
        let font = CreateFontW(
            ICON_SIZE, 0, 0, 0,
            400, 0, 0, 0,
            FONT_CHARSET(1), FONT_OUTPUT_PRECISION(0), FONT_CLIP_PRECISION(0),
            FONT_QUALITY(5), 0,
            w!("Segoe MDL2 Assets"),
        );
        let icons = Icons {
            next: glyph_to_hicon(GLYPH_NEXT, font),
            pause: glyph_to_hicon(GLYPH_PAUSE, font),
            play: glyph_to_hicon(GLYPH_PLAY, font),
            prev: glyph_to_hicon(GLYPH_PREV, font),
        };
        let _ = DeleteObject(HGDIOBJ(font.0));
        icons
    })
}

fn make_button(id: u32, tooltip: &str, icon: HICON) -> THUMBBUTTON {
    let mut btn = THUMBBUTTON {
        dwMask: THB_TOOLTIP | THB_FLAGS | THB_ICON,
        iId: id,
        iBitmap: 0,
        hIcon: icon,
        szTip: [0; 260],
        dwFlags: THBF_ENABLED,
    };
    for (i, ch) in tooltip.encode_utf16().enumerate().take(259) {
        btn.szTip[i] = ch;
    }
    btn
}

fn build_buttons() -> [THUMBBUTTON; 3] {
    let icons = get_or_create_icons();
    let (play_icon, play_tip) = if get_is_playing() {
        (icons.pause, "Pause")
    } else {
        (icons.play, "Play")
    };
    [
        make_button(ID_PREV, "Previous", icons.prev),
        make_button(ID_PLAY, play_tip, play_icon),
        make_button(ID_NEXT, "Next", icons.next),
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

        // Required: allow the shell to deliver TaskbarButtonCreated and WM_COMMAND
        // through the UIPI message filter (blocked by default on elevated processes).
        let _ = ChangeWindowMessageFilterEx(hwnd, msg_id, MSGFLT_ALLOW, None);
        let _ = ChangeWindowMessageFilterEx(hwnd, WM_COMMAND, MSGFLT_ALLOW, None);

        let original = SetWindowLongPtrW(hwnd, GWLP_WNDPROC, wnd_proc as *const () as isize);
        store_original_wnd_proc(original);
    }

    Ok(())
}

// Spawns a background thread that posts WM_TRY_INIT_THUMBAR after a delay.
// Handles the case where TaskbarButtonCreated arrived before our WndProc was installed.
pub fn schedule_fallback_init() {
    std::thread::spawn(|| {
        std::thread::sleep(std::time::Duration::from_millis(2000));
        post_to_window(WM_TRY_INIT_THUMBAR);
    });
}

// Called from a Tauri command thread: post a message so the update
// happens on the window thread (STA-safe).
pub fn update_play_icon(is_playing: bool) -> windows::core::Result<()> {
    set_is_playing(is_playing);
    post_to_window(WM_UPDATE_THUMBAR);
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

    // Fallback init: posted by schedule_fallback_init if TaskbarButtonCreated was missed.
    if msg == WM_TRY_INIT_THUMBAR {
        let is_init = TASKBAR.get().and_then(|m| m.lock().ok()).map_or(false, |g| g.is_some());
        if !is_init {
            let _ = init_taskbar_buttons(hwnd);
        }
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
