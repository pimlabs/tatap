# Tatap

Teleprompter ringan berbasis browser, jalan tanpa install dan tanpa backend.

## Cara Pakai Lokal

- **Langsung**: buka `index.html` di browser. Semua fitur jalan kecuali service worker.
- **Dengan service worker aktif** (untuk test PWA/offline): jalankan local server. Rekomendasi pakai Bun atau uv kalau ada (gak perlu install apapun ke project, cuma static file server):

  ```bash
  bunx serve .                 # kalau ada Bun
  uv run -m http.server 8000   # kalau ada uv
  python3 -m http.server 8000  # fallback paling universal
  ```

  lalu buka `http://localhost:8000` (Bun's `serve` defaultnya port lain, cek output terminal).

## Live Demo

https://pimlabs.github.io/tatap/

## Dokumentasi

- [AGENTS.md](AGENTS.md) — source of truth konteks development (arsitektur, konvensi, batasan).
- [CLAUDE.md](CLAUDE.md) — pointer ke AGENTS.md.
- [CONTRIBUTING.md](CONTRIBUTING.md) — panduan kontribusi.

## Lisensi

[MIT](LICENSE)
