import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cpu, CloudSun, WifiOff } from 'lucide-react';

const API = 'http://localhost:5000/api';

// ── Open-Meteo weather fetch (free, no API key) ───────────────────────────
async function fetchLiveWeather() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) return reject(new Error('Geolocation not supported'));
        navigator.geolocation.getCurrentPosition(
            async ({ coords }) => {
                const { latitude: lat, longitude: lon } = coords;
                const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
                    `&current=temperature_2m,relative_humidity_2m&timezone=auto`;
                const res = await fetch(url);
                const json = await res.json();
                const current = json.current;
                resolve({
                    temperature: parseFloat(current.temperature_2m.toFixed(1)),
                    humidity: Math.round(current.relative_humidity_2m),
                    source: 'live',
                    location: `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`,
                });
            },
            (err) => reject(err),
            { timeout: 8000 }
        );
    });
}

// ── Sensor Gauge Panel component ──────────────────────────────────────────
function SensorPanel({ sensor, weatherStatus }) {
    const gauges = [
        { label: '🌡 Temperature', value: sensor.temperature, unit: '°C', color: 'var(--orange)', min: 0, max: 50 },
        { label: '💧 Humidity', value: sensor.humidity, unit: '%', color: 'var(--cyan)', min: 0, max: 100 },
        { label: '⚡ Resistance', value: sensor.resistance, unit: 'Ω', color: 'var(--purple)', min: 0, max: 2000 },
    ];

    return (
        <div className="card" style={{ marginBottom: 24 }}>
            <div className="section-header">
                <div>
                    <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ color: 'var(--green)', animation: 'blink 1.5s infinite' }}>◉</span>
                        Connected Slab Sensor (ESP32-S3 Sim)
                    </div>
                    <div className="section-sub">
                        {weatherStatus === 'live'
                            ? '🌤 Temp & Humidity from live weather API · Resistance from sensor'
                            : weatherStatus === 'loading'
                                ? '⏳ Fetching live weather data…'
                                : '📡 Mock sensor feed (weather API unavailable)'}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {weatherStatus === 'live' && (
                        <span className="badge badge-green" style={{ gap: 4 }}>
                            <CloudSun size={11} /> Live Weather
                        </span>
                    )}
                    {weatherStatus === 'error' && (
                        <span className="badge badge-orange" style={{ gap: 4 }}>
                            <WifiOff size={11} /> Mock Data
                        </span>
                    )}
                    <span className="badge badge-green">● TRANSMITTING</span>
                </div>
            </div>

            {/* ESP32 device + gauges */}
            <div style={{
                background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: 20, marginBottom: 20,
                border: '1px solid rgba(56,189,248,0.2)', display: 'flex', alignItems: 'center', gap: 20
            }}>
                {/* device chip */}
                <div style={{
                    width: 120, height: 80, background: '#0a1628',
                    border: '2px solid var(--cyan)', borderRadius: 8, position: 'relative', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 0 20px rgba(56,189,248,0.3)'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 10, color: 'var(--cyan)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>ESP32-S3</div>
                        <div style={{ fontSize: 18, marginTop: 2 }}>🔲</div>
                        <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>APIE v1.0</div>
                    </div>
                    <div style={{ position: 'absolute', top: 6, right: 6, width: 7, height: 7, borderRadius: '50%', background: 'var(--green)', animation: 'blink 1s infinite', boxShadow: '0 0 8px var(--green)' }} />
                    {[0, 1, 2, 3].map(i => <div key={i} style={{ position: 'absolute', left: -6, top: 14 + i * 14, width: 6, height: 4, background: '#888', borderRadius: 1 }} />)}
                    {[0, 1, 2, 3].map(i => <div key={i} style={{ position: 'absolute', right: -6, top: 14 + i * 14, width: 6, height: 4, background: '#888', borderRadius: 1 }} />)}
                </div>

                <div style={{ display: 'flex', gap: 12, flex: 1 }}>
                    {gauges.map(g => {
                        const pct = Math.min(100, ((g.value - g.min) / (g.max - g.min)) * 100);
                        return (
                            <div key={g.label} style={{ flex: 1, textAlign: 'center' }}>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>{g.label}</div>
                                <div style={{
                                    width: 64, height: 64, borderRadius: '50%', margin: '0 auto',
                                    border: `3px solid ${g.color}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexDirection: 'column', position: 'relative',
                                    boxShadow: `0 0 16px ${g.color}40`,
                                    background: `conic-gradient(${g.color} ${pct * 3.6}deg, var(--bg-primary) 0)`,
                                }}>
                                    <div style={{
                                        position: 'absolute', inset: 4, background: 'var(--bg-secondary)',
                                        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'
                                    }}>
                                        <div style={{ fontSize: 13, fontWeight: 800, color: g.color, fontFamily: 'var(--font-mono)', lineHeight: 1 }}>{g.value}</div>
                                        <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{g.unit}</div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Signal waveform */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 32 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginRight: 4, whiteSpace: 'nowrap' }}>Signal</span>
                {Array.from({ length: 48 }, (_, i) => {
                    const h = 4 + Math.abs(Math.sin(i * 0.5 + Date.now() / 500)) * 24;
                    return <div key={i} style={{ width: 3, height: h, borderRadius: 2, background: `hsl(${190 + i * 2},80%,60%)`, opacity: 0.7 + (i / 48) * 0.3 }} />;
                })}
            </div>
        </div>
    );
}

// ── Main SmartSlab page ───────────────────────────────────────────────────
export default function SmartSlab() {
    const navigate = useNavigate();
    const [sensor, setSensor] = useState({ temperature: 27.5, humidity: 68, resistance: 920 });
    const [weatherStatus, setWeatherStatus] = useState('loading'); // 'loading' | 'live' | 'error'
    const [loading, setLoading] = useState(false);

    // Load saved geometry from sessionStorage so inputs persist between pages
    const savedGeo = (() => {
        try { return JSON.parse(sessionStorage.getItem('apie_geometry') || '{}'); } catch { return {}; }
    })();

    const [form, setForm] = useState({
        cementType: savedGeo.cementType || 'OPC53',
        cement: savedGeo.cement || 400,
        sand: savedGeo.sand || 600,
        aggregate: savedGeo.aggregate || 1200,
        water: savedGeo.water || 160,
        length: savedGeo.length || 6,
        breadth: savedGeo.breadth || 1.2,
        height: savedGeo.height || 0.2,
        elementType: savedGeo.elementType || 'Slab',
    });

    // 1️⃣  Fetch live weather on mount (temp + humidity from Open-Meteo)
    useEffect(() => {
        setWeatherStatus('loading');
        fetchLiveWeather()
            .then(({ temperature, humidity }) => {
                setSensor(prev => ({ ...prev, temperature, humidity }));
                setWeatherStatus('live');
            })
            .catch(() => setWeatherStatus('error'));
    }, []);

    // 2️⃣  Fetch live resistance from backend sensor stream every 3 s
    useEffect(() => {
        const fetch_ = async () => {
            try {
                const res = await fetch(`${API}/sensor/live`);
                const json = await res.json();
                if (json.success) {
                    // Only update resistance from mock sensor; keep weather temp/humidity
                    setSensor(prev => ({
                        ...prev,
                        resistance: json.data.resistance,
                        // Only overwrite temp/humidity if we don't have live weather
                        ...(weatherStatus === 'error' ? {
                            temperature: json.data.temperature,
                            humidity: json.data.humidity,
                        } : {}),
                    }));
                }
            } catch { }
        };
        fetch_();
        const iv = setInterval(fetch_, 3000);
        return () => clearInterval(iv);
    }, [weatherStatus]);

    const wcRatio = (form.water / form.cement).toFixed(3);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // 3️⃣  Always persist geometry so DigitalTwin stays in sync
        const geometryPayload = {
            length: +form.length, breadth: +form.breadth, height: +form.height,
            elementType: form.elementType, cementType: form.cementType,
            cement: +form.cement, sand: +form.sand, aggregate: +form.aggregate, water: +form.water,
        };
        sessionStorage.setItem('apie_geometry', JSON.stringify(geometryPayload));

        try {
            const payload = {
                ...geometryPayload,
                temperature: sensor.temperature,
                humidity: sensor.humidity,
                resistance: sensor.resistance,
            };
            const res = await fetch(`${API}/predict`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const json = await res.json();
            if (json.success) {
                sessionStorage.setItem('apie_prediction', JSON.stringify(json.data));
                navigate('/analysis');
            } else {
                alert('Analysis failed: ' + json.error);
            }
        } catch {
            // Offline fallback — compute simple strength curve from actual inputs
            const wcR = +form.water / +form.cement;
            const h = +form.height;
            const factor = (sensor.temperature >= 20 && sensor.temperature <= 30 ? 1.0 : 0.88)
                * (sensor.humidity >= 60 ? 1.0 : 0.9)
                * (h <= 0.2 ? 1.0 : 0.94)
                * (wcR <= 0.45 ? 1.0 : 0.90);
            const peak = parseFloat((42 * factor).toFixed(2));
            const setT = parseFloat((29 / factor).toFixed(1));
            const deMT = parseFloat(Math.max(setT + 2, Math.min(48, setT * 1.6)).toFixed(1));
            const tradT = form.cementType === 'OPC53' ? 30 : form.cementType === 'OPC43' ? 32 : 36;
            const mockResult = {
                settingTime: setT,
                deMouldTime: deMT,
                traditionalTime: tradT,
                hoursSaved: parseFloat((tradT - deMT).toFixed(1)),
                peakStrength: peak,
                targetStrength: form.cementType === 'PPC' ? 18 : form.cementType === 'OPC43' ? 20 : 22,
                confidenceScore: Math.round(80 + factor * 14),
                cementType: form.cementType,
                elementType: form.elementType,
                wcRatio: parseFloat(wcR.toFixed(3)),
                strengthHistory: Array.from({ length: 73 }, (_, hour) => {
                    let pct;
                    const s2 = setT * 0.5, s3 = setT * 3;
                    if (hour <= s2) pct = (hour / s2) * 0.05;
                    else if (hour <= setT) pct = 0.05 + ((hour - s2) / s2) * 0.15;
                    else if (hour <= s3) pct = 0.20 + Math.log1p(((hour - setT) / (setT * 2)) * 6) / Math.log1p(6) * 0.55;
                    else pct = 0.75 + ((hour - s3) / (72 - s3)) * 0.25;
                    return { hour, strength: parseFloat((peak * Math.min(pct, 1)).toFixed(2)) };
                }),
                factors: { tempFactor: factor.toFixed(3), humidityFactor: (sensor.humidity >= 60 ? 1.0 : 0.9).toFixed(3), thicknessFactor: (h <= 0.2 ? 1.0 : 0.94).toFixed(3), wcFactor: (wcR <= 0.45 ? 1.0 : 0.90).toFixed(3) }
            };
            sessionStorage.setItem('apie_prediction', JSON.stringify(mockResult));
            navigate('/analysis');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fade-in">
            <div className="page-title">Smart Slab Sensor</div>
            <p className="page-sub">Configure your IoT-connected element and run AI analysis</p>

            <SensorPanel sensor={sensor} weatherStatus={weatherStatus} />

            <form onSubmit={handleSubmit}>
                <div className="grid-2" style={{ gap: 24, marginBottom: 24 }}>
                    {/* ── Mix Design ── */}
                    <div className="card">
                        <div className="section-title" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>🧪 Concrete Mix Design</div>

                        <div className="form-group">
                            <label className="form-label">Cement Type</label>
                            <select className="form-select" name="cementType" value={form.cementType} onChange={handleChange}>
                                <option value="OPC43">OPC 43 Grade</option>
                                <option value="OPC53">OPC 53 Grade</option>
                                <option value="PPC">PPC (Portland Pozzolana)</option>
                            </select>
                        </div>

                        <div className="form-grid-2">
                            <div className="form-group">
                                <label className="form-label">Cement (kg/m³)</label>
                                <input className="form-input" type="number" name="cement" value={form.cement} onChange={handleChange} min="200" max="600" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Sand / Balu (kg/m³)</label>
                                <input className="form-input" type="number" name="sand" value={form.sand} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="form-grid-2">
                            <div className="form-group">
                                <label className="form-label">Aggregate (kg/m³)</label>
                                <input className="form-input" type="number" name="aggregate" value={form.aggregate} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Water (kg/m³)</label>
                                <input className="form-input" type="number" name="water" value={form.water} onChange={handleChange} />
                            </div>
                        </div>

                        {/* Auto W/C ratio */}
                        <div style={{
                            background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', padding: '12px 14px',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            border: `1px solid ${+wcRatio > 0.55 ? 'rgba(251,146,60,0.4)' : 'var(--border)'}`
                        }}>
                            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Water–Cement Ratio (auto)</span>
                            <span style={{
                                fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: 18,
                                color: +wcRatio <= 0.45 ? 'var(--green)' : +wcRatio <= 0.55 ? 'var(--yellow)' : 'var(--orange)'
                            }}>{wcRatio}</span>
                        </div>
                        {+wcRatio > 0.55 && (
                            <div className="alert-banner warning" style={{ marginTop: 10, marginBottom: 0 }}>
                                <span>⚠️</span>
                                <span style={{ fontSize: 12 }}>High w/c ratio will reduce strength. Ideal: 0.40–0.45</span>
                            </div>
                        )}
                    </div>

                    {/* ── Geometry + Sensor ── */}
                    <div>
                        <div className="card" style={{ marginBottom: 16 }}>
                            <div className="section-title" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>📐 Element Geometry</div>

                            <div className="form-group">
                                <label className="form-label">Element Type</label>
                                <select className="form-select" name="elementType" value={form.elementType} onChange={handleChange}>
                                    <option value="Slab">Slab</option>
                                    <option value="Beam">Beam</option>
                                    <option value="Column">Column</option>
                                </select>
                            </div>

                            <div className="form-grid-3">
                                <div className="form-group">
                                    <label className="form-label">Length (m)</label>
                                    <input className="form-input" type="number" name="length" value={form.length} onChange={handleChange} step="0.1" min="0.1" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Breadth (m)</label>
                                    <input className="form-input" type="number" name="breadth" value={form.breadth} onChange={handleChange} step="0.1" min="0.1" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Height (m)</label>
                                    <input className="form-input" type="number" name="height" value={form.height} onChange={handleChange} step="0.01" min="0.05" />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 12, padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                                <div style={{ flex: 1, textAlign: 'center' }}>
                                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Volume</div>
                                    <div style={{ fontWeight: 700, color: 'var(--cyan)', fontFamily: 'var(--font-mono)' }}>
                                        {(form.length * form.breadth * form.height).toFixed(3)} m³
                                    </div>
                                </div>
                                <div style={{ flex: 1, textAlign: 'center' }}>
                                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Thickness</div>
                                    <div style={{ fontWeight: 700, color: 'var(--purple)', fontFamily: 'var(--font-mono)' }}>
                                        {(form.height * 1000).toFixed(0)} mm
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Live sensor readings */}
                        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(56,189,248,0.05), rgba(167,139,250,0.05))' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                                <div className="section-title">📡 Sensor Readings (Live)</div>
                                {weatherStatus === 'live' && (
                                    <span className="badge badge-green" style={{ fontSize: 10 }}>🌤 Live Weather</span>
                                )}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {[
                                    { label: 'Temperature', value: `${sensor.temperature} °C`, icon: '🌡', color: 'var(--orange)', source: weatherStatus === 'live' ? 'Weather API' : 'Sensor Mock' },
                                    { label: 'Humidity', value: `${sensor.humidity} %`, icon: '💧', color: 'var(--cyan)', source: weatherStatus === 'live' ? 'Weather API' : 'Sensor Mock' },
                                    { label: 'Resistance', value: `${sensor.resistance} Ω`, icon: '⚡', color: 'var(--purple)', source: 'Sensor Mock' },
                                ].map(s => (
                                    <div key={s.label} style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)'
                                    }}>
                                        <div>
                                            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s.icon} {s.label}</span>
                                            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{s.source}</div>
                                        </div>
                                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: s.color }}>{s.value}</span>
                                    </div>
                                ))}
                            </div>
                            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10 }}>
                                {weatherStatus === 'live'
                                    ? '🌤 Temperature & Humidity are live from your local weather. Resistance updates every 3 s.'
                                    : 'All values from mock sensor stream. Enable location access for live weather.'}
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={loading}
                    style={{ width: '100%', justifyContent: 'center', fontSize: 16, boxShadow: '0 4px 32px rgba(56,189,248,0.25)' }}
                >
                    {loading
                        ? <><span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⚙</span> Running AI Analysis…</>
                        : <><Cpu size={18} /> Run AI Analysis</>
                    }
                </button>
            </form>
        </div>
    );
}
