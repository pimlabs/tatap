# Kontribusi

Tatap adalah project personal milik Eko, di-host di org GitHub `pimlabs`. Bukan produk open-source yang aktif menerima kontribusi luar — tapi kalau ada yang mau bantu (issue, PR kecil), berikut aturannya.

## Sebelum Mulai

Baca [AGENTS.md](AGENTS.md) dulu. Itu source of truth untuk arsitektur, konvensi kode, dan batasan project. Jangan ubah apapun yang bertentangan dengan dokumen itu tanpa diskusi sama pemilik repo.

## Non-Negotiable

- Tidak ada build step (no npm, no bundler, no transpiler).
- Tidak ada backend/server — pure static files.
- Satu file `index.html` untuk seluruh app (HTML + CSS + JS).
- Tidak ada dependency/library/CDN baru tanpa diskusi eksplisit dengan pemilik repo.

## Cara Test Lokal

```bash
bunx serve .                 # kalau ada Bun
uv run -m http.server 8000   # kalau ada uv
python3 -m http.server 8000  # fallback paling universal
```

Lalu buka `http://localhost:8000`. Lihat [README.md](README.md) untuk detail lain.

## Commit Convention

Pesan commit singkat, imperatif, konsisten satu bahasa per commit:

```
tambah: section jump dengan marker ---
fix: highlight tidak reset setelah restart
docs: update ROADMAP untuk v3
```

## Lisensi

Kontribusi ke repo ini dianggap dilisensikan di bawah [MIT License](LICENSE) yang sama dengan project.
