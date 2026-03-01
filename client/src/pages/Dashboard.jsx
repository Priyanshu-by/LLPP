import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Clock, AlertTriangle, Radio, Plus, X, CloudSun, WifiOff } from 'lucide-react';

const API = 'http://localhost:5000/api';

const MOCK_ALERTS = [
    { id: 1, icon: '🟢', text: 'Slab S-12 will reach safe de-mould strength in 3.5 hrs', time: '2 min ago', type: 'success' },
    { id: 2, icon: '🟡', text: 'Beam B-07: High humidity slowing curing — add ventilation', time: '8 min ago', type: 'warning' },
    { id: 3, icon: '🔵', text: 'Column C-03 analysis complete. 28d strength: 42 MPa estimated', time: '22 min ago', type: 'info' },
    { id: 4, icon: '🟢', text: 'Slab S-11 successfully de-moulded. 9 hrs saved vs traditional', time: '1 hr ago', type: 'success' },
];

const INIT_ELEMENTS = [
    { id: 'S-12', type: 'Slab', status: 'Curing', progress: 68, eta: '3.5h', strength: '14.2 MPa', cement: 'OPC53' },
    { id: 'B-07', type: 'Beam', status: 'Ready to De-mould', progress: 95, eta: 'Now', strength: '21.8 MPa', cement: 'OPC53' },
    { id: 'S-13', type: 'Slab', status: 'Casting', progress: 5, eta: '26h', strength: '1.2 MPa', cement: 'OPC43' },
    { id: 'C-03', type: 'Column', status: 'Completed', progress: 100, eta: '—', strength: '38.4 MPa', cement: 'PPC' },
];

const STATUS_OPTIONS = ['Casting', 'Curing', 'Ready to De-mould', 'Completed'];

function statusBadge(status) {
    const map = { 'Curing': 'badge-cyan', 'Ready to De-mould': 'badge-green', 'Casting': 'badge-orange', 'Completed': 'badge-purple' };
    return <span className={`badge ${map[status] || 'badge-cyan'}`}>● {status}</span>;
}

