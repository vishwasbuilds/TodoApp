// Handles account registration and login, returning a signed session token.
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

function createToken(user) {
  return jwt.sign({userId: user._id.toString()}, process.env.JWT_SECRET, {expiresIn: '7d'});
}

// Limits API responses to account details that are safe to expose publicly.
function publicUser(user) {
  return {id: user._id.toString(), name: user.name, email: user.email};
}

router.post('/register', async (req, res) => {
  try {
    // Normalize account identifiers before validation and database lookup.
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    if (!name || !email || password.length < 6)
      return res.status(400).json({message: 'Name, valid email, and password (at least 6 characters) are required.'});
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(400).json({message: 'Enter a valid email address.'});
    if (await User.findOne({email}))
      return res.status(409).json({message: 'An account with this email already exists.'});
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({name, email, passwordHash});
    return res.status(201).json({token: createToken(user), user: publicUser(user)});
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({message: 'Email is already registered.'});
    console.error(err); return res.status(500).json({message: 'Could not create account.'});
  }
});

router.post('/login', async (req, res) => {
  try {
    // Use the same email normalization as registration before checking credentials.
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const user = await User.findOne({email});
    if (!user || !(await bcrypt.compare(password, user.passwordHash)))
      return res.status(401).json({message: 'Invalid email or password.'});
    return res.json({token: createToken(user), user: publicUser(user)});
  } catch (err) {
    console.error(err); return res.status(500).json({message: 'Could not log in.'});
  }
});
module.exports = router;
