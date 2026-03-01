import { useState, useEffect } from 'react';

const API = 'http://localhost:5000/api';

/**
 * Proper 6-face CSS 3D cuboid.
 * W = length (pixels), D = breadth (pixels), H = height (pixels, exaggerated for visibility).
 * All faces are positioned using CSS preserve-3d so the box truly changes shape
 * when any of the three dimensions change.
 */
function Slab3D({ length = 6, breadth = 1.2, height = 0.2, curingPct = 0.6 }) {
    const SCALE = 30;
    // Map real dimensions → pixel dimensions; exaggerate height 6× so thin slabs stay visible
    const W = Math.max(70, Math.min(270, length * SCALE));
    const D = Math.max(36, Math.min(160, breadth * SCALE));
    const H = Math.max(18, Math.min(110, height * SCALE * 6));

    // Curing color: blue (fresh) → green (ready)
    const hue = 200 + 120 * (1 - curingPct);   // 320 (blue) → 200 (green-cyan)
    const base = `hsl(${hue}, 70%, ${22 + curingPct * 26}%)`;
    const glow = `hsl(${hue}, 85%, 58%)`;

    // Shared face base style
    const faceBase = {
        position: 'absolute',
        background: base,
        border: '1px solid rgba(56,189,248,0.35)',
        transition: 'all 0.35s ease',
    };

    return (
        <div style={{
            perspective: 900,
            height: 360,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
            {/* Rotating wrapper – W×D is the "footprint" of the box on screen */}
            <div style={{
                width: W, height: D,
                position: 'relative',
                transformStyle: 'preserve-3d',
                transform: 'rotateX(22deg) rotateY(35deg)',
                animation: 'dt-rotate 14s linear infinite',
            }}>
                {/* ── Top face  (W × D, lifted  H/2) ── */}
                <div style={{
                    ...faceBase,
                    width: W, height: D,
                    transform: `translateZ(${H / 2}px)`,
                    opacity: 0.96,
                    boxShadow: `0 0 32px ${glow}55`,
                }}>
                    <span style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.75)',
                        letterSpacing: 1.5, textTransform: 'uppercase',
                    }}>▲ Top</span>
                </div>

                {/* ── Bottom face (W × D, lowered H/2) ── */}
                <div style={{
                    ...faceBase,
                    width: W, height: D,
                    transform: `rotateX(180deg) translateZ(${H / 2}px)`,
                    opacity: 0.25,
                    background: '#0b1a2e',
                }} />

                {/* ── Front face (W × H) ── */}
                <div style={{
                    ...faceBase,
                    width: W, height: H,
                    top: (D - H) / 2,
                    transform: `rotateX(-90deg) translateZ(${D / 2}px)`,
                    opacity: 0.82,
                }} />

                {/* ── Back face (W × H) ── */}
                <div style={{
                    ...faceBase,
                    width: W, height: H,
                    top: (D - H) / 2,
                    transform: `rotateX(90deg) translateZ(${D / 2}px)`,
                    opacity: 0.50,
                }} />

                {/* ── Right face (D × H) ── */}
                <div style={{
                    ...faceBase,
                    width: D, height: H,
                    left: (W - D) / 2,
                    top: (D - H) / 2,
                    transform: `rotateY(90deg) translateZ(${W / 2}px)`,
                    opacity: 0.68,
                }} />

                {/* ── Left face (D × H) ── */}
                <div style={{
                    ...faceBase,
                    width: D, height: H,
                    left: (W - D) / 2,
                    top: (D - H) / 2,
                    transform: `rotateY(-90deg) translateZ(${W / 2}px)`,
                    opacity: 0.45,
                }} />
            </div>
        </div>
    );
}

