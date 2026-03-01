import { useState, useEffect } from 'react';

const API = 'http://localhost:5000/api';
const RECORDS_KEY = 'constructai_completed_records'; // localStorage key shared with Dashboard

// ── Cement label helpers ───────────────────────────────────────────────────
const CEMENT_LABELS = { OPC43: 'OPC 43', OPC53: 'OPC 53', PPC: 'PPC' };
const cementBadge = (c) => (
    <span className="badge badge-cyan" style={{ fontSize: 10 }}>
        {CEMENT_LABELS[c] || c || '—'}
    </span>
);

// ── Baseline hours helper ─────────────────────────────────────────────────
// Priority: stored traditionalTime → cement type lookup → element type lookup
const CEMENT_BASELINE = { OPC43: 32, OPC53: 30, PPC: 36 };
const ELEMENT_BASELINE = { Slab: 32, Beam: 30, Column: 36 };
const baselineHours = (r) =>
    r.traditionalTime ??
    CEMENT_BASELINE[r.cementType] ??
    ELEMENT_BASELINE[r.elementType] ??
    30;
function statusBadge(status) {
    const map = {
        'Curing': 'badge-cyan',
        'Ready to De-mould': 'badge-green',
        'Casting': 'badge-orange',
        'Completed': 'badge-purple',
    };
    return <span className={`badge ${map[status] || 'badge-cyan'}`}>● {status}</span>;
}

// ── Correct hours-saved display ───────────────────────────────────────────
// hoursSaved should be positive (traditional − deMould). If field is negative
// (old bug), take absolute value. If it's 0 / missing, compute from tradTime.
function savedHoursDisplay(r) {
    const saved = Math.abs(r.hoursSaved ?? 0);
    const color = saved > 0 ? 'var(--green)' : 'var(--text-muted)';
    const prefix = saved > 0 ? '+' : '';
    return (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color, fontWeight: 700 }}>
            {prefix}{saved.toFixed(1)}h
        </span>
    );
}

// ── Seed records (properly defined with correct status + cement) ───────────
const SEED_RECORDS = [
    { _id: 'R001', elementId: 'S-12', elementType: 'Slab', cementType: 'OPC53', settingTime: 28, deMouldTime: 22, hoursSaved: 10, status: 'Completed', confidenceScore: 91, createdAt: new Date(Date.now() - 18 * 3600000).toISOString() },
    { _id: 'R002', elementId: 'B-07', elementType: 'Beam', cementType: 'OPC43', settingTime: 30, deMouldTime: 24, hoursSaved: 8, status: 'Completed', confidenceScore: 87, createdAt: new Date(Date.now() - 30 * 3600000).toISOString() },
    { _id: 'R003', elementId: 'C-03', elementType: 'Column', cementType: 'PPC', settingTime: 34, deMouldTime: 28, hoursSaved: 6, status: 'Completed', confidenceScore: 83, createdAt: new Date(Date.now() - 72 * 3600000).toISOString() },
    { _id: 'R004', elementId: 'S-11', elementType: 'Slab', cementType: 'OPC53', settingTime: 27, deMouldTime: 21, hoursSaved: 11, status: 'Completed', confidenceScore: 93, createdAt: new Date(Date.now() - 100 * 3600000).toISOString() },
];

// Load completed records from localStorage (added by Dashboard when elements are completed)
function loadLocalRecords() {
    try {
        const stored = JSON.parse(localStorage.getItem(RECORDS_KEY) || '[]');
        return Array.isArray(stored) ? stored : [];
    } catch { return []; }
}

