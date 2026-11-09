const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth, inMemoryUsers } = require('../middleware/auth');

// In-memory store fallback
const memUsers = new Map(); // id -> {name, email, passwordHash, createdAt}

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// Demo user seed
const DEMO_EMAIL = 'demo@resumeiq.com';
const DEMO_PASS = 'demo123';

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields are required' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });

    const passwordHash = await bcrypt.hash(password, 12);

    try {
      // Try MongoDB
      const exists = await User.findOne({ email: email.toLowerCase() });
      if (exists) return res.status(400).json({ message: 'An account with this email already exists' });
      const user = await User.create({ name, email: email.toLowerCase(), passwordHash });
      const token = signToken(user._id);
      return res.status(201).json({ token, user: user.toPublic() });
    } catch (dbErr) {
      // Fallback: in-memory
      const existingId = [...memUsers.entries()].find(([, u]) => u.email === email.toLowerCase())?.[0];
      if (existingId) return res.status(400).json({ message: 'An account with this email already exists' });
      const id = Date.now().toString();
      const userData = { name, email: email.toLowerCase(), passwordHash, createdAt: new Date() };
      memUsers.set(id, userData);
      inMemoryUsers.set(id, userData);
      const token = signToken(id);
      return res.status(201).json({ token, user: { _id: id, name, email: email.toLowerCase(), createdAt: userData.createdAt } });
    }
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    // Demo account always works
    if (email === DEMO_EMAIL && password === DEMO_PASS) {
      let demoId = [...memUsers.entries()].find(([, u]) => u.email === DEMO_EMAIL)?.[0];
      if (!demoId) {
        const hash = await bcrypt.hash(DEMO_PASS, 12);
        demoId = 'demo-user-001';
        const userData = { name: 'Demo User', email: DEMO_EMAIL, passwordHash: hash, createdAt: new Date() };
        memUsers.set(demoId, userData);
        inMemoryUsers.set(demoId, userData);
      }
      const token = signToken(demoId);
      return res.json({ token, user: { _id: demoId, name: 'Demo User', email: DEMO_EMAIL } });
    }

    try {
      // Try MongoDB
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user || !(await user.matchPassword(password))) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      const token = signToken(user._id);
      return res.json({ token, user: user.toPublic() });
    } catch (dbErr) {
      // Fallback: in-memory
      const entry = [...memUsers.entries()].find(([, u]) => u.email === email.toLowerCase());
      if (!entry) return res.status(401).json({ message: 'Invalid email or password' });
      const [id, userData] = entry;
      const match = await bcrypt.compare(password, userData.passwordHash);
      if (!match) return res.status(401).json({ message: 'Invalid email or password' });
      const token = signToken(id);
      return res.json({ token, user: { _id: id, name: userData.name, email: userData.email, createdAt: userData.createdAt } });
    }
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
});

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  res.json({ user: req.user.toPublic ? req.user.toPublic() : req.user });
});

// PUT /api/auth/profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, email } = req.body;
    try {
      const user = await User.findByIdAndUpdate(req.user._id, { name, email }, { new: true });
      return res.json({ user: user.toPublic() });
    } catch {
      const userData = memUsers.get(String(req.user._id));
      if (userData) {
        userData.name = name || userData.name;
        userData.email = email || userData.email;
        memUsers.set(String(req.user._id), userData);
        inMemoryUsers.set(String(req.user._id), userData);
      }
      return res.json({ user: { _id: req.user._id, name: name || req.user.name, email: email || req.user.email } });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/auth/password
router.put('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Both passwords are required' });
    if (newPassword.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
    try {
      const user = await User.findById(req.user._id);
      if (!(await user.matchPassword(currentPassword))) return res.status(400).json({ message: 'Current password is incorrect' });
      user.passwordHash = await bcrypt.hash(newPassword, 12);
      await user.save();
      return res.json({ message: 'Password updated successfully' });
    } catch {
      const userData = memUsers.get(String(req.user._id));
      if (!userData) return res.status(404).json({ message: 'User not found' });
      const match = await bcrypt.compare(currentPassword, userData.passwordHash);
      if (!match) return res.status(400).json({ message: 'Current password is incorrect' });
      userData.passwordHash = await bcrypt.hash(newPassword, 12);
      return res.json({ message: 'Password updated successfully' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/auth/account
router.delete('/account', auth, async (req, res) => {
  try {
    try { await User.findByIdAndDelete(req.user._id); } catch {}
    memUsers.delete(String(req.user._id));
    inMemoryUsers.delete(String(req.user._id));
    res.json({ message: 'Account deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
