# Design System · Tatap

Referensi token dan pola komponen buat `styles.css`. Tujuannya: keputusan visual (radius berapa, tombol jenis apa buat kontrol ini) gak perlu ditimbang ulang dari nol tiap nambah fitur baru.

Lahir dari audit `styles.css` yang nemuin 12 nilai border-radius, 15 ukuran font, dan sekitar 19 varian class tombol yang gak punya skala jelas. Lihat `ROADMAP.md` v3m untuk konteks lengkap kenapa dokumen ini dibuat.

## Prinsip

1. **Intuitive dulu, baru rapi.** Setiap komponen harus langsung kebaca fungsinya tanpa mikir: icon harus match esensi aksi (bukan sekadar mirip), label gak boleh ambigu, dan jenis kontrol harus cocok sama jenis keputusan (checkbox buat biner, button-group buat pilihan majemuk yang mutually-exclusive, slider buat rentang kontinu).
2. **Clean.** Minim ornamen, minim warna yang gak perlu. Satu warna aksen (`--accent`) dipakai konsisten buat nunjukkin "ini aktif/interaktif", bukan disebar buat dekorasi.
3. **Icon SVG doang, gak pernah emoji.** Emoji render beda-beda tiap OS/browser dan gak konsisten gaya garisnya. Semua icon ambil dari sprite `<symbol>` di awal `index.html` (`<use href="#i-xxx">`), gaya hand-drawn line icon (`stroke-width:1.8`, sudut membulat). Butuh icon baru yang belum ada di sprite: tambah symbol baru ngikut gaya yang sama, jangan pakai emoji sebagai jalan pintas.
4. **Reuse sebelum bikin baru.** Sebelum nambah class tombol/toggle baru, cek dulu apakah salah satu pola di bawah udah cocok. Kalau kepengen "agak beda dikit", itu biasanya tanda kurang teliti liat pola yang ada, bukan kebutuhan varian baru.
5. **Zero-build tetap final.** Semua di bawah ini CSS custom properties dan class biasa, gak ada preprocessor/build step. Lihat `AGENTS.md` buat batasan arsitektur proyek.

## Token warna

Sudah konsisten dipakai di seluruh app, gak berubah:

| Token | Peran |
|---|---|
| `--bg` | Dasar layar |
| `--panel` | Permukaan kartu/modal |
| `--panel-border` | Garis tepi kartu, input, tombol outline |
| `--text` | Teks utama |
| `--muted` | Teks sekunder, label, placeholder |
| `--accent` | Aksi dan state aktif |
| `--accent-dim` | Background state aktif (tint tipis dari accent) |
| `--control-track` | Track slider dan toggle switch yang belum ke-isi |
| `--subtle-fill` | Tint halus (contoh: box sample kalibrasi) |

Ditambah, buat nutup 4 tempat yang selama ini ngetik ulang hex code yang sama dan 3 tempat yang ngetik ulang warna danger:

| Token baru | Nilai (dark / light) | Ganti hardcode di |
|---|---|---|
| `--on-accent` | `#161208` (sama di kedua tema) | `#startBtn`, `.btn-accent`, `#controlBar .playBtn`, `#remoteBtnPlayPause` |
| `--danger` | `#c0524a` (sama di kedua tema) | `#remoteBtnExit`, `.libDelete` |
| `--danger-text` | `#e0776f` (sama di kedua tema) | `#remoteBtnExit`, `.libDelete:hover`, `.remoteError` |
| `--success` | `#5FCB86` (sama di kedua tema) | `.dotOnline` |

## Skala radius

12 nilai yang ada sekarang (5, 8, 10, 12, 13, 14, 16, 18, 22, 99, 999px) dipadetin jadi 4 langkah:

| Token | Nilai | Dipakai buat |
|---|---|---|
| `--r-sm` | `8px` | Chip, badge, opsi di dalam segmented control |
| `--r-md` | `12px` | Tombol, input teks/warna |
| `--r-lg` | `16px` | Kartu panel, modal, textarea (ganti `--radius` lama yang `14px`) |
| `--r-pill` | `999px` | CTA utama, toggle switch, badge bulat |

Lingkaran penuh (tombol icon-only di control bar stage, knob switch, dll) tetap `border-radius:50%`, di luar skala ini.

## Skala tipe

15 ukuran yang ada sekarang dipadetin jadi 7 langkah. Kalau kepengen "agak lebih gede dikit" dari salah satu langkah, itu tanda butuh langkah baru yang bakal dipakai berkali-kali, bukan angka sekali-pakai:

