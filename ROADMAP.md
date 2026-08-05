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

## ✅ v3d — Remote control dari HP (selesai)

- **Dependency eksternal kedua** (setelah Google Fonts): [PeerJS](https://peerjs.com) via jsdelivr CDN, pinned ke versi `1.5.5` dengan Subresource Integrity hash — WebRTC P2P, gratis, no signup, pakai broker publik `0.peerjs.com` cuma buat signaling awal (jalur data sesudahnya P2P langsung antar device). Trade-off yang perlu diketahui: fitur ini butuh internet (bukan cuma LAN) karena signaling server publik, dan gak akan jalan offline meski app-nya sendiri PWA — degradasi dibikin graceful (badge "remote gak bisa dimuat", app tetap jalan normal tanpa remote kalau CDN/script gagal load).
- Toggle "Remote HP" di setup screen. Saat toggle aktif & masuk stage, layar utama ("host") generate kode 4 digit (`tatap-XXXX` sebagai Peer ID), ditampilin di control bar.
- Device lain (HP) buka URL yang sama, klik "📱 Jadi remote control dari HP ini" → masukin kode 4 digit → tersambung via data channel P2P. Kontrol yang tersedia: play/pause, speed ±10, section prev/next, restart, exit — semuanya manggil fungsi yang sama persis dengan keyboard shortcut di host, cuma dipicu dari pesan JSON via data channel.
- Sengaja **gak** manggil `showControls()` pas command dari remote masuk — biar control bar gak nongol di layar utama pas dikontrol dari HP (relevan buat physical mirror rig, control bar bisa kerekam kalau nongol).
- Satu host cuma nerima satu koneksi remote sekaligus (koneksi kedua langsung di-reject) — cukup buat use-case personal, gak perlu multi-remote.
- Fix bareng: `sw.js` cache version ketinggalan (masih `v2` padahal `app.js`/`index.html`/`styles.css` udah berubah 2 fitur terakhir) — di-bump ke `v3` biar PWA yang udah ke-install re-fetch app shell terbaru.
- **Belum dites end-to-end beneran** — sandbox development ini network policy-nya blokir CDN (jsdelivr/unpkg) dan broker PeerJS (`0.peerjs.com`), jadi koneksi P2P asli (host↔HP, handshake kode, kirim command bolak-balik) belum pernah divalidasi jalan. Yang udah dites otomatis (Playwright headless, 12/12 pass): toggle persist, badge muncul/kesembunyi sesuai state, degradasi graceful pas `Peer` library gagal load (gak crash, badge kasih pesan jelas), validasi input kode 4 digit, form connect/back/disconnect switch UI dengan benar. **Perlu ditest manual sama Eko di device asli** (laptop + HP beneran, buka lewat GitHub Pages) sebelum dianggap kelar — terutama: apakah kode beneran connect, apakah command remote sampe ke host dengan latency wajar, dan apakah behaviour di jaringan WiFi rumah/hotspot HP normal (WebRTC kadang butuh TURN relay kalau NAT-nya strict, PeerJS default cuma pakai STUN publik Google — kemungkinan kecil gagal connect di jaringan tertentu, belum ada fallback TURN).

## ✅ v3e — Mobile readiness (selesai)

Dikerjain lewat mockup artifact dulu (beberapa ronde validasi/revisi), baru dieksekusi ke kode asli setelah disetujui.

- **Layar setup dipecah 3 tab di mobile** (`<880px`): Naskah → Setting → Preview, urutan ngikutin alur kerja (tulis → atur → cek hasil → mulai). Tab bar pill mengambang di bawah layar (thumb-reachable), tab aktif dapet indikator background.
- **Desktop (`>=880px`) bukan sistem terpisah** — 3 blok yang sama (`#panelNaskah`/`#panelSetting`/`#panelPreview`) ditampilin sekaligus jadi 3 kolom CSS grid, tab bar disembunyiin. Nol komponen/markup duplikat antara mobile & desktop.
- **Tab Preview baru** — render mini naskah pakai ukuran/warna/margin asli dari state (bukan versi diskalain, jadi akurat literally "begini nanti tampilannya", cuma di-window tinggi tetap + fade di bawah kayak viewport stage beneran), plus estimasi durasi/kata/bagian yang sebelumnya nempel di panel Kecepatan, plus tombol "▶ Mulai" jadi CTA penutup di sini.
- **Toolbar naskah dirapikan** — "💾 Simpan naskah" / "📚 Naskah tersimpan" / "Import Markdown" yang sebelumnya 3 chip lepas ukuran beda-beda, sekarang jadi satu toolbar bersegmen (3 sel sama besar, pembatas tipis, badge angka nempel di icon).
- **Semua icon emoji diganti SVG** — satu sprite icon line-style (`stroke-width:1.8`, sudut membulat) digambar manual di `<svg style="display:none">` awal `<body>`, dipakai lewat `<use href="#i-xxx">` di tab bar, toolbar, control bar, remote pad, badge remote, dan tombol close section panel. Alasan: emoji render beda-beda tiap OS/browser, SVG konsisten dan gak nambah dependency (bukan ditarik dari icon library eksternal).
- **Control bar stage direstruktur biar gak kepotong**:
  - Kontrol kecepatan (`−`/angka/`+`) yang sebelumnya selalu tampil 3 elemen, sekarang jadi 1 tombol toggle nunjukkin angka aja — tap buat buka popover `−`/`+` yang ngambang di atas bar. Ngurangin lebar default bar secara permanen.
  - Posisi popover dihitung dinamis dari `getBoundingClientRect()` bar asli (bukan angka fixed) — soalnya bar bisa wrap ke 2 baris di layar sempit, jadi tingginya gak selalu sama. Sempat ketauan bug pas testing: posisi fixed bikin popover numpuk nutupin tombol section di layar sempit — udah difix sebelum di-ship.
  - `#controlBar` dikasih `flex-wrap:wrap;justify-content:center` + tombol diperbesar 38px→44px (touch target minimum) — di layar sempit (mis. iPhone SE 375px + Remote HP aktif) bar wrap jadi 2 baris rapi, bukan kepotong/ke-clip kayak sebelumnya.
- **Remote pad** (device kedua yang jadi remote) ikut dapet icon SVG + status dot ijo buat "Tersambung", + tombol "Keluar dari stage" dikasih aksen merah tipis biar beda dari aksi netral lainnya.
- **Testing**: 32/32 assertion Playwright headless pass (default tab, semua 12+ kontrol Setting hadir tanpa kelewat, preview render & sinkron ke perubahan ukuran/warna, toolbar & library masih jalan, desktop nampilin 3 kolom sekaligus, control bar gak keluar viewport bahkan di 375px + Remote HP aktif, popover speed buka/tutup & incrementnya bener, keyboard shortcut masih jalan, section panel & speed popover saling exclusive, badge remote gak ada emoji lagi, modal kalibrasi masih kebuka) + screenshot visual manual buat cross-check. Font Fraunces/Inter gak bisa diverifikasi visual di sandbox dev (Google Fonts CDN diblokir network policy sandbox) — fallback font dipakai buat screenshot, tapi CSS `font-family` aslinya gak diubah jadi bakal render benar di production.

## ✅ v3f — Tema aplikasi: Gelap/Terang/Sistem (selesai)

- Toggle 3-way baru "Tema aplikasi" di panel Tampilan (Gelap/Terang/Sistem), default **Sistem**. Ngatur chrome UI doang — setup screen, modal, tab bar — lewat CSS custom properties (`--bg`/`--panel`/`--panel-border`/`--text`/`--muted`/`--accent`) yang di-override via `[data-theme]` attribute di `<html>`.
- **Awalnya terpisah total dari "Warna latar"/"Warna teks"** yang udah ada (khusus warna panggung teleprompter, `state.bg`/`state.text`) — lihat v3g di bawah, sekarang ada opsi buat nyambungin keduanya kalau mau.
- Mode **Sistem** = gak nyimpen preferensi eksplisit, ngikutin `@media (prefers-color-scheme)` — otomatis live-reactive kalau OS diganti pas app lagi kebuka (`matchMedia().addEventListener("change", ...)`), gak perlu reload.
- `<meta name="theme-color">` (warna status bar browser/PWA) ikut di-update dinamis sesuai tema yang resolve, termasuk pas mode Sistem (dihitung dari `matchMedia` saat itu).
- Attribute `data-theme` di-set sedini mungkin (langsung setelah `loadState()`, sebelum elemen lain dibangun) buat minimalisir flash tema salah pas load.
- Palet terang: bg `#F7F5F1` (warm paper, bukan putih polos), panel `#FFFFFF`, teks `#221F1A`, accent `#C9791F` (amber didalemin dikit dari versi gelap `#E8A33D` biar kontras cukup di atas putih).
- 13/13 test end-to-end pass via Playwright (OS dark + system → gelap, klik Terang → override localStorage-persisted, klik Sistem → attribute dilepas balik ngikut OS, fresh profile + OS light + system → otomatis terang, warna panggung/preview tetap gak kesentuh selama mode custom, meta theme-color update, gak ada JS error).

## ✅ v3g — Warna panggung: ikuti tema aplikasi / custom (selesai)

- Toggle baru "Warna panggung" (Ikuti tema aplikasi / Custom) di bawah field "Tema aplikasi" — default **Custom** (preserve behavior lama, gak diam-diam ganti pengaturan user yang udah ada).
- Mode **Ikuti tema aplikasi**: `state.bg`/`state.text` panggung disamain sama palet tema aplikasi yang lagi aktif (dark → `#0E0F11`/`#F2EFE9`, light → `#F7F5F1`/`#221F1A`) lewat `THEME_COLORS` map + `resolveActiveTheme()` (di-reuse dari fitur tema v3f). Field `Warna latar`/`Warna teks` + preset Gelap/Terang disembunyiin (gak relevan) selama mode ini aktif.
- Live-sync: ganti tema aplikasi (Gelap/Terang/Sistem) atau OS berubah pas mode Sistem → warna panggung ikut ke-update otomatis lewat `syncStageColorsIfInherit()` yang dipanggil dari dalam `applyTheme()` — satu jalur, gak ada state ganda yang bisa out-of-sync.
- Mode **Custom**: balik ke behavior asli (color picker + preset Gelap/Terang manual), field-nya muncul lagi. Pindah dari Inherit ke Custom gak reset warna — nilai terakhir (hasil inherit) jadi starting point yang bisa diedit.
- 15/15 test end-to-end pass via Playwright (default custom, switch ke inherit → field ilang + warna ikut tema aktif + preview box ikut, ganti tema aplikasi pas mode inherit → warna panggung ikut live termasuk di preview box, switch balik ke custom → field muncul lagi & custom color gak ketimpa lagi, stage asli (`#stage` pas `Mulai`) makai warna inherited yang bener, persist setelah reload).

## 🔧 Fix — Service worker gak langsung ambil alih pas update

- **Bug lama, ketauan pas fitur Tema aplikasi (v3f/v3g) gak muncul di HP** yang udah pernah buka app sebelumnya. Penyebabnya: `sw.js` gak pernah manggil `self.skipWaiting()`/`self.clients.claim()`, jadi service worker versi baru cuma nunggu ("waiting") sampai SEMUA tab/instance PWA yang lagi buka app itu ditutup total — sementara service worker LAMA tetap yang ngelayanin fetch (termasuk `index.html`/`app.js` versi lama dari cache), meski file di GitHub Pages udah ke-update.
- Fix: tambah `self.skipWaiting()` di `install` dan `self.clients.claim()` di `activate` — sekarang service worker baru langsung ambil alih begitu selesai install & activate, gak perlu nunggu semua tab ditutup.
- **Ini fix ke depan** (biar update berikutnya gak macet lagi) — buat device yang udah kena stuck di versi lama SEKARANG, service worker lama itu masih yang jalan sampai di-refresh paksa manual sekali (tutup semua tab/PWA app-nya total lalu buka lagi, atau clear site data/cache browser buat domain ini). Setelah itu ke depannya bakal auto-update mulus.
- `sw.js` cache `v6` → `v7`.

## 🔧 Fix — Tema terang: slider & toggle switch gak ikut tema

Ketauan pas Eko coba tema Terang beneran: kombinasi warnanya keliatan aneh. Dua penyebab:

- **Gak ada deklarasi `color-scheme`** di `:root` — tanpa ini, browser render chrome native (track slider yang belum ke-isi, dll) ngikutin preferensi **OS**, bukan `[data-theme]` custom kita. Kalau OS dark tapi app di-set Terang, elemen native tetap kebawa gelap = "opsi font" (slider Ukuran teks) keliatan nabrak. Fix: tambah `color-scheme:dark`/`light` ke tiap blok token, ngikutin pola yang sama kayak variabel warna lainnya.
- **Ternyata `color-scheme` + `accent-color` doang gak cukup buat `<input type=range>`** — behaviour track yang belum ke-isi gak konsisten diambil dari situ (tetep item di Chromium meski `color-scheme` udah bener). Fix lebih pasti: ambil alih penuh styling track & thumb slider via `::-webkit-slider-runnable-track`/`::-webkit-slider-thumb` (+ prefix `-moz-`), full custom pakai `var(--panel-border)`/`var(--accent)` — gak gantung ke rendering native lagi sama sekali. Efek samping: fill/progress bar bawaan browser (yang sebelumnya kebetulan nongol dari `accent-color`) ilang, ganti jadi track polos + thumb — tetep jelas karena label angka di atas tiap slider udah nunjukkin nilai persis.
- **Toggle switch (Cermin/Hitung mundur/dll) track-nya di-hardcode `#2A2D31`** (abu gelap), gak pernah ikut tema. Fix: tarik jadi variabel `--switch-track-off` (dark `#2A2D31`, light `#D6CDB6`).
- Bonus: box "sample kalibrasi" di modal juga kebetulan pakai `rgba(255,255,255,.04)` yang jadi nyaris gak keliatan di panel putih (light theme) — ditarik jadi variabel `--subtle-fill` yang nyesuain arah tint-nya per tema (putih tipis di dark, hitam tipis di light).
- 9/9 test tambahan pass (color-scheme ke-set bener di semua kombinasi OS/tema, switch track & calib-sample warnanya bener-bener beda antar tema, range input tetap fungsional setelah di-custom-styling) + screenshot visual cross-check kombinasi OS-dark+app-Terang (skenario yang awalnya munculin bug).
- `sw.js` cache `v7` → `v8`.

## ✅ v3h — Touch feedback di semua tombol (selesai)

- Semua `<button>` (+ `.sectionItem`, div section-jump yang diperlakukan kayak tombol) sekarang punya respon instan pas ditekan: **membesar dikit** (`scale(1.07)`) + **indikator brightness** (`filter:brightness(1.2)`), transisi cepat (`.1s`). Aturan global satu tempat (`button, .sectionItem { ... }` di awal `styles.css`), bukan nge-duplicate per komponen — otomatis kepakai di tab bar, toolbar, preset, tema toggle, start button, control bar (termasuk yang accent/playBtn), speed popover, remote pad, section jump, dst.
- Pilih `:active` (bukan `:hover`) karena itu yang beneran ngerespon touch — `:hover` gak reliable di touch device (kadang gak nyala sama sekali, kadang nyangkut/"sticky" abis tap).
- `-webkit-tap-highlight-color:transparent` disertain biar gak numpuk sama highlight flash bawaan Android Chrome yang keliatan norak kalau digabung sama animasi custom kita.
- `input[type=range]` sengaja **dikecualiin** — nge-scale seluruh elemen pas lagi di-drag bisa bikin jarak visual antara jari/kursor sama thumb keliatan aneh.
- `prefers-reduced-motion` di-hormatin — transform di-disable buat yang minta gerakan diminimalin, indikator brightness tetap jalan (bukan efek gerak, jadi aman).
- 15/15 test end-to-end Playwright (simulasi `mouse.down()`/`mouse.up()` beneran, bukan cuma cek CSS statis) — verifikasi transform berubah pas ditekan & balik normal pas dilepas, di semua kategori tombol: tab bar, tema toggle, preset, start button, toolbar, control bar (termasuk accent bg), section jump item (div).

## 🔧 Fix — Evaluasi color & UI/UX (4 temuan)

Diminta Eko buat evaluasi color scheme & UI/UX aplikasi asli (bukan mockup) — dicek dark/light theme, mobile/desktop, screenshot Playwright headless. 4 temuan genuine (udah dipisahin dari 3 false-alarm hasil screenshot: highlight yang keliatan nabrak ternyata cuma 1 baris ter-wrap panjang, tab-switch keliatan salah ternyata cuma ke-capture di tengah transisi CSS, preview kosong ternyata cuma debounce `scheduleEstimate` belum sempet jalan pas screenshot diambil):

- **Tabrakan nama & visual "Gelap/Terang"** — panel "Tema aplikasi" & toggle preset "Warna panggung" sama-sama punya tombol berlabel "Gelap"/"Terang" dengan gaya identik, jadi keliatan kayak satu grup padahal dua hal beda (ngatur chrome UI vs warna panggung teleprompter). Fix: pecah kartu `.panel` "Tampilan" jadi dua — "Tema Aplikasi" (cuma toggle tema) dan "Panggung" (ukuran teks, margin, warna panggung + custom fields) — disambiguasi lewat pengelompokan/proximity, bukan ganti label tombol.
- **Tab Setting kepanjangan/padat** — kesolve sebagai efek samping dari pecahnya kartu di atas, gak ada perubahan struktural terpisah.
- **Preview tab ada dead-zone kosong** di viewport mobile umum — `textarea#script` & `.previewBox` sekarang `flex:1` ngisi sisa ruang vertikal di bawah `880px`, di-scope ke `@media (max-width:879.98px)` doang. Desktop sengaja **gak** ikut berubah — preview box di sana tetap snippet pendek (`height:220px` fixed) biar gak membengkak ngikutin panjang naskah kalau di-apply flex-fill juga (sempat kejadian pas development, previewBox tumbuh 1300px+ nutupin tombol Mulai — makanya di-scope ulang).
  - Ternyata `#setup` cuma `min-height:100vh` (bukan `height`), jadi `flex:1` di anak-anaknya gak ada "sisa ruang" jelas buat di-grow-kan — fix tambahan: `#setup{height:100vh;height:100dvh;overflow-y:auto;}` + `main.layout{min-height:0;}`, tapi cuma di breakpoint mobile yang sama (desktop tetap `min-height:100vh` + scroll halaman biasa).
- **Kontras track slider rendah** di dark theme — track yang belum ke-isi (`--switch-track-off` lama, `#2A2D31`) nyaris nyatu sama background panel. Fix: rename jadi `--control-track` (dipakai bareng buat range track & toggle switch track), dark value dinaikin ke `#363A40`, light value (`#D6CDB6`) gak berubah.
- 5 suite Playwright headless yang ada di-rerun full buat regresi (implementation/theme/stagecolor/colorscheme/touchfeedback) — semua pass setelah 1 assertion di `e2e-colorscheme.js` di-update (nilai lama `--switch-track-off` diganti `--control-track` yang baru). Screenshot visual mobile-dark/light & desktop dicek manual buat verifikasi ke-4 fix.
- `sw.js` cache `v9` → `v10`.

## 🔧 Fix — Header layar setup ketutup notch/dynamic island

- Dilaporkan Eko: area atas (logo "Tatap" + tagline) ketutup notch/dynamic island di HP tertentu. Penyebab: `viewport-fit=cover` udah di-set di meta viewport (biar app bisa gambar sampai ke tepi layar), tapi cuma `.tabbar` di bawah yang reserve `env(safe-area-inset-bottom)` — `#setup` di atas masih padding-top fixed `32px` doang, gak reserve `env(safe-area-inset-top)`.
- Fix: `#setup{padding:calc(32px + env(safe-area-inset-top,0px)) ...}` — di device tanpa notch/`env()` unsupported, fallback `0px` bikin behaviour persis sama kayak sebelumnya (32px polos); di device dengan notch, otomatis nambah jarak sebesar area aman OS.
- **Belum bisa divalidasi visual di sandbox ini** — Playwright/Chromium headless resolve `env(safe-area-inset-top)` ke `0px` (gak ada notch beneran buat disimulasikan), jadi cuma keverifikasi CSS-nya valid & gak ngerusak layout non-notch (padding tetap `32px` seperti semula). **Perlu dicek manual sama Eko di HP asli yang punya notch/dynamic island.**
- Konteks tambahan (klarifikasi Eko): kasusnya khususnya kalau app dijalankan sebagai **PWA terinstall** (bukan sekadar tab browser). Confirmed relevan — `manifest.json` `display:"standalone"` + meta `apple-mobile-web-app-status-bar-style:black-translucent` di `index.html` itu justru yang bikin konten iOS home-screen app digambar **di bawah** status bar/notch (translucent = area status bar transparan, konten nembus sampai atas). Itu sebabnya `env(safe-area-inset-top)` diperlukan — di mode browser tab biasa, browser chrome (address bar dll) udah otomatis ngasih jarak, gak terlalu keliatan; di PWA standalone gak ada browser chrome sama sekali jadi notch beneran nutup konten kalau gak di-reserve manual.
- `sw.js` cache `v10` → `v11`.

## 🔧 Fix — Minimum ukuran teks 24px kurang rendah

- Dilaporkan Eko: opsi "Ukuran teks" di panel Panggung minimalnya `24px`, kurang buat kebutuhan yang mau teks lebih kecil. Fix: `min` di `#sizeRange` diturunin ke `14px` — `value`/`max`/langkah lain gak berubah, cuma nambah rentang di ujung bawah.
- Gak ada logic lain yang gantung ke nilai `24` (dicek: `state.size` cuma dipake buat `fontSize` di preview/stage & input ke `measureScript`, gak ada clamp/asumsi minimum di `app.js`), jadi aman diturunin tanpa efek samping.
- Diverifikasi manual via Playwright: attribute `min` ke-apply bener, geser slider ke `14` beneran ngubah `sizeVal`/font-size preview.
- `sw.js` cache `v11` → `v12`.

## 🔧 Fix — Padding safe-area kegedean di PWA (gak harmonis)

- Fix notch/dynamic-island di atas kerja (gak ketutup lagi, confirmed via screenshot device asli), tapi Eko lapor spacing-nya **gak harmonis** — atas (header) maupun bawah (tab bar) — dan **cuma kejadian di mode PWA terinstall**, gak di tab browser biasa.
- Root cause: dua tempat yang reserve safe-area (`#setup` padding-top, `.tabbar` margin-bottom) pakai `calc(base + env(safe-area-inset))` — **additive**, bukan `max()`. Di tab browser, `env()` resolve ke `0px` (browser chrome-nya sendiri udah reserve area itu), jadi selisihnya nyaris gak keliatan. Di PWA standalone, `env()` resolve ke nilai asli (status bar/home indicator OS, bisa ~59px/~34px di iPhone ber-Dynamic-Island) — ke-tambah ke base `32px`/`10px` yang emang didesain buat konteks non-notch, hasilnya jarak dobel-dobelan (mis. `32px + 59px = 91px` di atas) yang keliatan berlebihan/gak proporsional dibanding skala spacing lain di app.
- Fix: ganti `calc(base + env(...))` jadi `max(base, env(...))` di kedua tempat — `#setup{padding-top:max(32px, env(safe-area-inset-top,0px))}` dan `.tabbar{margin-bottom:max(10px, env(safe-area-inset-bottom,0px))}`. Device tanpa notch/PWA tetap dapet `32px`/`10px` (gak berubah), device dengan safe-area besar cuma dapet SEBESAR area aman itu (gak ditambah base lagi) — jadi jarak pas buat nge-clear notch/home-indicator tanpa nambah whitespace ekstra di atasnya.
- Belum bisa divalidasi visual lagi di sandbox (limitasi sama seperti fix sebelumnya) — **perlu dicek ulang manual sama Eko di PWA device asli**.
- `sw.js` cache `v12` → `v13`.

## 🔧 Fix — Konten tab Setting numpuk/overlap sama footer (bug beneran, bukan cuma spacing)

- Eko kirim screenshot: setelah fix `max()` di atas, tab Setting yang di-scroll ke bawah keliatan **kacau beneran** — teks footer ("Naskah & pengaturan disimpan otomatis...") numpuk tepat di atas tombol "Kalibrasi kecepatan baca", dan header ("TEMA APLIKASI") ke-scroll sampai nempel status bar. Ini bukan cuma soal jarak kurang pas — ada bug layout asli.
- Root cause: `#setup` (bukan `.panelGroup`) yang jadi scroll container tunggal (`overflow-y:auto`, dari fix dead-zone sebelumnya). Konten tab Setting (3 kartu, lebih tinggi dari box yang di-alokasikan flex ke `.panelGroup`) gak punya `overflow` sendiri, jadi kelebihan tingginya cuma "bocor" keluar box (overflow:visible bawaan) TANPA dorong sibling di bawahnya (`<footer class="note">`, yang posisinya dihitung dari box `.panelGroup` yang lebih pendek dari konten aslinya) — makanya numpuk. Header ikut ke-scroll bareng karena dia sejajar `.panelGroup` di dalam scroll container yang sama (`#setup`), jadi begitu discroll, dia lewatin balik area aman notch yang cuma direserve di posisi scroll paling atas.
- Fix: scroll container-nya dipindah ke `.panelGroup` sendiri (`overflow-y:auto`, mobile-only), bukan `#setup`. Efeknya: (1) tiap tab (Naskah/Setting/Preview) sekarang scroll independen di dalam box-nya sendiri kalau kontennya kepanjangan — kelebihan tinggi Setting gak bocor lagi, otomatis ke-contain & scrollable, gak numpuk ke footer; (2) header (logo+tagline) yang ada DI LUAR `.panelGroup` jadi gak ikut ke-scroll sama sekali — selalu nempel di atas, gak pernah lewatin notch lagi, sekalian nyelesain concern "menu atas kacau pas discroll".
- `#setup{overflow-y:auto}` dibiarin nyala juga (safety net edge-case), tapi normalnya gak pernah kepakai lagi karena `.panelGroup` udah nge-contain overflow-nya sendiri.
- Diverifikasi: `panelGroup.scrollHeight > clientHeight` (938 vs 552 buat sample naskah dites) sementara `footer` posisinya tetap gak gerak pas `.panelGroup` di-scroll — overlap check (`getBoundingClientRect` footer vs tombol kalibrasi) `false` setelah scroll ke bawah. Screenshot manual cross-check: header pinned, footer bersih di bawah "Jadi remote control dari HP ini" tanpa numpuk. Desktop dicek gak kesentuh (`overflow-y` tetep `visible`, scoped ke mobile breakpoint doang).
- `sw.js` cache `v13` → `v14`.

## 🔧 Fix — Toolbar Naskah kepenyet sampai 2px di viewport pendek (iPhone SE)

- Diminta Eko cek detil visual mobile sebelum merge PR #11 (mastiin gak ada yang rusak). Audit Playwright headless nyeluruh (3 kombinasi viewport/tema: iPhone 14 390×844 dark/light, iPhone SE 375×667 dark) nemuin bug lain yang belum pernah kesorot — **bukan regresi dari fix-fix sebelumnya, tapi bug laten yang cuma keliatan di viewport pendek** yang belum pernah dites.
- Root cause: toolbar (Simpan/Tersimpan/Import) punya `overflow:hidden` (buat clip sudut tombol bersegmen biar ngikut border-radius kartu). Spec flexbox bilang **automatic minimum size** suatu flex item = ukuran konten (min-content) HANYA kalau `overflow`-nya `visible` — kalau bukan (`hidden`, dst), otomatis jadi `0`. Jadi pas total tinggi konten Naskah (toolbar + textarea `min-height:380px` + hint) lebih gede dari box yang tersedia (kejadian di viewport pendek kayak iPhone SE), `flex-shrink` bawaan (default `1` di semua elemen) "meratain" defisitnya ke semua sibling — tapi textarea gak bisa nyusut (ke-floor `min-height:380px`), jadi SEMUA defisit ditanggung toolbar (yang gak dilindungi min-content-nya sendiri karena `overflow:hidden`), nyusut sampe cuma **2px** — tombol Simpan/Tersimpan/Import ilang total.
- Fix: `flex-shrink:0` di semua elemen non-flexible di tab Naskah & Preview (`.toolbar`, `.hint-inline`, `.previewLabel`, `.previewCaption`, `.estimate`, `#startBtn`, `.hint`) — cuma `textarea#script` & `.previewBox` yang boleh nyusut/gede. Kelebihan tinggi (kalau viewport-nya emang pendek banget) sekarang di-scroll rapi lewat `.panelGroup{overflow-y:auto}` (fix sebelumnya), bukan nyusutin elemen yang harusnya ukuran tetap.
- Diverifikasi: toolbar balik ke tinggi natural (`61px`, dari `2px`) di iPhone SE simulasi, screenshot manual cross-check 3 kombinasi viewport/tema × ~12 state per kombinasi (naskah kosong/terisi, Setting atas/bawah/custom-color, Preview, modal kalibrasi, modal library, stage+control bar, speed popover, section panel, remote pad) — semua bersih, gak ada yang kepenyet/numpuk/overlap. Regression suite penuh (implementation/theme/stagecolor/colorscheme/touchfeedback) tetap pass.
- `sw.js` cache `v14` → `v15`.

## 🔧 Fix — Footer "Naskah & pengaturan disimpan..." nongol di semua tab

- Eko notice: teks footer privasi/penyimpanan nongol identik di ketiga tab (Naskah, Setting, Preview). Penyebab: `<footer class="note">` posisinya di luar ketiga `.panelGroup` — sibling dari `<main>`/`<nav class="tabbar">`, jadi gak ikut sistem show/hide per-tab (`.panelGroup.active{display:flex}`), otomatis kerender terus di semua tab.
- Ditanya ke Eko mau ditaruh di mana — jawabannya: cuma di tab Naskah (tab default/pertama).
- Fix: `<footer class="note">` dipindah jadi anak terakhir `#panelNaskah` (setelah `.hint-inline`), dihapus dari posisi global-nya. Otomatis cuma nongol pas tab Naskah aktif (mobile) / di kolom Naskah doang (desktop, 3 kolom).
- `footer.note` ditambahin ke daftar `flex-shrink:0` (sekarang dia anak `.panelGroup` yang scrollable, perlu proteksi yang sama kayak `.hint-inline` biar gak ikut kepenyet di viewport pendek).
- Diverifikasi: query DOM konfirmasi footer cuma ada di `#panelNaskah`, gak ada di `#panelSetting`/`#panelPreview`, dan invisible pas tab lain aktif. Screenshot mobile & desktop cross-check — bersih, gak ada duplikasi. Regression suite tetap pass.
- `sw.js` cache `v15` → `v16`.

## ✅ v3j — Toolbar Naskah dirombak: primary/secondary, bukan tab-switcher palsu (selesai)

- Eko kasih feedback: tombol Simpan/Tersimpan/Import "gak begitu intuitive" dari sisi label, icon, bentuk, & posisi. Diagnosis:
  1. **Label mirip** — "Simpan" vs "Tersimpan" cuma beda prefix, gampang salah baca sekilas, padahal fungsinya beda jauh (aksi instan vs buka daftar). Makin parah karena tombol Simpan sendiri, abis diklik, LABEL-nya flash jadi "Tersimpan!" — jadi dua tombol bersebelahan bisa nampilin kata yang nyaris sama persis.
  2. **Bentuk segmented nyamain tab-switcher** — ketiganya difusi jadi satu strip bordered rata (persis gaya tab bar Naskah/Setting/Preview), padahal ketiganya jenis interaksi beda: Simpan aksi instan, Tersimpan/Daftar buka modal, Import buka file-picker. Nyamain visualnya bikin otak baca ini sebagai "pilihan view", bukan "tiga aksi beda".
  3. Icon save (floppy) & folder sama-sama "berkonotasi storage", nambah kebingungan.
- Ditanya scope ke Eko — dipilih: **pisahin visual primary/secondary** (bukan cuma rename+icon).
- Fix: toolbar direstruktur jadi `.toolbarRow` berisi `.toolPrimary` (Simpan — aksi paling sering, jadi tombol menonjol: border+background accent, icon+label sejajar horizontal, lebar dominan `flex:1`) + `.toolSecondary` (grup Daftar+Import — aksi lebih jarang, jadi pasangan tombol kecil `62px` muted, icon+label kecil ke bawah kayak sebelumnya, badge count tetap nempel di Daftar).
- Label "Tersimpan" (tombol daftar naskah) diganti jadi **"Daftar"** — beresin tabrakan kata sama flash "Tersimpan!" di tombol Simpan sekalian (flash text-nya sendiri dibiarin, gak nabrak lagi karena tetangganya udah ganti nama).
- Class lama `.toolbar`/`.toolItem` diganti total (`.toolbarRow`/`.toolPrimary`/`.toolSecondary`/`.toolSecondaryBtn`) — termasuk update referensi di aturan `flex-shrink:0` (fix viewport-pendek sebelumnya) yang masih nunjuk ke `.toolbar` lama, supaya proteksi anti-kepenyet tetap kepakai di struktur baru.
- Diverifikasi: DOM metrics (toolbar row `55px`, `flex-shrink:0` aktif, ketiga tombol full-size) di iPhone SE simulasi — gak ada regresi kepenyet. Flow Simpan (dialog `prompt()` buat nama naskah baru, flash "Tersimpan!", revert ke "Simpan") tetap jalan lewat Playwright dialog handling. Screenshot cross-check iPhone 14 dark/light, iPhone SE dark, desktop 3-kolom — bersih. Regression suite penuh (implementation — 1 assertion di-update ngikutin class baru, library, theme, touchfeedback) pass.
- `sw.js` cache `v16` → `v17`.

## 🔧 Fix — Remote pad kepenceng, Tema Aplikasi kekuatan visual

Tiga temuan sekaligus dari Eko: "tombol di remote gak jalan efektif", "visualnya gak intuitif dan handy", "control Tema Aplikasi terlalu kuat dan makan ruang".

- **Bug asli: tombol play/pause di remote pad gak center** — `#remoteBtnPlayPause` punya `display:flex` (buat center-in icon-nya sendiri), tapi efek sampingnya bikin dia jadi block-level, jadi gak lagi ngikut `text-align:center` dari `#remotePad` (parent). Hasilnya tombol nempel ke kiri, bukan di tengah — target sentuh utama remote jadi kepenceng, konsisten sama laporan "gak jalan efektif". Fix: `margin:0 auto` langsung di tombolnya, gak gantung ke `text-align` parent lagi.
- **Baris Section gak konsisten sama baris Speed** — Speed pakai pola `[−][70][+]` (tombol-label-tombol), Section malah `[‹ Section][Section ›]` (dua tombol lebar isi teks "Section" dobel, kata yang sama keulang berdampingan). Direstruktur biar sama-persis pola-nya: `[‹][Section][›]`. Label "Section" dikasih warna muted (beda dari label speed yang accent-colored) karena ini teks statis, bukan nilai live kayak angka speed.
- **Tombol `.remoteRow` (−/+/‹/›) kepaksa `flex:1` stretch ngisi 320px penuh** — jadinya pil lebar aneh buat cuma nampung 1 icon, `justify-content:center` di parent-nya jadi percuma karena gak ada sisa ruang buat di-center-in. Fix: ukuran tetap (`52×48px`), `flex:none` — sekarang jadi cluster kompak yang bener-bener kekontrol di tengah.
- **Kartu "Tema Aplikasi" terlalu berat buat preference yang jarang diubah** — sebelumnya kartu penuh (h3 header + `<label>` yang isinya literally ngulang teks h3 lagi + toggle di baris terpisah), visual weight-nya nyamain "Panggung" di bawahnya padahal itu kartu dengan slider yang jauh lebih sering diutak-atik. Fix: dipadetin jadi SATU baris (`.themeRow`: label kiri, toggle kanan, padding kartu dikurangin), label `<label>Tema aplikasi</label>` yang redundan dihapus total.
- Sekalian ketemu 1 test lama yang stale (bukan gara-gara perubahan ini) — `e2e-remote.js` masih assert `textContent` tombol play/pause = emoji `⏸`/`▶`, padahal sejak v3e ikon-nya udah pindah ke SVG `<use href>` (gak ada text content lagi). Diupdate buat cek `href` attribute-nya.
- Diverifikasi: DOM metrics konfirmasi play/pause bener-bener center (`diff: 0`) di 3 kombinasi viewport. Screenshot cross-check mobile dark/light/SE & desktop — remote pad & Tema Aplikasi keduanya bersih. Regression suite penuh (implementation, theme, remote, stagecolor, colorscheme, touchfeedback, library) pass.
- **Belum bisa divalidasi koneksi P2P beneran** (limitasi sandbox yang sama kayak v3d) — remote pad di-screenshot dengan cara force-show DOM (`hidden=false` manual), bukan lewat koneksi asli. Fungsional tombol (kirim command via data channel) belum tervalidasi ulang di device fisik.
- `sw.js` cache `v17` → `v18`.

## 🔧 Fix — Indikator playing/paused di remote pad kurang beda

- Follow-up dari fix di atas: Eko minta indikator play/pause di remote pad yang lebih intuitive & beda jelas antar 2 state. Sebelumnya cuma icon yang beda (pause-bars vs play-triangle) — susah kebeda sekilas/dari jarak jauh, apalagi konteks pemakaiannya emang sambil rekam (gak selalu merhatiin closeup ke HP remote).
- Fix: warna fill tombol sekarang ikut beda per state, bukan cuma icon. **Playing** = solid accent fill (konsisten sama makna "aktif/on" yang dipakai elemen lain se-app, mis. switch checked). **Paused** = outline doang (`background:transparent`, border+icon accent) — nunjukkin "idle/berhenti" tanpa beban visual kayak lagi aktif.
- `applyRemoteState()` (dipanggil pas terima state message dari host lewat data channel) sekarang toggle class `.isPaused` bareng swap `href` icon yang udah ada sebelumnya — satu sumber state, dua sinyal visual (warna + bentuk icon) yang saling nguatin.
- Diverifikasi: simulasi kedua state (toggle class + href manual, karena P2P beneran gak bisa ditest di sandbox) — dark & light theme, warna fill kekonfirmasi transparent penuh pas paused vs solid accent pas playing. Regression suite (remote, implementation, touchfeedback) pass.
- `sw.js` cache `v18` → `v19`.

## 💭 v4 — Ide, belum dianalisis teknis

- Sync naskah laptop ↔ iPad (opsi: manual export/import JSON dulu, baru pertimbangkan backend ringan kalau frekuensi pakai tinggi)
- Export caption/SRT dari naskah + timing scroll
- Bluetooth remote / foot pedal support (kemungkinan besar gratis — keyboard event sudah ada, tinggal mapping)

## Prioritas yang disarankan

Semua item v3 (a–j) udah selesai dikerjakan — remote control (v3d) masih butuh verifikasi manual koneksi P2P beneran (lihat catatan di v3d), mobile readiness (v3e) juga baru divalidasi otomatis, belum dicoba di device fisik. Beberapa fix safe-area/PWA (notch, padding, scroll container) juga masih nunggu verifikasi manual di device asli — lihat catatan di masing-masing entri fix. Sisa roadmap tinggal v4, yang masih ide dan belum dianalisis teknis — perlu obrolan/scoping dulu sama pemilik repo sebelum mulai, sesuai catatan di masing-masing item.
