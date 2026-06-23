## ADDED Requirements

### Requirement: Import naskah dari file Markdown
Sistem SHALL menyediakan tombol "Import Markdown" yang membuka file picker terbatas pada file `.md`/`.markdown`/`text/markdown`. Setelah file dipilih, sistem SHALL membaca isi file, menjalankan `stripMarkdown` pada isinya, dan mengisi `textarea#script` dengan hasilnya.

#### Scenario: User import file markdown valid
- **WHEN** user klik tombol "Import Markdown" dan memilih file `.md` yang berisi heading dan bold text
- **THEN** `textarea#script` terisi teks dari file tersebut dengan marker heading dan bold sudah dihapus, dan baris `---` (kalau ada) tetap apa adanya

### Requirement: Auto-clean markdown saat paste
Sistem SHALL mendeteksi syntax markdown pada konten yang di-paste ke `textarea#script` menggunakan heuristik (heading, bold/italic, atau kombinasi sinyal markdown lain). Kalau syntax markdown terdeteksi, sistem SHALL menjalankan `stripMarkdown` pada konten tersebut sebelum konten disisipkan ke textarea.

#### Scenario: User paste teks markdown
- **WHEN** user paste teks yang mengandung baris heading (`## Judul`) ke `textarea#script`
- **THEN** teks yang masuk ke textarea adalah versi yang sudah dibersihkan (tanpa marker `##`), bukan teks mentah dari clipboard

#### Scenario: User paste teks biasa tanpa syntax markdown
- **WHEN** user paste teks biasa (tanpa heading, bold, atau emoji) ke `textarea#script`
- **THEN** teks masuk ke textarea tanpa perubahan apapun — paste berjalan seperti behavior default browser

### Requirement: Baris section-break tidak ikut diproses
Fungsi `stripMarkdown` SHALL melewati baris yang exact match `---` tanpa modifikasi, supaya tetap kompatibel dengan `tokenizeScript` yang memperlakukan baris tersebut sebagai section-break marker.

#### Scenario: Import file markdown yang punya pemisah section
- **WHEN** file markdown yang diimpor berisi baris `---` di antara dua bagian teks
- **THEN** baris `---` tetap muncul persis di textarea hasil import, tidak dihapus atau diubah oleh `stripMarkdown`
