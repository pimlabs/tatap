## Why

Naskah saat ini cuma bisa masuk lewat paste manual ke `textarea#script`. Kalau sumbernya markdown (heading `#`/`##`, bold/italic, emoji), user harus bersihin syntax-nya satu-satu sebelum dipakai di teleprompter — friksi yang gak perlu untuk workflow yang sudah sering dipakai. ROADMAP.md menandai fitur import markdown sebagai milestone v3 dengan effort kecil dan tanpa dependency baru, jadi ini kandidat paling murah untuk dikerjakan duluan.

## What Changes

- Tombol "Import Markdown" di sebelah textarea naskah, membuka file picker (`accept=".md,.markdown,text/markdown"`), membaca file via `FileReader`, lalu mengisi `textarea#script` dengan hasil yang sudah dibersihkan.
- Listener `paste` di `textarea#script` yang mendeteksi heuristik syntax markdown (heading, bold/italic, emoji) pada konten clipboard dan otomatis membersihkannya sebelum disisipkan.
- Fungsi murni baru `stripMarkdown(text)`: menghapus marker heading di awal baris (teks tetap, marker dibuang), menghapus marker bold/italic, menghapus karakter emoji. Baris `---` **tidak** ikut diproses — itu sudah dipakai `tokenizeScript` sebagai section-break marker.
- Paste/import teks biasa (tanpa syntax markdown) tidak boleh berubah sama sekali — tidak ada stripping kalau tidak ada syntax yang terdeteksi.

## Capabilities

### New Capabilities

- `script-input`: cara naskah masuk ke aplikasi (paste manual, import file, auto-clean markdown) dan kontrak bahwa hasil akhir selalu kompatibel dengan `tokenizeScript`.

### Modified Capabilities

(tidak ada — ini capability pertama yang di-spec di repo ini)

## Impact

- Satu file kena: `index.html` (single-file app, sesuai AGENTS.md). Tambah ~1 fungsi pure, 1 tombol, 1 `<input type="file">` hidden, 1 event listener tambahan di `textarea#script` yang sudah ada.
- Tidak ada dependency CDN baru.
- Tidak ada perubahan skema `state`/`localStorage`.
- Tidak mengubah `tokenizeScript`, `renderLinesInto`, atau logic prompter lain — fitur ini murni di titik masuk naskah, sebelum tokenizer jalan.
