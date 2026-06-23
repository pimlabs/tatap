# Roadmap — Tatap

Status per 23 Juni 2026.

## ✅ v1 — Core teleprompter (selesai)

- Paste naskah, auto-scroll fullscreen
- Kontrol: ukuran teks, margin samping, kecepatan (px/detik)
- Warna latar & teks + preset Gelap/Terang
- Mirror mode (buat physical rig)
- Hitung mundur 3-2-1
- Keyboard: Space (pause), ↑↓ (speed), Esc (keluar)
- Auto-save naskah & setting ke localStorage
- Single-file HTML, jalan tanpa install

## ✅ v2 — Reading aids & PWA (selesai)

- Estimasi durasi baca (live, berdasarkan tinggi render aktual ÷ speed)
- Section jump — pisah naskah dengan `---`, panel jump + shortcut `[` `]`
- Highlight baris aktif (baris yang lewat garis fokus jadi bold + accent, baris lain tetap kebaca buat lihat ke depan)
- Kalibrasi speed personal — baca sample paragraph, speed di-set otomatis dari tempo bacaan asli
- Auto-pause via marker `[pause]` (bukan deteksi tanda baca otomatis — lihat catatan keputusan di bawah)
- PWA: manifest + service worker, installable di iPad/laptop, jalan offline setelah dibuka sekali

### Keputusan desain yang sudah final (jangan diubah tanpa diskusi ulang)

- **Auto-pause discope ke marker `[pause]` manual**, bukan deteksi titik/koma otomatis. Alasan: deteksi tanda baca akan memicu pause puluhan kali per halaman dan merusak flow membaca — bertentangan sama tujuan teleprompter itu sendiri.
- **Highlight baris aktif tidak men-dim baris lain.** Konvensi teleprompter umum: reader perlu bisa lihat ke depan, jadi cuma baris aktif yang ditonjolkan (bold + accent color), bukan baris lain yang digelapkan.
- **Estimasi durasi mengecualikan runway padding** (`18vh` atas + `100vh` bawah di stage). Estimasi merepresentasikan waktu baca konten asli, bukan termasuk buffer visual.

## ✅ v3a — Import Markdown (selesai)

- Tombol "Import Markdown" di sebelah textarea naskah — buka file `.md`, hasilnya otomatis dibersihkan dari syntax markdown sebelum masuk ke textarea.
- Auto-clean saat paste — kalau konten yang di-paste ke textarea kedeteksi markdown (heading/bold/italic), otomatis distrip; teks biasa (termasuk yang punya inline `#hashtag`) gak disentuh sama sekali.
- Fungsi pure `stripMarkdown`/`looksLikeMarkdown` (berdekatan dengan `tokenizeScript`) menghapus marker heading/bold/italic/emoji per baris, dan **melewati baris `---` apa adanya** — tetap compatible sama section-break marker yang sudah ada.
- **Keputusan**: scope digeneralisasi jadi "import Markdown" generic, bukan spesifik format `eko-narrative-book` — gak ada dependency ke project lain, dan gak nambah CDN/library baru (regex manual, bukan markdown parser).
- Dikerjakan via OpenSpec change `add-markdown-import` (lihat `openspec/changes/add-markdown-import/` — proposal, design, spec, tasks).

## 🔜 v3 — Belum dibangun, sudah dianalisis

| Fitur | Effort | Catatan |
|---|---|---|
| Remote control dari HP | M–L | Butuh PeerJS via CDN (WebRTC P2P, gratis, no signup). Ini akan jadi dependency eksternal pertama selain Google Fonts — perlu keputusan eksplisit sebelum dibangun. |
| Multi-script library | M | Simpan beberapa naskah (per chapter), pilih dari list. Masih localStorage-based, belum perlu backend. |
| Section label otomatis dari heading | S | Section list saat ini cuma snippet baris pertama — bisa diperbaiki kalau baris itu markdown heading (`#`/`##`). |

## 💭 v4 — Ide, belum dianalisis teknis

- Sync naskah laptop ↔ iPad (opsi: manual export/import JSON dulu, baru pertimbangkan backend ringan kalau frekuensi pakai tinggi)
- Export caption/SRT dari naskah + timing scroll
- Bluetooth remote / foot pedal support (kemungkinan besar gratis — keyboard event sudah ada, tinggal mapping)

## Prioritas yang disarankan

Import Markdown udah selesai (lihat v3a). Sisa v3: **Section label otomatis dari heading** — effort kecil. Catatan implementasi: `stripMarkdown` saat ini buang marker heading sebelum teks masuk textarea, jadi info "baris ini tadinya heading" hilang — fitur ini perlu nangkep heading sebelum di-strip (atau jalan duluan sebelum stripper), bukan baca ulang dari hasil yang udah bersih.