export default function DigitalTwin() {
    const [sensor, setSensor] = useState({ temperature: 27.5, humidity: 68, resistance: 920 });
    const [prediction, setPrediction] = useState(null);
    const [curingPct, setCuringPct] = useState(0.1);

    // ── Load geometry from sessionStorage (shared with SmartSlab) ────────
    const loadGeo = () => {
        try {
            const geo = JSON.parse(sessionStorage.getItem('apie_geometry') || '{}');
            return {
                length: geo.length || 6,
                breadth: geo.breadth || 1.2,
                height: geo.height || 0.2,
                elementType: geo.elementType || 'Slab',
            };
        } catch { return { length: 6, breadth: 1.2, height: 0.2, elementType: 'Slab' }; }
    };
    const [dims, setDims] = useState(loadGeo);
    // Raw string state so users can freely clear/type without snapping back
    const [rawDims, setRawDims] = useState(() => {
        const g = loadGeo();
        return { length: String(g.length), breadth: String(g.breadth), height: String(g.height) };
    });

    useEffect(() => {
        // Load prediction insights
        const stored = sessionStorage.getItem('apie_prediction');
        if (stored) {
            try {
                const d = JSON.parse(stored);
                setPrediction(d);
                const pct = Math.min(1, (d.targetStrength || 22) / (d.peakStrength || 45));
                setCuringPct(pct * 0.4); // start at partial, let animation fill
            } catch { }
        }
        // Animate curing color from current to 100%
        let pct = curingPct;
        const t = setInterval(() => {
            pct = Math.min(1, pct + 0.003);
            setCuringPct(pct);
        }, 100);
        return () => clearInterval(t);
    }, []);

    useEffect(() => {
        const iv = setInterval(async () => {
            try {
                const res = await fetch(`${API}/sensor/live`);
                const json = await res.json();
                if (json.success) setSensor(json.data);
            } catch { }
        }, 3000);
        return () => clearInterval(iv);
    }, []);

    const strengthColor = curingPct < 0.4 ? 'var(--orange)' : curingPct < 0.8 ? 'var(--cyan)' : 'var(--green)';
    const curingLabel = curingPct < 0.3 ? 'Initial Set' : curingPct < 0.6 ? 'Curing' : curingPct < 0.9 ? 'Strength Gain' : 'De-mould Ready';

    return (
        <div className="fade-in">
            <div className="page-title">Digital Twin</div>
            <p className="page-sub">Live 3D representation of your precast element with sensor overlay</p>

            <div className="grid-2" style={{ gap: 24, marginBottom: 24 }}>
                {/* 3D View */}
                <div className="card" style={{ overflow: 'hidden', position: 'relative' }}>
                    <div className="section-title" style={{ marginBottom: 8 }}>🧬 3D Element Model</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="badge badge-cyan" style={{ fontSize: 10 }}>{dims.elementType}</span>
                        {dims.length}m × {dims.breadth}m × {dims.height}m
                        <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>· {(dims.length * dims.breadth * dims.height).toFixed(3)} m³</span>
                    </div>

                    {/* Curing heatmap gradient overlay */}
                    <div style={{
                        position: 'absolute', top: 48, right: 16, width: 14, height: 120,
                        borderRadius: 7, background: 'linear-gradient(to top, #f87171, #fbbf24, #4ade80)',
                        border: '1px solid var(--border)', zIndex: 5
                    }} />
                    <div style={{ position: 'absolute', top: 42, right: 32, fontSize: 10, color: 'var(--green)' }}>Max</div>
                    <div style={{ position: 'absolute', top: 160, right: 32, fontSize: 10, color: 'var(--red)' }}>Min</div>

                    <Slab3D length={dims.length} breadth={dims.breadth} height={dims.height} curingPct={curingPct} />

                    {/* Curing phase badge */}
                    <div style={{ textAlign: 'center', marginTop: 12 }}>
                        <span className="badge" style={{ background: `${strengthColor}22`, color: strengthColor, border: `1px solid ${strengthColor}44`, fontSize: 13, padding: '6px 16px' }}>
                            ● {curingLabel}
                        </span>
                    </div>

                    {/* Progress bar */}
                    <div style={{ marginTop: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
                            <span>Curing Progress</span>
                            <span>{Math.round(curingPct * 100)}%</span>
                        </div>
                        <div className="progress-bar-wrap">
                            <div className="progress-bar" style={{ width: `${curingPct * 100}%`, background: strengthColor, transition: 'width 0.5s ease, background 0.5s ease' }} />
                        </div>
                    </div>
                </div>

                {/* Live Sensor Overlay */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="card">
                        <div className="section-title" style={{ marginBottom: 16 }}>📡 Live Sensor Readings</div>
                        {[
                            { label: 'Temperature', value: `${sensor.temperature}°C`, icon: '🌡', color: 'var(--orange)', hint: sensor.temperature > 35 ? 'High – risk of thermal cracking' : 'Optimal range' },
                            { label: 'Humidity', value: `${sensor.humidity}%`, icon: '💧', color: 'var(--cyan)', hint: sensor.humidity > 80 ? 'Very high – surface evaporation slow' : 'Favorable' },
                            { label: 'Resistance', value: `${sensor.resistance}Ω`, icon: '⚡', color: 'var(--purple)', hint: sensor.resistance > 1200 ? 'High – strong hydration' : 'Moderate hydration' },
                        ].map(s => (
                            <div key={s.label} style={{
                                display: 'flex', alignItems: 'center', gap: 12, padding: '12px',
                                background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', marginBottom: 10,
                                border: '1px solid var(--border)'
                            }}>
                                <div style={{
                                    width: 44, height: 44, borderRadius: '50%',
                                    border: `2px solid ${s.color}`, display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', fontSize: 18, position: 'relative',
                                    boxShadow: `0 0 12px ${s.color}40`,
                                    background: `${s.color}10`
                                }}>
                                    {s.icon}
                                    <div style={{ position: 'absolute', inset: -4, borderRadius: '50%', border: `1px solid ${s.color}`, animation: 'pulse-ring 2s infinite' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.label}</div>
                                    <div style={{ fontSize: 20, fontWeight: 800, color: s.color, fontFamily: 'var(--font-mono)', lineHeight: 1.2 }}>{s.value}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{s.hint}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Dimensions */}
                    <div className="card">
                        <div className="section-title" style={{ marginBottom: 12 }}>📐 Dimension Overlay</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                            {[
                                { label: 'Length (m)', key: 'length', min: 0.1, step: 0.1 },
                                { label: 'Breadth (m)', key: 'breadth', min: 0.1, step: 0.1 },
                                { label: 'Height (m)', key: 'height', min: 0.01, step: 0.01 },
                            ].map(({ label, key, min, step }) => (
                                <div key={key} style={{ padding: '10px', background: 'var(--bg-secondary)', borderRadius: 8 }}>
                                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={rawDims[key]}
                                        min={min}
                                        step={step}
                                        onChange={e => setRawDims(r => ({ ...r, [key]: e.target.value }))}
                                        onBlur={e => {
                                            const parsed = parseFloat(e.target.value);
                                            const val = isNaN(parsed) || parsed < min ? min : parsed;
                                            setRawDims(r => ({ ...r, [key]: String(val) }));
                                            setDims(d => ({ ...d, [key]: val }));
                                        }}
                                        style={{
                                            padding: '6px 10px', fontSize: 16, fontWeight: 700,
                                            fontFamily: 'var(--font-mono)', color: 'var(--cyan)',
                                            background: 'var(--bg-primary)', textAlign: 'center',
                                            border: '1px solid var(--border-active)'
                                        }}
                                    />
                                </div>
                            ))}
                            {/* Volume — auto-calculated, read-only */}
                            <div style={{ padding: '10px', background: 'var(--bg-secondary)', borderRadius: 8, textAlign: 'center' }}>
                                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.5 }}>Volume (m³)</div>
                                <div style={{
                                    fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: 16,
                                    color: 'var(--purple)', padding: '6px 0'
                                }}>
                                    {(dims.length * dims.breadth * dims.height).toFixed(3)}
                                </div>
                            </div>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            ✏️ Edit values above — the 3D model updates instantly
                        </div>
                    </div>

                    {prediction && (
                        <div className="card" style={{ background: 'var(--green-dim)', border: '1px solid rgba(74,222,128,0.3)' }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--green)', marginBottom: 6 }}>✅ AI Insight</div>
                            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                                Safe de-moulding in <strong style={{ color: 'var(--green)' }}>{prediction.deMouldTime}h</strong>.
                                Saving <strong style={{ color: 'var(--orange)' }}>{prediction.hoursSaved}h</strong> vs traditional.
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Autodesk Forge placeholder */}
            <div className="card" style={{ borderStyle: 'dashed', borderColor: 'rgba(56,189,248,0.3)', textAlign: 'center', padding: 40 }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>🏗️</div>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Autodesk Forge BIM Integration</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 14, maxWidth: 480, margin: '0 auto', marginBottom: 20 }}>
                    Connect your Autodesk Forge credentials to load IFC/RVT precast models and overlay live AI + sensor data directly on BIM geometry.
                </div>
                <button className="btn btn-secondary">
                    🔑 Configure Forge API Key
                </button>
            </div>
        </div>
    );
}
