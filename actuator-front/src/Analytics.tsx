import React, { useState, useEffect, useCallback } from 'react';
import './styles/main.scss';
import { motion } from 'framer-motion';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from 'recharts';

interface GameAnalytics {
    totalParticipants: number;
    completionRate: number;
    averageCompletionTime: number;
    topCompanyParticipants: string[] | null;
    popularComponentCombinations: string[][] | null;
    successRateByExperience: { [key: string]: number } | null;
}

const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://actuator-back:4004';

const Analytics: React.FC = () => {
    const [analyticsData, setAnalyticsData] = useState<GameAnalytics | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const fetchAnalytics = useCallback(async () => {
        try {
            const response = await fetch(`${backendUrl}/api/analytics`, {
                headers: { Authorization: password },
            });
            if (!response.ok) {
                throw new Error(response.status === 401 ? 'Invalid password' : 'Failed to fetch analytics data');
            }
            const data = await response.json();
            setAnalyticsData(data);
            setError('');
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to load analytics. Please check your password.');
        }
    }, [password]);

    const componentFrequency = React.useMemo(() => {
        const freq: { [k: string]: number } = {};

        const extractName = (item: any) => {
            if (item == null) return '';
            if (typeof item === 'string' || typeof item === 'number') return String(item);
            if (typeof item === 'object') {
                // try common fields
                if (typeof item.name === 'string') return item.name;
                if (typeof item.component === 'string') return item.component;
                // fallback to JSON if it has identifiable keys
                try {
                    return JSON.stringify(item);
                } catch {
                    return String(item);
                }
            }
            return String(item);
        };

        if (Array.isArray(analyticsData?.popularComponentCombinations)) {
            analyticsData!.popularComponentCombinations.forEach((combo) => {
                if (Array.isArray(combo)) {
                    combo.forEach((c) => {
                        const name = extractName(c);
                        if (!name) return;
                        freq[name] = (freq[name] || 0) + 1;
                    });
                } else {
                    const name = extractName(combo as any);
                    if (!name) return;
                    freq[name] = (freq[name] || 0) + 1;
                }
            });
        }
        return Object.entries(freq).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    }, [analyticsData]);

    const successRateData = React.useMemo(() => {
        if (!analyticsData?.successRateByExperience) return [] as { name: string; value: number }[];
        return Object.entries(analyticsData.successRateByExperience).map(([k, v]) => ({ name: k, value: Number(v) }));
    }, [analyticsData]);

    const handleLogin = () => {
        fetchAnalytics();
        setIsAuthenticated(true);
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchAnalytics();
        }
    }, [isAuthenticated, fetchAnalytics]);

    return (
        <div className="app-container">
            <div className="card">
                {!isAuthenticated ? (
                    <>
                        <h2>Analytics Dashboard</h2>
                        <input
                            type="password"
                            placeholder="Enter admin password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <p className="error">{error || '\u00A0'}</p>
                        <button className="button" onClick={handleLogin}>
                            Login
                        </button>
                    </>
                ) : (
                    <>
                        <h2>Data Analytics Dashboard</h2>
                        {analyticsData ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                                <p>Total Participants: {analyticsData.totalParticipants}</p>
                                <p>Completion Rate: {analyticsData.completionRate}%</p>
                                <p>Average Completion Time: {analyticsData.averageCompletionTime} seconds</p>
                                <p>Top Companies: {analyticsData.topCompanyParticipants?.join(', ') || 'None'}</p>
                                <p>Popular Combinations (component frequency):</p>
                                <div style={{ width: '100%', height: 280 }}>
                                    {componentFrequency.length > 0 ? (
                                        <ResponsiveContainer>
                                            <BarChart data={componentFrequency.slice(0, 20)} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                                <YAxis />
                                                <Tooltip />
                                                <Legend />
                                                <Bar dataKey="value" fill="#8884d8" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <p>No combinations available</p>
                                    )}
                                </div>

                                <p style={{ marginTop: 18 }}>Success Rate by Attempt Count:</p>
                                <div style={{ width: '100%', height: 240 }}>
                                    {successRateData.length > 0 ? (
                                        <ResponsiveContainer>
                                            <PieChart>
                                                <Pie data={successRateData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                                    {successRateData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042'][index % 4]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <p>No success rate data available</p>
                                    )}
                                </div>
                                <p>Success Rate by Attempt Count:</p>
                                <ul>
                                    {analyticsData.successRateByExperience
                                        ? Object.entries(analyticsData.successRateByExperience).map(([exp, rate]) => (
                                              <li key={exp}>{exp}: {rate}%</li>
                                          ))
                                        : <li>No data available</li>}
                                </ul>
                                <button className="button outline" onClick={fetchAnalytics}>
                                    REFRESH
                                </button>
                                <button className="button" onClick={() => (window.location.href = '/')}>
                                    BACK TO GAME
                                </button>
                            </motion.div>
                        ) : (
                            <p>Loading analytics data...</p>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Analytics;