import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const API = 'http://localhost:5000/api';

export default function Login() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: 'manager@apie.in', password: 'demo123' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            const res = await fetch(`${API}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            const json = await res.json();
            if (json.success) {
                sessionStorage.setItem('apie_user', JSON.stringify(json.data.user));
                navigate('/dashboard');
            } else {
                setError(json.error || 'Login failed');
            }
        } catch {
            // Offline fallback
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
            <div style={{ width: '100%', maxWidth: 420, padding: '0 24px', zIndex: 1 }} className="fade-in">
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div className="logo-badge" style={{ fontSize: 28, fontWeight: 900 }}>⚙ APIE</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Precast Intelligence Engine</div>
                </div>

                <div className="card">
                    <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>Welcome back</h2>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>Sign in to your plant account</p>

                    {error && <div className="alert-banner warning" style={{ marginBottom: 16 }}><span>⚠️</span>{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input className="form-input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="manager@apie.in" required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input className="form-input" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" required />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} disabled={loading}>
                            {loading ? '⚙ Signing in…' : 'Sign In →'}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
                        Demo: <code style={{ color: 'var(--cyan)' }}>manager@apie.in</code> / <code style={{ color: 'var(--cyan)' }}>demo123</code>
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-secondary)' }}>
                    Don't have an account? <Link to="/register" style={{ color: 'var(--cyan)', fontWeight: 600 }}>Register</Link>
                </div>
                <div style={{ textAlign: 'center', marginTop: 12 }}>
                    <Link to="/" style={{ color: 'var(--text-muted)', fontSize: 12 }}>← Back to landing page</Link>
                </div>
            </div>
        </div>
    );
}
