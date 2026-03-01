const express = require('express');
const router = express.Router();

let settings = {
    targetDeMouldStrength: 20,       // MPa
    defaultCementType: 'OPC53',
    sensorCalibrationOffset: { temperature: 0, humidity: 0, resistance: 0 },
    traditionalCuringHours: { Slab: 32, Beam: 30, Column: 36 },
    notifications: { emailAlerts: true, deMouldReady: true },
    darkMode: true
};

router.get('/', (req, res) => res.json({ success: true, data: settings }));

router.patch('/', (req, res) => {
    settings = { ...settings, ...req.body };
    res.json({ success: true, data: settings });
});

module.exports = router;
