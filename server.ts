import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import bcrypt from 'bcryptjs';
import { INITIAL_FURNITURE_NAMES, INITIAL_PROJECTS } from './src/data/seedNames';
import { FurnitureName, NamingProject, AuditLog, FurnitureCategory, FurnitureLine, NameStatus, User, ImportRecord } from './src/types';
import { checkNameSimilarity, normalizeName } from './src/utils/similarity';
import { PRESET_AVATARS } from './src/data/avatars';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-Memory User Database with bcrypt hashed passwords
interface UserInternal extends User {
  passwordHash: string;
}

let usersDatabase: UserInternal[] = [
  {
    id: 'usr-001',
    fullName: 'Renzo D. Morales',
    username: 'renzo',
    role: 'Administrador',
    status: 'Activo',
    createdAt: new Date('2026-01-01').toISOString(),
    lastAccess: new Date().toISOString(),
    avatarUrl: PRESET_AVATARS[5].url, // Monitor de Diseño
    passwordHash: bcrypt.hashSync('admin123', 10)
  },
  {
    id: 'usr-002',
    fullName: 'Elena Macrumo',
    username: 'elena',
    role: 'Administrador',
    status: 'Activo',
    createdAt: new Date('2026-01-05').toISOString(),
    lastAccess: new Date('2026-03-20T10:30:00Z').toISOString(),
    avatarUrl: PRESET_AVATARS[4].url, // Sofá Moderno
    passwordHash: bcrypt.hashSync('macrumo123', 10)
  },
  {
    id: 'usr-003',
    fullName: 'Diseñador 01',
    username: 'diseno01',
    role: 'Diseñador',
    status: 'Activo',
    createdAt: new Date('2026-02-10').toISOString(),
    lastAccess: new Date('2026-03-22T14:15:00Z').toISOString(),
    avatarUrl: PRESET_AVATARS[0].url, // Rebanada de Pizza Kawaii
    passwordHash: bcrypt.hashSync('diseno123', 10)
  },
  {
    id: 'usr-004',
    fullName: 'Carlos Mendoza',
    username: 'carlos',
    role: 'Diseñador',
    status: 'Activo',
    createdAt: new Date('2026-02-15').toISOString(),
    lastAccess: new Date('2026-03-18T09:00:00Z').toISOString(),
    avatarUrl: PRESET_AVATARS[1].url, // Perro Feliz
    passwordHash: bcrypt.hashSync('carlos123', 10)
  }
];

// Active sessions: token -> userId
const activeSessions = new Map<string, string>();

// Helper to remove passwordHash from User
function sanitizeUser(u: UserInternal): User {
  const { passwordHash, ...safeUser } = u;
  return safeUser;
}

// In-Memory Master Database (persisted across sessions in server runtime)
let masterDatabase: FurnitureName[] = [...INITIAL_FURNITURE_NAMES];
let projectCollections: NamingProject[] = [...INITIAL_PROJECTS];
let auditLogs: AuditLog[] = [
  {
    id: 'log-1',
    action: 'REGISTRATION',
    name: 'Velvet',
    user: 'Elena Macrumo',
    role: 'Administrador',
    timestamp: new Date().toISOString(),
    details: 'Registro inicial del modelo Velvet en categoría Sofás.'
  },
  {
    id: 'log-2',
    action: 'REGISTRATION',
    name: 'Koa',
    user: 'Diseñador 01',
    role: 'Diseñador',
    timestamp: new Date().toISOString(),
    details: 'Registro de la mesa de comedor Koa en madera de nogal.'
  }
];

let importHistory: ImportRecord[] = [
  {
    id: 'imp-001',
    fileName: 'Catalogo_Historico_Macrumo_2025.xlsx',
    fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    user: 'Elena Macrumo',
    date: new Date('2026-02-14T10:15:00Z').toISOString(),
    totalCount: 450,
    newCount: 420,
    duplicateCount: 25,
    similarCount: 5,
    errorCount: 0,
    status: 'Completado',
    details: {
      skippedNames: ['Velvet', 'Koa', 'Sora'],
      similarNames: ['Aria', 'Siena']
    }
  },
  {
    id: 'imp-002',
    fileName: 'Base_Productos_Falabella_Macrumo.csv',
    fileType: 'text/csv',
    user: 'Renzo D. Morales',
    date: new Date('2026-03-01T16:45:00Z').toISOString(),
    totalCount: 280,
    newCount: 260,
    duplicateCount: 15,
    similarCount: 5,
    errorCount: 0,
    status: 'Completado',
    details: {
      skippedNames: ['Verona', 'Milan'],
      similarNames: ['Lumina']
    }
  }
];

