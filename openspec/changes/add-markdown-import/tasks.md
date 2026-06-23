## 1. Fungsi pure stripMarkdown

- [ ] 1.1 Tambah fungsi `stripMarkdown(text)` di `index.html`, berdekatan dengan `tokenizeScript` — hapus marker heading (`^#{1,6}\s+`), bold/italic (`**`/`*`/`_`), dan emoji per baris, lewatkan baris exact `---` tanpa modifikasi.
- [ ] 1.2 Tambah fungsi heuristik `looksLikeMarkdown(text)` — deteksi sinyal markdown (heading line, pasangan bold/italic, dll) buat dipakai sebelum decide apply strip pada paste.
- [ ] 1.3 Extract `stripMarkdown` + `looksLikeMarkdown` ke file sementara dan jalankan `node --check` plus test case manual (heading, bold, emoji, `---`, teks biasa) sesuai konvensi Testing di AGENTS.md.

## 2. UI Import file

- [ ] 2.1 Tambah tombol "Import Markdown" di setup screen, sebelahan dengan `textarea#script`.
- [ ] 2.2 Tambah `<input type="file" accept=".md,.markdown,text/markdown" hidden>`, cache ke object `el`.
- [ ] 2.3 Wire klik tombol → trigger file input → `FileReader.readAsText` → jalankan `stripMarkdown` pada hasilnya → isi `textarea#script` → `scheduleSave()`.

## 3. Auto-clean saat paste

- [ ] 3.1 Tambah event listener `paste` di `textarea#script`.
- [ ] 3.2 Di handler: ambil `event.clipboardData.getData('text/plain')`, jalankan `looksLikeMarkdown`; kalau true, `event.preventDefault()`, jalankan `stripMarkdown`, insert manual ke textarea di posisi cursor.
- [ ] 3.3 Kalau `looksLikeMarkdown` false, biarkan paste default jalan (tidak ada perubahan behavior untuk teks biasa).

## 4. Verifikasi manual

- [ ] 4.1 Test di browser (`python3 -m http.server`): import file `.md` contoh dengan heading + bold + `---`, pastikan hasil bersih dan section break tetap jalan di prompter.
- [ ] 4.2 Test paste markdown langsung ke textarea, pastikan auto-clean jalan.
- [ ] 4.3 Test paste teks biasa (tanpa markdown), pastikan tidak ada perubahan sama sekali.
- [ ] 4.4 Cek regresi: fitur lain (section jump, auto-pause `[pause]`, speed calibration) masih jalan normal setelah perubahan.

## 5. Dokumentasi

- [ ] 5.1 Update `ROADMAP.md` — pindahkan item "Import Markdown" dari planned ke completed setelah semua task di atas selesai dan diverifikasi.
