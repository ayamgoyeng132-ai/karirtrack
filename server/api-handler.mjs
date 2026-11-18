import {
  getFullState,
  saveSettings,
  createJob,
  updateJob,
  deleteJobs,
  bulkUpdateStage,
  upsertDocument,
  deleteDocument,
  upsertTemplate,
  deleteTemplate,
  clearAllData,
  seedIfEmpty,
  importFullState,
  isAuthSetup,
  setupAuth,
  loginWithPin,
  validateSession,
  destroySession,
  changePin,
  getAuthDisplayName,
  removeAuth,
} from './db.mjs';

function sendJson(res, status, data) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        resolve(raw ? JSON.parse(raw) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function getToken(req) {
  const auth = req.headers['authorization'] || '';
  if (auth.startsWith('Bearer ')) return auth.slice(7);
  return '';
}

export async function apiHandler(req, res, next) {
  try {
    const rawUrl = req.url || '/';
    const parsed = new URL(rawUrl, 'http://localhost');
    const pathname = parsed.pathname.replace(/^\/api(?=\/|$)/, '') || '/';
    const method = (req.method || 'GET').toUpperCase();

    if (method === 'GET' && pathname === '/auth/status') {
      const hasAuth = isAuthSetup();
      const token = getToken(req);
      const authenticated = hasAuth && validateSession(token);
      const displayName = hasAuth ? getAuthDisplayName() : '';
      return sendJson(res, 200, { hasAuth, authenticated, displayName });
    }

    if (method === 'POST' && pathname === '/auth/setup') {
      const body = await readBody(req);
      if (isAuthSetup()) {
        return sendJson(res, 400, { error: 'Login sudah diatur. Gunakan PIN untuk masuk.' });
      }
      try {
        const session = setupAuth(body.pin, body.displayName);
        return sendJson(res, 201, { session, displayName: body.displayName || '' });
      } catch (err) {
        return sendJson(res, 400, { error: err.message });
      }
    }

    if (method === 'POST' && pathname === '/auth/login') {
      const body = await readBody(req);
      const session = loginWithPin(body.pin);
      if (!session) {
        return sendJson(res, 401, { error: 'PIN salah. Periksa kembali dan coba lagi.' });
      }
      const displayName = getAuthDisplayName();
      return sendJson(res, 200, { session, displayName });
    }

    if (method === 'POST' && pathname === '/auth/logout') {
      destroySession(getToken(req));
      return sendJson(res, 200, { ok: true });
    }

    if (method === 'POST' && pathname === '/auth/change-pin') {
      const token = getToken(req);
      if (!validateSession(token)) {
        return sendJson(res, 401, { error: 'Sesi tidak valid.' });
      }
      const body = await readBody(req);
      try {
        changePin(body.currentPin, body.newPin);
        return sendJson(res, 200, { ok: true });
      } catch (err) {
        return sendJson(res, 400, { error: err.message });
      }
    }

    if (method === 'POST' && pathname === '/auth/remove') {
      const token = getToken(req);
      if (!validateSession(token)) {
        return sendJson(res, 401, { error: 'Sesi tidak valid.' });
      }
      removeAuth();
      return sendJson(res, 200, { ok: true });
    }

    if (isAuthSetup()) {
      const token = getToken(req);
      if (!validateSession(token)) {
        return sendJson(res, 401, { error: 'Silakan masuk terlebih dahulu.' });
      }
    }

    if (method === 'GET' && pathname === '/state') {
      return sendJson(res, 200, getFullState());
    }

    if (method === 'PUT' && pathname === '/settings') {
      const body = await readBody(req);
      const settings = saveSettings(body);
      return sendJson(res, 200, { settings });
    }

    if (method === 'POST' && pathname === '/jobs') {
      const body = await readBody(req);
      if (!body.company || !body.position) {
        return sendJson(res, 400, { error: 'Nama perusahaan dan posisi wajib diisi.' });
      }
      const job = createJob(body);
      return sendJson(res, 201, { job });
    }

    if (method === 'POST' && pathname === '/jobs/bulk') {
      const body = await readBody(req);
      const ids = Array.isArray(body.ids) ? body.ids : [];
      if (body.action === 'delete') {
        deleteJobs(ids);
      } else if (body.action === 'stage' && body.stage) {
        bulkUpdateStage(ids, body.stage);
      }
      return sendJson(res, 200, { jobs: getFullState().jobs });
    }

    const jobMatch = pathname.match(/^\/jobs\/([^/]+)$/);
    if (jobMatch) {
      const id = decodeURIComponent(jobMatch[1]);
      if (method === 'PUT') {
        const body = await readBody(req);
        const job = updateJob(id, body);
        if (!job) return sendJson(res, 404, { error: 'Lamaran tidak ditemukan.' });
        return sendJson(res, 200, { job });
      }
      if (method === 'DELETE') {
        deleteJobs([id]);
        return sendJson(res, 200, { ok: true });
      }
    }

    if ((method === 'POST' || method === 'PUT') && pathname.startsWith('/documents')) {
      const body = await readBody(req);
      const docMatch = pathname.match(/^\/documents\/([^/]+)$/);
      if (docMatch) body.id = decodeURIComponent(docMatch[1]);
      if (!body.title) return sendJson(res, 400, { error: 'Judul dokumen wajib diisi.' });
      const documents = upsertDocument(body);
      return sendJson(res, 200, { documents });
    }

    const docDelMatch = pathname.match(/^\/documents\/([^/]+)$/);
    if (docDelMatch && method === 'DELETE') {
      const documents = deleteDocument(decodeURIComponent(docDelMatch[1]));
      return sendJson(res, 200, { documents });
    }

    if ((method === 'POST' || method === 'PUT') && pathname.startsWith('/templates')) {
      const body = await readBody(req);
      const tplMatch = pathname.match(/^\/templates\/([^/]+)$/);
      if (tplMatch) body.id = decodeURIComponent(tplMatch[1]);
      if (!body.title || !body.body) {
        return sendJson(res, 400, { error: 'Judul dan isi template wajib diisi.' });
      }
      const templates = upsertTemplate(body);
      return sendJson(res, 200, { templates });
    }

    const tplDelMatch = pathname.match(/^\/templates\/([^/]+)$/);
    if (tplDelMatch && method === 'DELETE') {
      const templates = deleteTemplate(decodeURIComponent(tplDelMatch[1]));
      return sendJson(res, 200, { templates });
    }

    if (method === 'POST' && pathname === '/system/reset') {
      return sendJson(res, 200, clearAllData());
    }

    if (method === 'POST' && pathname === '/system/seed') {
      seedIfEmpty(true);
      return sendJson(res, 200, getFullState());
    }

    if (method === 'POST' && pathname === '/system/import') {
      const body = await readBody(req);
      return sendJson(res, 200, importFullState(body));
    }

    if (next) return next();
    sendJson(res, 404, { error: 'Endpoint tidak ditemukan.' });
  } catch (err) {
    console.error('API Error:', err);
    sendJson(res, 500, { error: err instanceof Error ? err.message : 'Terjadi kesalahan server.' });
  }
}
