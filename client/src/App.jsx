import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import SmartSlab from './pages/SmartSlab';
import Analysis from './pages/Analysis';
import DigitalTwin from './pages/DigitalTwin';
import Analytics from './pages/Analytics';
import Records from './pages/Records';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public routes (no sidebar) */}
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* App routes (with sidebar layout) */}
                <Route element={<Layout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/smart-slab" element={<SmartSlab />} />
                    <Route path="/analysis" element={<Analysis />} />
                    <Route path="/digital-twin" element={<DigitalTwin />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/records" element={<Records />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="*" element={<Navigate to="/dashboard" />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