| Token | Nilai | Dipakai buat |
|---|---|---|
| `--fs-label` | `11px` | Header kartu (uppercase, letter-spacing), meta info |
| `--fs-meta` | `12px` | Hint, caption, teks penjelas kecil |
| `--fs-sm` | `13px` | Label field, item list |
| `--fs-body` | `14px` | Teks body standar, tombol |
| `--fs-lg` | `16px` | Textarea naskah, input besar |
| `--fs-h3` | `20px` | Judul modal |
| `--fs-h1` | `26px` | Wordmark "Tatap" |

## Pola komponen

### Tombol

5 pola, gantiin 19 class lama:

| Class baru | Ganti | Kapan dipakai |
|---|---|---|
| `.btn-fill` | `.toolPrimary` | Aksi utama di dalam kartu/panel (background solid accent) |
| `.btn-fill.btn-pill` | `#startBtn`, `.btn-accent` | CTA paling penting di layar (mis. "Mulai") |
| `.btn-outline` | `.btn-secondary`, `.remoteActionRow button`, `.toolSecondaryBtn` | Aksi sekunder, border tipis, gak nge-fill |
| `.btn-quiet` | `.btn-ghost`, `.linklike` | Aksi tersier, low-emphasis (tutup, batal, putuskan) |
| `.btn-danger` | `.libDelete`, `#remoteBtnExit` | Aksi destructive, warna merah dari awal (bukan cuma pas `:hover`, karena touch device gak punya hover state sebelum disentuh) |

### Segmented control (`.seg`)

Gantiin `.themeOpt`, `.speedPresetBtn`, dan `.presets button`, tiga implementasi ulang dari pola yang sama persis. Dipakai buat pilihan majemuk yang mutually-exclusive (contoh: Gelap/Terang/Sistem).

```html
<div class="seg">
  <button class="opt active">Gelap</button>
  <button class="opt">Terang</button>
  <button class="opt">Sistem</button>
</div>
```

### Toggle switch (`.switch`)

Sudah konsisten, gak diubah. Dipakai buat pertanyaan biner (on/off), bukan pilihan majemuk. Aturan pemilihan:

- **2 pilihan yang genuinely mutually-exclusive dan setara** (contoh: Gelap vs Terang, sama beratnya) → segmented control.
- **1 pertanyaan ya/tidak** (contoh: "custom warna panggung: iya atau ngikut tema?") → toggle switch, bukan segmented 2-opsi.

## Yang sengaja dikecualikan

**Overlay stage** (`#controlBar`, `#speedPopover`, `.overlay-panel`, `#countdownOverlay`). Sengaja selalu gelap-translucent apapun tema app, karena harus tetap legible di atas warna panggung custom milik user yang bisa apa aja. Gak ditarik ke token `--panel`/`--panel-border` yang ngikut tema. Nilai `rgba()`-nya sendiri dirapiin jadi 3 token terpisah:

| Token | Nilai |
|---|---|
| `--overlay-bg` | `rgba(20,20,22,.9)` |
| `--overlay-border` | `rgba(255,255,255,.1)` |
| `--overlay-hover` | `rgba(255,255,255,.12)` |

## Status implementasi

Dokumen ini proposal. Belum ada kode yang dieksekusi dari sini. Rencana eksekusi (3 fase, low-risk dulu):

1. **Token dulu.** Tambah semua variabel di atas ke `:root` (3 blok tema, ngikut pola yang udah ada). Ganti nilai hardcode yang cocok ke variabelnya. Nol perubahan visual, screenshot before/after harus identik.
2. **Konsolidasi tombol per grup.** Satu grup per commit (mulai dari `.seg`, paling banyak duplikasi), bukan sekaligus 19 class. Target: nol perubahan visual, cuma nama class yang beda.
3. **Skala tipe, paling akhir.** Beberapa ukuran (11.5px, 12.5px, 10.5px) bakal dibulatin ke tetangga terdekat. Satu-satunya fase yang punya kemungkinan kecil kelihatan beda 1px. Screenshot cross-check penuh sebelum di-ship.

## Catatan penulisan

Berlaku buat teks di UI dan dokumen ini sendiri: gak pakai tanda hubung panjang (em dash) buat menyambung klausa. Pakai titik, koma, atau titik dua. Separator dalam satu baris (mis. antar item hint) pakai titik tengah (`·`, `&middot;`), bukan em dash.
