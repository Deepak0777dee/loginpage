'use strict';

// ── Storage Keys ──────────────────────────────────────────
const USERS_KEY   = 'stackly_users';
const SESSION_KEY = 'stackly_session';

// ── Demo seed users ───────────────────────────────────────
function initUsers() {
  if (!localStorage.getItem(USERS_KEY)) {
    const demo = [
      { id: 1, name: 'Admin User',      email: 'admin@stackly.com',      password: 'Admin@123',   role: 'admin',      avatar: 'AU', createdAt: new Date().toISOString() },
      { id: 2, name: 'Jane Consultant', email: 'consultant@stackly.com', password: 'Consult@123', role: 'consultant', avatar: 'JC', createdAt: new Date().toISOString() }
    ];
    localStorage.setItem(USERS_KEY, JSON.stringify(demo));
  }
}

// ── Helpers ───────────────────────────────────────────────
function getUsers()   { try { return JSON.parse(localStorage.getItem(USERS_KEY)  || '[]');   } catch { return []; }  }
function getSession() { try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch { return null; } }
function setSession(user) { localStorage.setItem(SESSION_KEY, JSON.stringify(user)); }
function clearSession()   { localStorage.removeItem(SESSION_KEY); }

function validateEmail(e)    { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim()); }
function validatePassword(p) { return p.length >= 8; }

function getDashboardUrl(role) {
  return role === 'admin' ? 'dashboard-admin.html' : 'dashboard-consultant.html';
}

// ── Auth functions ────────────────────────────────────────
function login(email, password, role) {
  if (!email || !password || !role) return { success: false, message: 'All fields are required.' };

  // No backend — accept ANY credentials and log in immediately.
  // Derive a display name from the email prefix.
  const name     = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const user     = { id: Date.now(), name, email: email.toLowerCase(), password, role, avatar: initials, createdAt: new Date().toISOString() };

  // Upsert: keep all other users, overwrite this email entry
  const others = getUsers().filter(u => u.email.toLowerCase() !== email.toLowerCase());
  localStorage.setItem(USERS_KEY, JSON.stringify([...others, user]));

  setSession(user);
  return { success: true, user };
}

function signup(name, email, password, confirm, role) {
  if (!name || !email || !password || !confirm || !role) return { success: false, message: 'All fields are required.' };
  if (!validateEmail(email))       return { success: false, message: 'Enter a valid email address.' };
  if (!validatePassword(password)) return { success: false, message: 'Password must be at least 8 characters.' };
  if (password !== confirm)        return { success: false, message: 'Passwords do not match.' };

  const initials = name.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const newUser  = { id: Date.now(), name: name.trim(), email: email.trim().toLowerCase(), password, role, avatar: initials, createdAt: new Date().toISOString() };
  const others   = getUsers().filter(u => u.email.toLowerCase() !== email.trim().toLowerCase());
  localStorage.setItem(USERS_KEY, JSON.stringify([...others, newUser]));
  setSession(newUser);
  return { success: true, user: newUser };
}

function logout() { clearSession(); window.location.href = 'index.html'; }

function requireAuth() {
  const s = getSession();
  if (!s) { window.location.href = 'index.html'; return null; }
  return s;
}

function redirectIfLoggedIn() {
  const s = getSession();
  if (s) window.location.href = getDashboardUrl(s.role);
}

// ── Boot ──────────────────────────────────────────────────
initUsers();
