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

## ✅ v3b — Section label otomatis dari heading (selesai)

- Saat import/paste Markdown, heading `#`/`##` sekarang otomatis jadi section break (`---`) sebelum heading tersebut ditulis ke textarea — heading H1/H2 di tengah dokumen akan memicu section break baru, heading pertama dokumen tidak (supaya gak ada section kosong duplikat di awal).
- Efeknya: label section panel (yang diambil dari baris pertama tiap section) otomatis jadi teks heading asli, tanpa perlu ubah `buildSectionList`/`snippetFrom` sama sekali.
- Heading H3–H6 tetap di-strip markernya seperti biasa, tapi TIDAK memicu section break otomatis (biar gak kebanyakan subsection kecil jadi section jump).
- Fungsi baru `autoSectionizeMarkdown` jalan sebelum `stripMarkdownLine` (harus tahu suatu baris itu heading sebelum marker `#`-nya dihapus) — dipanggil dari `stripMarkdown`, jadi otomatis kepakai baik lewat tombol Import Markdown maupun auto-clean saat paste.
- 9/9 test case pure-logic pass via Node (heading pertama dokumen, heading beruntun, heading yang udah didahului `---` manual, blank line sebelum heading pertama, H3–H6 gak bikin break, teks biasa gak kesentuh, inline `#hashtag` gak dianggap heading, multi-H2 di dokumen panjang). Verifikasi end-to-end juga jalan via Playwright headless (import file `.md` → cek label section panel).

## ✅ v3c — Multi-script library (selesai)

- Tombol "💾 Simpan naskah" dan "📚 Naskah tersimpan (N)" di sebelah Import Markdown. Naskah disimpan sebagai `{id, title, script, updatedAt}` di localStorage key terpisah `tatap:library` (array), gak nyampur sama `tatap:state` yang isinya cuma naskah aktif + pengaturan.
- `state.activeLibId` melacak naskah mana yang lagi "connected" ke library. Klik Simpan saat ada link aktif → update in-place, diam-diam, tanpa prompt. Kalau belum ada link (naskah baru atau abis Import Markdown, yang otomatis clear link-nya) → `prompt()` native buat nama, defaultnya diambil dari baris pertama naskah.
- Modal "Naskah tersimpan" (reuse pola `.modal`/`.modal-box` dari modal kalibrasi) nampilin list diurut terbaru dulu, tiap item ada tombol Muat & Hapus (`confirm()` native sebelum hapus).
- Sengaja pakai `prompt()`/`confirm()` browser native buat nama & konfirmasi hapus, bukan modal custom — biar tetep ringan, gak nambah state UI baru yang gak perlu buat tool personal ini.
- 11/11 test end-to-end pass via Playwright headless (save naskah baru dgn prompt, update silent tanpa prompt saat link aktif, save naskah kedua yg distinct, list nampilin dua-duanya, load balikin teks yg bener, localStorage persist setelah reload — baik naskah aktif maupun library-nya, hapus via confirm, guard: naskah kosong gak munculin prompt/gak kesave).

## 🔜 v3 — Belum dibangun, sudah dianalisis

| Fitur | Effort | Catatan |
|---|---|---|
| Remote control dari HP | M–L | Butuh PeerJS via CDN (WebRTC P2P, gratis, no signup). Ini akan jadi dependency eksternal pertama selain Google Fonts — perlu keputusan eksplisit sebelum dibangun. |

## 💭 v4 — Ide, belum dianalisis teknis

- Sync naskah laptop ↔ iPad (opsi: manual export/import JSON dulu, baru pertimbangkan backend ringan kalau frekuensi pakai tinggi)
- Export caption/SRT dari naskah + timing scroll
- Bluetooth remote / foot pedal support (kemungkinan besar gratis — keyboard event sudah ada, tinggal mapping)

## Prioritas yang disarankan

v3a (Import Markdown), v3b (section label dari heading), v3c (Multi-script library) udah selesai. Sisa satu-satunya item v3: **Remote control dari HP** — tapi ini butuh keputusan eksplisit soal dependency PeerJS via CDN dulu (lihat Open Questions), jangan dikerjakan diam-diam tanpa konfirmasi.
