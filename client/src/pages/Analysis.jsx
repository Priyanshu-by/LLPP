import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, ReferenceLine
} from 'recharts';

// ── Fallback data if user lands here without running analysis ─────────────
function makeDemoData(peak = 45.2, setT = 28.5) {
    return {
        settingTime: setT, deMouldTime: 22.3, traditionalTime: 30,
        hoursSaved: 7.7, peakStrength: peak, targetStrength: 22,
        confidenceScore: 89, cementType: 'OPC53', elementType: 'Slab', wcRatio: 0.4,
        strengthHistory: Array.from({ length: 73 }, (_, h) => {
            const s2 = setT * 0.5, s3 = setT * 3;
            let pct;
            if (h <= s2) pct = (h / s2) * 0.05;
            else if (h <= setT) pct = 0.05 + ((h - s2) / s2) * 0.15;
            else if (h <= s3) pct = 0.20 + Math.log1p(((h - setT) / (setT * 2)) * 6) / Math.log1p(6) * 0.55;
            else pct = 0.75 + ((h - s3) / (72 - s3)) * 0.25;
            return { hour: h, strength: parseFloat((peak * Math.min(pct, 1)).toFixed(2)) };
        }),
        factors: { tempFactor: 0.98, humidityFactor: 1.0, thicknessFactor: 1.0, wcFactor: 0.97 }
    };
}

const TIMELINE_STEPS = [
    { label: 'Casting', icon: '🏗️', desc: 'Element poured into mould' },
    { label: 'Dormant', icon: '💤', desc: 'Initial hydration begins' },
    { label: 'Setting', icon: '🔥', desc: 'Rapid strength gain phase' },
    { label: 'Curing', icon: '⏳', desc: 'Approaching target strength' },
    { label: 'De-mould Ready', icon: '✅', desc: 'Safe to remove from mould' },
];

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px' }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Hour {label}</div>
            {payload.map(p => (
                <div key={p.name} style={{ color: p.color, fontSize: 13, fontWeight: 600 }}>
                    {p.name}: {typeof p.value === 'number' ? p.value.toFixed(2) : p.value} {p.name === 'Strength' ? 'MPa' : 'MPa'}
                </div>
            ))}
        </div>
    );
}

