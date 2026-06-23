## Context

`textarea#script` adalah satu-satunya titik masuk naskah saat ini (lihat AGENTS.md konsep #1, tokenizer). Tokenizer (`tokenizeScript`) sudah punya konvensi sendiri: baris `---` = section break, baris `[pause]` = manual pause marker, baris kosong = blank spacer. Fitur import markdown harus berjalan **sebelum** teks masuk tokenizer, dan tidak boleh mengganggu konvensi yang sudah ada.

## Goals / Non-Goals

**Goals:**
- Naskah markdown (heading, bold/italic, emoji) bisa diimpor lewat file picker atau paste langsung, hasilnya bersih dan siap dibaca teleprompter.
- Baris `---` tetap diperlakukan sebagai section-break marker — tidak ikut diproses oleh stripper.
- Teks non-markdown (paste/import biasa) tidak berubah sama sekali.

**Non-Goals:**
- Tidak menangani format markdown spesifik proyek lain (mis. `eko-narrative-book`) — generic strip saja.
- Tidak menambah dependency parser markdown (CDN baru) — cukup regex sederhana, sesuai prinsip zero-dependency di AGENTS.md.
- Tidak mengubah `tokenizeScript`, `renderLinesInto`, atau struktur `state`.

## Decisions

1. **Stripping pakai regex manual, bukan library markdown parser.**
   Alternatif: pakai library kecil (marked.js dll) via CDN. Ditolak — nambah dependency eksternal pertama selain Google Fonts butuh diskusi eksplisit (AGENTS.md Open Questions), dan kebutuhan di sini cuma strip syntax, bukan render markdown jadi HTML. Regex manual cukup dan tetap zero-dependency.

2. **`stripMarkdown(text)` sebagai fungsi pure baru**, ditaruh berdekatan dengan `tokenizeScript` di `index.html` (pola yang sama: fungsi murni, testable lewat Node tanpa DOM, sesuai konvensi Testing di AGENTS.md).
   Aturan: 
   - Baris yang match `^#{1,6}\s+` → buang marker `#`, sisakan teks.
   - `**text**` / `*text*` / `_text_` → buang marker, sisakan teks.
   - Karakter emoji (regex unicode range umum) → dibuang.
   - Baris yang exact match `---` (sama seperti deteksi section-break di `tokenizeScript`) → **dilewati, tidak diproses sama sekali**.

3. **Deteksi "apakah teks ini markdown" pakai heuristik regex sederhana**, dijalankan sekali sebelum decide apply `stripMarkdown` atau tidak.
   Alternatif: selalu jalankan strip ke semua paste/import. Ditolak — berisiko mengubah teks biasa yang memang mengandung karakter `*`/`#` secara sah (misal naskah yang menyebut hashtag). Heuristik (butuh kombinasi minimal: ada heading line ATAU ada pasangan bold/italic marker yang valid) mengurangi false-positive.

4. **Import file pakai `<input type="file">` tersembunyi + `FileReader.readAsText`**, dipicu oleh tombol "Import Markdown". Tidak pakai drag-and-drop di iterasi ini — scope kecil, bisa jadi follow-up kalau dibutuhkan.

5. **Paste auto-clean pakai event `paste` di `textarea#script`**, baca `event.clipboardData.getData('text/plain')`, jalankan heuristik+strip, lalu `event.preventDefault()` + insert manual kalau markdown terdeteksi. Kalau tidak terdeteksi, biarkan paste default jalan (tidak ada perubahan behavior).

## Risks / Trade-offs

- **[Risk]** Heuristik regex bisa false-negative (markdown tidak terdeteksi, tidak distrip) atau false-positive (teks biasa ke-strip tanpa sengaja) → **Mitigasi**: heuristik konservatif (butuh sinyal kuat sebelum strip jalan), dan user tetap bisa edit manual di textarea setelah import/paste — bukan proses yang ireversibel.
- **[Risk]** Emoji regex unicode range tidak menutup semua emoji (skin-tone modifier, ZWJ sequence, dll) → **Mitigasi**: cukup untuk kasus umum di awal, bukan blocker untuk merge; bisa diperluas di iterasi berikutnya kalau ditemukan kasus yang lolos.
- **[Trade-off]** Tidak pakai parser markdown asli (AST-based) berarti edge case syntax markdown yang lebih kompleks (nested list, table, code block) tidak tertangani rapi — diterima karena use-case Tatap cuma naskah baca, bukan dokumen markdown kompleks.
