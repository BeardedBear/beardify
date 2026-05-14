# Beardify desktop (Tauri v2)

Native desktop wrapper around the Beardify webapp. Adds Windows
thumbnail-toolbar player controls (prev / play-pause / next under the taskbar
icon preview).

## Bootstrap (one-time)

1. Install Rust: https://www.rust-lang.org/tools/install
2. From the project root, install JS deps:

   ```bash
   bun install
   ```

3. Generate icons from the existing favicon (required before `tauri build`):

   ```bash
   bunx @tauri-apps/cli icon ../public/img/favicon.png
   ```

   Tauri writes the generated `.ico` / `.png` / `.icns` files into
   `src-tauri/icons/`. `tauri dev` works without this step (it uses a default
   icon), but `tauri build` will fail until the icons exist.

4. Provide the desktop OAuth redirect URI in `.env`:

   ```env
   VITE_REDIRECT_URI_DESKTOP=https://your-domain.example/desktop-auth.html
   ```

   See "OAuth in desktop builds" below for the matching relay page.

## Usage

```bash
bun run tauri:dev      # launches Vite + the native window
bun run tauri:build    # produces MSI / NSIS installers under
                       # src-tauri/target/release/bundle/
```

The webapp keeps working unchanged via `bun run dev` / `bun run build`.

## OAuth in desktop builds

Spotify rejects the `tauri://` custom protocol as a redirect URI. The desktop
build therefore points Spotify at a small static HTML page hosted on the
Beardify web domain, which immediately redirects the browser to the
`beardify://` deep link the desktop app listens for.

Minimal `desktop-auth.html` to host on the web domain:

```html
<!doctype html>
<meta charset="utf-8">
<title>Beardify</title>
<script>
  location.href = "beardify://auth?" + location.search.slice(1);
</script>
```

Dev builds keep using `http://127.0.0.1:3000/auth` (the same redirect URI as
the webapp), so deep-linking is only required for production installers.

## Thumbnail toolbar buttons

The Windows-only `src/thumbar.rs` module:

- subclasses the main window (`SetWindowLongPtrW`)
- on `TaskbarButtonCreated`, calls `ITaskbarList3::ThumbBarAddButtons` with
  three buttons: previous, play/pause, next
- on `WM_COMMAND` with `THBN_CLICKED`, emits `thumbar-action` with payload
  `"previous" | "play-pause" | "next"`
- exposes `set_play_state` (Tauri command) so the JS side can update the
  play/pause tooltip when playback state changes

The buttons currently ship without custom HICON resources (tooltips identify
them). To add real icons, populate `hIcon` on each `THUMBBUTTON` entry in
`build_buttons()` and add `THB_ICON` to `dwMask`.
