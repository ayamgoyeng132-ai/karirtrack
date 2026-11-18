# KarirTrack

Jurnal dan manajemen lamaran kerja pribadi untuk pencari kerja Indonesia.

## Fitur

- Dashboard dengan ringkasan dan tindak lanjut lamaran
- Papan Kanban untuk alur seleksi
- Daftar lengkap semua loker (tabel + filter)
- Kalender interview dan batas waktu
- Master CV dan template pesan HR
- Pengaturan lengkap (tahapan, platform, profil)
- Login PIN untuk keamanan data
- Mode terang/gelap
- Mobile-friendly

## Tech Stack

- React 19 + TypeScript + Tailwind CSS v4
- better-sqlite3 (backend storage)
- Node.js HTTP server (production)

## Development

```bash
npm install
npm run dev
```

## Production

```bash
npm run build
npm start
```

## Deploy (Docker)

```bash
docker build -t karirtrack .
docker run -p 10000:10000 -v karirtrack-data:/app/data karirtrack
```
