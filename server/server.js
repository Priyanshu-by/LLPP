const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/constructai_db';

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB (graceful fallback if no MongoDB running)
mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch((err) => {
        console.warn('⚠️  MongoDB not available – running in in-memory mode:', err.message);
    });

// Routes
app.use('/api/sensor', require('./routes/sensor'));
app.use('/api/mix', require('./routes/mix'));
app.use('/api/predict', require('./routes/predict'));
app.use('/api/elements', require('./routes/elements'));
app.use('/api/records', require('./routes/records'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/auth', require('./routes/auth'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'Construct AI Backend Running', version: '1.0.0', time: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`🚀 Construct AI Server running on http://localhost:${PORT}`);
});
