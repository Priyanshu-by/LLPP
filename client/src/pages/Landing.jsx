import { Link } from 'react-router-dom';
import { Zap, Cpu, Clock, ChevronRight, ArrowRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const STATS = [
    { value: '8.4h', label: 'Avg Hours Saved', color: 'var(--cyan)' },
    { value: '23%', label: 'Yard Space Optimized', color: 'var(--green)' },
    { value: '94%', label: 'AI Accuracy', color: 'var(--purple)' },
    { value: '312', label: 'Elements Predicted', color: 'var(--orange)' },
];

const STEPS = [
    { icon: '🏗️', label: 'Casting', desc: 'Element poured and formed' },
    { icon: '📡', label: 'Sensors', desc: 'IoT monitors temp, humidity, resistance' },
    { icon: '🧠', label: 'AI Analysis', desc: 'Strength & timeline predicted' },
    { icon: '🛠️', label: 'De-mould', desc: 'Faster, safer de-moulding decision' },
];

function Counter({ target, suffix = '' }) {
    const [count, setCount] = useState(0);
    const targetNum = parseFloat(target);
    useEffect(() => {
        let start = 0;
        const step = targetNum / 40;
        const timer = setInterval(() => {
            start = Math.min(start + step, targetNum);
            setCount(start.toFixed(target.includes('.') ? 1 : 0));
            if (start >= targetNum) clearInterval(timer);
        }, 40);
        return () => clearInterval(timer);
    }, [targetNum]);
    return <span>{count}{suffix}</span>;
}

export default function Landing() {
    const [activeStep, setActiveStep] = useState(0);
    useEffect(() => {
        const t = setInterval(() => setActiveStep(s => (s + 1) % STEPS.length), 1800);
        return () => clearInterval(t);
    }, []);

    return (
        <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
            {/* Construction net overlay */}
            <div className="construction-net">
                <div className="construction-mesh" />
            </div>
            <div className="guide-line" aria-hidden="true" />

            {/* Crane SVG (decorative) */}
            <svg className="crane" viewBox="0 0 200 140" aria-hidden="true">
                <g fill="none" stroke="#ffd166" strokeWidth="3">
                    <path className="arm" d="M10 120 L120 20 L160 40" stroke="#ffd166" strokeWidth="3" strokeLinecap="round" />
                    <path d="M120 20 L120 120" stroke="#ffd166" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="10" cy="120" r="6" fill="#ef4444" />
                    <rect x="118" y="116" width="12" height="18" fill="#f59e0b" />
                </g>
            </svg>
            {/* Navbar */}
            <nav style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
                height: 64, padding: '0 48px', display: 'flex', alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(7,9,15,0.8)', backdropFilter: 'blur(16px)',
                borderBottom: '1px solid var(--border)'
            }}>
                <div style={{ fontSize: 22, fontWeight: 900 }}>
                    <span className="gradient-text-cyan">⚙ Construct AI</span>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <Link to="/login" className="btn btn-secondary btn-sm">Sign In</Link>
                    <Link to="/dashboard" className="btn btn-primary btn-sm">Launch Platform →</Link>
                </div>
            </nav>

            {/* Hero */}
            <section className="hero-section" style={{ paddingTop: 120 }}>
                <div className="hero-gradient" />
                <div className="hero-content fade-in" style={{ textAlign: 'center', maxWidth: 900, margin: '0 auto' }}>
                    <div className="hero-tag">
                        <Zap size={12} /> Smart Construction
                    </div>
                    <h1 className="hero-title">
                        <span className="gradient-text-cyan">Reduce Curing Time</span><br />
                        with AI‑Powered Sensor Intelligence
                    </h1>
                    <p className="hero-subtitle" style={{ margin: '0 auto 36px' }}>
                        Construct AI connects live IoT sensors to AI prediction models, giving precast yard managers
                        real-time visibility into concrete strength gain — enabling faster, safer de-moulding decisions.
                    </p>
                    <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link to="/dashboard" className="btn btn-primary btn-lg">
                            <LayoutDashboard size={18} /> Go to Dashboard
                        </Link>
                        <Link to="/digital-twin" className="btn btn-secondary btn-lg">
                            <Box size={18} /> View Digital Twin
                        </Link>
                    </div>
                </div>
            </section>

            {/* KPI Stats */}
            <section style={{ padding: '0 48px 80px' }}>
                <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                    <div className="grid-4">
                        {STATS.map(s => (
                            <div key={s.label} className="card" style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 40, fontWeight: 900, color: s.color, fontFamily: 'var(--font-mono)' }}>
                                    {s.value}
                                </div>
                                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6 }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Problem vs Solution */}
            <section style={{ padding: '60px 48px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                    <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 800, marginBottom: 40 }}>
                        Traditional vs <span className="gradient-text-cyan">AI-Optimized</span> Curing
                    </h2>
                    <div className="grid-2" style={{ gap: 32 }}>
                        <div className="card" style={{ borderColor: 'rgba(248,113,113,0.25)' }}>
                            <h3 style={{ color: 'var(--red)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                 Traditional Method
                            </h3>
                            {['Fixed 32–36 hour curing schedule', 'No real-time strength data', 'Over-curing wastes yard space', 'Human judgment = higher risk', 'Production bottlenecks'].map(p => (
                                <div key={p} style={{ display: 'flex', gap: 10, marginBottom: 10, color: 'var(--text-secondary)', fontSize: 14 }}>
                                    <span style={{ color: 'var(--red)', marginTop: 2 }}>✗</span> {p}
                                </div>
                            ))}
                        </div>
                        <div className="card" style={{ borderColor: 'rgba(56,189,248,0.25)' }}>
                            <h3 style={{ color: 'var(--cyan)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                 Construct AI Method
                            </h3>
                            {['Dynamic prediction: 18–28 hrs average', 'Live sensor data every 3 seconds', 'Saves 8+ hours per cycle', 'Confidence score for safe de-moulding', 'Maximize throughput & yard utilization'].map(p => (
                                <div key={p} style={{ display: 'flex', gap: 10, marginBottom: 10, color: 'var(--text-secondary)', fontSize: 14 }}>
                                    <span style={{ color: 'var(--cyan)', marginTop: 2 }}>✓</span> {p}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Animated Workflow */}
            <section style={{ padding: '80px 48px' }}>
                <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
                    <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>How It Works</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 48, fontSize: 15 }}>
                        From casting to de-moulding, Construct AI monitors every step
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, flexWrap: 'wrap' }}>
                        {STEPS.map((step, i) => (
                            <div key={step.label} style={{ display: 'flex', alignItems: 'center' }}>
                                <div style={{
                                    textAlign: 'center', width: 160, padding: '20px 16px',
                                    borderRadius: 'var(--radius-lg)', transition: 'all 0.4s',
                                    background: activeStep === i ? 'var(--cyan-dim)' : 'var(--bg-card)',
                                    border: `1px solid ${activeStep === i ? 'rgba(56,189,248,0.4)' : 'var(--border)'}`,
                                    transform: activeStep === i ? 'scale(1.05)' : 'scale(1)',
                                }}>
                                    <div style={{ fontSize: 32, marginBottom: 8 }}>{step.icon}</div>
                                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, color: activeStep === i ? 'var(--cyan)' : 'var(--text-primary)' }}>{step.label}</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{step.desc}</div>
                                </div>
                                {i < STEPS.length - 1 && (
                                    <ArrowRight size={20} style={{ color: 'var(--text-muted)', margin: '0 8px', flexShrink: 0 }} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section style={{ padding: '60px 48px 100px', textAlign: 'center', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
                <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12 }}>Ready to optimize your precast yard?</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>
                    Start a session, connect your sensors, and let Construct AI do the rest.
                </p>
                <Link to="/smart-slab" className="btn btn-primary btn-lg">
                    <Cpu size={18} /> Start Smart Slab Analysis
                </Link>
            </section>

            {/* Footer */}
            {/* <footer style={{ padding: '24px 48px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>© 2024 Construct AI · AI-Powered Precast Intelligence Engine</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>MERN Stack · IoT Simulation · AI Prediction</span>
            </footer> */}
        </div>
    );
}

// Missing imports used in Landing
function LayoutDashboard({ size }) { return <span style={{ fontSize: size }}>➤</span> }
function Box({ size }) { return <span style={{ fontSize: size }}>➤</span> }
