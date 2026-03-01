const mongoose = require('mongoose');

const SensorDataSchema = new mongoose.Schema({
    elementId: { type: String, required: true },
    temperature: { type: Number, required: true },  // °C
    humidity: { type: Number, required: true },      // %
    resistance: { type: Number, required: true },    // Ohms
    estimatedStrength: { type: Number },             // MPa (computed)
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SensorData', SensorDataSchema);
