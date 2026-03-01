/**
 * Construct AI Prediction Engine
 * 
 * Simulates realistic AI-based concrete strength and curing predictions.
 * Core logic:
 *   1. Resistance → Strength mapping (electrochemical impedance correlation)
 *   2. Cement type strength modifier
 *   3. Temperature & humidity environmental adjustment
 *   4. Element thickness (thicker = slower heat dissipation = slightly faster at core)
 *   5. w/c ratio penalty
 */

// ── Cement type factors ────────────────────────────────────────────────────
const CEMENT_FACTORS = {
    OPC43: { strengthMult: 1.0, settingBase: 30, traditional: 32, targetMPa: 20 },
    OPC53: { strengthMult: 1.15, settingBase: 28, traditional: 30, targetMPa: 22 },
    PPC: { strengthMult: 0.88, settingBase: 34, traditional: 36, targetMPa: 18 },
};

// ── Resistance → Strength (Ohms → MPa) ────────────────────────────────────
// Higher resistance = more hydration = higher strength
function resistanceToStrength(resistance, cementFactor) {
    // Sigmoid-like curve: plateaus above 2000Ω
    const base = (10000 / (resistance + 200)) * 25;
    return parseFloat((base * cementFactor).toFixed(2));
}

// ── Temperature factor ─────────────────────────────────────────────────────
// Optimal curing: 20–30°C. Below 10°C slows, above 35°C risks micro-cracks
function tempFactor(temp) {
    if (temp < 10) return 0.70;
    if (temp < 20) return 0.85 + (temp - 10) * 0.015;
    if (temp <= 30) return 1.0;
    if (temp <= 40) return 0.98 - (temp - 30) * 0.02;
    return 0.75;
}

// ── Humidity factor ────────────────────────────────────────────────────────
// High humidity (>70%) aids curing; very dry conditions (<40%) lose moisture
function humidityFactor(humidity) {
    if (humidity < 40) return 0.80;
    if (humidity < 60) return 0.90;
    if (humidity <= 80) return 1.0;
    return 0.97; // too humid slightly slows surface evaporation
}

// ── Thickness factor ───────────────────────────────────────────────────────
function thicknessFactor(height) {
    // Thin slabs (<0.15m) cure faster; thick (>0.4m) may have thermal gradients
    if (height < 0.1) return 1.05;
    if (height <= 0.2) return 1.0;
    if (height <= 0.35) return 0.96;
    return 0.90;
}

// ── w/c ratio penalty ─────────────────────────────────────────────────────
function wcFactor(wcRatio) {
    // Ideal: 0.4–0.45. Higher w/c = more porosity = lower strength
    if (wcRatio < 0.35) return 0.95; // too stiff, workability issues
    if (wcRatio <= 0.45) return 1.0;
    if (wcRatio <= 0.55) return 0.92 - (wcRatio - 0.45) * 0.5;
    return 0.82;
}

// ── Generate hour-by-hour strength history ─────────────────────────────────
function buildStrengthHistory(peakStrength, settingTime, totalHours = 72) {
    const history = [];
    for (let h = 0; h <= totalHours; h++) {
        let pct;
        if (h <= settingTime * 0.5) {
            // Dormant phase
            pct = (h / (settingTime * 0.5)) * 0.05;
        } else if (h <= settingTime) {
            // Initial setting
            pct = 0.05 + ((h - settingTime * 0.5) / (settingTime * 0.5)) * 0.15;
        } else if (h <= settingTime * 3) {
            // Rapid strength gain (logarithmic)
            const t = (h - settingTime) / (settingTime * 2);
            pct = 0.20 + Math.log1p(t * 6) / Math.log1p(6) * 0.55;
        } else {
            // Gradual gain to peak
            const t = (h - settingTime * 3) / (totalHours - settingTime * 3);
            pct = 0.75 + t * 0.25;
        }
        history.push({
            hour: h,
            strength: parseFloat((peakStrength * Math.min(pct, 1)).toFixed(2))
        });
    }
    return history;
}

// ── Main Prediction Function ───────────────────────────────────────────────
function runPrediction({
    cementType = 'OPC53',
    cement, sand, aggregate, water,
    length, breadth, height,
    elementType = 'Slab',
    temperature, humidity, resistance
}) {
    const cf = CEMENT_FACTORS[cementType] || CEMENT_FACTORS['OPC53'];
    const wcRatio = water / cement;

    // Combined factor
    const combinedFactor =
        cf.strengthMult *
        tempFactor(temperature) *
        humidityFactor(humidity) *
        thicknessFactor(height) *
        wcFactor(wcRatio);

    // 28-day peak strength (MPa)
    const peakStrength = parseFloat(
        (resistanceToStrength(resistance, combinedFactor) * 1.8).toFixed(2)
    );

    // Setting time (hours) adjusted by factors
    const settingTime = parseFloat(
        (cf.settingBase / (combinedFactor * 1.05)).toFixed(1)
    );

    // De-moulding time = time when strength reaches targetMPa
    // Using inverted strength curve
    const targetRatio = cf.targetMPa / peakStrength;
    // From the strength curve: 75% strength is at settingTime * 3 hours
    let deMouldTime;
    if (targetRatio <= 0.20) deMouldTime = settingTime;
    else if (targetRatio <= 0.75) {
        const t = Math.exp((targetRatio - 0.20) / 0.55 * Math.log1p(6)) - 1;
        deMouldTime = parseFloat((settingTime + t * settingTime * 2).toFixed(1));
    } else {
        const t = (targetRatio - 0.75) / 0.25;
        deMouldTime = parseFloat((settingTime * 3 + t * (72 - settingTime * 3)).toFixed(1));
    }

    // Clamp realistic bounds
    deMouldTime = Math.max(settingTime + 2, Math.min(deMouldTime, 48));

    const hoursSaved = parseFloat((cf.traditional - deMouldTime).toFixed(1));
    const confidenceScore = Math.min(95, Math.round(
        72 + combinedFactor * 15 - Math.abs(wcRatio - 0.42) * 30
    ));

    const strengthHistory = buildStrengthHistory(peakStrength, settingTime, 72);

    return {
        elementType,
        cementType,
        wcRatio: parseFloat(wcRatio.toFixed(3)),
        settingTime,
        deMouldTime,
        traditionalTime: cf.traditional,
        hoursSaved,
        targetStrength: cf.targetMPa,
        peakStrength,
        confidenceScore,
        strengthHistory,
        factors: {
            tempFactor: parseFloat(tempFactor(temperature).toFixed(3)),
            humidityFactor: parseFloat(humidityFactor(humidity).toFixed(3)),
            thicknessFactor: parseFloat(thicknessFactor(height).toFixed(3)),
            wcFactor: parseFloat(wcFactor(wcRatio).toFixed(3)),
        }
    };
}

module.exports = { runPrediction };
