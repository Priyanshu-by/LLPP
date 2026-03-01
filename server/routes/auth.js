const express = require('express');
const router = express.Router();

// Mock auth (JWT-ready structure, no real auth required for this demo)
const users = [
    { id: '1', name: 'Rajan Kumar', email: 'manager@apie.in', role: 'Plant Manager', password: 'demo123' },
    { id: '2', name: 'Dr. Priya S.', email: 'quality@apie.in', role: 'Quality Engineer', password: 'demo123' },
];

router.post('/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) return res.status(401).json({ success: false, error: 'Invalid credentials' });
    const { password: _, ...safeUser } = user;
    res.json({ success: true, data: { user: safeUser, token: `mock_jwt_${user.id}_${Date.now()}` } });
});

router.post('/register', (req, res) => {
    const { name, email, password, role } = req.body;
    if (users.find(u => u.email === email)) {
        return res.status(409).json({ success: false, error: 'Email already registered' });
    }
    const newUser = { id: String(users.length + 1), name, email, role: role || 'Plant Manager', password };
    users.push(newUser);
    const { password: _, ...safeUser } = newUser;
    res.status(201).json({ success: true, data: { user: safeUser, token: `mock_jwt_${newUser.id}_${Date.now()}` } });
});

router.get('/me', (req, res) => {
    res.json({ success: true, data: { id: '1', name: 'Rajan Kumar', email: 'manager@apie.in', role: 'Plant Manager' } });
});

module.exports = router;
