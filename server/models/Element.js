const mongoose = require('mongoose');

const ElementSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, enum: ['Slab', 'Beam', 'Column'], required: true },
    length: { type: Number, required: true },    // meters
    breadth: { type: Number, required: true },   // meters
    height: { type: Number, required: true },    // meters
    volume: { type: Number },                    // auto-calculated m³
    status: {
        type: String,
        enum: ['Casting', 'Curing', 'Ready to De-mould', 'Completed'],
        default: 'Casting'
    },
    castingDate: { type: Date, default: Date.now },
    deMouldDate: { type: Date }
});

ElementSchema.pre('save', function (next) {
    this.volume = parseFloat((this.length * this.breadth * this.height).toFixed(3));
    next();
});

module.exports = mongoose.model('Element', ElementSchema);
