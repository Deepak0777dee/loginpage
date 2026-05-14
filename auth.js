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
function getUsers()  { try { return JSON.parse(localStorage.getItem(USERS_KEY)  || '[]');   } catch { return []; }  }
function getSession(){ try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch { return null; } }
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

  // Check if user already exists with matching password + role
  const users = getUsers();
  let user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password && u.role === role);

  // No backend — accept any valid credentials; auto-create guest session
  if (!user) {
    // If email exists but wrong password/role, reject
    const existingEmail = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingEmail && existingEmail.password !== password) {
      return { success: false, message: 'Incorrect password for this account.' };
    }
    // Otherwise auto-register them with this role
    const name = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    user = { id: Date.now(), name, email: email.toLowerCase(), password, role, avatar: initials, createdAt: new Date().toISOString() };
    users.push(user);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  setSession(user);
  return { success: true, user };
}

function signup(name, email, password, confirm, role) {
  if (!name || !email || !password || !confirm || !role) return { success: false, message: 'All fields are required.' };
  if (!validateEmail(email))       return { success: false, message: 'Enter a valid email address.' };
  if (!validatePassword(password)) return { success: false, message: 'Password must be at least 8 characters.' };
  if (password !== confirm)        return { success: false, message: 'Passwords do not match.' };

  const users = getUsers();
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase()))
    return { success: false, message: 'An account with this email already exists.' };

  const initials = name.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const newUser  = { id: Date.now(), name: name.trim(), email: email.trim().toLowerCase(), password, role, avatar: initials, createdAt: new Date().toISOString() };
  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
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
