const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { runPrediction } = require('../controllers/predictionController');

let CyclePrediction;
try { CyclePrediction = require('../models/CyclePrediction'); } catch (e) { }

// In-memory store (used when MongoDB not available)
const inMemoryPredictions = [];

// POST /api/predict - run AI prediction
router.post('/', async (req, res) => {
    try {
        const {
            cementType, cement, sand, aggregate, water,
            length, breadth, height, elementType,
            temperature, humidity, resistance,
            elementId
        } = req.body;

        // Validate required fields
        if (!cement || !water || !temperature || !resistance) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }

        const result = runPrediction({
            cementType, cement: +cement, sand: +sand, aggregate: +aggregate, water: +water,
            length: +length, breadth: +breadth, height: +height, elementType,
            temperature: +temperature, humidity: +humidity, resistance: +resistance
        });

        const predictionDoc = {
            elementId: elementId || uuidv4(),
            elementType,
            cementType,
            ...result,
            createdAt: new Date()
        };

        if (CyclePrediction && require('mongoose').connection.readyState === 1) {
            const doc = await new CyclePrediction(predictionDoc).save();
            return res.status(201).json({ success: true, data: doc });
        }

        const saved = { ...predictionDoc, _id: uuidv4() };
        inMemoryPredictions.unshift(saved);
        res.status(201).json({ success: true, data: saved });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/predict - get all predictions
router.get('/', async (req, res) => {
    try {
        if (CyclePrediction && require('mongoose').connection.readyState === 1) {
            const docs = await CyclePrediction.find().sort({ createdAt: -1 }).limit(50);
            return res.json({ success: true, data: docs });
        }
        res.json({ success: true, data: inMemoryPredictions.slice(0, 20) });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/predict/:id
router.get('/:id', async (req, res) => {
    try {
        if (CyclePrediction && require('mongoose').connection.readyState === 1) {
            const doc = await CyclePrediction.findById(req.params.id);
            if (!doc) return res.status(404).json({ success: false, error: 'Not found' });
            return res.json({ success: true, data: doc });
        }
        const found = inMemoryPredictions.find(p => p._id === req.params.id);
        if (!found) return res.status(404).json({ success: false, error: 'Not found' });
        res.json({ success: true, data: found });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
