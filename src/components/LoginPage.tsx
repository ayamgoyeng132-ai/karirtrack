import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Eye, EyeOff, KeyRound, Loader2, LogIn, ShieldCheck, User } from 'lucide-react';
import { api, type AuthStatus } from '../api';

type AuthMode = 'loading' | 'setup' | 'login';

interface LoginPageProps {
  onAuthenticated: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onAuthenticated }) => {
  const [mode, setMode] = useState<AuthMode>('loading');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [authDisplayName, setAuthDisplayName] = useState('');

  const pinRef = useRef<HTMLInputElement>(null);

  const checkAuth = useCallback(async () => {
    try {
      const status: AuthStatus = await api.getAuthStatus();
      if (status.authenticated) {
        onAuthenticated();
        return;
      }
      setAuthDisplayName(status.displayName);
      setMode(status.hasAuth ? 'login' : 'setup');
    } catch {
      setMode('setup');
    }
  }, [onAuthenticated]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (mode !== 'loading') {
      const timer = setTimeout(() => pinRef.current?.focus(), 150);
      return () => clearTimeout(timer);
    }
  }, [mode]);

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (pin.trim().length < 4) {
      setError('PIN minimal 4 karakter.');
      return;
    }
    if (pin !== confirmPin) {
      setError('PIN konfirmasi tidak cocok.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await api.setupAuth(pin.trim(), displayName.trim());
      api.setToken(result.session.token);
      onAuthenticated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengatur PIN.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!pin.trim()) {
      setError('Masukkan PIN Anda.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await api.login(pin.trim());
      api.setToken(result.session.token);
      onAuthenticated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'PIN salah.');
    } finally {
      setSubmitting(false);
    }
  };

  if (mode === 'loading') {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[#FAF6F0] dark:bg-[#161412]">
        <div
          role="status"
          className="flex items-center gap-3 rounded-xl border border-[#D6CFC2] bg-white px-6 py-4 dark:border-[#38332E] dark:bg-[#211E1B]"
        >
          <Loader2 className="h-5 w-5 animate-spin text-[#C2410C]" aria-hidden="true" />
          <span className="text-sm font-bold text-[#1C1917] dark:text-[#F5F5F4]">
            Memuat...
          </span>
        </div>
      </div>
    );
  }

  const isSetup = mode === 'setup';

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#FAF6F0] px-4 py-8 dark:bg-[#161412]">
      <div className="w-full max-w-[400px]">
        {/* Logo / Brand */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#D6CFC2] bg-white dark:border-[#38332E] dark:bg-[#211E1B]">
            <ShieldCheck className="h-8 w-8 text-[#C2410C]" aria-hidden="true" />
          </div>
          <h1 className="font-editorial text-2xl font-bold text-[#1C1917] sm:text-3xl dark:text-[#F5F5F4]">
            KarirTrack
          </h1>
          <p className="mt-1 text-xs text-[#57534E] dark:text-[#A8A29E]">
            Jurnal Lamaran Kerja Pribadi
          </p>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-[#D6CFC2] bg-white p-6 sm:p-8 dark:border-[#38332E] dark:bg-[#211E1B]">
          {/* Card Header */}
          <div className="mb-6">
            <span className="font-mono-num block text-[10px] font-bold uppercase tracking-wider text-[#57534E] dark:text-[#A8A29E]">
              {isSetup ? 'LANGKAH AWAL / BUAT PIN' : 'AKSES / MASUK'}
            </span>
            <h2 className="font-editorial mt-1 text-lg font-bold text-[#1C1917] dark:text-[#F5F5F4]">
              {isSetup ? 'Buat PIN Akses' : (
                <>
                  Selamat datang{authDisplayName ? `, ${authDisplayName}` : ''}
                </>
              )}
            </h2>
            <p className="mt-1 text-xs text-[#44403C] dark:text-[#D6D3D1]">
              {isSetup
                ? 'Atur PIN untuk mengamankan data lamaran Anda di perangkat ini.'
                : 'Masukkan PIN Anda untuk melanjutkan.'}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              role="alert"
              className="mb-4 rounded-lg border border-[#BE123C]/30 bg-[#FFF1F2] px-4 py-3 text-xs font-medium text-[#9F1239] dark:border-[#FB7185]/30 dark:bg-[#2A1215] dark:text-[#FDA4AF]"
            >
              {error}
            </div>
          )}

          <form onSubmit={isSetup ? handleSetup : handleLogin} noValidate>
            {/* Display Name (setup only) */}
            {isSetup && (
              <div className="mb-4">
                <label
                  htmlFor="auth-name"
                  className="mb-1.5 block text-xs font-bold text-[#1C1917] dark:text-[#F5F5F4]"
                >
                  Nama Anda (opsional)
                </label>
                <div className="relative">
                  <User
                    className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#A8A29E]"
                    aria-hidden="true"
                  />
                  <input
                    id="auth-name"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="cth. Raka"
                    autoComplete="name"
                    className="min-h-[48px] w-full rounded-lg border border-[#D6CFC2] bg-[#FAF6F0] py-3 pr-4 pl-10 text-sm text-[#1C1917] placeholder-[#A8A29E] transition focus:border-[#C2410C] focus:ring-0 dark:border-[#38332E] dark:bg-[#161412] dark:text-[#F5F5F4] dark:placeholder-[#57534E] dark:focus:border-[#FB923C]"
                  />
                </div>
              </div>
            )}

            {/* PIN */}
            <div className="mb-4">
              <label
                htmlFor="auth-pin"
                className="mb-1.5 block text-xs font-bold text-[#1C1917] dark:text-[#F5F5F4]"
              >
                {isSetup ? 'Buat PIN (minimal 4 karakter)' : 'PIN'}
              </label>
              <div className="relative">
                <KeyRound
                  className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#A8A29E]"
                  aria-hidden="true"
                />
                <input
                  ref={pinRef}
                  id="auth-pin"
                  type={showPin ? 'text' : 'password'}
                  inputMode="numeric"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder={isSetup ? 'Minimal 4 karakter' : 'Masukkan PIN'}
                  autoComplete={isSetup ? 'new-password' : 'current-password'}
                  className="min-h-[48px] w-full rounded-lg border border-[#D6CFC2] bg-[#FAF6F0] py-3 pr-12 pl-10 text-sm text-[#1C1917] placeholder-[#A8A29E] transition focus:border-[#C2410C] focus:ring-0 dark:border-[#38332E] dark:bg-[#161412] dark:text-[#F5F5F4] dark:placeholder-[#57534E] dark:focus:border-[#FB923C]"
                />
                <button
                  type="button"
                  onClick={() => setShowPin((v) => !v)}
                  aria-label={showPin ? 'Sembunyikan PIN' : 'Tampilkan PIN'}
                  className="absolute top-1/2 right-3 -translate-y-1/2 rounded p-1 text-[#57534E] hover:text-[#1C1917] dark:text-[#A8A29E] dark:hover:text-[#F5F5F4]"
                >
                  {showPin ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm PIN (setup only) */}
            {isSetup && (
              <div className="mb-6">
                <label
                  htmlFor="auth-confirm-pin"
                  className="mb-1.5 block text-xs font-bold text-[#1C1917] dark:text-[#F5F5F4]"
                >
                  Konfirmasi PIN
                </label>
                <div className="relative">
                  <KeyRound
                    className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#A8A29E]"
                    aria-hidden="true"
                  />
                  <input
                    id="auth-confirm-pin"
                    type={showConfirmPin ? 'text' : 'password'}
                    inputMode="numeric"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value)}
                    placeholder="Ketik ulang PIN"
                    autoComplete="new-password"
                    className="min-h-[48px] w-full rounded-lg border border-[#D6CFC2] bg-[#FAF6F0] py-3 pr-12 pl-10 text-sm text-[#1C1917] placeholder-[#A8A29E] transition focus:border-[#C2410C] focus:ring-0 dark:border-[#38332E] dark:bg-[#161412] dark:text-[#F5F5F4] dark:placeholder-[#57534E] dark:focus:border-[#FB923C]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPin((v) => !v)}
                    aria-label={showConfirmPin ? 'Sembunyikan PIN' : 'Tampilkan PIN'}
                    className="absolute top-1/2 right-3 -translate-y-1/2 rounded p-1 text-[#57534E] hover:text-[#1C1917] dark:text-[#A8A29E] dark:hover:text-[#F5F5F4]"
                  >
                    {showConfirmPin ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg bg-[#C2410C] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#9A3412] active:bg-[#7C2D12] disabled:opacity-60"
            >
              {submitting ? (
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              ) : isSetup ? (
                <>
                  <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                  <span>Simpan PIN dan Masuk</span>
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5" aria-hidden="true" />
                  <span>Masuk</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer hint */}
        <p className="mt-6 text-center text-[10px] text-[#78716C] dark:text-[#57534E]">
          Data tersimpan di perangkat lokal (SQLite). PIN melindungi akses ke jurnal lamaran Anda.
        </p>
      </div>
    </div>
  );
};
