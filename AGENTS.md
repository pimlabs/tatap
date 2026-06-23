# AGENTS.md

Instruksi ini berlaku untuk semua coding agent (Claude Code, Cursor, Copilot, dll) yang bekerja di repo ini.

## Project Overview

**Tatap** adalah teleprompter ringan berbasis browser. Single-purpose tool, dipakai sendiri oleh pemilik repo untuk merekam video narasi buku/konten. Bukan produk SaaS, bukan untuk banyak pengguna.

Prinsip non-negotiable: **lite, zero-cost, zero-build**.

- Tidak ada build step (no npm, no bundler, no transpiler)
- Tidak ada backend/server — pure static files
- Hosting target: GitHub Pages (gratis, static-only)
- Dependency eksternal dibatasi seminimal mungkin (saat ini hanya Google Fonts via CDN)
- Semua state tersimpan di `localStorage` browser, tidak ada database

**Sebelum menambah dependency, library, atau build tool apapun — tanya pemilik repo dulu.** Ini adalah keputusan arsitektur sengaja, bukan kelalaian.

## File Structure

```
tatap/
├── index.html       # Seluruh app: HTML + CSS + JS dalam satu file
├── manifest.json     # PWA manifest
├── sw.js             # Service worker (cache app shell untuk offline)
├── icon-192.png      # PWA icon
├── icon-512.png      # PWA icon
├── CLAUDE.md
├── AGENTS.md
├── ROADMAP.md
└── README.md
```

Tidak ada `src/`, tidak ada `package.json`. Semua logic ada di `index.html` dalam satu `<script>` tag (IIFE pattern).

## Cara Menjalankan / Testing Lokal

- **Buka langsung**: double-click `index.html`, semua fitur jalan kecuali service worker (butuh http/https, bukan `file://`).
- **Test dengan service worker aktif**: jalankan local server, contoh:
  ```
  python3 -m http.server 8000
  ```
  lalu buka `http://localhost:8000`.
- **Tidak ada automated browser test** di proyek ini. Logic murni (parsing naskah) bisa ditest lewat Node tanpa browser — lihat bagian Testing di bawah.

## Code Style

- Vanilla JS, ES5-leaning (`var`, bukan `let`/`const`) untuk kompatibilitas browser lama tanpa transpiler.
- Satu file `index.html`, semua CSS di `<style>`, semua JS di satu `<script>` IIFE di bagian akhir `<body>`.
- CSS pakai custom properties (`:root { --bg: ...; }`) untuk semua warna/spacing yang berulang — jangan hardcode hex value langsung di banyak tempat.
- Penamaan elemen DOM: cache semua `getElementById` ke object `el` di awal script, jangan query berulang.
- State app disimpan di satu object `state`, di-load/save ke `localStorage` lewat `loadState()`/`saveState()`. Jangan bikin sumber kebenaran state yang lain.

## Konsep Inti (wajib dipahami sebelum ubah logic)

1. **Tokenizer naskah** (`tokenizeScript`) — fungsi murni, parsing teks naskah jadi array baris bertipe `content` / `blank` / `pause`. Konvensi:
   - Baris berisi `---` saja → section break (tidak dirender, tandai baris berikutnya sebagai section anchor)
   - Baris berisi `[pause]` saja → manual auto-pause marker
   - Baris kosong → blank line spacer (TIDAK memicu auto-pause)
2. **Render ganda** — fungsi `renderLinesInto(container, tokenized)` dipakai untuk dua tujuan: render asli ke `#stageText` (saat main) DAN render ke `#measurer` (offscreen, untuk estimasi durasi & kalibrasi speed). Jaga supaya keduanya konsisten — jangan duplikasi logic render di tempat lain.
3. **Pointer-based highlight/auto-pause** — `ptr` adalah index baris yang sedang "aktif" (melewati garis fokus). Bergerak monoton maju via `getBoundingClientRect()`, di-resync manual setelah jump section.
4. **Section jump math** — posisi scroll baru dihitung dari posisi elemen target relatif ke garis fokus, bukan dari index baris. Lihat `jumpToSection()`.

