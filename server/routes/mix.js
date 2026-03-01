const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

let MixDesign;
try { MixDesign = require('../models/MixDesign'); } catch (e) { }

// POST /api/mix - store a mix design
router.post('/', async (req, res) => {
    try {
        const { cementType, cement, sand, aggregate, water, elementId } = req.body;
        const wcRatio = parseFloat((water / cement).toFixed(3));
        const mixData = { cementType, cement, sand, aggregate, water, wcRatio, elementId };

        if (MixDesign && require('mongoose').connection.readyState === 1) {
            const doc = await new MixDesign(mixData).save();
            return res.status(201).json({ success: true, data: doc });
        }
        res.status(201).json({ success: true, data: { ...mixData, _id: uuidv4() } });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/mix - get all mix designs
router.get('/', async (req, res) => {
    try {
        if (MixDesign && require('mongoose').connection.readyState === 1) {
            const docs = await MixDesign.find().sort({ createdAt: -1 }).limit(50);
            return res.json({ success: true, data: docs });
        }
        res.json({ success: true, data: [] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
