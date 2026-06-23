## 1. Fungsi pure stripMarkdown

- [x] 1.1 Tambah fungsi `stripMarkdown(text)` di `index.html`, berdekatan dengan `tokenizeScript` — hapus marker heading (`^#{1,6}\s+`), bold/italic (`**`/`*`/`_`), dan emoji per baris, lewatkan baris exact `---` tanpa modifikasi.
- [x] 1.2 Tambah fungsi heuristik `looksLikeMarkdown(text)` — deteksi sinyal markdown (heading line, pasangan bold/italic, dll) buat dipakai sebelum decide apply strip pada paste.
- [x] 1.3 Extract `stripMarkdown` + `looksLikeMarkdown` ke file sementara dan jalankan `node --check` plus test case manual (heading, bold, emoji, `---`, teks biasa) sesuai konvensi Testing di AGENTS.md. — 15/15 test case pass.

## 2. UI Import file

- [x] 2.1 Tambah tombol "Import Markdown" di setup screen, sebelahan dengan `textarea#script`.
- [x] 2.2 Tambah `<input type="file" accept=".md,.markdown,text/markdown" hidden>`, cache ke object `el`.
- [x] 2.3 Wire klik tombol → trigger file input → `FileReader.readAsText` → jalankan `stripMarkdown` pada hasilnya → isi `textarea#script` → `scheduleSave()`.

## 3. Auto-clean saat paste

- [x] 3.1 Tambah event listener `paste` di `textarea#script`.
- [x] 3.2 Di handler: ambil `event.clipboardData.getData('text/plain')`, jalankan `looksLikeMarkdown`; kalau true, `event.preventDefault()`, jalankan `stripMarkdown`, insert manual ke textarea di posisi cursor.
- [x] 3.3 Kalau `looksLikeMarkdown` false, biarkan paste default jalan (tidak ada perubahan behavior untuk teks biasa).

## 4. Verifikasi manual

- [x] 4.1 Test di browser (`python3 -m http.server`): import file `.md` contoh dengan heading + bold + `---`, pastikan hasil bersih dan section break tetap jalan di prompter. — diverifikasi via Playwright (file picker `#importMdInput`), hasil bersih + `---` utuh.
- [x] 4.2 Test paste markdown langsung ke textarea, pastikan auto-clean jalan. — diverifikasi via trusted paste (clipboard + Cmd+V asli, bukan synthetic event) di Playwright headed.
- [x] 4.3 Test paste teks biasa (tanpa markdown), pastikan tidak ada perubahan sama sekali. — termasuk edge case inline `#hashtag` (bukan heading di awal baris) — gak ke-strip, no false positive.
- [x] 4.4 Cek regresi: fitur lain (section jump, auto-pause `[pause]`, speed calibration) masih jalan normal setelah perubahan. — `estimateInfo` benar deteksi 2 bagian dari `---` dan exclude `[pause]` dari word count, 0 console error.

## 5. Dokumentasi

- [x] 5.1 Update `ROADMAP.md` — pindahkan item "Import Markdown" dari planned ke completed setelah semua task di atas selesai dan diverifikasi.
