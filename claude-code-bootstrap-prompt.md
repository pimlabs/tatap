# Prompt untuk Claude Code — Setup GitHub + Deploy Tatap

Cara pakai:
1. Taruh semua file ini dalam satu folder bernama `tatap`:
   `index.html`, `manifest.json`, `sw.js`, `icon-192.png`, `icon-512.png`,
   `CLAUDE.md`, `AGENTS.md`, `ROADMAP.md`
2. Buka terminal, `cd` ke folder itu.
3. Jalankan `claude` untuk masuk ke Claude Code.
4. Paste seluruh blok prompt di bawah ini.

---

```
Kamu bekerja di folder project bernama "tatap" — sebuah teleprompter web statis
single-file (AGENTS.md adalah source of truth proyek ini, baca itu dulu
sebelum mulai — CLAUDE.md cuma link pointer ke AGENTS.md, gak ada isi
tambahan di sana). Tugas kamu sekarang BUKAN mengubah kode app, tapi nge-setup
repo Git + GitHub + GitHub Pages untuk deploy. Ikuti langkah ini urut, dan
STOP + tanya saya kalau ada langkah yang gagal atau ambigu — jangan
diam-diam lanjut dengan asumsi sendiri.

1. Cek isi folder ini. Pastikan ada: index.html, manifest.json, sw.js,
   icon-192.png, icon-512.png, CLAUDE.md, AGENTS.md, ROADMAP.md.
   Kalau ada yang kurang, kasih tahu saya, jangan lanjut dulu.

2. Cek apakah folder ini sudah git repo (`git status`). Kalau belum,
   `git init` dengan default branch "main".

3. Buat file .gitignore minimal (cuma .DS_Store, Thumbs.db, dan file
   editor temp umum — proyek ini gak punya node_modules/build artifact).

4. Tulis README.md singkat (Bahasa Indonesia) yang isinya:
   - Nama proyek "Tatap" + satu kalimat deskripsi (teleprompter ringan,
     browser-based, no install)
   - Cara pakai lokal (buka index.html, atau jalankan local server kalau
     mau test PWA/service worker)
   - Link live demo (isi placeholder dulu, nanti saya update manual
     setelah Pages aktif)
   - Sebutkan bahwa AGENTS.md ada untuk konteks development (source of
     truth), CLAUDE.md cuma pointer ke situ

5. Cek `gh auth status`. Kalau belum login, STOP dan suruh saya jalankan
   `gh auth login` manual dulu — jangan coba login otomatis.

6. Git add semua file, commit dengan message:
   "Initial commit: Tatap v2 - teleprompter ringan dengan PWA"

7. Buat repo baru di GitHub bernama "tatap", PUBLIC (wajib public karena
   GitHub Pages gratis cuma jalan di repo public untuk akun non-Enterprise),
   sambil push repo lokal yang sudah ada commit-nya:

   gh repo create tatap --public --source=. --remote=origin --push

   Kalau ternyata repo dengan nama "tatap" sudah ada di akun saya, STOP dan
   tanya saya dulu (mau pakai nama lain atau pakai repo yang sudah ada).

8. Aktifkan GitHub Pages lewat REST API (bukan lewat web UI, karena kita di
   terminal). Ganti <OWNER> dengan username GitHub saya (deteksi dari
   `gh api user --jq .login`):

   gh api -X POST repos/<OWNER>/tatap/pages \
     -f "source[branch]=main" \
     -f "source[path]=/"

   Kalau responnya 409 Conflict, itu artinya Pages sudah aktif sebelumnya —
   itu OK, lanjut saja, bukan error yang perlu di-stop.

9. Tunggu sebentar (Pages butuh waktu build, biasanya di bawah 1 menit),
   lalu cek status dan ambil URL live-nya:

   gh api repos/<OWNER>/tatap/pages --jq .html_url

   Kalau status belum "built" setelah dicoba beberapa kali, jangan terus
   nge-loop — kasih tahu saya URL-nya dan bilang mungkin masih proses build,
   saya cek manual beberapa menit lagi.

10. Update README.md: isi placeholder link live demo dengan URL asli dari
    langkah 9. Commit & push perubahan ini.

11. Kasih saya ringkasan akhir: URL repo GitHub, URL live Pages, dan
    konfirmasi semua file ke-push dengan benar (jalankan `git status` dan
    `git log --oneline -5` buat verifikasi, tampilkan ke saya).

Catatan penting:
- Jangan generate GitHub Actions workflow apapun — Pages cukup pakai
  publishing-from-branch biasa untuk static site sesimpel ini.
- Jangan ubah isi index.html/manifest.json/sw.js sama sekali di sesi ini.
  Kalau kamu nemu bug atau hal yang kelihatan aneh di file-file itu pas
  baca-baca, catat dan laporkan ke saya — jangan langsung diperbaiki.
- Semua path di manifest.json/sw.js/index.html sudah relatif (./icon-192.png
  dst), jangan diubah jadi absolute path — itu akan rusak begitu di-serve
  dari subpath github.io/tatap/.
```

---

## Kalau langkah 8 gagal karena permission

Token default `gh` kadang nggak punya scope buat ngatur Pages settings. Kalau
itu terjadi, Claude Code akan kasih tahu errornya — solusinya jalankan manual:

```
gh auth refresh -s delete_repo,repo
```

atau langsung aktifkan dari web: Settings → Pages → pilih branch `main`,
folder `/ (root)` → Save (cara manual yang udah pernah dibahas sebelumnya).