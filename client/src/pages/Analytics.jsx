import { useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell
} from 'recharts';

const barData = [
    { month: 'Oct', traditional: 32, ai: 24, saved: 8 },
    { month: 'Nov', traditional: 34, ai: 23, saved: 11 },
    { month: 'Dec', traditional: 30, ai: 22, saved: 8 },
    { month: 'Jan', traditional: 32, ai: 21.5, saved: 10.5 },
    { month: 'Feb', traditional: 33, ai: 22.3, saved: 10.7 },
    { month: 'Mar', traditional: 31, ai: 22.8, saved: 8.2 },
];

const pieData = [
    { name: 'OPC 53', value: 45, color: '#38bdf8' },
    { name: 'OPC 43', value: 35, color: '#fb923c' },
    { name: 'PPC', value: 20, color: '#a78bfa' },
];

const elementData = [
    { type: 'Slab', cycles: 142, avgSaved: 8.4 },
    { type: 'Beam', cycles: 98, avgSaved: 7.2 },
    { type: 'Column', cycles: 72, avgSaved: 9.1 },
];

const savingsData = barData.map((d, i) => ({
    ...d,
    costSaved: (d.saved * 850).toFixed(0),
    yardHrs: (d.saved * 2.1).toFixed(1)
}));

function CustomTooltip({ active, payload, label }) {
    if (active && payload?.length) {
        return (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px' }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>{label}</div>
                {payload.map(p => (
                    <div key={p.name} style={{ color: p.color, fontSize: 13, fontWeight: 600 }}>
                        {p.name}: {p.value}{p.name.includes('Hour') || p.name.includes('Traditional') || p.name.includes('AI') ? 'h' : ''}
                    </div>
                ))}
            </div>
        );
    }
    return null;
}

export default function Analytics() {
    const [filter, setFilter] = useState({ cement: 'All', element: 'All' });

    return (
        <div className="fade-in">
            <div className="page-title">Cycle Time Analytics</div>
            <p className="page-sub">Management-level optimization insights and cost savings tracking</p>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                <select className="form-select" style={{ width: 'auto' }} value={filter.cement} onChange={e => setFilter(f => ({ ...f, cement: e.target.value }))}>
                    <option>All Cement Types</option>
                    <option>OPC 43</option>
                    <option>OPC 53</option>
                    <option>PPC</option>
                </select>
                <select className="form-select" style={{ width: 'auto' }} value={filter.element} onChange={e => setFilter(f => ({ ...f, element: e.target.value }))}>
                    <option>All Element Types</option>
                    <option>Slab</option>
                    <option>Beam</option>
                    <option>Column</option>
                </select>
            </div>

            {/* Summary KPIs */}
            <div className="grid-4" style={{ marginBottom: 24 }}>
                {[
                    { label: 'Total Cycles', value: '312', color: 'var(--cyan)', icon: '🔄' },
                    { label: 'Avg Hours Saved', value: '8.6h', color: 'var(--green)', icon: '⏱️' },
                    { label: 'Cost Saved (₹)', value: '₹2.6L', color: 'var(--orange)', icon: '💰' },
                    { label: 'Yard Space Saved', value: '23%', color: 'var(--purple)', icon: '📦' },
                ].map(k => (
                    <div key={k.label} className="card" style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 24, marginBottom: 6 }}>{k.icon}</div>
                        <div style={{ fontSize: 28, fontWeight: 900, color: k.color, fontFamily: 'var(--font-mono)' }}>{k.value}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 }}>{k.label}</div>
                    </div>
                ))}
            </div>

            {/* Bar Chart: Traditional vs AI */}
            <div className="grid-2" style={{ marginBottom: 24 }}>
                <div className="card">
                    <div className="section-title" style={{ marginBottom: 16 }}>📊 Traditional vs AI Curing Hours</div>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={barData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="month" stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
                            <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: 12 }} />
                            <Bar dataKey="traditional" name="Traditional" fill="#f87171" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="ai" name="AI-Optimized" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="card">
                    <div className="section-title" style={{ marginBottom: 16 }}>⚡ Hours Saved per Month</div>
                    <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={barData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="month" stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
                            <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Line dataKey="saved" name="Hours Saved" stroke="var(--green)" strokeWidth={2.5} dot={{ fill: 'var(--green)', r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid-2" style={{ marginBottom: 24 }}>
                {/* Cement Type Pie */}
                <div className="card">
                    <div className="section-title" style={{ marginBottom: 16 }}>🧪 Cement Type Distribution</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                        <ResponsiveContainer width="60%" height={200}>
                            <PieChart>
                                <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${value}%`} labelLine={false}>
                                    {pieData.map((entry) => (
                                        <Cell key={entry.name} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div>
                            {pieData.map(p => (
                                <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                                    <div style={{ width: 12, height: 12, borderRadius: 3, background: p.color }} />
                                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{p.name}</span>
                                    <span style={{ fontWeight: 700, marginLeft: 'auto', color: p.color }}>{p.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* By Element Type */}
                <div className="card">
                    <div className="section-title" style={{ marginBottom: 16 }}>🏗️ By Element Type</div>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Type</th>
                                <th>Cycles</th>
                                <th>Avg Saved</th>
                                <th>Efficiency</th>
                            </tr>
                        </thead>
                        <tbody>
                            {elementData.map(e => (
                                <tr key={e.type}>
                                    <td><strong>{e.type}</strong></td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{e.cycles}</td>
                                    <td style={{ color: 'var(--green)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{e.avgSaved}h</td>
                                    <td>
                                        <div className="progress-bar-wrap" style={{ width: 80 }}>
                                            <div className="progress-bar" style={{ width: `${(e.avgSaved / 12) * 100}%`, background: 'var(--cyan)' }} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="alert-banner info" style={{ marginTop: 16, marginBottom: 0 }}>
                        <span>ℹ️</span>
                        <span style={{ fontSize: 12 }}>Columns show highest savings due to thermal mass effects in thick cross-sections.</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