// ── Add Element Modal ──────────────────────────────────────────────────────
function AddElementModal({ onClose, onAdd }) {
    const [form, setForm] = useState({
        id: '', type: 'Slab', cement: 'OPC53',
        length: 6, breadth: 1.2, height: 0.2,
        status: 'Casting',
    });
    const [err, setErr] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.id.trim()) { setErr('Element ID is required'); return; }
        const newEl = {
            id: form.id.trim().toUpperCase(),
            type: form.type,
            status: form.status,
            progress: form.status === 'Casting' ? 5 : form.status === 'Curing' ? 40 : form.status === 'Ready to De-mould' ? 95 : 100,
            eta: form.status === 'Casting' ? '28h' : form.status === 'Curing' ? '12h' : form.status === 'Ready to De-mould' ? 'Now' : '—',
            strength: form.status === 'Casting' ? '0.0 MPa' : '—',
            cement: form.cement,
            length: +form.length, breadth: +form.breadth, height: +form.height,
        };
        onAdd(newEl);
        onClose();
    };

    const upd = (k, v) => { setErr(''); setForm(f => ({ ...f, [k]: v })); };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(7,9,15,0.85)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'fade-in 0.2s ease',
        }}>
            <div style={{
                background: 'var(--bg-card)', border: '1px solid var(--border-active)',
                borderRadius: 'var(--radius-xl)', padding: 32, width: '100%', maxWidth: 520,
                boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
                animation: 'slide-up 0.25s ease',
            }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: 18 }}>➕ Add New Element</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>Register a new precast element for tracking</div>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
                        <X size={20} />
                    </button>
                </div>

                {err && <div className="alert-banner warning" style={{ marginBottom: 16 }}><span>⚠️</span>{err}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-grid-2">
                        <div className="form-group">
                            <label className="form-label">Element ID <span style={{ color: 'var(--orange)' }}>*</span></label>
                            <input className="form-input" placeholder="e.g. S-14" value={form.id} onChange={e => upd('id', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Element Type</label>
                            <select className="form-select" value={form.type} onChange={e => upd('type', e.target.value)}>
                                <option>Slab</option>
                                <option>Beam</option>
                                <option>Column</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-grid-2">
                        <div className="form-group">
                            <label className="form-label">Cement Type</label>
                            <select className="form-select" value={form.cement} onChange={e => upd('cement', e.target.value)}>
                                <option value="OPC43">OPC 43</option>
                                <option value="OPC53">OPC 53</option>
                                <option value="PPC">PPC</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Initial Status</label>
                            <select className="form-select" value={form.status} onChange={e => upd('status', e.target.value)}>
                                {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                        <div className="form-label" style={{ marginBottom: 10 }}>📐 Dimensions</div>
                        <div className="form-grid-3">
                            {[['length', 'Length (m)', 0.1, 0.1], ['breadth', 'Breadth (m)', 0.1, 0.1], ['height', 'Height (m)', 0.05, 0.01]].map(([k, lbl, min, step]) => (
                                <div key={k} className="form-group">
                                    <label className="form-label" style={{ fontSize: 11 }}>{lbl}</label>
                                    <input className="form-input" type="number" value={form[k]} min={min} step={step} onChange={e => upd(k, e.target.value)} />
                                </div>
                            ))}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                            Volume: <strong>{(+form.length * +form.breadth * +form.height).toFixed(3)} m³</strong>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                        <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                        <button type="submit" className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }}>
                            ➕ Add to Dashboard
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────
export default function Dashboard() {
    const [sensor, setSensor] = useState({ temperature: 27.5, humidity: 68, resistance: 920 });
    const [weather, setWeather] = useState({ temp: null, humidity: null, status: 'loading' }); // live weather
    const [elements, setElements] = useState(INIT_ELEMENTS);
    const [showModal, setShowModal] = useState(false);
    const [alerts, setAlerts] = useState(MOCK_ALERTS);

    // 1️⃣  Live weather (temp + humidity from Open-Meteo)
    useEffect(() => {
        if (!navigator.geolocation) { setWeather(w => ({ ...w, status: 'error' })); return; }
        navigator.geolocation.getCurrentPosition(
            async ({ coords }) => {
                try {
                    const { latitude: lat, longitude: lon } = coords;
                    const res = await fetch(
                        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m&timezone=auto`
                    );
                    const json = await res.json();
                    const cur = json.current;
                    setWeather({ temp: cur.temperature_2m, humidity: cur.relative_humidity_2m, status: 'live' });
                    // Also update sensor display for temp/humidity
                    setSensor(prev => ({
                        ...prev,
                        temperature: parseFloat(cur.temperature_2m.toFixed(1)),
                        humidity: Math.round(cur.relative_humidity_2m),
                    }));
                } catch { setWeather(w => ({ ...w, status: 'error' })); }
            },
            () => setWeather(w => ({ ...w, status: 'error' })),
            { timeout: 8000 }
        );
    }, []);

    // 2️⃣  Mock sensor (resistance updates every 4s; temp/humidity only if no live weather)
    useEffect(() => {
        const fetchSensor = async () => {
            try {
                const res = await fetch(`${API}/sensor/live`);
                const json = await res.json();
                if (json.success) {
                    setSensor(prev => ({
                        ...prev,
                        resistance: json.data.resistance,
                        ...(weather.status !== 'live' ? { temperature: json.data.temperature, humidity: json.data.humidity } : {}),
                    }));
                }
            } catch { }
        };
        fetchSensor();
        const iv = setInterval(fetchSensor, 4000);
        return () => clearInterval(iv);
    }, [weather.status]);

    // Persist a completed element to localStorage so Records page picks it up
    const saveToRecords = (el) => {
        try {
            const RECORDS_KEY = 'apie_completed_records';
            const existing = JSON.parse(localStorage.getItem(RECORDS_KEY) || '[]');
            const already = existing.find(r => r.elementId === el.id);
            if (!already) {
                const record = {
                    _id: `DASH-${el.id}-${Date.now()}`,
                    elementId: el.id,
                    elementType: el.type,
                    cementType: el.cement || 'OPC53',
                    settingTime: el.length && el.height ? Math.round(25 + el.height * 20) : 28,
                    deMouldTime: el.length && el.height ? Math.round(20 + el.height * 16) : 22,
                    hoursSaved: el.length && el.height ? Math.round(10 - el.height * 5) : 8,
                    status: 'Completed',
                    confidenceScore: Math.round(82 + Math.random() * 12),
                    createdAt: new Date().toISOString(),
                };
                localStorage.setItem(RECORDS_KEY, JSON.stringify([record, ...existing]));
            }
        } catch { }
    };

    const handleAddElement = (el) => {
        setElements(prev => [el, ...prev]);
        if (el.status === 'Completed') saveToRecords(el);
        setAlerts(prev => [{
            id: Date.now(), icon: '🔵',
            text: `${el.type} ${el.id} added to dashboard — status: ${el.status}`,
            time: 'Just now', type: 'info'
        }, ...prev]);
    };

    // Update element status; if marked Completed → push to Records
    const updateStatus = (id, newStatus) => {
        setElements(prev => prev.map(e => {
            if (e.id !== id) return e;
            const updated = {
                ...e, status: newStatus,
                progress: newStatus === 'Completed' ? 100 : newStatus === 'Ready to De-mould' ? 95 : newStatus === 'Curing' ? 50 : 10,
                eta: newStatus === 'Completed' ? '—' : newStatus === 'Ready to De-mould' ? 'Now' : newStatus === 'Curing' ? '12h' : '28h',
            };
            if (newStatus === 'Completed') saveToRecords(updated);
            return updated;
        }));
    };

    const removeElement = (id) => setElements(prev => prev.filter(e => e.id !== id));

    // Animated SVG icon components for KPI cards
    const KpiIcon = ({ type, color }) => {
        const wrap = {
            width: 52, height: 52, borderRadius: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 14, position: 'relative', overflow: 'visible',
            background: `${color}18`,
            border: `1.5px solid ${color}40`,
            boxShadow: `0 0 18px ${color}30`,
        };
        if (type === 'curing') return (
            <div style={wrap}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" style={{ animation: 'kpi-breathe 2s ease-in-out infinite' }}>
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill={`${color}25`} />
                    <path d="M12 6v6l4 2" stroke={color} strokeWidth="2" strokeLinecap="round" />
                    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" fill="none" strokeDasharray="4 2"
                        style={{ animation: 'kpi-spin 8s linear infinite', transformOrigin: 'center' }} />
                    <circle cx="12" cy="12" r="3" fill={color} style={{ animation: 'kpi-breathe 2s ease-in-out infinite' }} />
                </svg>
                <span style={{ position: 'absolute', inset: -4, borderRadius: 20, border: `1px solid ${color}30`, animation: 'kpi-ping 2.2s ease-out infinite' }} />
            </div>
        );
        if (type === 'demould') return (
            <div style={wrap}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" style={{ animation: 'kpi-bounce 1.4s ease-in-out infinite' }}>
                    <path d="M20 6L9 17l-5-5" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" fill={`${color}20`} />
                </svg>
            </div>
        );
        if (type === 'total') return (
            <div style={wrap}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" style={{ animation: 'kpi-float 2.5s ease-in-out infinite' }}>
                    <rect x="3" y="3" width="7" height="7" rx="2" fill={`${color}40`} stroke={color} strokeWidth="1.5" />
                    <rect x="14" y="3" width="7" height="7" rx="2" fill={`${color}25`} stroke={color} strokeWidth="1.5" />
                    <rect x="3" y="14" width="7" height="7" rx="2" fill={`${color}25`} stroke={color} strokeWidth="1.5" />
                    <rect x="14" y="14" width="7" height="7" rx="2" fill={`${color}40`} stroke={color} strokeWidth="1.5" />
                </svg>
            </div>
        );
        if (type === 'sensors') return (
            <div style={wrap}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="3" fill={color} style={{ animation: 'kpi-breathe 1.6s ease-in-out infinite' }} />
                    <circle cx="12" cy="12" r="6" stroke={color} strokeWidth="1.2" fill="none" strokeOpacity="0.5"
                        style={{ animation: 'kpi-ping 1.6s ease-out infinite' }} />
                    <circle cx="12" cy="12" r="9.5" stroke={color} strokeWidth="1" fill="none" strokeOpacity="0.25"
                        style={{ animation: 'kpi-ping 1.6s ease-out infinite 0.4s' }} />
                    <line x1="12" y1="2" x2="12" y2="5" stroke={color} strokeWidth="2" strokeLinecap="round" style={{ animation: 'kpi-spin 4s linear infinite', transformOrigin: '12px 12px' }} />
                </svg>
                <span style={{ position: 'absolute', inset: -6, borderRadius: 22, border: `1px solid ${color}20`, animation: 'kpi-ping 2.5s ease-out infinite 0.8s' }} />
            </div>
        );
        return null;
    };

    const kpis = [
        { label: 'Slabs in Curing', value: elements.filter(e => e.status === 'Curing').length, icon: 'curing', color: '#38bdf8' },
        { label: 'Ready to De-mould', value: elements.filter(e => e.status === 'Ready to De-mould').length, icon: 'demould', color: '#4ade80' },
        { label: 'Total Elements', value: elements.length, icon: 'total', color: '#fb923c' },
        { label: 'Active Sensors', value: elements.filter(e => e.status !== 'Completed').length, icon: 'sensors', color: '#a78bfa' },
    ];

    return (
        <div className="fade-in">
            {showModal && <AddElementModal onClose={() => setShowModal(false)} onAdd={handleAddElement} />}

            <div className="page-title">Dashboard</div>
            <p className="page-sub">Central command center for your precast yard operations</p>

            {/* KPI Row */}
            <div className="kpi-grid" style={{ marginBottom: 28 }}>
                {kpis.map(k => (
                    <div key={k.label} className="kpi-card" style={{ position: 'relative', overflow: 'hidden' }}>
                        {/* Subtle color bleed background */}
                        <div style={{
                            position: 'absolute', bottom: -20, right: -20,
                            width: 90, height: 90, borderRadius: '50%',
                            background: `radial-gradient(circle, ${k.color}18 0%, transparent 70%)`,
                            pointerEvents: 'none',
                        }} />
                        <div style={{ padding: 0, border: 'none', background: 'transparent' }}>
                            <KpiIcon type={k.icon} color={k.color} />
                            <div className="label">{k.label}</div>
                            <div className="value" style={{ color: k.color, fontSize: 38, marginTop: 4 }}>{k.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid-2" style={{ marginBottom: 28 }}>
                {/* Live Sensor + Weather Feed */}
                <div className="card">
                    <div className="section-header">
                        <div>
                            <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Radio size={16} color="var(--cyan)" /> Live Sensor Feed
                            </div>
                            <div className="section-sub">SLAB-001 · Updates every 4s</div>
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                            {weather.status === 'live' && <span className="badge badge-green" style={{ gap: 4, fontSize: 10 }}><CloudSun size={10} /> Weather API</span>}
                            {weather.status === 'error' && <span className="badge badge-orange" style={{ gap: 4, fontSize: 10 }}><WifiOff size={10} /> Mock</span>}
                            <span className="badge badge-green">● LIVE</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 12 }}>
                        {[
                            { label: '🌡 Temp', value: `${sensor.temperature}°C`, color: 'var(--orange)', sub: weather.status === 'live' ? '🌤 Weather API' : 'Sensor Mock' },
                            { label: '💧 Humidity', value: `${sensor.humidity}%`, color: 'var(--cyan)', sub: weather.status === 'live' ? '🌤 Weather API' : 'Sensor Mock' },
                            { label: '⚡ Resistance', value: `${sensor.resistance}Ω`, color: 'var(--purple)', sub: 'Sensor Mock' },
                        ].map(s => (
                            <div key={s.label} style={{ flex: 1, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: '14px', textAlign: 'center' }}>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>{s.label}</div>
                                <div style={{ fontSize: 22, fontWeight: 800, color: s.color, fontFamily: 'var(--font-mono)' }}>{s.value}</div>
                                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>{s.sub}</div>
                            </div>
                        ))}
                    </div>

                    {weather.status === 'live' && (
                        <div className="alert-banner success" style={{ marginTop: 12, marginBottom: 0 }}>
                            <span>🌤</span>
                            <span style={{ fontSize: 12 }}>
                                Live weather: <strong>{weather.temp}°C</strong>, <strong>{weather.humidity}%</strong> humidity at your location
                            </span>
                        </div>
                    )}

                    <div style={{ marginTop: 12 }}>
                        <Link to="/smart-slab" className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                            Open Smart Slab →
                        </Link>
                    </div>
                </div>

                {/* AI Alerts */}
                <div className="card">
                    <div className="section-header">
                        <div>
                            <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <AlertTriangle size={16} color="var(--yellow)" /> AI Alerts
                            </div>
                            <div className="section-sub">Latest intelligence updates</div>
                        </div>
                    </div>
                    <div style={{ maxHeight: 240, overflowY: 'auto' }}>
                        {alerts.map(alert => (
                            <div key={alert.id} className="ai-alert">
                                <span className="ai-alert-icon">{alert.icon}</span>
                                <div style={{ flex: 1 }}>
                                    <div className="ai-alert-text">{alert.text}</div>
                                    <div className="ai-alert-time">{alert.time}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Active Elements Table */}
            <div className="card">
                <div className="section-header">
                    <div>
                        <div className="section-title">Active Elements</div>
                        <div className="section-sub">{elements.length} element{elements.length !== 1 ? 's' : ''} tracked</div>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <Link to="/records" className="btn btn-secondary btn-sm">View All Records</Link>
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={() => setShowModal(true)}
                            style={{ gap: 6 }}
                        >
                            <Plus size={14} /> Add Element
                        </button>
                    </div>
                </div>

                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Element ID</th>
                            <th>Type</th>
                            <th>Cement</th>
                            <th>Status</th>
                            <th>Curing Progress</th>
                            <th>Strength</th>
                            <th>ETA</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {elements.map(el => (
                            <tr key={el.id}>
                                <td><span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--cyan)' }}>{el.id}</span></td>
                                <td style={{ color: 'var(--text-secondary)' }}>{el.type}</td>
                                <td><span className="badge" style={{ fontSize: 10, background: 'rgba(56,189,248,0.1)', color: 'var(--cyan)', border: '1px solid rgba(56,189,248,0.2)' }}>{el.cement || '—'}</span></td>
                                <td>{statusBadge(el.status)}</td>
                                <td>
                                    {/* Inline status selector — selecting Completed saves to Records */}
                                    <select
                                        value={el.status}
                                        onChange={e => updateStatus(el.id, e.target.value)}
                                        style={{
                                            background: 'var(--bg-secondary)', color: 'var(--text-primary)',
                                            border: '1px solid var(--border)', borderRadius: 6,
                                            padding: '4px 8px', fontSize: 12, cursor: 'pointer',
                                        }}
                                    >
                                        {['Casting', 'Curing', 'Ready to De-mould', 'Completed'].map(s => (
                                            <option key={s}>{s}</option>
                                        ))}
                                    </select>
                                </td>
                                <td style={{ minWidth: 140 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <div className="progress-bar-wrap" style={{ flex: 1 }}>
                                            <div className="progress-bar" style={{
                                                width: `${el.progress}%`,
                                                background: el.progress >= 95 ? 'var(--green)' : el.progress >= 60 ? 'var(--cyan)' : 'var(--orange)'
                                            }} />
                                        </div>
                                        <span style={{ fontSize: 12, color: 'var(--text-muted)', width: 36 }}>{el.progress}%</span>
                                    </div>
                                </td>
                                <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--cyan)', fontSize: 13 }}>{el.strength}</td>
                                <td style={{ color: el.eta === 'Now' ? 'var(--green)' : 'var(--text-secondary)', fontWeight: el.eta === 'Now' ? 700 : 400 }}>{el.eta}</td>
                                <td>
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        <Link to="/analysis" className="btn btn-secondary btn-sm">Analyze</Link>
                                        <button
                                            onClick={() => removeElement(el.id)}
                                            style={{ background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 6, color: 'var(--red)', cursor: 'pointer', padding: '4px 8px', fontSize: 12 }}
                                            title="Remove element"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {elements.length === 0 && (
                            <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>
                                No elements tracked. Click <strong>+ Add Element</strong> to get started.
                            </td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Quick nav cards */}
            <div className="grid-3" style={{ marginTop: 24 }}>
                {[
                    { title: 'Smart Slab Sensor', desc: 'Run IoT-connected AI analysis', link: '/smart-slab', color: 'var(--cyan)', emoji: '📡' },
                    { title: 'Digital Twin', desc: 'Visualize slab in 3D with live data', link: '/digital-twin', color: 'var(--purple)', emoji: '🧬' },
                    { title: 'Analytics', desc: 'Compare cycles, savings, optimization', link: '/analytics', color: 'var(--orange)', emoji: '📈' },
                ].map(n => (
                    <Link key={n.title} to={n.link} style={{ textDecoration: 'none' }}>
                        <div className="card" style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = n.color}
                            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                        >
                            <div style={{ fontSize: 28, marginBottom: 10 }}>{n.emoji}</div>
                            <div style={{ fontWeight: 700, marginBottom: 4 }}>{n.title}</div>
                            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{n.desc}</div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
