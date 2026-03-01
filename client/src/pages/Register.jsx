import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const API = 'http://localhost:5000/api';

export default function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Plant Manager' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            const res = await fetch(`${API}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            const json = await res.json();
            if (json.success) navigate('/dashboard');
            else setError(json.error || 'Registration failed');
        } catch {
            navigate('/dashboard');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--bg-primary)', position: 'relative', overflow: 'hidden'
        }}>
            <div className="hero-gradient" />
            <div style={{ width: '100%', maxWidth: 440, padding: '0 24px', zIndex: 1 }} className="fade-in">
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div className="logo-badge" style={{ fontSize: 28, fontWeight: 900 }}>⚙ APIE</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Create your plant account</div>
                </div>

                <div className="card">
                    <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>Create account</h2>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>Join the APIE precast intelligence platform</p>

                    {error && <div className="alert-banner warning" style={{ marginBottom: 16 }}><span>⚠️</span>{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Rajan Kumar" required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input className="form-input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@company.in" required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Role</label>
                            <select className="form-select" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                                <option>Plant Manager</option>
                                <option>Quality Engineer</option>
                                <option>Site Supervisor</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input className="form-input" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Create password" required minLength={6} />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} disabled={loading}>
                            {loading ? '⚙ Creating…' : 'Create Account →'}
                        </button>
                    </form>
                </div>

                <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-secondary)' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--cyan)', fontWeight: 600 }}>Sign in</Link>
                </div>
            </div>
        </div>
    );
}
