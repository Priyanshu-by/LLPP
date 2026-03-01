const mongoose = require('mongoose');

const StrengthPointSchema = new mongoose.Schema({
    hour: Number,
    strength: Number   // MPa
}, { _id: false });

const CyclePredictionSchema = new mongoose.Schema({
    elementId: { type: String, required: true },
    elementType: { type: String, enum: ['Slab', 'Beam', 'Column'], required: true },
    mixDesignId: { type: mongoose.Schema.Types.ObjectId, ref: 'MixDesign' },
    // Prediction results
    settingTime: { type: Number },           // hours to initial set
    deMouldTime: { type: Number },           // hours to safe de-moulding
    traditionalTime: { type: Number },       // baseline traditional hours
    hoursSaved: { type: Number },
    targetStrength: { type: Number },        // MPa threshold for de-moulding
    peakStrength: { type: Number },          // MPa at 28 days
    confidenceScore: { type: Number },       // 0-100
    strengthHistory: [StrengthPointSchema],  // hour-by-hour
    status: {
        type: String,
        enum: ['Casting', 'Curing', 'Ready to De-mould', 'Completed'],
        default: 'Casting'
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CyclePrediction', CyclePredictionSchema);
