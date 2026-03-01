import { useState, useEffect } from 'react';

const API = 'http://localhost:5000/api';
const STORAGE_KEY = 'constructai_settings';

// ── Defaults (targetStrength removed per user request) ─────────────────────
const DEFAULTS = {
    defaultCement: 'OPC53',
    tempOffset: 0,
    humidityOffset: 0,
    resistanceOffset: 0,
    traditionalSlab: 32,
    traditionalBeam: 30,
    traditionalColumn: 36,
    darkMode: true,
    emailAlerts: true,
    deMouldAlerts: true,
};

// ── Toggle — outside page so it never remounts ─────────────────────────────
function Toggle({ value, onChange }) {
    return (
        <button
            type="button" role="switch" aria-checked={value}
            onClick={() => onChange(!value)}
            style={{
                width: 52, height: 28, borderRadius: 14,
                border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0, outline: 'none',
                background: value
                    ? 'linear-gradient(90deg, #38bdf8, #818cf8)'
                    : 'rgba(128,128,128,0.25)',
                boxShadow: value ? '0 0 14px rgba(56,189,248,0.45)' : 'inset 0 0 0 1px rgba(128,128,128,0.3)',
                transition: 'background 0.25s, box-shadow 0.25s',
            }}
        >
            <span style={{
                position: 'absolute', top: 4,
                left: value ? 26 : 4,
                width: 20, height: 20, borderRadius: '50%',
                background: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,0.35)',
                transition: 'left 0.22s cubic-bezier(0.4,0,0.2,1)',
                display: 'block',
            }} />
        </button>
    );
}

function ToggleRow({ label, desc, value, onChange }) {
    return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 0', borderBottom: '1px solid var(--border)',
        }}>
            <div style={{ flex: 1, marginRight: 16 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{label}</div>
                {desc && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{desc}</div>}
            </div>
            <Toggle value={value} onChange={onChange} />
        </div>
    );
}

// ── Toast notification ─────────────────────────────────────────────────────
function Toast({ message, type }) {
    const colors = { success: 'var(--green)', info: 'var(--cyan)', error: 'var(--red)' };
    const icons = { success: '✅', info: 'ℹ️', error: '❌' };
    return (
        <div style={{
            position: 'fixed', bottom: 32, right: 32, zIndex: 9999,
            background: 'var(--bg-card)', border: `1px solid ${colors[type]}`,
            borderRadius: 12, padding: '14px 20px',
            display: 'flex', alignItems: 'center', gap: 10,
            boxShadow: `0 8px 32px rgba(0,0,0,0.4)`,
            minWidth: 260, animation: 'fade-in 0.3s ease',
        }}>
            <span style={{ fontSize: 18 }}>{icons[type]}</span>
            <span style={{ fontWeight: 600, color: colors[type], fontSize: 14 }}>{message}</span>
        </div>
    );
}

