const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const { users, saveUsers } = require('../data/users');

router.post('/register', async (req, res) => {
  const { username, password, role } = req.body;

  try {
    const userExists = users.find((user) => user.username === username);
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    if (role) {
      if (role !== 'user' && role !== 'admin') {
        return res.status(400).json({ message: 'Invalid role' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: users.length + 1,
      username,
      password: hashedPassword,
      role: role || 'user',
      token: null,
    };

    const payload = { userId: newUser.id, role: newUser.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    newUser.token = token;
    users.push(newUser);
    saveUsers();

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = users.find((user) => user.username === username);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const payload = { userId: user.id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    user.token = token;
    saveUsers();
    
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/admin', auth(['admin']), (req, res) => {
  res.json({ message: 'Welcome to admin panel' });
});

router.get('/protected', auth(), (req, res) => {
  res.json({ message: 'This is a protected route' });
});

module.exports = router;