export default function Analysis() {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [displayedHour, setDisplayedHour] = useState(0);
    const [animStep, setAnimStep] = useState(0);
    const [chartReady, setChartReady] = useState(false);
    const animRef = useRef(null);

    // ── Load prediction from sessionStorage (set by SmartSlab) ───────────
    useEffect(() => {
        const stored = sessionStorage.getItem('constructai_prediction');
        let parsed = null;
        if (stored) {
            try { parsed = JSON.parse(stored); } catch { }
        }
        const d = parsed || makeDemoData();
        setData(d);
        // Reset animation
        setDisplayedHour(0);
        setAnimStep(0);
        setChartReady(false);
        // short delay then start animation
        setTimeout(() => setChartReady(true), 200);
    }, []);

    // ── Animate the hour counter (drives the chart fill) ─────────────────
    useEffect(() => {
        if (!chartReady || !data) return;
        const maxHour = Math.min(72, data.strengthHistory?.length - 1 || 72);
        if (displayedHour >= maxHour) return;

        // Speed: finish the animation in ~3 seconds
        const stepMs = Math.max(10, Math.round(3000 / maxHour));
        animRef.current = setTimeout(() => setDisplayedHour(h => h + 1), stepMs);
        return () => clearTimeout(animRef.current);
    }, [displayedHour, chartReady, data]);

    // ── Timeline step from current hour ──────────────────────────────────
    useEffect(() => {
        if (!data) return;
        const { settingTime: sT, deMouldTime: dT } = data;
        const thresholds = [0, sT * 0.25, sT * 0.65, sT, dT];
        const step = thresholds.filter(t => displayedHour >= t).length - 1;
        setAnimStep(Math.min(step, TIMELINE_STEPS.length - 1));
    }, [displayedHour, data]);

    if (!data) return <div style={{ padding: 40, color: 'var(--text-muted)' }}>Loading analysis…</div>;

    // Only show points up to displayedHour
    const chartData = (data.strengthHistory || [])
        .filter(p => p.hour <= displayedHour)
        .map(p => ({ hour: p.hour, Strength: p.strength, Target: data.targetStrength }));

    const currentStrength = chartData[chartData.length - 1]?.Strength || 0;
    const deMouldReached = currentStrength >= data.targetStrength;

    return (
        <div className="fade-in">
            <div className="page-title">AI Analysis & Prediction</div>
            <p className="page-sub">Intelligence report for your precast element</p>

            {/* ── De-mould Banner ── */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(74,222,128,0.15), rgba(56,189,248,0.1))',
                border: '1px solid rgba(74,222,128,0.4)', borderRadius: 'var(--radius-lg)',
                padding: '20px 24px', marginBottom: 24,
                display: 'flex', alignItems: 'center', gap: 16
            }}>
                <div style={{ fontSize: 36 }}>🎯</div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--green)', marginBottom: 4 }}>
                        This {data.elementType} will be safely de-moulded in {data.deMouldTime}h
                    </div>
                    <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                        Saving <strong style={{ color: 'var(--orange)' }}>{data.hoursSaved} hours</strong> vs traditional curing.
                        Traditional: {data.traditionalTime}h → AI-Optimized: <strong style={{ color: 'var(--cyan)' }}>{data.deMouldTime}h</strong>
                    </div>
                    <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>
                        Cement: {data.cementType} · W/C Ratio: {data.wcRatio} · Target: {data.targetStrength} MPa · 28d Peak: {data.peakStrength} MPa
                    </div>
                </div>
                <div style={{ textAlign: 'center', flexShrink: 0 }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>AI Confidence</div>
                    <div style={{
                        width: 64, height: 64, borderRadius: '50%', border: '4px solid var(--green)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'var(--green-dim)', boxShadow: '0 0 20px rgba(74,222,128,0.3)'
                    }}>
                        <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--green)' }}>{data.confidenceScore}%</div>
                    </div>
                </div>
            </div>

            {/* ── Summary KPI cards ── */}
            <div className="grid-4" style={{ marginBottom: 24 }}>
                {[
                    { label: 'Baseline (Trad.)', value: `${data.traditionalTime}h`, color: 'var(--orange)', icon: '⏲️' },
                    { label: 'De-mould Time', value: `${data.deMouldTime}h`, color: 'var(--green)', icon: '✅' },
                    { label: 'Hours Saved', value: `${data.hoursSaved}h`, color: 'var(--cyan)', icon: '⚡' },
                    { label: '28d Strength', value: `${data.peakStrength} MPa`, color: 'var(--purple)', icon: '💪' },
                ].map(c => (
                    <div key={c.label} className="card" style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 24, marginBottom: 6 }}>{c.icon}</div>
                        <div style={{ fontSize: 26, fontWeight: 900, color: c.color, fontFamily: 'var(--font-mono)' }}>{c.value}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 }}>{c.label}</div>
                    </div>
                ))}
            </div>

            {/* ── Curing Timeline ── */}
            <div className="card" style={{ marginBottom: 24 }}>
                <div className="section-title" style={{ marginBottom: 20 }}>⏱ Hour-by-Hour Curing Progress</div>

                {/* Timeline steps */}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20, overflowX: 'auto' }}>
                    {TIMELINE_STEPS.map((step, i) => (
                        <div key={step.label} style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 100 }}>
                            <div style={{ textAlign: 'center', flex: 1, padding: '0 4px' }}>
                                <div style={{
                                    width: 48, height: 48, borderRadius: '50%', margin: '0 auto 8px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                                    background: animStep >= i ? 'var(--cyan-dim)' : 'var(--bg-secondary)',
                                    border: `2px solid ${animStep >= i ? 'var(--cyan)' : 'var(--border)'}`,
                                    transition: 'all 0.4s',
                                    boxShadow: animStep === i ? '0 0 20px rgba(56,189,248,0.4)' : 'none'
                                }}>{step.icon}</div>
                                <div style={{ fontSize: 12, fontWeight: animStep >= i ? 700 : 400, color: animStep >= i ? 'var(--text-primary)' : 'var(--text-muted)' }}>{step.label}</div>
                                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{step.desc}</div>
                            </div>
                            {i < TIMELINE_STEPS.length - 1 && (
                                <div style={{
                                    height: 2, flex: 1,
                                    background: animStep > i ? 'var(--cyan)' : 'var(--border)',
                                    transition: 'background 0.4s', marginBottom: 32, minWidth: 20
                                }} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Progress row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Hour {displayedHour} / {data.deMouldTime}h</span>
                    <div className="progress-bar-wrap" style={{ flex: 1 }}>
                        <div className="progress-bar" style={{
                            width: `${Math.min(100, (displayedHour / data.deMouldTime) * 100)}%`,
                            background: deMouldReached ? 'var(--green)' : 'var(--cyan)',
                            transition: 'width 0.1s linear, background 0.4s'
                        }} />
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', color: deMouldReached ? 'var(--green)' : 'var(--cyan)', fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap' }}>
                        {currentStrength.toFixed(2)} MPa
                    </span>
                </div>



                {/* Replay button */}
                <button
                    className="btn btn-secondary btn-sm"
                    style={{ marginTop: 10 }}
                    onClick={() => { setDisplayedHour(0); setChartReady(false); setTimeout(() => setChartReady(true), 100); }}
                >
                    ↺ Replay Animation
                </button>
            </div>

            {/* ── Charts row ── */}
            <div className="grid-2" style={{ marginBottom: 24 }}>
                {/* Strength vs Time Chart */}
                <div className="card">
                    <div className="section-title" style={{ marginBottom: 16 }}>📈 Strength vs Time (from your inputs)</div>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                            <defs>
                                <linearGradient id="strengthGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.35} />
                                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis
                                dataKey="hour"
                                stroke="var(--text-muted)"
                                tick={{ fontSize: 11 }}
                                label={{ value: 'Time (hours)', position: 'insideBottom', offset: -12, fill: 'var(--text-muted)', fontSize: 11 }}
                            />
                            <YAxis
                                stroke="var(--text-muted)"
                                tick={{ fontSize: 11 }}
                                domain={[0, Math.ceil(data.peakStrength * 1.05)]}
                                label={{ value: 'MPa', angle: -90, position: 'insideLeft', fill: 'var(--text-muted)', fontSize: 11, dy: 20 }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            {/* Target strength reference */}
                            <ReferenceLine
                                y={data.targetStrength}
                                stroke="var(--orange)"
                                strokeDasharray="5 3"
                                label={{ value: `Target ${data.targetStrength} MPa`, fill: 'var(--orange)', fontSize: 10, position: 'right' }}
                            />
                            {/* De-mould time reference */}
                            <ReferenceLine
                                x={data.deMouldTime}
                                stroke="var(--green)"
                                strokeDasharray="5 3"
                                label={{ value: `De-mould ${data.deMouldTime}h`, fill: 'var(--green)', fontSize: 10 }}
                            />
                            <Area
                                type="monotone"
                                dataKey="Strength"
                                stroke="#38bdf8"
                                fill="url(#strengthGrad)"
                                strokeWidth={2.5}
                                dot={false}
                                isAnimationActive={false}
                            />
                            <Area
                                type="monotone"
                                dataKey="Target"
                                stroke="var(--orange)"
                                fill="none"
                                strokeWidth={1}
                                strokeDasharray="4 3"
                                dot={false}
                                isAnimationActive={false}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* AI Factor Analysis */}
                <div className="card">
                    <div className="section-title" style={{ marginBottom: 16 }}>🧠 AI Factor Analysis</div>
                    <div style={{ marginBottom: 20 }}>
                        {[
                            { label: 'Temperature Factor', value: parseFloat(data.factors?.tempFactor || 0), color: 'var(--orange)' },
                            { label: 'Humidity Factor', value: parseFloat(data.factors?.humidityFactor || 0), color: 'var(--cyan)' },
                            { label: 'Thickness Factor', value: parseFloat(data.factors?.thicknessFactor || 0), color: 'var(--purple)' },
                            { label: 'W/C Ratio Factor', value: parseFloat(data.factors?.wcFactor || 0), color: 'var(--green)' },
                        ].map(f => (
                            <div key={f.label} style={{ marginBottom: 14 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>{f.label}</span>
                                    <span style={{ fontWeight: 700, color: f.color, fontFamily: 'var(--font-mono)' }}>
                                        {isNaN(f.value) ? '—' : f.value.toFixed(3)}
                                    </span>
                                </div>
                                <div className="progress-bar-wrap">
                                    <div className="progress-bar" style={{ width: `${Math.min(100, (f.value || 0) * 100)}%`, background: f.color, transition: 'width 1s ease' }} />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: 14 }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Prediction Details</div>
                        {[
                            ['Cement Type', data.cementType],
                            ['Element Type', data.elementType],
                            ['W/C Ratio', data.wcRatio],
                            ['Baseline (Trad.)', `${data.traditionalTime}h`],
                            ['Target Strength', `${data.targetStrength} MPa`],
                            ['Peak Strength', `${data.peakStrength} MPa`],
                        ].map(([k, v]) => (
                            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0', borderBottom: '1px solid var(--border)' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>{k}</span>
                                <span style={{ fontWeight: 600 }}>{v}</span>
                            </div>
                        ))}
                    </div>

                    <button onClick={() => navigate('/smart-slab')} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', marginTop: 14 }}>
                        ← Re-run Analysis with New Inputs
                    </button>
                </div>
            </div>
        </div>
    );
}