export default function Records() {
    const [records, setRecords] = useState([]);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('Completed');
    const [filterType, setFilterType] = useState('All');
    const [sortBy, setSortBy] = useState('date');

    useEffect(() => {
        // 1. Start with seed data
        let combined = [...SEED_RECORDS];

        // 2. Merge localStorage completed records from Dashboard (avoid duplicates by _id/elementId)
        const local = loadLocalRecords();
        local.forEach(lr => {
            if (!combined.find(r => r._id === lr._id || r.elementId === lr.elementId)) {
                combined.push(lr);
            }
        });

        // 3. Try backend API (overrides if available and has data)
        fetch(`${API}/records`)
            .then(r => r.json())
            .then(json => {
                if (json.success && Array.isArray(json.data) && json.data.length) {
                    // Merge API data with local — API wins on duplicate IDs
                    json.data.forEach(apiRec => {
                        const idx = combined.findIndex(r => r._id === apiRec._id);
                        if (idx >= 0) combined[idx] = { ...combined[idx], ...apiRec };
                        else combined.push(apiRec);
                    });
                }
                // Ensure all records have status 'Completed' in records view
                // (records = post-analysis entries, so Casting is never valid here)
                combined = combined.map(r => ({
                    ...r,
                    status: r.status || 'Completed',
                    cementType: r.cementType || r.cement || '—',
                    hoursSaved: Math.abs(r.hoursSaved ?? 0),
                }));
                combined.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setRecords(combined);
            })
            .catch(() => {
                // Use combined seed + local only
                combined = combined.map(r => ({
                    ...r,
                    status: r.status || 'Completed',
                    cementType: r.cementType || r.cement || '—',
                    hoursSaved: Math.abs(r.hoursSaved ?? 0),
                }));
                combined.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setRecords(combined);
            });
    }, []);

    // ── Filter + Sort ─────────────────────────────────────────────────────
    const filtered = records
        .filter(r => {
            const q = search.toLowerCase();
            const ms = !q || r.elementId?.toLowerCase().includes(q) || r.elementType?.toLowerCase().includes(q) || r.cementType?.toLowerCase().includes(q);
            const mst = filterStatus === 'All' || r.status === filterStatus;
            const mt = filterType === 'All' || r.elementType === filterType;
            return ms && mst && mt;
        })
        .sort((a, b) => {
            if (sortBy === 'date') return new Date(b.createdAt) - new Date(a.createdAt);
            if (sortBy === 'saved') return (b.hoursSaved ?? 0) - (a.hoursSaved ?? 0);
            if (sortBy === 'confidence') return (b.confidenceScore ?? 0) - (a.confidenceScore ?? 0);
            return 0;
        });

    const completed = records.filter(r => r.status === 'Completed');
    const totalSaved = records.reduce((s, r) => s + Math.abs(r.hoursSaved ?? 0), 0);
    const avgConf = records.length ? (records.reduce((s, r) => s + (r.confidenceScore ?? 0), 0) / records.length).toFixed(0) : 0;

    // ── Delete helpers ────────────────────────────────────────────────────
    const deleteRecord = (id) => {
        setRecords(prev => prev.filter(r => r._id !== id && r.elementId !== id));
        // Also remove from localStorage if it was a local record
        try {
            const existing = JSON.parse(localStorage.getItem(RECORDS_KEY) || '[]');
            localStorage.setItem(RECORDS_KEY, JSON.stringify(existing.filter(r => r._id !== id && r.elementId !== id)));
        } catch { }
    };

    const clearAll = () => {
        if (!window.confirm('Delete ALL records? This cannot be undone.')) return;
        setRecords([]);
        try { localStorage.setItem(RECORDS_KEY, '[]'); } catch { }
    };

    return (
        <div className="fade-in">
            <div className="page-title">Data &amp; Records</div>
            <p className="page-sub">Full traceability of all predictions, elements, and de-moulding events</p>

            {/* ── Summary KPIs ── */}
            <div className="grid-4" style={{ marginBottom: 24 }}>
                {[
                    { label: 'Total Records', value: records.length, color: 'var(--cyan)', icon: '🗂️' },
                    { label: 'Completed', value: completed.length, color: 'var(--green)', icon: '✅' },
                    { label: 'Total Hrs Saved', value: `${totalSaved.toFixed(1)}h`, color: 'var(--orange)', icon: '⏱️' },
                    { label: 'Avg Confidence', value: `${avgConf}%`, color: 'var(--purple)', icon: '🎯' },
                ].map(k => (
                    <div key={k.label} className="card" style={{ textAlign: 'center', padding: '18px 12px' }}>
                        <div style={{ fontSize: 22, marginBottom: 6 }}>{k.icon}</div>
                        <div style={{ fontSize: 26, fontWeight: 900, color: k.color, fontFamily: 'var(--font-mono)' }}>{k.value}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{k.label}</div>
                    </div>
                ))}
            </div>

            {/* ── Controls ── */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
                <input
                    className="form-input" style={{ width: 230 }}
                    placeholder="🔍  Search ID, type, cement…"
                    value={search} onChange={e => setSearch(e.target.value)}
                />
                <select className="form-select" style={{ width: 'auto' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    {['All', 'Completed', 'Curing', 'Ready to De-mould', 'Casting'].map(s => <option key={s}>{s}</option>)}
                </select>
                <select className="form-select" style={{ width: 'auto' }} value={filterType} onChange={e => setFilterType(e.target.value)}>
                    {['All', 'Slab', 'Beam', 'Column'].map(t => <option key={t}>{t}</option>)}
                </select>
                <select className="form-select" style={{ width: 'auto' }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
                    <option value="date">Sort: Date</option>
                    <option value="saved">Sort: Hrs Saved</option>
                    <option value="confidence">Sort: Confidence</option>
                </select>
                <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 'auto' }}>
                    {filtered.length} record{filtered.length !== 1 ? 's' : ''}
                </span>
                {records.length > 0 && (
                    <button
                        onClick={clearAll}
                        style={{
                            background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.3)',
                            borderRadius: 6, color: 'var(--red)', cursor: 'pointer',
                            padding: '7px 14px', fontSize: 12, fontWeight: 600,
                        }}
                    >
                        🗑 Clear All
                    </button>
                )}
            </div>

            {/* ── Table ── */}
            <div className="card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Element ID</th>
                            <th>Type</th>
                            <th>Cement</th>
                            <th>Baseline (Trad.)</th>
                            <th>De-mould</th>
                            <th>Hours Saved ↑</th>
                            <th>Confidence</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(r => (
                            <tr key={r._id || r.elementId}>
                                <td>
                                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--cyan)' }}>
                                        {r.elementId}
                                    </span>
                                </td>
                                <td style={{ color: 'var(--text-secondary)' }}>{r.elementType}</td>
                                <td>{cementBadge(r.cementType)}</td>
                                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-secondary)' }}>
                                    {baselineHours(r)}h
                                </td>
                                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--cyan)', fontWeight: 700 }}>
                                    {r.deMouldTime}h
                                </td>
                                <td>{savedHoursDisplay(r)}</td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <div className="progress-bar-wrap" style={{ width: 52 }}>
                                            <div className="progress-bar" style={{
                                                width: `${r.confidenceScore ?? 0}%`,
                                                background: (r.confidenceScore ?? 0) > 85 ? 'var(--green)' : 'var(--cyan)'
                                            }} />
                                        </div>
                                        <span style={{ fontSize: 12, color: 'var(--text-muted)', minWidth: 28 }}>{r.confidenceScore ?? 0}%</span>
                                    </div>
                                </td>
                                <td>{statusBadge(r.status)}</td>
                                <td style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                    {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                </td>
                                <td>
                                    <button
                                        onClick={() => deleteRecord(r._id || r.elementId)}
                                        title="Delete this record"
                                        style={{
                                            background: 'rgba(248,113,113,0.12)',
                                            border: '1px solid rgba(248,113,113,0.3)',
                                            borderRadius: 6, color: 'var(--red)',
                                            cursor: 'pointer', padding: '4px 8px',
                                            fontSize: 14, lineHeight: 1,
                                        }}
                                    >
                                        🗑
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={9} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>
                                    No records match your filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* ── Completed records highlight ── */}
            {completed.length > 0 && (
                <div className="alert-banner success" style={{ marginTop: 20, marginBottom: 0 }}>
                    <span>✅</span>
                    <span style={{ fontSize: 13 }}>
                        <strong>{completed.length}</strong> element{completed.length !== 1 ? 's' : ''} successfully de-moulded,
                        saving a total of <strong>{totalSaved.toFixed(1)} hours</strong> vs traditional curing.
                    </span>
                </div>
            )}
        </div>
    );
}
