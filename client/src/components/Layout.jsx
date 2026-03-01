import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
    LayoutDashboard, Radio, Brain, Box, BarChart3,
    Database, Settings, LogOut, Thermometer, Droplets, Zap
} from 'lucide-react';

const API = 'http://localhost:5000/api';
const STORAGE_KEY = 'constructai_settings';

const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Smart Slab', path: '/smart-slab', icon: Radio },
    { label: 'AI Analysis', path: '/analysis', icon: Brain },
    { label: 'Digital Twin', path: '/digital-twin', icon: Box },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Records', path: '/records', icon: Database },
    { label: 'Settings', path: '/settings', icon: Settings },
];

export default function Layout() {
    const navigate = useNavigate();
    const [sensor, setSensor] = useState({ temperature: 27.5, humidity: 68, resistance: 915 });
    const [sensorLive, setSensorLive] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Load cement setting from localStorage
    const savedSettings = (() => {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
    })();
    const cement = savedSettings.defaultCement || 'OPC53';
    const cementLabel = { OPC43: 'OPC 43', OPC53: 'OPC 53', PPC: 'PPC' }[cement] || cement;

    // Fetch live sensor data every 5s (shared between topbar + sidebar widget)
    useEffect(() => {
        const fetchSensor = async () => {
            try {
                const res = await fetch(`${API}/sensor/live`);
                const json = await res.json();
                if (json.success) { setSensor(json.data); setSensorLive(true); }
            } catch { setSensorLive(false); }
        };
        fetchSensor();
        const iv = setInterval(fetchSensor, 5000);
        return () => clearInterval(iv);
    }, []);

    const sensorRows = [
        { Icon: Thermometer, label: 'Temp', value: `${sensor.temperature}°C`, color: '#fb923c' },
        { Icon: Droplets, label: 'Humid', value: `${sensor.humidity}%`, color: '#38bdf8' },
        { Icon: Zap, label: 'Resist', value: `${sensor.resistance}Ω`, color: '#a78bfa' },
    ];

    return (
        <div className="app-shell">
            {/* Mobile overlay */}
            <div
                className="sidebar-overlay"
                onClick={() => setSidebarOpen(false)}
                style={{
                    display: 'none', position: 'fixed', inset: 0,
                    background: 'rgba(0,0,0,0.55)', zIndex: 190,
                    backdropFilter: 'blur(2px)',
                    opacity: sidebarOpen ? 1 : 0,
                    pointerEvents: sidebarOpen ? 'auto' : 'none',
                    transition: 'opacity 0.3s',
                }}
            />

            {/* ── Sidebar ─────────────────────────────────────────── */}
            <aside className={`sidebar${sidebarOpen ? ' sidebar-open' : ''}`}>
                <div className="sidebar-logo">
                    <div className="logo-badge">⚙ Construct AI</div>
                    <p>Precast Intelligence Engine</p>
                </div>

                <div className="sidebar-section-label">Navigation</div>

                {navItems.map(({ label, path, icon: Icon }) => (
                    <NavLink
                        key={path}
                        to={path}
                        className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
                    >
                        <Icon className="nav-icon" />
                        {label}
                    </NavLink>
                ))}



                {/* Account */}
                <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                    <div className="sidebar-section-label">Account</div>
                    <NavLink to="/login" className="sidebar-link">
                        <LogOut className="nav-icon" />
                        Sign Out
                    </NavLink>
                </div>
            </aside>

            {/* ── Main content ─────────────────────────────────────── */}
            <main className="main-content">
                {/* ── Topbar — two rows ── */}
                <div className="topbar">

                    {/* Row 1: branding + right actions */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
<<<<<<< HEAD
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {/* Hamburger — hidden on desktop, shown on tablet/mobile via CSS */}
                            <button
                                className="topbar-hamburger"
                                onClick={() => setSidebarOpen(o => !o)}
                                style={{
                                    display: 'none', alignItems: 'center', justifyContent: 'center',
                                    background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)',
                                    borderRadius: 8, width: 36, height: 36,
                                    color: 'var(--text-primary)', fontSize: 18, cursor: 'pointer',
                                    flexShrink: 0,
                                }}
                            >☰</button>
                            <span className="topbar-title">⚙ APIE · Precast Intelligence Engine</span>
                        </div>
=======
                        <span className="topbar-title">⚙ Construct AI · Precast Intelligence Engine</span>
>>>>>>> 116d15e5613f8f6755533b5e5c3c6a40fd5c9528
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {/* Home button */}
                            <button
                                onClick={() => navigate('/')}
                                title="Go to Home"
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    background: 'rgba(56,189,248,0.08)',
                                    border: '1px solid rgba(56,189,248,0.25)',
                                    borderRadius: 8, padding: '5px 12px',
                                    color: 'var(--cyan)', fontSize: 12, fontWeight: 600,
                                    cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(56,189,248,0.18)'; e.currentTarget.style.borderColor = 'rgba(56,189,248,0.5)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(56,189,248,0.08)'; e.currentTarget.style.borderColor = 'rgba(56,189,248,0.25)'; }}
                            >
                             Home ➤
                            </button>
                            {/* Avatar */}
                            <div style={{
                                width: 32, height: 32, borderRadius: '50%',
                                background: 'linear-gradient(135deg,#38bdf8,#818cf8)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 13, fontWeight: 700, color: '#000', flexShrink: 0,
                            }}>R</div>
                        </div>
                    </div>


                    {/* Row 2: full sensor data strip */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
                        paddingTop: 6, borderTop: '1px solid rgba(255,255,255,0.07)', width: '100%',
                    }}>
                        {/* Section label */}
                        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginRight: 4 }}>
                            Live Sensor
                        </span>

                        {/* Sensor readings */}
                        {[
                            { emoji: '🌡', label: 'Temp', value: `${sensor.temperature}°C`, color: '#fb923c' },
                            { emoji: '💧', label: 'Humid', value: `${sensor.humidity}%`, color: '#38bdf8' },
                            { emoji: '⚡', label: 'Resist', value: `${sensor.resistance}Ω`, color: '#a78bfa' },
                        ].map(s => (
                            <div key={s.label} style={{
                                display: 'flex', alignItems: 'center', gap: 5,
                                background: 'rgba(255,255,255,0.04)',
                                border: `1px solid ${s.color}35`,
                                borderRadius: 20, padding: '3px 12px',
                                fontSize: 12, fontFamily: 'var(--font-mono)',
                                fontWeight: 700, color: s.color, whiteSpace: 'nowrap',
                            }}>
                                <span>{s.emoji}</span>
                                <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 400 }}>{s.label}</span>
                                <span>{s.value}</span>
                            </div>
                        ))}

                        {/* Divider */}
                        <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 4px' }} />

                        {/* Default cement */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 5,
                            background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.25)',
                            borderRadius: 20, padding: '3px 12px', whiteSpace: 'nowrap',
                        }}>
                            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Cement</span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--cyan)', fontFamily: 'var(--font-mono)' }}>{cementLabel}</span>
                        </div>

                        {/* LIVE / MOCK badge */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 5, marginLeft: 'auto',
                            background: sensorLive ? 'rgba(74,222,128,0.12)' : 'rgba(148,163,184,0.1)',
                            border: `1px solid ${sensorLive ? 'rgba(74,222,128,0.35)' : 'rgba(148,163,184,0.2)'}`,
                            borderRadius: 20, padding: '3px 12px', fontSize: 11, fontWeight: 700,
                            color: sensorLive ? 'var(--green)' : 'var(--text-muted)',
                        }}>
                            <span style={{
                                width: 6, height: 6, borderRadius: '50%', display: 'inline-block',
                                background: sensorLive ? 'var(--green)' : 'var(--text-muted)',
                                animation: sensorLive ? 'blink 2s infinite' : 'none',
                            }} />
                            {sensorLive ? 'LIVE' : 'MOCK'}
                        </div>
                    </div>
                </div>

                <div className="page-wrapper">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

