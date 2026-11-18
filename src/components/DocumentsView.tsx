import React, { useState } from 'react';
import {
  Plus,
  Copy,
  Check,
  Pencil,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import type {
  AppSettings,
  DocumentItem,
  JobApplication,
  MessageTemplate,
} from '../types';
import { getStageMeta, renderMessageTemplate } from '../utils/format';

interface DocumentsViewProps {
  documents: DocumentItem[];
  templates: MessageTemplate[];
  jobs: JobApplication[];
  settings: AppSettings;
  onSaveDocument: (doc: Partial<DocumentItem>) => Promise<void>;
  onDeleteDocument: (id: string) => Promise<void>;
  onSaveTemplate: (tpl: Partial<MessageTemplate>) => Promise<void>;
  onDeleteTemplate: (id: string) => Promise<void>;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  documents,
  templates,
  jobs,
  settings,
  onSaveDocument,
  onDeleteDocument,
  onSaveTemplate,
  onDeleteTemplate,
}) => {
  const [editingDoc, setEditingDoc] = useState<Partial<DocumentItem> | null>(null);
  const [editingTpl, setEditingTpl] = useState<Partial<MessageTemplate> | null>(null);
  const [previewJobId, setPreviewJobId] = useState<string>(jobs[0]?.id || '');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const selectedPreviewJob = jobs.find((j) => j.id === previewJobId) || null;

  const handleCopy = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Section 1: Master CV & Dokumen */}
      <section aria-label="Manajemen Versi CV dan Portofolio" className="space-y-4">
        <div className="flex flex-col justify-between gap-3 border-b border-[#D6CFC2] pb-4 dark:border-[#38332E] sm:flex-row sm:items-end">
          <div>
            <span className="font-mono-num text-xs font-bold uppercase tracking-wider text-[#57534E] dark:text-[#A8A29E]">
              01 / ARSIP BERKAS LAMARAN
            </span>
            <h2 className="font-editorial mt-0.5 text-xl font-bold text-[#1C1917] dark:text-[#F5F5F4]">
              Master Versi CV, Portofolio & Dokumen
            </h2>
            <p className="mt-0.5 text-xs text-[#44403C] dark:text-[#D6D3D1]">
              Catat versi CV yang Anda miliki agar dapat ditautkan ke setiap lamaran dan diukur tingkat panggilannya.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setEditingDoc({
                title: '',
                type: 'CV / Resume',
                version: 'v1.0',
                targetRole: '',
                url: '',
                notes: '',
                isDefault: documents.length === 0,
              })
            }
            className="inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-lg bg-[#C2410C] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#9A3412]"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Tambah Dokumen / CV</span>
          </button>
        </div>

        {editingDoc && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!editingDoc.title?.trim()) return;
              await onSaveDocument(editingDoc);
              setEditingDoc(null);
            }}
            className="rounded-xl border-2 border-[#C2410C] bg-white p-5 dark:border-[#FB923C] dark:bg-[#211E1B]"
          >
            <h3 className="font-editorial text-base font-bold text-[#1C1917] dark:text-[#F5F5F4]">
              {editingDoc.id ? 'Perbarui Dokumen' : 'Tambah Dokumen Baru'}
            </h3>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="sm:col-span-2">
                <label htmlFor="doc-title" className="mb-1 block text-xs font-bold text-[#44403C] dark:text-[#D6D3D1]">
                  Nama Dokumen *
                </label>
                <input
                  id="doc-title"
                  required
                  value={editingDoc.title || ''}
                  onChange={(e) => setEditingDoc({ ...editingDoc, title: e.target.value })}
                  placeholder="Contoh: CV ATS Software Engineer (ID/EN)"
                  className="min-h-[44px] w-full rounded-lg border border-[#A8A29E] bg-[#FAF6F0] px-3 py-2 text-sm text-[#1C1917] dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4]"
                />
              </div>

              <div>
                <label htmlFor="doc-type" className="mb-1 block text-xs font-bold text-[#44403C] dark:text-[#D6D3D1]">
                  Kategori
                </label>
                <select
                  id="doc-type"
                  value={editingDoc.type || 'CV / Resume'}
                  onChange={(e) => setEditingDoc({ ...editingDoc, type: e.target.value })}
                  className="min-h-[44px] w-full rounded-lg border border-[#A8A29E] bg-[#FAF6F0] px-3 py-2 text-sm text-[#1C1917] dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4]"
                >
                  <option value="CV / Resume">CV / Resume</option>
                  <option value="Portofolio">Portofolio</option>
                  <option value="Cover Letter">Cover Letter</option>
                  <option value="Sertifikat / Lainnya">Sertifikat / Lainnya</option>
                </select>
              </div>

              <div>
                <label htmlFor="doc-version" className="mb-1 block text-xs font-bold text-[#44403C] dark:text-[#D6D3D1]">
                  Kode Versi
                </label>
                <input
                  id="doc-version"
                  value={editingDoc.version || ''}
                  onChange={(e) => setEditingDoc({ ...editingDoc, version: e.target.value })}
                  placeholder="v3.1 / 2026"
                  className="min-h-[44px] w-full rounded-lg border border-[#A8A29E] bg-[#FAF6F0] px-3 py-2 text-sm text-[#1C1917] dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4]"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="doc-role" className="mb-1 block text-xs font-bold text-[#44403C] dark:text-[#D6D3D1]">
                  Target Posisi
                </label>
                <input
                  id="doc-role"
                  value={editingDoc.targetRole || ''}
                  onChange={(e) => setEditingDoc({ ...editingDoc, targetRole: e.target.value })}
                  placeholder="Frontend / Product Manager / Data Analyst"
                  className="min-h-[44px] w-full rounded-lg border border-[#A8A29E] bg-[#FAF6F0] px-3 py-2 text-sm text-[#1C1917] dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4]"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="doc-url" className="mb-1 block text-xs font-bold text-[#44403C] dark:text-[#D6D3D1]">
                  Tautan Dokumen (URL)
                </label>
                <input
                  id="doc-url"
                  type="url"
                  value={editingDoc.url || ''}
                  onChange={(e) => setEditingDoc({ ...editingDoc, url: e.target.value })}
                  placeholder="https://..."
                  className="min-h-[44px] w-full rounded-lg border border-[#A8A29E] bg-[#FAF6F0] px-3 py-2 text-sm text-[#1C1917] dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4]"
                />
              </div>

              <div className="sm:col-span-4">
                <label htmlFor="doc-notes" className="mb-1 block text-xs font-bold text-[#44403C] dark:text-[#D6D3D1]">
                  Catatan Dokumen
                </label>
                <input
                  id="doc-notes"
                  value={editingDoc.notes || ''}
                  onChange={(e) => setEditingDoc({ ...editingDoc, notes: e.target.value })}
                  placeholder="Fokus keahlian atau proyek yang ditonjolkan pada versi ini..."
                  className="min-h-[44px] w-full rounded-lg border border-[#A8A29E] bg-[#FAF6F0] px-3 py-2 text-sm text-[#1C1917] dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4]"
                />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <label className="inline-flex min-h-[44px] items-center gap-2.5 text-xs font-bold text-[#1C1917] dark:text-[#F5F5F4]">
                <input
                  type="checkbox"
                  checked={Boolean(editingDoc.isDefault)}
                  onChange={(e) =>
                    setEditingDoc({ ...editingDoc, isDefault: e.target.checked })
                  }
                  className="h-4 w-4 rounded"
                />
                <span>Jadikan CV Default saat mencatat loker baru</span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingDoc(null)}
                  className="min-h-[44px] rounded-lg border border-[#A8A29E] px-4 py-2 text-xs font-bold text-[#1C1917] dark:border-[#57534E] dark:text-[#F5F5F4]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] rounded-lg bg-[#C2410C] px-4 py-2 text-xs font-bold text-white hover:bg-[#9A3412]"
                >
                  Simpan Dokumen
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc, idx) => {
            const usedCount = jobs.filter((j) => j.documentId === doc.id).length;
            const interviewCount = jobs.filter((j) => {
              if (j.documentId !== doc.id) return false;
              const cat = getStageMeta(settings.stages, j.stage).category;
              return cat === 'interview' || cat === 'offer' || cat === 'accepted';
            }).length;

            return (
              <article
                key={doc.id}
                className="flex flex-col justify-between rounded-xl border border-[#D6CFC2] bg-white p-5 dark:border-[#38332E] dark:bg-[#211E1B]"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono-num text-xs font-bold uppercase text-[#C2410C] dark:text-[#FB923C]">
                      DOC.0{idx + 1} • {doc.type} {doc.version ? `(${doc.version})` : ''}
                    </span>
                    {doc.isDefault && (
                      <span className="font-mono-num rounded border border-[#B45309] bg-[#FEF3C7] px-2 py-0.5 text-[10px] font-bold uppercase text-[#451A03] dark:bg-[#451A03] dark:text-[#FEF3C7]">
                        DEFAULT
                      </span>
                    )}
                  </div>

                  <h3 className="font-editorial mt-2 text-base font-bold text-[#1C1917] dark:text-[#F5F5F4]">
                    {doc.title}
                  </h3>

                  {doc.targetRole && (
                    <p className="mt-1.5 text-xs font-bold text-[#44403C] dark:text-[#D6D3D1]">
                      Target Posisi: {doc.targetRole}
                    </p>
                  )}
                  {doc.notes && (
                    <p className="mt-1 text-xs leading-relaxed text-[#57534E] dark:text-[#A8A29E]">
                      {doc.notes}
                    </p>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-[#E6DFD3] pt-3 dark:border-[#38332E]">
                  <span className="font-mono-num text-xs font-bold text-[#1C1917] dark:text-[#F5F5F4]">
                    Dipakai {usedCount}x • {interviewCount} interview
                  </span>

                  <div className="flex items-center gap-1">
                    {doc.url && (
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Buka dokumen ${doc.title}`}
                        className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-transparent text-[#44403C] hover:border-[#D6CFC2] hover:bg-[#FAF6F0] dark:text-[#D6D3D1] dark:hover:bg-[#161412]"
                      >
                        <ExternalLink className="h-4 w-4" aria-hidden="true" />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => setEditingDoc(doc)}
                      aria-label={`Edit dokumen ${doc.title}`}
                      className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-transparent text-[#44403C] hover:border-[#D6CFC2] hover:bg-[#FAF6F0] dark:text-[#D6D3D1] dark:hover:bg-[#161412]"
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteDocument(doc.id)}
                      aria-label={`Hapus dokumen ${doc.title}`}
                      className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-transparent text-[#BE123C] hover:bg-[#FFE4E6] dark:text-[#FB7185] dark:hover:bg-[#4C0519]"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Section 2: Template Pesan Follow-Up & Komunikasi HR */}
      <section aria-label="Template Pesan Komunikasi HR" className="space-y-4">
        <div className="flex flex-col justify-between gap-3 border-b border-[#D6CFC2] pb-4 dark:border-[#38332E] lg:flex-row lg:items-end">
          <div>
            <span className="font-mono-num text-xs font-bold uppercase tracking-wider text-[#57534E] dark:text-[#A8A29E]">
              02 / SURAT & KOMUNIKASI REKRUTMEN
            </span>
            <h2 className="font-editorial mt-0.5 text-xl font-bold text-[#1C1917] dark:text-[#F5F5F4]">
              Template Pesan HR (Follow-Up, LinkedIn, Nego Gaji)
            </h2>
            <p className="mt-0.5 text-xs text-[#44403C] dark:text-[#D6D3D1]">
              Pilih salah satu loker pada pratinjau untuk mengisi variabel{' '}
              <code className="font-mono-num rounded bg-[#EFE8DC] px-1 py-0.5 dark:bg-[#2A2622]">
                {'{perusahaan}'}
              </code>
              ,{' '}
              <code className="font-mono-num rounded bg-[#EFE8DC] px-1 py-0.5 dark:bg-[#2A2622]">
                {'{posisi}'}
              </code>
              , dan{' '}
              <code className="font-mono-num rounded bg-[#EFE8DC] px-1 py-0.5 dark:bg-[#2A2622]">
                {'{nama_hr}'}
              </code>{' '}
              secara otomatis.
            </p>
          </div>

          <div className="flex flex-wrap items-end gap-2.5">
            <div>
              <label
                htmlFor="preview-job-select"
                className="mb-1 block text-xs font-bold text-[#44403C] dark:text-[#D6D3D1]"
              >
                Pratinjau untuk Loker:
              </label>
              <select
                id="preview-job-select"
                value={previewJobId}
                onChange={(e) => setPreviewJobId(e.target.value)}
                className="min-h-[44px] rounded-lg border border-[#A8A29E] bg-white px-3 py-2 text-xs font-bold text-[#1C1917] dark:border-[#57534E] dark:bg-[#211E1B] dark:text-[#F5F5F4]"
              >
                <option value="">Tanpa Loker (Tampilkan Placeholder)</option>
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.company} ({j.position})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() =>
                setEditingTpl({
                  title: '',
                  category: 'Follow-Up',
                  subject: 'Follow-up Lamaran {posisi} - {nama_saya}',
                  body: 'Halo Bapak/Ibu {nama_hr},\n\nPerkenalkan saya {nama_saya}...',
                })
              }
              className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-[#C2410C] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#9A3412]"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>Buat Template Baru</span>
            </button>
          </div>
        </div>

        {editingTpl && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!editingTpl.title?.trim() || !editingTpl.body?.trim()) return;
              await onSaveTemplate(editingTpl);
              setEditingTpl(null);
            }}
            className="rounded-xl border-2 border-[#C2410C] bg-white p-5 dark:border-[#FB923C] dark:bg-[#211E1B]"
          >
            <h3 className="font-editorial text-base font-bold text-[#1C1917] dark:text-[#F5F5F4]">
              {editingTpl.id ? 'Edit Template Pesan' : 'Buat Template Pesan Baru'}
            </h3>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label htmlFor="tpl-title" className="mb-1 block text-xs font-bold text-[#44403C] dark:text-[#D6D3D1]">
                  Judul Template *
                </label>
                <input
                  id="tpl-title"
                  required
                  value={editingTpl.title || ''}
                  onChange={(e) => setEditingTpl({ ...editingTpl, title: e.target.value })}
                  className="min-h-[44px] w-full rounded-lg border border-[#A8A29E] bg-[#FAF6F0] px-3 py-2 text-sm text-[#1C1917] dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4]"
                />
              </div>
              <div>
                <label htmlFor="tpl-cat" className="mb-1 block text-xs font-bold text-[#44403C] dark:text-[#D6D3D1]">
                  Kategori
                </label>
                <select
                  id="tpl-cat"
                  value={editingTpl.category || 'Follow-Up'}
                  onChange={(e) => setEditingTpl({ ...editingTpl, category: e.target.value })}
                  className="min-h-[44px] w-full rounded-lg border border-[#A8A29E] bg-[#FAF6F0] px-3 py-2 text-sm text-[#1C1917] dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4]"
                >
                  <option value="Follow-Up">Follow-Up</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Cover Letter">Cover Letter</option>
                  <option value="Terima Kasih Interview">Terima Kasih Interview</option>
                  <option value="Offering & Nego">Offering & Nego</option>
                </select>
              </div>
              <div className="sm:col-span-3">
                <label htmlFor="tpl-subj" className="mb-1 block text-xs font-bold text-[#44403C] dark:text-[#D6D3D1]">
                  Subjek Email (Opsional)
                </label>
                <input
                  id="tpl-subj"
                  value={editingTpl.subject || ''}
                  onChange={(e) => setEditingTpl({ ...editingTpl, subject: e.target.value })}
                  className="min-h-[44px] w-full rounded-lg border border-[#A8A29E] bg-[#FAF6F0] px-3 py-2 text-sm text-[#1C1917] dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4]"
                />
              </div>
              <div className="sm:col-span-3">
                <label htmlFor="tpl-body" className="mb-1 block text-xs font-bold text-[#44403C] dark:text-[#D6D3D1]">
                  Isi Pesan * (mendukung {'{perusahaan}'}, {'{posisi}'}, {'{nama_hr}'}, {'{nama_saya}'}, {'{tanggal_apply}'}, {'{platform}'}, {'{portofolio}'})
                </label>
                <textarea
                  id="tpl-body"
                  required
                  rows={6}
                  value={editingTpl.body || ''}
                  onChange={(e) => setEditingTpl({ ...editingTpl, body: e.target.value })}
                  className="w-full rounded-lg border border-[#A8A29E] bg-[#FAF6F0] p-3 text-sm text-[#1C1917] dark:border-[#57534E] dark:bg-[#161412] dark:text-[#F5F5F4]"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingTpl(null)}
                className="min-h-[44px] rounded-lg border border-[#A8A29E] px-4 py-2 text-xs font-bold text-[#1C1917] dark:border-[#57534E] dark:text-[#F5F5F4]"
              >
                Batal
              </button>
              <button
                type="submit"
                className="min-h-[44px] rounded-lg bg-[#C2410C] px-4 py-2 text-xs font-bold text-white hover:bg-[#9A3412]"
              >
                Simpan Template
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {templates.map((tpl, idx) => {
            const renderedSubject = renderMessageTemplate(
              tpl.subject,
              selectedPreviewJob,
              settings.profile
            );
            const renderedBody = renderMessageTemplate(
              tpl.body,
              selectedPreviewJob,
              settings.profile
            );

            return (
              <article
                key={tpl.id}
                className="flex flex-col justify-between rounded-xl border border-[#D6CFC2] bg-white p-5 dark:border-[#38332E] dark:bg-[#211E1B]"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono-num rounded border border-[#A8A29E] bg-[#F3EDE2] px-2 py-0.5 text-[11px] font-bold uppercase text-[#1C1917] dark:border-[#57534E] dark:bg-[#2A2622] dark:text-[#F5F5F4]">
                      TPL.0{idx + 1} • {tpl.category}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setEditingTpl(tpl)}
                        aria-label={`Edit template ${tpl.title}`}
                        className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-[#44403C] hover:bg-[#FAF6F0] dark:text-[#D6D3D1] dark:hover:bg-[#161412]"
                      >
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteTemplate(tpl.id)}
                        aria-label={`Hapus template ${tpl.title}`}
                        className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-[#BE123C] hover:bg-[#FFE4E6] dark:text-[#FB7185] dark:hover:bg-[#4C0519]"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-editorial mt-2 text-base font-bold text-[#1C1917] dark:text-[#F5F5F4]">
                    {tpl.title}
                  </h3>
                  {renderedSubject && (
                    <p className="mt-1 text-xs font-bold text-[#44403C] dark:text-[#D6D3D1]">
                      Subjek: {renderedSubject}
                    </p>
                  )}

                  <pre className="mt-3 max-h-52 overflow-y-auto whitespace-pre-wrap rounded-lg border border-[#D6CFC2] bg-[#FAF6F0] p-3.5 font-sans text-xs leading-relaxed text-[#1C1917] dark:border-[#38332E] dark:bg-[#161412] dark:text-[#F5F5F4]">
                    {renderedBody}
                  </pre>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(
                        tpl.id,
                        renderedSubject ? `${renderedSubject}\n\n${renderedBody}` : renderedBody
                      )
                    }
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-[#1C1917] px-4 py-2 text-xs font-bold text-[#FAF6F0] transition hover:bg-[#292524] dark:bg-[#C2410C] dark:text-white dark:hover:bg-[#9A3412]"
                  >
                    {copiedId === tpl.id ? (
                      <>
                        <Check className="h-4 w-4" aria-hidden="true" />
                        <span>Tersalin ke Clipboard</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" aria-hidden="true" />
                        <span>Salin Pesan Siap Kirim</span>
                      </>
                    )}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
};
