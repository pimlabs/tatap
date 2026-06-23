# Tatap

Teleprompter ringan berbasis browser, jalan tanpa install dan tanpa backend.

## Cara Pakai Lokal

- **Langsung**: buka `index.html` di browser. Semua fitur jalan kecuali service worker.
- **Dengan service worker aktif** (untuk test PWA/offline): jalankan local server, contoh:

  ```bash
  python3 -m http.server 8000
  ```

  lalu buka `http://localhost:8000`.

## Live Demo

https://pimlabs.github.io/tatap/

## Dokumentasi

- [AGENTS.md](AGENTS.md) — source of truth konteks development (arsitektur, konvensi, batasan).
- [CLAUDE.md](CLAUDE.md) — pointer ke AGENTS.md.
