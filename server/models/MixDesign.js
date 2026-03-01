const mongoose = require('mongoose');

const MixDesignSchema = new mongoose.Schema({
    elementId: { type: String },
    cementType: { type: String, enum: ['OPC43', 'OPC53', 'PPC'], required: true },
    cement: { type: Number, required: true },       // kg/m³
    sand: { type: Number, required: true },          // kg/m³
    aggregate: { type: Number, required: true },     // kg/m³
    water: { type: Number, required: true },         // kg/m³
    wcRatio: { type: Number },                       // auto-calculated
    createdAt: { type: Date, default: Date.now }
});

// Auto-calculate w/c ratio before save
MixDesignSchema.pre('save', function (next) {
    if (this.cement && this.water) {
        this.wcRatio = parseFloat((this.water / this.cement).toFixed(3));
    }
    next();
});

module.exports = mongoose.model('MixDesign', MixDesignSchema);
