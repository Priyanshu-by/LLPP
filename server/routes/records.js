const express = require('express');
const router = express.Router();

let CyclePrediction;
try { CyclePrediction = require('../models/CyclePrediction'); } catch (e) { }

// GET /api/records - combined view of predictions with status
router.get('/', async (req, res) => {
    try {
        if (CyclePrediction && require('mongoose').connection.readyState === 1) {
            const docs = await CyclePrediction.find().sort({ createdAt: -1 }).limit(50);
            return res.json({ success: true, data: docs });
        }
        // Return mock records
        const mockRecords = [
            { _id: 'R001', elementId: 'S-12', elementType: 'Slab', cementType: 'OPC53', settingTime: 28, deMouldTime: 22, hoursSaved: 8, status: 'Curing', confidenceScore: 91, createdAt: new Date(Date.now() - 18 * 3600000) },
            { _id: 'R002', elementId: 'B-07', elementType: 'Beam', cementType: 'OPC43', settingTime: 30, deMouldTime: 24, hoursSaved: 6, status: 'Ready to De-mould', confidenceScore: 87, createdAt: new Date(Date.now() - 30 * 3600000) },
            { _id: 'R003', elementId: 'C-03', elementType: 'Column', cementType: 'PPC', settingTime: 34, deMouldTime: 28, hoursSaved: 8, status: 'Completed', confidenceScore: 83, createdAt: new Date(Date.now() - 72 * 3600000) },
            { _id: 'R004', elementId: 'S-11', elementType: 'Slab', cementType: 'OPC53', settingTime: 27, deMouldTime: 21, hoursSaved: 9, status: 'Completed', confidenceScore: 93, createdAt: new Date(Date.now() - 100 * 3600000) },
        ];
        res.json({ success: true, data: mockRecords });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