// ── Settings page ──────────────────────────────────────────────────────────
export default function Settings() {
    const [settings, setSettings] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? { ...DEFAULTS, ...JSON.parse(saved) } : DEFAULTS;
        } catch { return DEFAULTS; }
    });
    const [toast, setToast] = useState(null);
    const [synced, setSynced] = useState(false); // true = just backend-synced

    // ① Apply dark/light theme to the whole app on every darkMode change
    useEffect(() => {
        document.documentElement.setAttribute(
            'data-theme',
            settings.darkMode ? 'dark' : 'light'
        );
    }, [settings.darkMode]);

    // ② Auto-save to localStorage on ANY settings change (instant, no button needed)
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        } catch { }
        setSynced(false); // mark as needing backend sync
    }, [settings]);

    const update = (key, val) => setSettings(s => ({ ...s, [key]: val }));

    const showToast = (msg, type = 'success') => {
        setToast({ message: msg, type });
        setTimeout(() => setToast(null), 2500);
    };

    // Sync to backend on demand
    const syncBackend = async () => {
        try {
            await fetch(`${API}/settings`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    defaultCementType: settings.defaultCement,
                    sensorCalibrationOffset: {
                        temperature: settings.tempOffset,
                        humidity: settings.humidityOffset,
                        resistance: settings.resistanceOffset,
                    },
                    traditionalCuringHours: {
                        Slab: settings.traditionalSlab,
                        Beam: settings.traditionalBeam,
                        Column: settings.traditionalColumn,
                    },
                    notifications: { emailAlerts: settings.emailAlerts, deMouldReady: settings.deMouldAlerts },
                    darkMode: settings.darkMode,
                }),
            });
            showToast('Synced to server!', 'success');
        } catch {
            showToast('Saved locally (server offline)', 'info');
        }
        setSynced(true);
    };

    const reset = () => {
        setSettings(DEFAULTS);
        showToast('Reset to defaults', 'info');
    };

    return (
        <div className="fade-in">
            {toast && <Toast message={toast.message} type={toast.type} />}

            {/* Header */}
            <div style={{ marginBottom: 4 }}>
                <div className="page-title">Settings &amp; Configuration</div>
                <p className="page-sub">Changes save automatically to your browser storage</p>
            </div>

            <div className="grid-2" style={{ gap: 24, marginBottom: 24 }}>
                {/* ── Cement & Baselines ── */}
                <div className="card">
                    <div className="section-title" style={{ marginBottom: 20 }}>🧪 Cement &amp; Baseline Settings</div>

                    <div className="form-group">
                        <label className="form-label">Default Cement Type</label>
                        <select
                            className="form-select"
                            value={settings.defaultCement}
                            onChange={e => update('defaultCement', e.target.value)}
                        >
                            <option value="OPC43">OPC 43 Grade</option>
                            <option value="OPC53">OPC 53 Grade</option>
                            <option value="PPC">PPC</option>
                        </select>
                    </div>

                    <div className="section-title" style={{ marginBottom: 12, marginTop: 20 }}>⏱️ Traditional Baseline (hours)</div>
                    <div className="form-grid-3">
                        {[
                            ['Slab', 'traditionalSlab'],
                            ['Beam', 'traditionalBeam'],
                            ['Column', 'traditionalColumn'],
                        ].map(([label, key]) => (
                            <div key={key} className="form-group">
                                <label className="form-label">{label}</label>
                                <input
                                    className="form-input" type="number"
                                    value={settings[key]}
                                    onChange={e => update(key, +e.target.value)}
                                    min={10} max={72}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="alert-banner info" style={{ marginBottom: 0, marginTop: 8 }}>
                        <span>ℹ️</span>
                        <span style={{ fontSize: 12 }}>Baseline hours are used to calculate how many hours Construct AI saves per cycle.</span>
                    </div>
                </div>

                {/* ── Sensor Calibration ── */}
                <div className="card">
                    <div className="section-title" style={{ marginBottom: 20 }}>📡 Sensor Calibration (Offset)</div>

                    {[
                        ['Temperature Offset (°C)', 'tempOffset', 0.1, -10, 10],
                        ['Humidity Offset (%)', 'humidityOffset', 0.1, -20, 20],
                        ['Resistance Offset (Ω)', 'resistanceOffset', 1, -200, 200],
                    ].map(([label, key, step, min, max]) => (
                        <div key={key} className="form-group">
                            <label className="form-label">{label}</label>
                            <input
                                className="form-input" type="number"
                                value={settings[key]}
                                onChange={e => update(key, +e.target.value)}
                                step={step} min={min} max={max}
                            />
                        </div>
                    ))}

                    <div className="alert-banner info" style={{ marginBottom: 0 }}>
                        <span>ℹ️</span>
                        <span style={{ fontSize: 12 }}>Offsets are applied to raw sensor readings before AI analysis runs.</span>
                    </div>
                </div>
            </div>

            {/* ── Preferences / Toggles ── */}
            <div className="card" style={{ marginBottom: 24 }}>
                <div className="section-title" style={{ marginBottom: 4 }}>⚙️ Preferences</div>

                <ToggleRow
                    label="Dark Mode"
                    desc="Toggle between dark (default) and light theme — takes effect instantly"
                    value={settings.darkMode}
                    onChange={v => update('darkMode', v)}
                />
                <ToggleRow
                    label="Email Alerts"
                    desc="Receive AI prediction and de-mould alerts via email"
                    value={settings.emailAlerts}
                    onChange={v => update('emailAlerts', v)}
                />
                <ToggleRow
                    label="De-mould Ready Notifications"
                    desc="Alert when element reaches safe de-moulding strength"
                    value={settings.deMouldAlerts}
                    onChange={v => update('deMouldAlerts', v)}
                />
            </div>

            {/* ── Live preview ── */}
            <div className="card" style={{ marginBottom: 24, background: 'var(--bg-secondary)' }}>
                <div className="section-title" style={{ marginBottom: 12, fontSize: 13 }}>📋 Current Configuration</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                    {[
                        ['Default Cement', settings.defaultCement],
                        ['Slab Baseline', `${settings.traditionalSlab}h`],
                        ['Beam Baseline', `${settings.traditionalBeam}h`],
                        ['Column Baseline', `${settings.traditionalColumn}h`],
                        ['Temp Offset', `${settings.tempOffset >= 0 ? '+' : ''}${settings.tempOffset}°C`],
                        ['Humidity Offset', `${settings.humidityOffset >= 0 ? '+' : ''}${settings.humidityOffset}%`],
                        ['Resistance Offset', `${settings.resistanceOffset >= 0 ? '+' : ''}${settings.resistanceOffset}Ω`],
                        ['Theme', settings.darkMode ? '🌙 Dark' : '☀️ Light'],
                    ].map(([k, v]) => (
                        <div key={k} style={{ background: 'var(--bg-card)', borderRadius: 8, padding: '10px 12px' }}>
                            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 3 }}>{k}</div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--cyan)', fontSize: 13 }}>{v}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Reset button ── */}
            <button
                onClick={reset}
                style={{
                    width: '100%',
                    padding: '18px 32px',
                    fontSize: 16,
                    fontWeight: 800,
                    fontFamily: 'var(--font-main)',
                    border: 'none',
                    borderRadius: 'var(--radius-lg)',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    background: 'linear-gradient(135deg, #7dd3fc 0%, #38bdf8 50%, #818cf8 100%)',
                    backgroundSize: '200% 200%',
                    color: '#000',
                    boxShadow: '0 4px 24px rgba(56,189,248,0.45), 0 1px 4px rgba(0,0,0,0.2)',
                    transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                    letterSpacing: 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                }}
                onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 36px rgba(56,189,248,0.6), 0 2px 8px rgba(0,0,0,0.2)';
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 24px rgba(56,189,248,0.45), 0 1px 4px rgba(0,0,0,0.2)';
                }}
                onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.98)'; }}
                onMouseUp={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
            >
                <span style={{
                    fontSize: 20,
                    display: 'inline-block',
                    transition: 'transform 0.4s ease',
                }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'rotate(-180deg)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'rotate(0deg)'; }}
                >↺</span>
                Reset to Defaults
                {/* Shimmer overlay */}
                <span style={{
                    position: 'absolute', inset: 0, borderRadius: 'inherit',
                    background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.25) 50%, transparent 60%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 2.5s linear infinite',
                    pointerEvents: 'none',
                }} />
            </button>
        </div>
    );
}
