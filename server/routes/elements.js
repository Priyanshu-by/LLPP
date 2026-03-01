const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

let Element;
try { Element = require('../models/Element'); } catch (e) { }

const mockElements = [
    { _id: 'E001', name: 'S-12', type: 'Slab', length: 6, breadth: 1.2, height: 0.2, volume: 1.44, status: 'Curing', castingDate: new Date(Date.now() - 18 * 3600000) },
    { _id: 'E002', name: 'B-07', type: 'Beam', length: 8, breadth: 0.4, height: 0.6, volume: 1.92, status: 'Ready to De-mould', castingDate: new Date(Date.now() - 30 * 3600000) },
    { _id: 'E003', name: 'S-13', type: 'Slab', length: 4, breadth: 1.0, height: 0.15, volume: 0.60, status: 'Casting', castingDate: new Date() },
    { _id: 'E004', name: 'C-03', type: 'Column', length: 0.4, breadth: 0.4, height: 3.0, volume: 0.48, status: 'Completed', castingDate: new Date(Date.now() - 72 * 3600000) },
];

router.get('/', async (req, res) => {
    try {
        if (Element && require('mongoose').connection.readyState === 1) {
            const docs = await Element.find().sort({ castingDate: -1 });
            return res.json({ success: true, data: docs });
        }
        res.json({ success: true, data: mockElements });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { name, type, length, breadth, height } = req.body;
        const volume = parseFloat((length * breadth * height).toFixed(3));
        const elData = { name, type, length: +length, breadth: +breadth, height: +height, volume, status: 'Casting', castingDate: new Date() };
        if (Element && require('mongoose').connection.readyState === 1) {
            const doc = await new Element(elData).save();
            return res.status(201).json({ success: true, data: doc });
        }
        const saved = { ...elData, _id: uuidv4() };
        mockElements.unshift(saved);
        res.status(201).json({ success: true, data: saved });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        if (Element && require('mongoose').connection.readyState === 1) {
            const doc = await Element.findByIdAndUpdate(req.params.id, { status }, { new: true });
            return res.json({ success: true, data: doc });
        }
        const el = mockElements.find(e => e._id === req.params.id);
        if (el) el.status = status;
        res.json({ success: true, data: el });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
