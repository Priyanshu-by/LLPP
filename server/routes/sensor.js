const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// In-memory store for sensor readings (also tries MongoDB)
let SensorData;
try { SensorData = require('../models/SensorData'); } catch (e) { }

// Mock live sensor state (simulates ESP32 stream)
let currentSensorState = {
    elementId: 'SLAB-001',
    temperature: 27.5,
    humidity: 68,
    resistance: 920,
    timestamp: new Date()
};

// Simulate sensor drift over time
function updateSensorState() {
    currentSensorState.temperature = parseFloat((24 + Math.random() * 10).toFixed(1));
    currentSensorState.humidity = parseFloat((55 + Math.random() * 30).toFixed(1));
    currentSensorState.resistance = parseFloat((600 + Math.random() * 800).toFixed(0));
    currentSensorState.timestamp = new Date();
}

setInterval(updateSensorState, 3000); // update every 3 seconds

// GET /api/sensor/live - stream current live sensor reading
router.get('/live', (req, res) => {
    res.json({ success: true, data: currentSensorState });
});

// GET /api/sensor/live/:elementId
router.get('/live/:elementId', (req, res) => {
    const data = { ...currentSensorState, elementId: req.params.elementId };
    res.json({ success: true, data });
});

// POST /api/sensor - store a sensor reading
router.post('/', async (req, res) => {
    try {
        const reading = {
            elementId: req.body.elementId || uuidv4(),
            temperature: req.body.temperature,
            humidity: req.body.humidity,
            resistance: req.body.resistance,
            estimatedStrength: req.body.estimatedStrength || null
        };

        if (SensorData && require('mongoose').connection.readyState === 1) {
            const doc = await new SensorData(reading).save();
            return res.status(201).json({ success: true, data: doc });
        }
        res.status(201).json({ success: true, data: { ...reading, _id: uuidv4() } });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/sensor/history/:elementId - last 20 readings
router.get('/history/:elementId', async (req, res) => {
    try {
        if (SensorData && require('mongoose').connection.readyState === 1) {
            const data = await SensorData.find({ elementId: req.params.elementId })
                .sort({ timestamp: -1 }).limit(20);
            return res.json({ success: true, data });
        }
        // Mock history
        const history = Array.from({ length: 10 }, (_, i) => ({
            elementId: req.params.elementId,
            temperature: parseFloat((25 + (i * 0.3)).toFixed(1)),
            humidity: parseFloat((65 + (i * 0.5)).toFixed(1)),
            resistance: parseFloat((950 - i * 20).toFixed(0)),
            timestamp: new Date(Date.now() - i * 3600000)
        }));
        res.json({ success: true, data: history });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
