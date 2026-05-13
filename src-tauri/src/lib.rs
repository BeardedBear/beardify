use std::path::PathBuf;

use tauri::{AppHandle, WebviewUrl, WebviewWindowBuilder};

#[cfg(windows)]
mod thumbar;

#[tauri::command]
fn set_play_state(_app: AppHandle, is_playing: bool) -> Result<(), String> {
    #[cfg(windows)]
    thumbar::update_play_icon(is_playing).map_err(|e| e.to_string())?;
    Ok(())
}

// Opens Spotify's authorization page in the OS default browser.
// Uses ShellExecuteW to avoid cmd.exe parsing '&' as a command separator.
// Spotify redirects to beardify://auth?code=... which tauri-plugin-deep-link
// intercepts and forwards to the Vue router via setupDeepLink in tauriBootstrap.ts.
#[tauri::command]
fn open_spotify_auth(_app: AppHandle, url: String) -> Result<(), String> {
    #[cfg(windows)]
    {
        use windows::Win32::UI::Shell::ShellExecuteW;
        use windows::Win32::UI::WindowsAndMessaging::SW_SHOWNORMAL;
        use windows::core::HSTRING;
        unsafe {
            ShellExecuteW(None, &HSTRING::from("open"), &HSTRING::from(url.as_str()), None, None, SW_SHOWNORMAL);
        }
    }
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![set_play_state, open_spotify_auth])
        .setup(|app| {
            // Register beardify:// in the OS registry so the browser can open deep links.
            // Required in dev mode; installers handle this automatically in production.
            #[cfg(desktop)]
            {
                use tauri_plugin_deep_link::DeepLinkExt;
                app.deep_link().register_all()?;
            }

            let handle = app.handle().clone();

            let window = WebviewWindowBuilder::new(
                app,
                "main",
                WebviewUrl::App(PathBuf::from("index.html")),
            )
            .title("Beardify")
            .inner_size(1280.0, 800.0)
            .min_inner_size(900.0, 600.0)
            .resizable(true)
            .build()?;

            #[cfg(windows)]
            if let Err(e) = thumbar::install(&window, handle) {
                eprintln!("Thumbar install failed: {e}");
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
