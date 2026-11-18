# DESIGN.md: KarirTrack (Jurnal & Manajemen Lamaran Kerja)

## Design Read & Dials
Reading this as: Personal Career & Job Application Workspace for Indonesian job seekers, in an Editorial Warm & Tactile journal style, dial **ENERGY 2 / RHYTHM 3 / MOTION 2**.

- **Dial:** `ENERGY 2 / RHYTHM 3 / MOTION 2`
- **Identity & Mood:** Terasa seperti buku jurnal karir cetak dan map berkas kerja pribadi (*dossier*) di atas meja kerja yang hangat, terstruktur, jujur, dan fokus pada tindakan nyata.

## Color Palette (2 Core Families + 1 Deliberate Accent, R-29 & R-25 Verified)

1. **Core 1: Warm Paper & Obsidian Canvas**
   - Light Canvas: `#FAF6F0` (Kertas krem hangat)
   - Elevated Card / Surface: `#FFFFFF` dan `#F3EDE2` (Warm Sand)
   - Dark Canvas: `#161412` (Warm Obsidian)
   - Dark Surface: `#211E1B` dan `#2A2622`
   - *Alasan (R-31):* Mengurangi silau layar putih murni saat pencari kerja membaca puluhan deskripsi lowongan, sekaligus membangun karakter jurnal fisik yang berbeda dari template SaaS biru-putih.

2. **Core 2: Espresso & Stone Ink Hierarchy**
   - Light Ink Primary: `#1C1917` (16.24:1 di atas `#FAF6F0`)
   - Light Ink Secondary: `#44403C` (9.54:1 di atas `#FAF6F0`)
   - Light Ink Muted: `#57534E` (7.09:1 di atas `#FAF6F0`, 6.55:1 di atas `#F3EDE2`)
   - Dark Ink Primary: `#F5F5F4` (16.84:1 di atas `#161412`)
   - Dark Ink Secondary: `#D6D3D1` (12.33:1 di atas `#161412`)
   - Dark Ink Muted: `#A8A29E` (6.58:1 di atas `#211E1B`)
   - Structural Hairlines: `#D6CFC2` (Light) / `#38332E` (Dark)
   - *Alasan (R-31):* Kontras teks melampaui standar WCAG AA (4.5:1) di semua permukaan terang maupun gelap agar nyaman dibaca di layar HP luar ruangan maupun malam hari.

3. **Deliberate Accent (1 Accent Only): Terracotta Clay**
   - Primary Accent: `#C2410C` dengan teks `#FFFFFF` (5.18:1)
   - Hover / Active Accent: `#9A3412` dengan teks `#FFFFFF` (7.31:1)
   - *Alasan (R-31):* Warna terracotta digunakan khusus pada titik aksi utama (`+ Catat Loker`, indikator menu aktif, dan tombol simpan utama) agar mata pengguna langsung menemukan aksi terpenting di setiap layar.

## Typography (R-06 & R-31)

- **Display & Section Headings:** `'Fraunces', Georgia, serif`
  - *Alasan (R-31):* Memberi karakter editorial seperti tajuk jurnal dan membuat angka metrik utama memiliki bobot visual tanpa perlu dekorasi ikon generik.
- **UI Body & Controls:** `'Plus Jakarta Sans', system-ui, sans-serif`
  - *Alasan (R-31):* Dirancang dengan proporsi x-height tinggi yang sangat terbaca untuk teks Bahasa Indonesia dan label antarmuka rapat di layar ponsel.
- **Dates, Salaries & Index Numbers:** `'JetBrains Mono', monospace` dengan `font-variant-numeric: tabular-nums`
  - *Alasan (R-31):* Menjaga kesejajaran vertikal nominal gaji (`Rp 20.000.000`), tanggal (`20 Nov 2026`), dan nomor indeks berkas (`#01`) saat dipindai cepat.

## Identity Motif & Structural Decisions (R-31)

- **Identity Motif (Stempel Indeks & Garis Berkas Editorial):** Setiap kartu loker dan bagian utama memiliki nomor indeks tabular (`01`, `02`), batas struktural tegas (`1px solid #D6CFC2`), dan label status berbentuk stempel dokumen (*stamp badge*) dengan sudut tegas (`rounded-md`), bukan kapsul glow.
- **Alasan Layout RHYTHM 3 (R-05, R-31):** Halaman Ringkasan tidak memakai deretan 5 kartu stat identik; melainkan dibuka dengan komposisi asimetris 7:5 (*Meja Fokus Hari Ini* di kiri untuk keputusan tindak lanjut langsung, dan *Buku Besar Ringkasan* berformat daftar tabular di kanan), diikuti pita alur tahapan penuh, lalu grid perbandingan kanal dan pengingat.
- **Alasan Radius & Elevasi (R-11, R-12, R-31):** Kartu kerja memakai sudut `rounded-xl` (12px) tanpa bayangan mengambang (*flat tactile border*), tombol aksi memakai `rounded-lg` (8px), dan hanya modal/drawer yang terangkat di atas halaman yang menggunakan bayangan elevasi.
- **Alasan Mobile Reflow & Bottom Bar (R-03, R-31):** Di layar ponsel dan tablet (`< 1024px`), navigasi berubah menjadi bilah bawah (*bottom navigation bar*) 5 tujuan utama dengan tinggi sentuh minimum `44x44px`, papan Kanban memiliki pemilih tahapan cepat agar tidak memaksa geser horizontal panjang, dan tabel otomatis berubah menjadi kartu berkas responsif (1 kolom di HP, 2 kolom di tablet).