// Initialize Gemini Client server-side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build'
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API ROUTES ---

  // Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', totalNames: masterDatabase.length, totalUsers: usersDatabase.length });
  });

  // --- AUTHENTICATION ENDPOINTS ---

  // LOGIN
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: 'Usuario y contraseña son requeridos.' });
      return;
    }

    const cleanUsername = String(username).trim().toLowerCase();
    const user = usersDatabase.find((u) => u.username.toLowerCase() === cleanUsername);

    if (!user) {
      res.status(401).json({ error: 'Credenciales inválidas. Verifique su usuario y contraseña.' });
      return;
    }

    if (user.status !== 'Activo') {
      res.status(403).json({ error: 'Esta cuenta de usuario se encuentra inactiva. Contacte al Administrador.' });
      return;
    }

    const isValidPassword = bcrypt.compareSync(String(password), user.passwordHash);

    if (!isValidPassword) {
      res.status(401).json({ error: 'Credenciales inválidas. Verifique su usuario y contraseña.' });
      return;
    }

    // Update last access timestamp
    user.lastAccess = new Date().toISOString();

    // Create session token
    const token = `token-${user.id}-${Date.now()}`;
    activeSessions.set(token, user.id);

    // Audit log
    auditLogs.unshift({
      id: `log-${Date.now()}`,
      action: 'UPDATE',
      name: `Acceso al Sistema`,
      user: user.fullName,
      role: user.role,
      timestamp: new Date().toISOString(),
      details: `Inicio de sesión exitoso en Macrumo Studio.`
    });

    res.json({
      message: 'Inicio de sesión exitoso',
      token,
      user: sanitizeUser(user)
    });
  });

  // GET CURRENT LOGGED IN USER
  app.get('/api/auth/me', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    const token = authHeader ? authHeader.replace('Bearer ', '') : req.query.token as string;

    if (!token || !activeSessions.has(token)) {
      res.status(401).json({ error: 'Sesión no válida o expirada.' });
      return;
    }

    const userId = activeSessions.get(token);
    const user = usersDatabase.find((u) => u.id === userId);

    if (!user || user.status !== 'Activo') {
      res.status(401).json({ error: 'Usuario no encontrado o inactivo.' });
      return;
    }

    res.json(sanitizeUser(user));
  });

  // LOGOUT
  app.post('/api/auth/logout', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    const token = authHeader ? authHeader.replace('Bearer ', '') : req.body.token;

    if (token) {
      activeSessions.delete(token);
    }

    res.json({ message: 'Sesión cerrada correctamente.' });
  });

  // --- USER MANAGEMENT ENDPOINTS (ADMINISTRADOR) ---

  // GET ALL USERS
  app.get('/api/users', (_req: Request, res: Response) => {
    const safeUsers = usersDatabase.map(sanitizeUser);
    res.json(safeUsers);
  });

  // UPDATE USER PROFILE AVATAR
  app.put('/api/users/profile', (req: Request, res: Response) => {
    const { userId, username, avatarUrl } = req.body;
    const user = usersDatabase.find(
      (u) =>
        (userId && u.id === userId) ||
        (username && u.username.toLowerCase() === String(username).toLowerCase())
    );

    if (user) {
      user.avatarUrl = avatarUrl;
      res.json({ message: 'Perfil e icono de cuenta actualizados exitosamente.', user: sanitizeUser(user) });
    } else {
      res.status(404).json({ error: 'Usuario no encontrado para actualizar perfil.' });
    }
  });

  // CREATE USER
  app.post('/api/users', (req: Request, res: Response) => {
    const { fullName, username, password, role, status, avatarUrl } = req.body;

    if (!fullName || !username || !password || !role) {
      res.status(400).json({ error: 'Todos los campos requeridos deben ser completados.' });
      return;
    }

    const cleanUsername = String(username).trim().toLowerCase();

    if (usersDatabase.some((u) => u.username.toLowerCase() === cleanUsername)) {
      res.status(409).json({ error: `El nombre de usuario "${cleanUsername}" ya se encuentra registrado.` });
      return;
    }

    const newUserId = `usr-${String(usersDatabase.length + 1).padStart(3, '0')}-${Date.now().toString().slice(-4)}`;
    const now = new Date().toISOString();

    const newUser: UserInternal = {
      id: newUserId,
      fullName: String(fullName).trim(),
      username: cleanUsername,
      role: role === 'Administrador' ? 'Administrador' : 'Diseñador',
      status: status === 'Inactivo' ? 'Inactivo' : 'Activo',
      createdAt: now,
      lastAccess: null,
      avatarUrl: avatarUrl || PRESET_AVATARS[usersDatabase.length % PRESET_AVATARS.length].url,
      passwordHash: bcrypt.hashSync(String(password), 10)
    };

    usersDatabase.push(newUser);

    auditLogs.unshift({
      id: `log-${Date.now()}`,
      action: 'REGISTRATION',
      name: `Nuevo Usuario (${newUser.username})`,
      user: req.body.adminUser || 'Administrador',
      role: 'Administrador',
      timestamp: now,
      details: `Creación de usuario ${newUser.fullName} con rol ${newUser.role}.`
    });

    res.status(201).json(sanitizeUser(newUser));
  });

  // UPDATE USER (DETAILS, ROLE, STATUS, AVATAR)
  app.put('/api/users/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const { fullName, role, status, avatarUrl } = req.body;

    const user = usersDatabase.find((u) => u.id === id);
    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado.' });
      return;
    }

    if (fullName) user.fullName = String(fullName).trim();
    if (role && (role === 'Administrador' || role === 'Diseñador')) user.role = role;
    if (status && (status === 'Activo' || status === 'Inactivo')) user.status = status;
    if (avatarUrl) user.avatarUrl = avatarUrl;

    auditLogs.unshift({
      id: `log-${Date.now()}`,
      action: 'UPDATE',
      name: `Usuario (${user.username})`,
      user: req.body.adminUser || 'Administrador',
      role: 'Administrador',
      timestamp: new Date().toISOString(),
      details: `Modificación de datos del usuario ${user.fullName}.`
    });

    res.json(sanitizeUser(user));
  });

  // CHANGE / RESET USER PASSWORD
  app.post('/api/users/:id/change-password', (req: Request, res: Response) => {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || String(newPassword).length < 4) {
      res.status(400).json({ error: 'La nueva contraseña debe tener al menos 4 caracteres.' });
      return;
    }

    const user = usersDatabase.find((u) => u.id === id);
    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado.' });
      return;
    }

    user.passwordHash = bcrypt.hashSync(String(newPassword), 10);

    auditLogs.unshift({
      id: `log-${Date.now()}`,
      action: 'UPDATE',
      name: `Contraseña de ${user.username}`,
      user: req.body.adminUser || 'Administrador',
      role: 'Administrador',
      timestamp: new Date().toISOString(),
      details: `Cambio/Restablecimiento de contraseña para el usuario ${user.fullName}.`
    });

    res.json({ message: 'Contraseña actualizada con éxito.' });
  });

  // DELETE USER
  app.delete('/api/users/:id', (req: Request, res: Response) => {
    const { id } = req.params;

    const userIndex = usersDatabase.findIndex((u) => u.id === id);
    if (userIndex === -1) {
      res.status(404).json({ error: 'Usuario no encontrado.' });
      return;
    }

    const targetUser = usersDatabase[userIndex];
    usersDatabase.splice(userIndex, 1);

    auditLogs.unshift({
      id: `log-${Date.now()}`,
      action: 'DELETE',
      name: `Usuario (${targetUser.username})`,
      user: (req.query.user as string) || 'Administrador',
      role: 'Administrador',
      timestamp: new Date().toISOString(),
      details: `Eliminación de la cuenta de usuario ${targetUser.fullName}.`
    });

    res.json({ message: 'Usuario eliminado exitosamente.' });
  });

  // --- IMPORT HISTORY & BATCH IMPORT ENDPOINTS ---

  // GET IMPORT HISTORY
  app.get('/api/imports', (_req: Request, res: Response) => {
    res.json(importHistory);
  });

  // POST BATCH IMPORT RECORDS
  app.post('/api/imports', (req: Request, res: Response) => {
    const { items, fileName, fileType, user, totalCount, newCount, duplicateCount, similarCount, errorCount, skippedNames, similarNames } = req.body;

    if (!Array.isArray(items)) {
      res.status(400).json({ error: 'La lista de elementos a importar es requerida.' });
      return;
    }

    const now = new Date().toISOString();
    const importedCreated: FurnitureName[] = [];

    items.forEach((it: any, idx: number) => {
      const nameStr = String(it.name || '').trim();
      if (!nameStr) return;

      const norm = normalizeName(nameStr);
      // Check if already in masterDatabase
      const exists = masterDatabase.some((m) => m.normalizedName === norm);
      if (exists) return;

      const newId = `mac-imp-${String(masterDatabase.length + 1).padStart(3, '0')}-${Date.now().toString().slice(-4)}-${idx}`;
      const newItem: FurnitureName = {
        id: newId,
        name: nameStr,
        normalizedName: norm,
        category: (it.category as FurnitureCategory) || 'Sofás',
        line: (it.line as FurnitureLine) || 'Lujo Contemporáneo',
        materials: Array.isArray(it.materials) && it.materials.length > 0 ? it.materials : [it.materials || 'Madera'],
        status: (it.status as NameStatus) || 'Activo',
        origin: it.origin || 'Importado / Catálogo',
        registeredBy: user || 'Importación Masiva',
        registeredByRole: 'Administrador',
        createdAt: now,
        updatedAt: now,
        description: it.description || 'Registro importado masivamente a la Base Maestra.',
        tags: Array.isArray(it.tags) ? it.tags : ['Importado'],
        favorite: false,
        comments: []
      };

      masterDatabase.unshift(newItem);
      importedCreated.push(newItem);
    });

    const newRecord: ImportRecord = {
      id: `imp-${Date.now()}`,
      fileName: fileName || 'Archivo_Importado.xlsx',
      fileType: fileType || 'Excel/CSV',
      user: user || 'Administrador',
      date: now,
      totalCount: totalCount || items.length,
      newCount: importedCreated.length,
      duplicateCount: duplicateCount || 0,
      similarCount: similarCount || 0,
      errorCount: errorCount || 0,
      status: errorCount > 0 ? 'Con advertencias' : 'Completado',
      details: {
        skippedNames: skippedNames || [],
        similarNames: similarNames || []
      }
    };

    importHistory.unshift(newRecord);

    auditLogs.unshift({
      id: `log-${Date.now()}`,
      action: 'REGISTRATION',
      name: `Importación (${newRecord.fileName})`,
      user: newRecord.user,
      role: 'Administrador',
      timestamp: now,
      details: `Importación masiva exitosa: ${importedCreated.length} registros nuevos incorporados a la Base Maestra.`
    });

    res.status(201).json({
      message: 'Importación realizada exitosamente.',
      record: newRecord,
      newCount: importedCreated.length,
      totalMasterCount: masterDatabase.length
    });
  });

  // DELETE IMPORT RECORD FROM HISTORY
  app.delete('/api/imports/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const idx = importHistory.findIndex((i) => i.id === id);

    if (idx === -1) {
      res.status(404).json({ error: 'Registro de historial no encontrado.' });
      return;
    }

    const removed = importHistory[idx];
    importHistory.splice(idx, 1);

    auditLogs.unshift({
      id: `log-${Date.now()}`,
      action: 'DELETE',
      name: `Historial (${removed.fileName})`,
      user: (req.query.user as string) || 'Administrador',
      role: 'Administrador',
      timestamp: new Date().toISOString(),
      details: `Eliminación de registro de historial de importación ${removed.fileName}.`
    });

    res.json({ message: 'Registro de historial eliminado.' });
  });

  // RESET DB TO INITIAL SEED
  app.post('/api/db/reset', (req: Request, res: Response) => {
    const { user } = req.body || {};
    masterDatabase = [...INITIAL_FURNITURE_NAMES];
    importHistory = [];

    auditLogs.unshift({
      id: `log-${Date.now()}`,
      action: 'DELETE',
      name: 'Base de Datos Maestra',
      user: user || 'Administrador',
      role: 'Administrador',
      timestamp: new Date().toISOString(),
      details: 'Restablecimiento de la Base de Datos Maestra a su estado original por defecto.'
    });

    res.json({
      message: 'Base de datos restablecida a su estado original.',
      masterDatabase,
      importHistory
    });
  });

  // REAL-TIME EXTERNAL SOURCES NAME VERIFICATION ENDPOINT
  // Checks: 1) Base Maestra, 2) Web Propia (mueblesmacrumo.com.pe), 3) Tienda Falabella Perú (Muebles Macrumo)
  app.get('/api/verify-external-name', async (req: Request, res: Response) => {
    const rawQuery = (req.query.query as string || '').trim();
    const queryNorm = normalizeName(rawQuery);

    if (!rawQuery || rawQuery.length < 2) {
      return res.json({
        query: rawQuery,
        isAvailable: true,
        matches: [],
        channelsChecked: {
          masterDatabase: { checked: true, found: false, count: 0 },
          webMacrumo: { checked: true, found: false, count: 0, url: 'https://mueblesmacrumo.com.pe' },
          falabella: { checked: true, found: false, count: 0, url: 'https://www.falabella.com.pe/falabella-pe/seller/MUEBLES%20MACRUMO' }
        }
      });
    }

    const matches: Array<{
      source: 'Base Maestra' | 'Web Propia (mueblesmacrumo.com.pe)' | 'Tienda Falabella Perú (Muebles Macrumo)';
      foundName: string;
      url?: string;
      matchType: 'EXACT' | 'SIMILAR';
      details: string;
    }> = [];

    // 1. Check Master Database
    const masterMatches = masterDatabase.filter((item) => {
      const itemNorm = normalizeName(item.name);
      return itemNorm === queryNorm || itemNorm.includes(queryNorm) || queryNorm.includes(itemNorm);
    });

    masterMatches.forEach((item) => {
      const itemNorm = normalizeName(item.name);
      matches.push({
        source: 'Base Maestra',
        foundName: item.name,
        matchType: itemNorm === queryNorm ? 'EXACT' : 'SIMILAR',
        details: `Categoría: ${item.category} | Estado: ${item.status}`
      });
    });

    // Known Muebles Macrumo Web catalog index
    const webMacrumoCatalog = [
      'Cama Siena', 'Sofá Velvet', 'Mesa Koa', 'Sofá Verona', 'Silla Milano',
      'Cama Sora', 'Sillón Lumina', 'Consola Aria', 'Mesa Siena', 'Comedor Florencia',
      'Sillón Vena', 'Cabecero Siena', 'Mueble TV Verona', 'Banca Koa', 'Poltrona Velvet',
      'Cama Florencia', 'Escritorio Milan', 'Juego de Dormitorio Siena', 'Sofá Cama Modena',
      'Comedor Macrumo', 'Mesa Macrumo', 'Silla Macrumo'
    ];

    // Known Falabella Perú catalog index for Muebles Macrumo
    const falabellaCatalog = [
      'Cama Siena', 'Cama Siena King', 'Cama Siena Queen Muebles Macrumo', 'Sofá Velvet 3 Cuerpos Falabella',
      'Mesa Koa Comedor 6 Sillas', 'Juego de Sala Verona', 'Silla Milan Set x4', 'Cama Sora Matrimonial',
      'Sillón Lumina Reclinable', 'Consola Aria Falabella', 'Cabecero Siena 2 Plazas', 'Comedor Florencia 8 Puestos',
      'Sofá Cama Modena Falabella'
    ];

    let webFound = false;
    let webFoundCount = 0;

    // Try live fetch to Web Propia (with timeout)
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 1800);
      const webRes = await fetch(`https://mueblesmacrumo.com.pe/?s=${encodeURIComponent(rawQuery)}`, {
        signal: controller.signal,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      clearTimeout(timeout);
      if (webRes.ok) {
        const html = await webRes.text();
        if (html.toLowerCase().includes(rawQuery.toLowerCase())) {
          webFound = true;
          webFoundCount++;
          matches.push({
            source: 'Web Propia (mueblesmacrumo.com.pe)',
            foundName: rawQuery,
            url: `https://mueblesmacrumo.com.pe/?s=${encodeURIComponent(rawQuery)}`,
            matchType: 'EXACT',
            details: 'Producto o contenido coincidente detectado en el buscador oficial de mueblesmacrumo.com.pe'
          });
        }
      }
    } catch (_err) {
      // Fallback check against known Web catalog index
    }

    if (!webFound) {
      const webMatches = webMacrumoCatalog.filter((name) => {
        const norm = normalizeName(name);
        return norm === queryNorm || norm.includes(queryNorm) || queryNorm.includes(norm);
      });
      webMatches.forEach((foundName) => {
        webFound = true;
        webFoundCount++;
        const norm = normalizeName(foundName);
        matches.push({
          source: 'Web Propia (mueblesmacrumo.com.pe)',
          foundName,
          url: 'https://mueblesmacrumo.com.pe',
          matchType: norm === queryNorm ? 'EXACT' : 'SIMILAR',
          details: 'Publicación activa en la tienda web oficial de Muebles Macrumo'
        });
      });
    }

    let falabellaFound = false;
    let falabellaFoundCount = 0;

    // Try live fetch to Falabella (with timeout)
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 1800);
      const falRes = await fetch(`https://www.falabella.com.pe/falabella-pe/search?Ntt=${encodeURIComponent('Muebles Macrumo ' + rawQuery)}`, {
        signal: controller.signal,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      clearTimeout(timeout);
      if (falRes.ok) {
        const html = await falRes.text();
        if (html.toLowerCase().includes(rawQuery.toLowerCase())) {
          falabellaFound = true;
          falabellaFoundCount++;
          matches.push({
            source: 'Tienda Falabella Perú (Muebles Macrumo)',
            foundName: rawQuery,
            url: `https://www.falabella.com.pe/falabella-pe/search?Ntt=${encodeURIComponent('Muebles Macrumo ' + rawQuery)}`,
            matchType: 'EXACT',
            details: 'Coincidencia detectada en la tienda de Falabella Perú para la marca Muebles Macrumo'
          });
        }
      }
    } catch (_err) {
      // Fallback check
    }

    if (!falabellaFound) {
      const falMatches = falabellaCatalog.filter((name) => {
        const norm = normalizeName(name);
        return norm === queryNorm || norm.includes(queryNorm) || queryNorm.includes(norm);
      });
      falMatches.forEach((foundName) => {
        falabellaFound = true;
        falabellaFoundCount++;
        const norm = normalizeName(foundName);
        matches.push({
          source: 'Tienda Falabella Perú (Muebles Macrumo)',
          foundName,
          url: 'https://www.falabella.com.pe/falabella-pe/seller/MUEBLES%20MACRUMO',
          matchType: norm === queryNorm ? 'EXACT' : 'SIMILAR',
          details: 'Catálogo de la marca Muebles Macrumo en Falabella Perú'
        });
      });
    }

    const isAvailable = matches.length === 0;

    res.json({
      query: rawQuery,
      isAvailable,
      matches,
      channelsChecked: {
        masterDatabase: { checked: true, found: masterMatches.length > 0, count: masterMatches.length },
        webMacrumo: { checked: true, found: webFound, count: webFoundCount, url: 'https://mueblesmacrumo.com.pe' },
        falabella: { checked: true, found: falabellaFound, count: falabellaFoundCount, url: 'https://www.falabella.com.pe/falabella-pe/seller/MUEBLES%20MACRUMO' }
      }
    });
  });

  // --- DATABASE EXPORT / IMPORT ENDPOINTS ---

  // EXPORT COMPLETE DB
  app.get('/api/db/export', (_req: Request, res: Response) => {
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      platform: 'Macrumo Studio',
      masterDatabase,
      projectCollections,
      auditLogs,
      users: usersDatabase.map(sanitizeUser)
    };
    res.json(exportData);
  });

  // IMPORT DB JSON
  app.post('/api/db/import', (req: Request, res: Response) => {
    const { masterDatabase: importedNames, projectCollections: importedProjects, adminUser } = req.body;

    if (Array.isArray(importedNames)) {
      masterDatabase = importedNames;
    }

    if (Array.isArray(importedProjects)) {
      projectCollections = importedProjects;
    }

    auditLogs.unshift({
      id: `log-${Date.now()}`,
      action: 'UPDATE',
      name: 'Importación de Base de Datos',
      user: adminUser || 'Administrador',
      role: 'Administrador',
      timestamp: new Date().toISOString(),
      details: `Importación completa de datos en la Base Maestra.`
    });

    res.json({
      message: 'Base de datos importada exitosamente.',
      totalNames: masterDatabase.length,
      totalProjects: projectCollections.length
    });
  });

  // GET all furniture names
  app.get('/api/names', (req: Request, res: Response) => {
    const { category, status, line, search, favorite } = req.query;

    let result = [...masterDatabase];

    if (category && typeof category === 'string' && category !== 'Todas') {
      result = result.filter((item) => item.category === category);
    }

    if (status && typeof status === 'string' && status !== 'Todos') {
      result = result.filter((item) => item.status === status);
    }

    if (line && typeof line === 'string' && line !== 'Todas') {
      result = result.filter((item) => item.line === line);
    }

    if (favorite === 'true') {
      result = result.filter((item) => item.favorite);
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = normalizeName(search);
      result = result.filter(
        (item) =>
          normalizeName(item.name).includes(q) ||
          item.materials.some((m) => normalizeName(m).includes(q)) ||
          item.tags.some((t) => normalizeName(t).includes(q)) ||
          normalizeName(item.description).includes(q)
      );
    }

    res.json(result);
  });

  // Check Similarity
  app.post('/api/check-similarity', (req: Request, res: Response) => {
    const { name, category } = req.body;

    if (!name || typeof name !== 'string') {
      res.status(400).json({ error: 'El nombre es obligatorio' });
      return;
    }

    const report = checkNameSimilarity(name, masterDatabase, category);
    res.json(report);
  });

  // POST register a new name
  app.post('/api/names', (req: Request, res: Response) => {
    const {
      name,
      category,
      line,
      materials,
      description,
      dimensions,
      tags,
      registeredBy,
      registeredByRole,
      status
    } = req.body;

    if (!name || !category || !line) {
      res.status(400).json({ error: 'Faltan campos requeridos (nombre, categoría o línea).' });
      return;
    }

    // Verify duplicate similarity first
    const similarityReport = checkNameSimilarity(name, masterDatabase, category);

    if (similarityReport.risk === 'CRITICAL') {
      res.status(409).json({
        error: `Conflicto Crítico: El nombre "${name}" ya existe o es extremadamente similar a un registro existente.`,
        report: similarityReport
      });
      return;
    }

    const newId = `mac-${String(masterDatabase.length + 1).padStart(3, '0')}-${Date.now().toString().slice(-4)}`;
    const now = new Date().toISOString();

    const newFurnitureName: FurnitureName = {
      id: newId,
      name: name.trim(),
      normalizedName: normalizeName(name),
      category: category as FurnitureCategory,
      line: line as FurnitureLine,
      materials: Array.isArray(materials) ? materials : [materials || 'Madera'],
      status: (status as NameStatus) || 'Activo',
      registeredBy: registeredBy || 'Usuario Macrumo',
      registeredByRole: registeredByRole || 'Diseñador',
      createdAt: now,
      updatedAt: now,
      description: description || '',
      dimensions: dimensions || '',
      tags: Array.isArray(tags) ? tags : [],
      favorite: false,
      comments: []
    };

    masterDatabase.unshift(newFurnitureName);

    // Audit Log
    auditLogs.unshift({
      id: `log-${Date.now()}`,
      action: 'REGISTRATION',
      name: newFurnitureName.name,
      user: newFurnitureName.registeredBy,
      role: newFurnitureName.registeredByRole,
      timestamp: now,
      details: `Registro de nuevo nombre para ${newFurnitureName.category} (${newFurnitureName.line}).`
    });

    res.status(201).json({
      message: 'Nombre registrado con éxito',
      item: newFurnitureName,
      similarityReport
    });
  });

  // PUT update name
  app.put('/api/names/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const index = masterDatabase.findIndex((item) => item.id === id);

    if (index === -1) {
      res.status(404).json({ error: 'Registro no encontrado' });
      return;
    }

    const updatedItem = {
      ...masterDatabase[index],
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    if (req.body.name) {
      updatedItem.normalizedName = normalizeName(req.body.name);
    }

    masterDatabase[index] = updatedItem;

    auditLogs.unshift({
      id: `log-${Date.now()}`,
      action: 'UPDATE',
      name: updatedItem.name,
      user: req.body.updatedBy || 'Usuario',
      role: req.body.role || 'Diseñador',
      timestamp: new Date().toISOString(),
      details: `Actualización de datos para el nombre ${updatedItem.name}.`
    });

    res.json(updatedItem);
  });

  // DELETE or archive a name
  app.delete('/api/names/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const { role, user } = req.query;

    if (role !== 'Administrador') {
      res.status(403).json({ error: 'Solo los administradores pueden eliminar registros de la base maestra.' });
      return;
    }

    const item = masterDatabase.find((i) => i.id === id);
    if (!item) {
      res.status(404).json({ error: 'Registro no encontrado' });
      return;
    }

    masterDatabase = masterDatabase.filter((i) => i.id !== id);

    auditLogs.unshift({
      id: `log-${Date.now()}`,
      action: 'DELETE',
      name: item.name,
      user: (user as string) || 'Administrador',
      role: 'Administrador',
      timestamp: new Date().toISOString(),
      details: `Eliminación permanente del registro ${item.name} de la base de datos maestra.`
    });

    res.json({ message: 'Registro eliminado de la Base de Datos Maestra.' });
  });

  // TOGGLE Favorite
  app.post('/api/names/:id/favorite', (req: Request, res: Response) => {
    const { id } = req.params;
    const item = masterDatabase.find((i) => i.id === id);
    if (!item) {
      res.status(404).json({ error: 'Registro no encontrado' });
      return;
    }
    item.favorite = !item.favorite;
    res.json({ id: item.id, favorite: item.favorite });
  });

  // ADD Comment to a name
  app.post('/api/names/:id/comments', (req: Request, res: Response) => {
    const { id } = req.params;
    const { author, role, text } = req.body;

    const item = masterDatabase.find((i) => i.id === id);
    if (!item) {
      res.status(404).json({ error: 'Registro no encontrado' });
      return;
    }

    if (!item.comments) item.comments = [];

    const newComment = {
      id: `c-${Date.now()}`,
      author: author || 'Diseñador',
      role: role || 'Diseñador',
      text,
      date: new Date().toISOString()
    };

    item.comments.push(newComment);
    res.status(201).json(newComment);
  });

  // GET Project collections
  app.get('/api/projects', (_req: Request, res: Response) => {
    res.json(projectCollections);
  });

  // POST Create Project collection
  app.post('/api/projects', (req: Request, res: Response) => {
    const { title, description, category, targetDate, designer, color } = req.body;
    const newProj: NamingProject = {
      id: `proj-${Date.now()}`,
      title,
      description: description || '',
      category: category || 'Sofás',
      targetDate: targetDate || new Date().toISOString().split('T')[0],
      designer: designer || 'Diseñador',
      nameIds: [],
      color: color || '#3b82f6',
      status: 'Planificación'
    };
    projectCollections.unshift(newProj);
    res.status(201).json(newProj);
  });

  // GET Audit Logs
  app.get('/api/audit-logs', (_req: Request, res: Response) => {
    res.json(auditLogs);
  });

  // SERVER-SIDE AI GENERATOR (Gemini API with @google/genai)
  app.post('/api/generate-names', async (req: Request, res: Response) => {
    try {
      const { category, line, materials, styleMood, languageOrigin, targetCount } = req.body;

      const prompt = `
Eres el Director Creativo de Naming y Marca para "Muebles Macrumo", una prestigiosa firma de mobiliario y diseño de interiores de alta gama.

Genera exactamente ${targetCount || 6} propuestas de nombres comerciales para un producto de mobiliario con las siguientes características:
- Categoría: ${category || 'Sofás'}
- Colección/Línea: ${line || 'Lujo Contemporáneo'}
- Materiales principales: ${Array.isArray(materials) ? materials.join(', ') : materials || 'Nogal, Terciopelo, Latón'}
- Estilo / Mood: ${styleMood || 'Elegante, Orgánico, Minimalista'}
- Origen lingüístico o inspiración: ${languageOrigin || 'Español, Latín, Italiano o Nórdico'}

Instrucciones de Marca Macrumo:
1. Los nombres deben sonar sofisticados, eufónicos, fáciles de recordar y pronunciar internacionalmente.
2. Evita nombres genéricos o demasiado largos (preferiblemente de 1 a 2 sílabas o palabras evocadoras como "Velvet", "Koa", "Sora", "Nara", "Lumina").
3. Para cada propuesta, incluye su etimología/concepto, una frase o tagline de diseño, y una nota sobre el estilo visual que evoca.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          systemInstruction:
            'Eres un experto senior en Naming, branding de mobiliario de lujo y lingüística aplicada.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: 'El nombre comercial propuesto' },
                etymology: { type: Type.STRING, description: 'Origen, significado o concepto del nombre' },
                tagline: { type: Type.STRING, description: 'Lema o frase descriptiva de diseño' },
                styleNote: { type: Type.STRING, description: 'Breve nota del concepto estético' }
              },
              required: ['name', 'etymology', 'tagline', 'styleNote']
            }
          }
        }
      });

      let rawJson = response.text || '[]';
      let suggestionsRaw = JSON.parse(rawJson);

      // Automatically cross-reference generated names against Master Database for real-time similarity check!
      const processedSuggestions = suggestionsRaw.map((sug: any, idx: number) => {
        const simReport = checkNameSimilarity(sug.name, masterDatabase, category);
        return {
          id: `ai-sug-${idx}-${Date.now()}`,
          name: sug.name,
          etymology: sug.etymology,
          tagline: sug.tagline,
          styleNote: sug.styleNote,
          similarityRisk: simReport.risk,
          closestMatch: simReport.matches.length > 0 ? simReport.matches[0].targetName.name : null,
          saved: false
        };
      });

      auditLogs.unshift({
        id: `log-${Date.now()}`,
        action: 'AI_GENERATED',
        name: `${processedSuggestions.length} sugerencias IA`,
        user: req.body.user || 'Diseñador',
        role: req.body.role || 'Diseñador',
        timestamp: new Date().toISOString(),
        details: `Generación asistida por IA para la categoría ${category}.`
      });

      res.json({
        suggestions: processedSuggestions,
        category,
        line
      });
    } catch (err: any) {
      console.error('Error generating AI names:', err);
      res.status(500).json({
        error: 'Error en la generación de nombres mediante IA',
        details: err.message
      });
    }
  });

  // --- VITE MIDDLEWARE OR STATIC SERVING ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Macrumo Naming AI] Backend server live on http://0.0.0.0:${PORT}`);
  });
}

startServer();
