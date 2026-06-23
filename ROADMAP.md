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

## 🔜 v3 — Belum dibangun, sudah dianalisis

| Fitur | Effort | Catatan |
|---|---|---|
| Remote control dari HP | M–L | Butuh PeerJS via CDN (WebRTC P2P, gratis, no signup). Ini akan jadi dependency eksternal pertama selain Google Fonts — perlu keputusan eksplisit sebelum dibangun. |
| Import Markdown dari `eko-narrative-book` | S | Strip heading/emoji yang gak perlu dibaca keras; deteksi `---` yang sudah dipakai book-pipeline sebagai section break (kemungkinan sudah compatible, perlu dicek format aslinya). |
| Multi-script library | M | Simpan beberapa naskah (per chapter), pilih dari list. Masih localStorage-based, belum perlu backend. |
| Section label otomatis dari heading | S | Section list saat ini cuma snippet baris pertama — bisa diperbaiki kalau baris itu markdown heading (`#`/`##`). |

## 💭 v4 — Ide, belum dianalisis teknis

- Sync naskah laptop ↔ iPad (opsi: manual export/import JSON dulu, baru pertimbangkan backend ringan kalau frekuensi pakai tinggi)
- Export caption/SRT dari naskah + timing scroll
- Bluetooth remote / foot pedal support (kemungkinan besar gratis — keyboard event sudah ada, tinggal mapping)

## Prioritas yang disarankan

Kalau harus pilih satu untuk dikerjakan duluan dari v3: **import Markdown dari eko-narrative-book** — effort kecil, langsung mengurangi friksi di workflow yang sudah jalan (paste manual → otomatis), dan tidak menambah dependency apapun.
