import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'karirtrack.sqlite');
const db = new Database(DB_PATH);

db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS auth (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    pin_hash TEXT NOT NULL,
    display_name TEXT DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    version TEXT DEFAULT '',
    target_role TEXT DEFAULT '',
    url TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    is_default INTEGER DEFAULT 0,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS templates (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    subject TEXT DEFAULT '',
    body TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    company TEXT NOT NULL,
    position TEXT NOT NULL,
    department TEXT DEFAULT '',
    location TEXT DEFAULT '',
    work_mode TEXT DEFAULT 'Hybrid',
    employment_type TEXT DEFAULT 'Full-time',
    stage TEXT NOT NULL DEFAULT 'applied',
    priority TEXT DEFAULT 'medium',
    pinned INTEGER DEFAULT 0,
    platform TEXT DEFAULT 'LinkedIn',
    job_url TEXT DEFAULT '',
    company_url TEXT DEFAULT '',
    currency TEXT DEFAULT 'IDR',
    salary_min INTEGER,
    salary_max INTEGER,
    salary_expected INTEGER,
    salary_offered INTEGER,
    benefits TEXT DEFAULT '',
    applied_date TEXT DEFAULT '',
    deadline_date TEXT DEFAULT '',
    follow_up_date TEXT DEFAULT '',
    document_id TEXT DEFAULT '',
    cover_letter_used INTEGER DEFAULT 0,
    hr_name TEXT DEFAULT '',
    hr_role TEXT DEFAULT '',
    hr_contact TEXT DEFAULT '',
    referrer_name TEXT DEFAULT '',
    skills_json TEXT DEFAULT '[]',
    job_description TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    checklist_json TEXT DEFAULT '[]',
    interviews_json TEXT DEFAULT '[]',
    history_json TEXT DEFAULT '[]',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`);

function formatDateOffset(daysOffset) {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export const DEFAULT_SETTINGS = {
  profile: {
    name: '',
    roleTarget: '',
    email: '',
    phone: '',
    portfolioUrl: '',
    linkedinUrl: '',
  },
  preferences: {
    weeklyGoal: 8,
    followUpDays: 7,
    defaultCurrency: 'IDR',
    theme: 'light',
    density: 'comfortable',
    showSampleBanner: true,
  },
  stages: [
    { id: 'wishlist', label: 'Wishlist / Disimpan', color: 'slate', category: 'wishlist', order: 0 },
    { id: 'applied', label: 'Sudah Apply', color: 'blue', category: 'active', order: 1 },
    { id: 'screening', label: 'Screening HR / Psikotes', color: 'indigo', category: 'active', order: 2 },
    { id: 'test', label: 'Tes Teknis / Studi Kasus', color: 'violet', category: 'interview', order: 3 },
    { id: 'interview', label: 'Interview HR & User', color: 'amber', category: 'interview', order: 4 },
    { id: 'offering', label: 'Offering / Nego Gaji', color: 'emerald', category: 'offer', order: 5 },
    { id: 'accepted', label: 'Diterima (Joined)', color: 'teal', category: 'accepted', order: 6 },
    { id: 'rejected', label: 'Ditolak / Ghosted', color: 'rose', category: 'rejected', order: 7 },
  ],
  platforms: [
    'LinkedIn',
    'Glints',
    'JobStreet',
    'Kalibrr',
    'Dealls',
    'Tech in Asia',
    'Website Perusahaan',
    'Referral',
    'Karir.com',
    'Instagram / X',
  ],
  workModes: ['WFO (On-site)', 'Hybrid', 'WFH / Remote'],
  employmentTypes: ['Full-time', 'Kontrak (PKWT)', 'Magang / Internship', 'Freelance', 'Part-time'],
};

function getSeedDocuments() {
  const now = new Date().toISOString();
  return [
    {
      id: 'doc-cv-ats',
      title: 'CV ATS Friendly: Software Engineer (ID/EN)',
      type: 'CV / Resume',
      version: 'v3.2',
      target_role: 'Frontend / Fullstack Engineer',
      url: 'https://drive.google.com/file/d/contoh-cv-ats',
      notes: 'Format 1 halaman ramah ATS, menonjolkan metrik performa dan proyek produksi.',
      is_default: 1,
      updated_at: now,
    },
    {
      id: 'doc-cv-product',
      title: 'CV Product & UI Engineer (Visual)',
      type: 'CV / Resume',
      version: 'v2.0',
      target_role: 'UI Engineer / Design Technologist',
      url: 'https://drive.google.com/file/d/contoh-cv-ui',
      notes: 'Menonjolkan design system, aksesibilitas (WCAG), dan studi kasus antarmuka.',
      is_default: 0,
      updated_at: now,
    },
    {
      id: 'doc-portfolio',
      title: 'Website Portofolio & Studi Kasus Interaktif',
      type: 'Portofolio',
      version: '2026',
      target_role: 'Semua Posisi Tech',
      url: 'https://portofolio-saya.dev',
      notes: 'Berisi 4 studi kasus lengkap dengan demo langsung dan tautan repositori.',
      is_default: 0,
      updated_at: now,
    },
  ];
}

function getSeedTemplates() {
  const now = new Date().toISOString();
  return [
    {
      id: 'tpl-followup-hr',
      title: 'Follow-Up Status Lamaran (H+7 Sopan)',
      category: 'Follow-Up',
      subject: 'Follow-up Lamaran {posisi} - {nama_saya}',
      body: `Halo Bapak/Ibu {nama_hr},\n\nSemoga sehat selalu. Perkenalkan saya {nama_saya}. Melalui pesan ini saya ingin menanyakan perkembangan proses seleksi untuk posisi {posisi} di {perusahaan} yang telah saya lamar melalui {platform} pada tanggal {tanggal_apply}.\n\nSaya sangat antusias dengan kesempatan berkontribusi di {perusahaan}. Apabila dibutuhkan informasi tambahan atau portofolio terbaru ({portofolio}), dengan senang hati akan saya kirimkan.\n\nTerima kasih banyak atas waktu dan perhatian Bapak/Ibu.\n\nSalam hangat,\n{nama_saya}`,
      updated_at: now,
    },
    {
      id: 'tpl-linkedin-connect',
      title: 'Pesan Connect LinkedIn ke Recruiter / Hiring Manager',
      category: 'LinkedIn',
      subject: 'Koneksi LinkedIn: {posisi}',
      body: `Halo Kak {nama_hr}, salam kenal! Saya {nama_saya}. Kebetulan saya baru saja melamar posisi {posisi} di {perusahaan}. Senang bisa terkoneksi di LinkedIn dan mengikuti perkembangan tim di {perusahaan}. Terima kasih!`,
      updated_at: now,
    },
    {
      id: 'tpl-thankyou-interview',
      title: 'Ucapan Terima Kasih Setelah Interview',
      category: 'Terima Kasih Interview',
      subject: 'Terima Kasih atas Sesi Interview {posisi} - {nama_saya}',
      body: `Halo Bapak/Ibu {nama_hr},\n\nTerima kasih banyak atas waktu dan diskusi yang menyenangkan pada sesi interview posisi {posisi} di {perusahaan} hari ini. Penjelasan mengenai tantangan tim semakin menguatkan ketertarikan saya untuk bergabung dan berkontribusi.\n\nSilakan kabari saya apabila ada tahapan atau dokumen lanjutan yang diperlukan. Terima kasih!\n\nSalam,\n{nama_saya}`,
      updated_at: now,
    },
    {
      id: 'tpl-nego-offering',
      title: 'Respon Positif & Negosiasi Offering Gaji',
      category: 'Offering & Nego',
      subject: 'Tanggapan Offering Letter {posisi} - {nama_saya}',
      body: `Halo Bapak/Ibu {nama_hr},\n\nTerima kasih banyak atas kepercayaan dan penawaran kerja (Offering) untuk posisi {posisi} di {perusahaan}. Saya sangat senang dan bersemangat untuk bergabung bersama tim.\n\nSetelah mempelajari detail kompensasi dan cakupan tanggung jawab peran ini, apakah memungkinkan untuk mendiskusikan penyesuaian gaji pokok ke kisaran ekspektasi saya? Saya yakin dapat memberikan kontribusi nyata bagi target tim {perusahaan}.\n\nTerima kasih atas pertimbangannya, saya menunggu kabar baik selanjutnya.\n\nSalam hormat,\n{nama_saya}`,
      updated_at: now,
    },
  ];
}

function getSeedJobs() {
  const now = new Date().toISOString();
  return [
    {
      id: 'job-goto-fe',
      company: 'GoTo Financial',
      position: 'Senior Frontend Engineer',
      department: 'Merchant Platform',
      location: 'Jakarta Selatan',
      work_mode: 'Hybrid',
      employment_type: 'Full-time',
      stage: 'interview',
      priority: 'high',
      pinned: 1,
      platform: 'LinkedIn',
      job_url: 'https://linkedin.com/jobs/view/contoh-goto',
      company_url: 'https://gofinancial.co.id',
      currency: 'IDR',
      salary_min: 22000000,
      salary_max: 30000000,
      salary_expected: 27000000,
      salary_offered: null,
      benefits: 'BPJS Lengkap, Asuransi Kesehatan Swasta, Laptop MacBook Pro, THR, Stock Option',
      applied_date: formatDateOffset(-6),
      deadline_date: '',
      follow_up_date: formatDateOffset(2),
      document_id: 'doc-cv-ats',
      cover_letter_used: 1,
      hr_name: 'Nadia Kusuma (Contoh HR)',
      hr_role: 'Tech Talent Acquisition',
      hr_contact: 'recruitment@contoh-perusahaan.id',
      referrer_name: 'Dimas (Engineering)',
      skills_json: JSON.stringify(['React', 'TypeScript', 'Performance', 'Design System', 'GraphQL']),
      job_description: 'Membangun aplikasi merchant berskala tinggi, optimasi Core Web Vitals (LCP < 2.0s), kolaborasi lintas tim produk dan desain, serta mentoring engineer junior.',
      notes: 'Screening HR berjalan lancar. Lanjut User Interview dengan Engineering Manager. Fokus pelajari arsitektur micro-frontend dan studi kasus optimasi bundle.',
      checklist_json: JSON.stringify([
        { id: 'c1', text: 'Riset produk GoPay Merchant terbaru', done: true },
        { id: 'c2', text: 'Siapkan cerita STAR tentang optimasi performa React', done: true },
        { id: 'c3', text: 'Siapkan 3 pertanyaan untuk Engineering Manager', done: false },
      ]),
      interviews_json: JSON.stringify([
        {
          id: 'iv-1',
          title: 'HR Screening Call',
          type: 'HR Interview',
          date: formatDateOffset(-3),
          time: '10:30',
          locationOrLink: 'Google Meet',
          interviewer: 'Nadia Kusuma',
          status: 'done',
          notes: 'Bahas ekspektasi gaji, notice period, dan kecocokan budaya kerja.',
        },
        {
          id: 'iv-2',
          title: 'Technical & User Interview',
          type: 'User Interview',
          date: formatDateOffset(1),
          time: '14:00',
          locationOrLink: 'https://meet.google.com/abc-defg-hij',
          interviewer: 'Arif Rahman (EM)',
          status: 'scheduled',
          notes: 'System design frontend dan code review selama 60 menit.',
        },
      ]),
      history_json: JSON.stringify([
        { id: 'h1', stage: 'applied', note: 'Apply via referral dan LinkedIn', timestamp: formatDateOffset(-6) },
        { id: 'h2', stage: 'screening', note: 'Dihubungi HR via WhatsApp', timestamp: formatDateOffset(-4) },
        { id: 'h3', stage: 'interview', note: 'Lolos HR screening, jadwal User Interview', timestamp: formatDateOffset(-2) },
      ]),
      created_at: now,
      updated_at: now,
    },
    {
      id: 'job-mekari-fs',
      company: 'Mekari',
      position: 'Fullstack Web Developer',
      department: 'Mekari Talenta',
      location: 'Jakarta Pusat',
      work_mode: 'Hybrid',
      employment_type: 'Full-time',
      stage: 'offering',
      priority: 'high',
      pinned: 1,
      platform: 'Dealls',
      job_url: 'https://dealls.com/loker/mekari-fullstack',
      company_url: 'https://mekari.com',
      currency: 'IDR',
      salary_min: 16000000,
      salary_max: 23000000,
      salary_expected: 21000000,
      salary_offered: 20000000,
      benefits: 'Asuransi Kesehatan, Tunjangan Internet Hybrid, Learning Budget Rp 5jt/tahun, THR',
      applied_date: formatDateOffset(-14),
      deadline_date: formatDateOffset(3),
      follow_up_date: formatDateOffset(1),
      document_id: 'doc-cv-ats',
      cover_letter_used: 0,
      hr_name: 'Bima Prakoso (Contoh HR)',
      hr_role: 'Senior People Partner',
      hr_contact: 'talent@contoh-perusahaan.id',
      referrer_name: '',
      skills_json: JSON.stringify(['Vue / React', 'Node.js', 'PostgreSQL', 'REST API']),
      job_description: 'Mengembangkan modul payroll dan HRIS SaaS B2B, integrasi API perbankan, serta menjaga kualitas automated test.',
      notes: 'Offering letter sudah diterima di angka Rp 20.000.000 gross. Sedang pertimbangkan negosiasi tipis ke Rp 21.000.000 sebelum batas tanda tangan Jumat ini.',
      checklist_json: JSON.stringify([
        { id: 'c4', text: 'Hitung simulasi gaji bersih (take home pay) setelah PPh 21 dan BPJS', done: true },
        { id: 'c5', text: 'Kirim email negosiasi sopan menggunakan template Offering', done: false },
      ]),
      interviews_json: JSON.stringify([
        {
          id: 'iv-3',
          title: 'Offering Discussion & Benefit Walkthrough',
          type: 'Offering Call',
          date: formatDateOffset(2),
          time: '11:00',
          locationOrLink: 'Zoom Meeting',
          interviewer: 'Bima Prakoso',
          status: 'scheduled',
          notes: 'Konfirmasi tanggal mulai kerja dan finalisasi kompensasi.',
        },
      ]),
      history_json: JSON.stringify([
        { id: 'h4', stage: 'applied', note: 'Melamar lewat Dealls', timestamp: formatDateOffset(-14) },
        { id: 'h5', stage: 'test', note: 'Selesai pengerjaan take-home project', timestamp: formatDateOffset(-9) },
        { id: 'h6', stage: 'interview', note: 'Final interview dengan VP Engineering', timestamp: formatDateOffset(-5) },
        { id: 'h7', stage: 'offering', note: 'Menerima Offering Letter resmi', timestamp: formatDateOffset(-1) },
      ]),
      created_at: now,
      updated_at: now,
    },
    {
      id: 'job-traveloka-ui',
      company: 'Traveloka',
      position: 'Product Frontend Engineer',
      department: 'Flight & Accommodation',
      location: 'Tangerang (BSD)',
      work_mode: 'Hybrid',
      employment_type: 'Full-time',
      stage: 'test',
      priority: 'high',
      pinned: 0,
      platform: 'Website Perusahaan',
      job_url: 'https://traveloka.com/careers',
      company_url: 'https://traveloka.com',
      currency: 'IDR',
      salary_min: 18000000,
      salary_max: 26000000,
      salary_expected: 24000000,
      salary_offered: null,
      benefits: 'Traveloka Points Tahunan, Asuransi Rawat Jalan/Inap, Shuttle Bus BSD',
      applied_date: formatDateOffset(-5),
      deadline_date: formatDateOffset(2),
      follow_up_date: formatDateOffset(4),
      document_id: 'doc-cv-product',
      cover_letter_used: 1,
      hr_name: 'Sinta Maharani (Contoh HR)',
      hr_role: 'Talent Acquisition Specialist',
      hr_contact: 'careers@contoh-perusahaan.id',
      referrer_name: '',
      skills_json: JSON.stringify(['React', 'Next.js', 'TypeScript', 'Web Accessibility']),
      job_description: 'Membangun pengalaman pencarian tiket cepat dan aksesibel untuk pengguna di Asia Tenggara.',
      notes: 'Diberikan tugas Take-Home Assessment membuat komponen filter penerbangan dengan unit test. Batas pengumpulan 2 hari lagi pukul 23:59.',
      checklist_json: JSON.stringify([
        { id: 'c6', text: 'Setup repositori dan arsitektur state management tugas teknis', done: true },
        { id: 'c7', text: 'Tambahkan aksesibilitas keyboard dan ARIA label', done: false },
        { id: 'c8', text: 'Tulis README dokumentasi keputusan teknis dan kirim tautan', done: false },
      ]),
      interviews_json: JSON.stringify([
        {
          id: 'iv-4',
          title: 'Batas Submit Take-Home Test',
          type: 'Technical Test',
          date: formatDateOffset(2),
          time: '20:00',
          locationOrLink: 'Portal HackerRank / GitHub',
          interviewer: 'Tim Frontend Traveloka',
          status: 'scheduled',
          notes: 'Pastikan seluruh test lulus dan deploy live preview.',
        },
      ]),
      history_json: JSON.stringify([
        { id: 'h8', stage: 'applied', note: 'Submit di career portal resmi', timestamp: formatDateOffset(-5) },
        { id: 'h9', stage: 'test', note: 'Undangan mengerjakan Take-Home Assignment', timestamp: formatDateOffset(-1) },
      ]),
      created_at: now,
      updated_at: now,
    },
    {
      id: 'job-bca-digital',
      company: 'BCA Digital (blu)',
      position: 'Web Application Specialist',
      department: 'Digital Banking Channel',
      location: 'Jakarta Pusat',
      work_mode: 'WFO (On-site)',
      employment_type: 'Full-time',
      stage: 'applied',
      priority: 'medium',
      pinned: 0,
      platform: 'Kalibrr',
      job_url: 'https://kalibrr.com/c/bca-digital',
      company_url: 'https://blubca.id',
      currency: 'IDR',
      salary_min: 14000000,
      salary_max: 20000000,
      salary_expected: 18500000,
      salary_offered: null,
      benefits: 'THR dan Bonus Tahunan Kompetitif, Asuransi Kesehatan Kelas A, Program KPR Karyawan',
      applied_date: formatDateOffset(-9),
      deadline_date: '',
      follow_up_date: formatDateOffset(-1),
      document_id: 'doc-cv-ats',
      cover_letter_used: 1,
      hr_name: 'Tim Rekrutmen blu',
      hr_role: 'HR Recruitment',
      hr_contact: 'recruitment@contoh-bank.co.id',
      referrer_name: '',
      skills_json: JSON.stringify(['TypeScript', 'Security', 'CI/CD', 'Microservices']),
      job_description: 'Pengembangan portal internal dan web onboarding nasabah perbankan digital dengan standar keamanan tinggi.',
      notes: 'Sudah lewat 9 hari sejak melamar, saatnya kirim pesan follow-up sopan ke HR.',
      checklist_json: JSON.stringify([
        { id: 'c9', text: 'Kirim pesan follow-up H+7 ke email rekrutmen', done: false },
      ]),
      interviews_json: JSON.stringify([]),
      history_json: JSON.stringify([
        { id: 'h10', stage: 'applied', note: 'Apply via Kalibrr', timestamp: formatDateOffset(-9) },
      ]),
      created_at: now,
      updated_at: now,
    },
    {
      id: 'job-linearlab-sg',
      company: 'LinearLab Studio (SG)',
      position: 'Remote Product Engineer',
      department: 'Core App',
      location: 'Singapura (Remote dari Indonesia)',
      work_mode: 'WFH / Remote',
      employment_type: 'Kontrak (PKWT)',
      stage: 'wishlist',
      priority: 'high',
      pinned: 0,
      platform: 'Glints',
      job_url: 'https://glints.com/id/opportunities/jobs/remote-product-engineer',
      company_url: 'https://linearlab.example.com',
      currency: 'SGD',
      salary_min: 3200,
      salary_max: 4500,
      salary_expected: 3800,
      salary_offered: null,
      benefits: '100% Remote, Waktu Kerja Fleksibel, Co-working Stipend, Cuti 18 Hari',
      applied_date: '',
      deadline_date: formatDateOffset(5),
      follow_up_date: '',
      document_id: 'doc-cv-product',
      cover_letter_used: 0,
      hr_name: 'Clara Tan (Contoh HR)',
      hr_role: 'Talent Lead',
      hr_contact: 'clara@linearlab.example.com',
      referrer_name: '',
      skills_json: JSON.stringify(['React', 'Tailwind CSS', 'SQLite', 'English C1']),
      job_description: 'Peran jarak jauh membangun perkakas produktivitas kolaboratif untuk tim APAC.',
      notes: 'Sesuaikan CV ke bahasa Inggris penuh dan tambahkan tautan demo aplikasi terbaru sebelum melamar akhir pekan ini.',
      checklist_json: JSON.stringify([
        { id: 'c10', text: 'Perbarui bagian proyek di CV bahasa Inggris', done: false },
        { id: 'c11', text: 'Tulis cover letter singkat khusus budaya kerja remote', done: false },
      ]),
      interviews_json: JSON.stringify([]),
      history_json: JSON.stringify([
        { id: 'h11', stage: 'wishlist', note: 'Disimpan dari Glints Remote', timestamp: formatDateOffset(-1) },
      ]),
      created_at: now,
      updated_at: now,
    },
    {
      id: 'job-shopee-fe',
      company: 'Shopee Indonesia',
      position: 'Frontend Engineer: Web Platform',
      department: 'Buyer Experience',
      location: 'Jakarta Selatan (PCP)',
      work_mode: 'WFO (On-site)',
      employment_type: 'Full-time',
      stage: 'rejected',
      priority: 'medium',
      pinned: 0,
      platform: 'JobStreet',
      job_url: 'https://id.jobstreet.com',
      company_url: 'https://careers.shopee.co.id',
      currency: 'IDR',
      salary_min: 17000000,
      salary_max: 24000000,
      salary_expected: 21000000,
      salary_offered: null,
      benefits: 'Makan Siang dan Malam, Asuransi Penuh, Gym Kantor',
      applied_date: formatDateOffset(-18),
      deadline_date: '',
      follow_up_date: '',
      document_id: 'doc-cv-ats',
      cover_letter_used: 0,
      hr_name: 'Rizky Pratama (Contoh HR)',
      hr_role: 'Campus & Experienced Recruiter',
      hr_contact: '',
      referrer_name: '',
      skills_json: JSON.stringify(['JavaScript', 'Algorithms', 'React', 'Webpack']),
      job_description: 'Optimasi halaman kampanye flash sale dengan trafik tinggi.',
      notes: 'Belum lolos pada tahap algorithmic live coding soal Dynamic Programming. Evaluasi: latihan rutin 2 soal medium per minggu.',
      checklist_json: JSON.stringify([]),
      interviews_json: JSON.stringify([]),
      history_json: JSON.stringify([
        { id: 'h12', stage: 'applied', note: 'Melamar via JobStreet', timestamp: formatDateOffset(-18) },
        { id: 'h13', stage: 'test', note: 'Online Coding Assessment', timestamp: formatDateOffset(-13) },
        { id: 'h14', stage: 'rejected', note: 'Email hasil seleksi belum berhasil', timestamp: formatDateOffset(-8) },
      ]),
      created_at: now,
      updated_at: now,
    },
  ];
}

export function seedIfEmpty(force = false) {
  const existingSettings = db.prepare('SELECT COUNT(*) as cnt FROM settings').get();
  if (!force && existingSettings.cnt > 0) {
    return;
  }

  const upsertSetting = db.prepare(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
  );
  for (const [k, v] of Object.entries(DEFAULT_SETTINGS)) {
    upsertSetting.run(k, JSON.stringify(v));
  }

  if (force) {
    db.exec('DELETE FROM jobs; DELETE FROM documents; DELETE FROM templates;');
  }

  const insertDoc = db.prepare(`
    INSERT INTO documents (id, title, type, version, target_role, url, notes, is_default, updated_at)
    VALUES (@id, @title, @type, @version, @target_role, @url, @notes, @is_default, @updated_at)
  `);
  for (const doc of getSeedDocuments()) {
    insertDoc.run(doc);
  }

  const insertTpl = db.prepare(`
    INSERT INTO templates (id, title, category, subject, body, updated_at)
    VALUES (@id, @title, @category, @subject, @body, @updated_at)
  `);
  for (const tpl of getSeedTemplates()) {
    insertTpl.run(tpl);
  }

  const insertJob = db.prepare(`
    INSERT INTO jobs (
      id, company, position, department, location, work_mode, employment_type,
      stage, priority, pinned, platform, job_url, company_url, currency,
      salary_min, salary_max, salary_expected, salary_offered, benefits,
      applied_date, deadline_date, follow_up_date, document_id, cover_letter_used,
      hr_name, hr_role, hr_contact, referrer_name, skills_json, job_description,
      notes, checklist_json, interviews_json, history_json, created_at, updated_at
    ) VALUES (
      @id, @company, @position, @department, @location, @work_mode, @employment_type,
      @stage, @priority, @pinned, @platform, @job_url, @company_url, @currency,
      @salary_min, @salary_max, @salary_expected, @salary_offered, @benefits,
      @applied_date, @deadline_date, @follow_up_date, @document_id, @cover_letter_used,
      @hr_name, @hr_role, @hr_contact, @referrer_name, @skills_json, @job_description,
      @notes, @checklist_json, @interviews_json, @history_json, @created_at, @updated_at
    )
  `);
  for (const job of getSeedJobs()) {
    insertJob.run(job);
  }
}

// Sanitize existing SQLite rows against em dashes (R-02) and initial fake profile defaults (R-38)
function sanitizeExistingData() {
  const em = '\u2014';
  const jobsWithEm = db.prepare('SELECT id, position, notes, job_description FROM jobs').all();
  const updJob = db.prepare('UPDATE jobs SET position = ?, notes = ?, job_description = ? WHERE id = ?');
  for (const j of jobsWithEm) {
    if ((j.position || '').includes(em) || (j.notes || '').includes(em) || (j.job_description || '').includes(em)) {
      updJob.run(
        (j.position || '').replaceAll(` ${em} `, ': ').replaceAll(em, '-'),
        (j.notes || '').replaceAll(` ${em} `, ', ').replaceAll(em, '-'),
        (j.job_description || '').replaceAll(` ${em} `, ', ').replaceAll(em, '-'),
        j.id
      );
    }
  }

  const docsWithEm = db.prepare('SELECT id, title, notes FROM documents').all();
  const updDoc = db.prepare('UPDATE documents SET title = ?, notes = ? WHERE id = ?');
  for (const d of docsWithEm) {
    if ((d.title || '').includes(em) || (d.notes || '').includes(em)) {
      updDoc.run(
        (d.title || '').replaceAll(` ${em} `, ': ').replaceAll(em, '-'),
        (d.notes || '').replaceAll(` ${em} `, ', ').replaceAll(em, '-'),
        d.id
      );
    }
  }

  const tplsWithEm = db.prepare('SELECT id, title, subject, body FROM templates').all();
  const updTpl = db.prepare('UPDATE templates SET title = ?, subject = ?, body = ? WHERE id = ?');
  for (const t of tplsWithEm) {
    if ((t.title || '').includes(em) || (t.subject || '').includes(em) || (t.body || '').includes(em)) {
      updTpl.run(
        (t.title || '').replaceAll(` ${em} `, ': ').replaceAll(em, '-'),
        (t.subject || '').replaceAll(` ${em} `, ' - ').replaceAll(em, '-'),
        (t.body || '').replaceAll(` ${em} `, ', ').replaceAll(em, '-'),
        t.id
      );
    }
  }

  const profRow = db.prepare('SELECT value FROM settings WHERE key = ?').get('profile');
  if (profRow) {
    try {
      const p = JSON.parse(profRow.value);
      if (p.name === 'Raka Pratama' && p.email === 'raka.pratama@email.com') {
        db.prepare('UPDATE settings SET value = ? WHERE key = ?').run(
          JSON.stringify(DEFAULT_SETTINGS.profile),
          'profile'
        );
      }
    } catch {
      // ignore
    }
  }
}

seedIfEmpty(false);
sanitizeExistingData();

function rowToJob(row) {
  return {
    id: row.id,
    company: row.company,
    position: row.position,
    department: row.department || '',
    location: row.location || '',
    workMode: row.work_mode || 'Hybrid',
    employmentType: row.employment_type || 'Full-time',
    stage: row.stage,
    priority: row.priority || 'medium',
    pinned: Boolean(row.pinned),
    platform: row.platform || 'LinkedIn',
    jobUrl: row.job_url || '',
    companyUrl: row.company_url || '',
    currency: row.currency || 'IDR',
    salaryMin: row.salary_min ?? null,
    salaryMax: row.salary_max ?? null,
    salaryExpected: row.salary_expected ?? null,
    salaryOffered: row.salary_offered ?? null,
    benefits: row.benefits || '',
    appliedDate: row.applied_date || '',
    deadlineDate: row.deadline_date || '',
    followUpDate: row.follow_up_date || '',
    documentId: row.document_id || '',
    coverLetterUsed: Boolean(row.cover_letter_used),
    hrName: row.hr_name || '',
    hrRole: row.hr_role || '',
    hrContact: row.hr_contact || '',
    referrerName: row.referrer_name || '',
    skills: safeJsonParse(row.skills_json, []),
    jobDescription: row.job_description || '',
    notes: row.notes || '',
    checklist: safeJsonParse(row.checklist_json, []),
    interviews: safeJsonParse(row.interviews_json, []),
    history: safeJsonParse(row.history_json, []),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function safeJsonParse(str, fallback) {
  try {
    return str ? JSON.parse(str) : fallback;
  } catch {
    return fallback;
  }
}

export function getFullState() {
  const settingsRows = db.prepare('SELECT key, value FROM settings').all();
  const settings = structuredClone(DEFAULT_SETTINGS);
  for (const r of settingsRows) {
    settings[r.key] = safeJsonParse(r.value, settings[r.key]);
  }

  const jobs = db
    .prepare('SELECT * FROM jobs ORDER BY pinned DESC, updated_at DESC')
    .all()
    .map(rowToJob);

  const documents = db
    .prepare('SELECT * FROM documents ORDER BY is_default DESC, updated_at DESC')
    .all()
    .map((d) => ({
      id: d.id,
      title: d.title,
      type: d.type,
      version: d.version || '',
      targetRole: d.target_role || '',
      url: d.url || '',
      notes: d.notes || '',
      isDefault: Boolean(d.is_default),
      updatedAt: d.updated_at,
    }));

  const templates = db
    .prepare('SELECT * FROM templates ORDER BY updated_at DESC')
    .all()
    .map((t) => ({
      id: t.id,
      title: t.title,
      category: t.category,
      subject: t.subject || '',
      body: t.body,
      updatedAt: t.updated_at,
    }));

  return { settings, jobs, documents, templates };
}

export function saveSettings(partialSettings) {
  const upsert = db.prepare(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
  );
  for (const [key, val] of Object.entries(partialSettings)) {
    if (val !== undefined) {
      upsert.run(key, JSON.stringify(val));
    }
  }
  return getFullState().settings;
}

export function createJob(payload) {
  const now = new Date().toISOString();
  const id = payload.id || `job-${crypto.randomUUID().slice(0, 8)}`;
  const stage = payload.stage || 'applied';
  const today = formatDateOffset(0);
  const appliedDate =
    payload.appliedDate !== undefined
      ? payload.appliedDate
      : stage === 'wishlist'
        ? ''
        : today;

  const initialHistory =
    Array.isArray(payload.history) && payload.history.length > 0
      ? payload.history
      : [{ id: `h-${crypto.randomUUID().slice(0, 6)}`, stage, note: 'Lamaran ditambahkan', timestamp: today }];

  db.prepare(`
    INSERT INTO jobs (
      id, company, position, department, location, work_mode, employment_type,
      stage, priority, pinned, platform, job_url, company_url, currency,
      salary_min, salary_max, salary_expected, salary_offered, benefits,
      applied_date, deadline_date, follow_up_date, document_id, cover_letter_used,
      hr_name, hr_role, hr_contact, referrer_name, skills_json, job_description,
      notes, checklist_json, interviews_json, history_json, created_at, updated_at
    ) VALUES (
      @id, @company, @position, @department, @location, @work_mode, @employment_type,
      @stage, @priority, @pinned, @platform, @job_url, @company_url, @currency,
      @salary_min, @salary_max, @salary_expected, @salary_offered, @benefits,
      @applied_date, @deadline_date, @follow_up_date, @document_id, @cover_letter_used,
      @hr_name, @hr_role, @hr_contact, @referrer_name, @skills_json, @job_description,
      @notes, @checklist_json, @interviews_json, @history_json, @created_at, @updated_at
    )
  `).run({
    id,
    company: (payload.company || '').trim(),
    position: (payload.position || '').trim(),
    department: payload.department || '',
    location: payload.location || '',
    work_mode: payload.workMode || 'Hybrid',
    employment_type: payload.employmentType || 'Full-time',
    stage,
    priority: payload.priority || 'medium',
    pinned: payload.pinned ? 1 : 0,
    platform: payload.platform || 'LinkedIn',
    job_url: payload.jobUrl || '',
    company_url: payload.companyUrl || '',
    currency: payload.currency || 'IDR',
    salary_min: toNullableInt(payload.salaryMin),
    salary_max: toNullableInt(payload.salaryMax),
    salary_expected: toNullableInt(payload.salaryExpected),
    salary_offered: toNullableInt(payload.salaryOffered),
    benefits: payload.benefits || '',
    applied_date: appliedDate,
    deadline_date: payload.deadlineDate || '',
    follow_up_date: payload.followUpDate || '',
    document_id: payload.documentId || '',
    cover_letter_used: payload.coverLetterUsed ? 1 : 0,
    hr_name: payload.hrName || '',
    hr_role: payload.hrRole || '',
    hr_contact: payload.hrContact || '',
    referrer_name: payload.referrerName || '',
    skills_json: JSON.stringify(payload.skills || []),
    job_description: payload.jobDescription || '',
    notes: payload.notes || '',
    checklist_json: JSON.stringify(payload.checklist || []),
    interviews_json: JSON.stringify(payload.interviews || []),
    history_json: JSON.stringify(initialHistory),
    created_at: now,
    updated_at: now,
  });

  const row = db.prepare('SELECT * FROM jobs WHERE id = ?').get(id);
  return rowToJob(row);
}

export function updateJob(id, payload) {
  const existingRow = db.prepare('SELECT * FROM jobs WHERE id = ?').get(id);
  if (!existingRow) return null;
  const existing = rowToJob(existingRow);
  const now = new Date().toISOString();
  const today = formatDateOffset(0);

  const nextStage = payload.stage ?? existing.stage;
  let nextHistory = payload.history ?? existing.history;
  if (payload.stage && payload.stage !== existing.stage && !payload.history) {
    nextHistory = [
      ...existing.history,
      {
        id: `h-${crypto.randomUUID().slice(0, 6)}`,
        stage: nextStage,
        note: payload.stageNote || `Status diubah ke ${nextStage}`,
        timestamp: today,
      },
    ];
  }

  let nextAppliedDate = payload.appliedDate !== undefined ? payload.appliedDate : existing.appliedDate;
  if (!nextAppliedDate && existing.stage === 'wishlist' && nextStage !== 'wishlist') {
    nextAppliedDate = today;
  }

  const merged = {
    id,
    company: payload.company !== undefined ? payload.company.trim() : existing.company,
    position: payload.position !== undefined ? payload.position.trim() : existing.position,
    department: payload.department ?? existing.department,
    location: payload.location ?? existing.location,
    work_mode: payload.workMode ?? existing.workMode,
    employment_type: payload.employmentType ?? existing.employmentType,
    stage: nextStage,
    priority: payload.priority ?? existing.priority,
    pinned: (payload.pinned ?? existing.pinned) ? 1 : 0,
    platform: payload.platform ?? existing.platform,
    job_url: payload.jobUrl ?? existing.jobUrl,
    company_url: payload.companyUrl ?? existing.companyUrl,
    currency: payload.currency ?? existing.currency,
    salary_min: payload.salaryMin !== undefined ? toNullableInt(payload.salaryMin) : existing.salaryMin,
    salary_max: payload.salaryMax !== undefined ? toNullableInt(payload.salaryMax) : existing.salaryMax,
    salary_expected: payload.salaryExpected !== undefined ? toNullableInt(payload.salaryExpected) : existing.salaryExpected,
    salary_offered: payload.salaryOffered !== undefined ? toNullableInt(payload.salaryOffered) : existing.salaryOffered,
    benefits: payload.benefits ?? existing.benefits,
    applied_date: nextAppliedDate,
    deadline_date: payload.deadlineDate ?? existing.deadlineDate,
    follow_up_date: payload.followUpDate ?? existing.followUpDate,
    document_id: payload.documentId ?? existing.documentId,
    cover_letter_used: (payload.coverLetterUsed ?? existing.coverLetterUsed) ? 1 : 0,
    hr_name: payload.hrName ?? existing.hrName,
    hr_role: payload.hrRole ?? existing.hrRole,
    hr_contact: payload.hrContact ?? existing.hrContact,
    referrer_name: payload.referrerName ?? existing.referrerName,
    skills_json: JSON.stringify(payload.skills ?? existing.skills),
    job_description: payload.jobDescription ?? existing.jobDescription,
    notes: payload.notes ?? existing.notes,
    checklist_json: JSON.stringify(payload.checklist ?? existing.checklist),
    interviews_json: JSON.stringify(payload.interviews ?? existing.interviews),
    history_json: JSON.stringify(nextHistory),
    updated_at: now,
  };

  db.prepare(`
    UPDATE jobs SET
      company = @company, position = @position, department = @department, location = @location,
      work_mode = @work_mode, employment_type = @employment_type, stage = @stage,
      priority = @priority, pinned = @pinned, platform = @platform, job_url = @job_url,
      company_url = @company_url, currency = @currency, salary_min = @salary_min,
      salary_max = @salary_max, salary_expected = @salary_expected, salary_offered = @salary_offered,
      benefits = @benefits, applied_date = @applied_date, deadline_date = @deadline_date,
      follow_up_date = @follow_up_date, document_id = @document_id, cover_letter_used = @cover_letter_used,
      hr_name = @hr_name, hr_role = @hr_role, hr_contact = @hr_contact, referrer_name = @referrer_name,
      skills_json = @skills_json, job_description = @job_description, notes = @notes,
      checklist_json = @checklist_json, interviews_json = @interviews_json,
      history_json = @history_json, updated_at = @updated_at
    WHERE id = @id
  `).run(merged);

  const row = db.prepare('SELECT * FROM jobs WHERE id = ?').get(id);
  return rowToJob(row);
}

export function deleteJobs(ids) {
  const stmt = db.prepare('DELETE FROM jobs WHERE id = ?');
  for (const id of ids) {
    stmt.run(id);
  }
}

export function bulkUpdateStage(ids, stage) {
  for (const id of ids) {
    updateJob(id, { stage });
  }
}

export function upsertDocument(payload) {
  const now = new Date().toISOString();
  const id = payload.id || `doc-${crypto.randomUUID().slice(0, 8)}`;
  if (payload.isDefault) {
    db.prepare('UPDATE documents SET is_default = 0').run();
  }
  db.prepare(`
    INSERT INTO documents (id, title, type, version, target_role, url, notes, is_default, updated_at)
    VALUES (@id, @title, @type, @version, @target_role, @url, @notes, @is_default, @updated_at)
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      type = excluded.type,
      version = excluded.version,
      target_role = excluded.target_role,
      url = excluded.url,
      notes = excluded.notes,
      is_default = excluded.is_default,
      updated_at = excluded.updated_at
  `).run({
    id,
    title: (payload.title || '').trim(),
    type: payload.type || 'CV / Resume',
    version: payload.version || '',
    target_role: payload.targetRole || '',
    url: payload.url || '',
    notes: payload.notes || '',
    is_default: payload.isDefault ? 1 : 0,
    updated_at: now,
  });
  return getFullState().documents;
}

export function deleteDocument(id) {
  db.prepare('DELETE FROM documents WHERE id = ?').run(id);
  db.prepare('UPDATE jobs SET document_id = ? WHERE document_id = ?').run('', id);
  return getFullState().documents;
}

export function upsertTemplate(payload) {
  const now = new Date().toISOString();
  const id = payload.id || `tpl-${crypto.randomUUID().slice(0, 8)}`;
  db.prepare(`
    INSERT INTO templates (id, title, category, subject, body, updated_at)
    VALUES (@id, @title, @category, @subject, @body, @updated_at)
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      category = excluded.category,
      subject = excluded.subject,
      body = excluded.body,
      updated_at = excluded.updated_at
  `).run({
    id,
    title: (payload.title || '').trim(),
    category: payload.category || 'Follow-Up',
    subject: payload.subject || '',
    body: payload.body || '',
    updated_at: now,
  });
  return getFullState().templates;
}

export function deleteTemplate(id) {
  db.prepare('DELETE FROM templates WHERE id = ?').run(id);
  return getFullState().templates;
}

export function clearAllData() {
  db.exec('DELETE FROM jobs;');
  const prefsRow = db.prepare('SELECT value FROM settings WHERE key = ?').get('preferences');
  const prefs = safeJsonParse(prefsRow?.value, DEFAULT_SETTINGS.preferences);
  prefs.showSampleBanner = false;
  saveSettings({ preferences: prefs });
  return getFullState();
}

export function importFullState(data) {
  if (data.settings && typeof data.settings === 'object') {
    saveSettings(data.settings);
  }
  if (Array.isArray(data.documents)) {
    db.exec('DELETE FROM documents;');
    for (const d of data.documents) {
      upsertDocument(d);
    }
  }
  if (Array.isArray(data.templates)) {
    db.exec('DELETE FROM templates;');
    for (const t of data.templates) {
      upsertTemplate(t);
    }
  }
  if (Array.isArray(data.jobs)) {
    db.exec('DELETE FROM jobs;');
    for (const j of data.jobs) {
      createJob(j);
    }
  }
  return getFullState();
}

function toNullableInt(val) {
  if (val === null || val === undefined || val === '') return null;
  const n = Number(val);
  return Number.isFinite(n) ? Math.round(n) : null;
}

function hashPin(pin) {
  return crypto.createHash('sha256').update(pin.trim()).digest('hex');
}

export function isAuthSetup() {
  const row = db.prepare('SELECT COUNT(*) as cnt FROM auth').get();
  return row.cnt > 0;
}

export function setupAuth(pin, displayName) {
  if (!pin || pin.trim().length < 4) {
    throw new Error('PIN minimal 4 karakter.');
  }
  const pinHash = hashPin(pin);
  db.prepare(
    'INSERT INTO auth (id, pin_hash, display_name) VALUES (1, ?, ?) ON CONFLICT(id) DO UPDATE SET pin_hash = excluded.pin_hash, display_name = excluded.display_name'
  ).run(pinHash, (displayName || '').trim());
  return createSession();
}

export function loginWithPin(pin) {
  if (!pin) return null;
  const row = db.prepare('SELECT pin_hash, display_name FROM auth WHERE id = 1').get();
  if (!row) return null;
  if (hashPin(pin) !== row.pin_hash) return null;
  return createSession();
}

export function changePin(currentPin, newPin) {
  const row = db.prepare('SELECT pin_hash FROM auth WHERE id = 1').get();
  if (!row) throw new Error('Autentikasi belum diatur.');
  if (hashPin(currentPin) !== row.pin_hash) {
    throw new Error('PIN lama salah.');
  }
  if (!newPin || newPin.trim().length < 4) {
    throw new Error('PIN baru minimal 4 karakter.');
  }
  db.prepare('UPDATE auth SET pin_hash = ? WHERE id = 1').run(hashPin(newPin));
  return true;
}

export function getAuthDisplayName() {
  const row = db.prepare('SELECT display_name FROM auth WHERE id = 1').get();
  return row?.display_name || '';
}

function createSession() {
  const token = crypto.randomUUID();
  const now = new Date();
  const expires = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  db.prepare(
    'INSERT INTO sessions (token, created_at, expires_at) VALUES (?, ?, ?)'
  ).run(token, now.toISOString(), expires.toISOString());
  cleanExpiredSessions();
  return { token, expiresAt: expires.toISOString() };
}

export function validateSession(token) {
  if (!token) return false;
  const row = db.prepare('SELECT expires_at FROM sessions WHERE token = ?').get(token);
  if (!row) return false;
  if (new Date(row.expires_at) < new Date()) {
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
    return false;
  }
  return true;
}

export function destroySession(token) {
  if (token) {
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
  }
}

function cleanExpiredSessions() {
  db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(new Date().toISOString());
}

export function removeAuth() {
  db.exec('DELETE FROM auth; DELETE FROM sessions;');
}