## Testing

`tokenizeScript` adalah fungsi murni (tidak menyentuh DOM) — bisa dan harus ditest via Node setiap kali logicnya diubah:

```bash
node --check extracted-script.js   # syntax check minimal
```

Untuk validasi logic tokenizer, extract fungsi tersebut dan jalankan test case manual (lihat riwayat development untuk contoh test yang sudah pernah dijalankan: section break, blank line, `[pause]` marker, edge case `---` ganda).

Logic yang bergantung pada `getBoundingClientRect()` (pointer, jump, animasi scroll) **tidak bisa divalidasi lewat Node/jsdom** secara bermakna — perlu manual test di browser asli. Selalu sebutkan ke pemilik repo bagian mana yang belum/sudah dites manual.

## Constraints & Non-Goals

- ❌ Jangan tambah framework (React/Vue/dll) — ini bukan aplikasi yang butuh component model.
- ❌ Jangan tambah backend/database tanpa diskusi eksplisit.
- ❌ Jangan ubah `localStorage` jadi `sessionStorage` atau sebaliknya tanpa alasan kuat.
- ❌ Jangan tambah dependency CDN baru tanpa menyebutkan trade-off-nya (ukuran, privasi, ketergantungan pihak ketiga) ke pemilik repo.
- ✅ Boleh nambah fitur baru di dalam `index.html` selama tetap single-file dan tetap jalan tanpa build step.
- ✅ Boleh bikin file terpisah HANYA untuk hal yang memang perlu file sendiri (manifest, service worker, ikon) — bukan untuk split JS/CSS yang sebenarnya bisa tetap inline.

## Commit Convention

Pesan commit singkat, imperatif, Bahasa Indonesia atau Inggris konsisten dalam satu commit:

```
tambah: section jump dengan marker ---
fix: highlight tidak reset setelah restart
docs: update ROADMAP untuk v3
```

Jangan commit langsung ke `main` untuk perubahan besar/eksperimental tanpa konfirmasi pemilik repo — tapi karena ini repo personal single-developer, branch protection biasanya tidak aktif, jadi kehati-hatian ada di proses, bukan di tooling.

## Deployment

Target: **GitHub Pages**, publishing source = branch `main`, folder root (`/`).

Penting: semua path di `index.html`, `manifest.json`, dan `sw.js` harus **relatif** (`./icon-192.png`, bukan `/icon-192.png`) karena GitHub Pages project site di-serve dari subpath `https://<user>.github.io/<repo>/`, bukan dari root domain.

## Open Questions (belum diputuskan — jangan diam-diam diputuskan sendiri)

- **Remote control dari HP** — sudah dianalisis butuh PeerJS via CDN (WebRTC P2P, gratis, no signup) karena GitHub Pages tidak punya backend. Belum dibangun. Ini akan jadi dependency eksternal pertama selain Google Fonts — konfirmasi ke pemilik repo dulu sebelum nambah `<script>` CDN baru.
- **Multi-script library** dan **sync laptop↔iPad** — masih ide di `ROADMAP.md`, belum ada keputusan teknis (localStorage vs backend ringan vs manual export/import).

## Catatan untuk Agent

Histori keputusan desain (kenapa nama "Tatap", kenapa auto-pause dibatasi ke marker `[pause]` dan bukan deteksi tanda baca, kenapa highlight tidak men-dim baris lain) ada di `ROADMAP.md` — anggap final kecuali pemilik repo bilang sebaliknya.

Proyek ini lahir dari diskusi panjang di chat (bukan ditulis langsung di Claude Code), jadi konteks "kenapa" suatu keputusan diambil lebih lengkap di `ROADMAP.md` daripada di commit history.

Pemilik repo (Eko) suka jawaban teknis singkat tanpa preamble panjang, dan menghargai trade-off/asumsi yang belum tervalidasi disebutkan terus terang — bukan ditutup-tutupi demi kedengaran lebih pasti. Terapkan ini juga ke ringkasan kerja & PR description yang kamu tulis.