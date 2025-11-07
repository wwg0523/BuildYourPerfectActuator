import React, { useState, useEffect, useCallback } from 'react';
import '../styles/main.scss';
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

const Analytics: React.FC = () => {
    const [analyticsData, setAnalyticsData] = useState<GameAnalytics | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'chart' | 'table'>('chart');

    const fetchAnalytics = useCallback(async () => {
        try {
            console.log('🔐 Fetching analytics with password:', password.substring(0, 3) + '***');
            const response = await fetch(`/api/analytics`, {
                headers: { Authorization: password },
            });
            
            console.log('📊 Response status:', response.status);
            console.log('📊 Content-Type:', response.headers.get('content-type'));
            
            if (!response.ok) {
                // Try to parse error response as JSON
                try {
                    const errorData = await response.json();
                    throw new Error(response.status === 401 ? 'Invalid password' : (errorData.error || `Failed to fetch analytics data (${response.status})`));
                } catch (parseErr) {
                    // If JSON parsing fails, throw status-based error
                    throw new Error(response.status === 401 ? 'Invalid password' : `Failed to fetch analytics data (${response.status})`);
                }
            }
            
            // Check content type to ensure we get JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const responseText = await response.text();
                console.error('❌ Non-JSON response:', responseText.substring(0, 200));
                throw new Error('Server returned non-JSON response. Check backend /api/analytics endpoint.');
            }
            
            const data = await response.json();
            console.log('✅ Analytics data received:', data);
            setAnalyticsData(data);
            setError('');
        } catch (err: any) {
            console.error('❌ Analytics fetch error:', err);
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
                                {/* Tab Navigation */}
                                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #eee' }}>
                                    <button
                                        onClick={() => setActiveTab('chart')}
                                        style={{
                                            padding: '10px 20px',
                                            border: 'none',
                                            background: activeTab === 'chart' ? '#007bff' : '#f0f0f0',
                                            color: activeTab === 'chart' ? '#fff' : '#333',
                                            cursor: 'pointer',
                                            fontWeight: 'bold',
                                            borderRadius: '4px 4px 0 0',
                                        }}
                                    >
                                        📊 Charts
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('table')}
                                        style={{
                                            padding: '10px 20px',
                                            border: 'none',
                                            background: activeTab === 'table' ? '#007bff' : '#f0f0f0',
                                            color: activeTab === 'table' ? '#fff' : '#333',
                                            cursor: 'pointer',
                                            fontWeight: 'bold',
                                            borderRadius: '4px 4px 0 0',
                                        }}
                                    >
                                        📋 Raw Data
                                    </button>
                                </div>

                                {/* Chart Tab */}
                                {activeTab === 'chart' && (
                                    <>
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
                                    </>
                                )}

                                {/* Table Tab */}
                                {activeTab === 'table' && (
                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={{
                                            width: '100%',
                                            borderCollapse: 'collapse',
                                            marginBottom: '20px',
                                        }}>
                                            <thead>
                                                <tr style={{ backgroundColor: '#f0f0f0', borderBottom: '2px solid #ddd' }}>
                                                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', borderRight: '1px solid #ddd' }}>Column Name</th>
                                                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Value</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr style={{ borderBottom: '1px solid #eee' }}>
                                                    <td style={{ padding: '12px', borderRight: '1px solid #eee', fontWeight: '500' }}>totalParticipants</td>
                                                    <td style={{ padding: '12px' }}>{analyticsData.totalParticipants}</td>
                                                </tr>
                                                <tr style={{ borderBottom: '1px solid #eee' }}>
                                                    <td style={{ padding: '12px', borderRight: '1px solid #eee', fontWeight: '500' }}>completionRate</td>
                                                    <td style={{ padding: '12px' }}>{analyticsData.completionRate}%</td>
                                                </tr>
                                                <tr style={{ borderBottom: '1px solid #eee' }}>
                                                    <td style={{ padding: '12px', borderRight: '1px solid #eee', fontWeight: '500' }}>averageCompletionTime</td>
                                                    <td style={{ padding: '12px' }}>{analyticsData.averageCompletionTime} seconds</td>
                                                </tr>
                                                <tr style={{ borderBottom: '1px solid #eee' }}>
                                                    <td style={{ padding: '12px', borderRight: '1px solid #eee', fontWeight: '500' }}>topCompanyParticipants</td>
                                                    <td style={{ padding: '12px' }}>
                                                        {Array.isArray(analyticsData.topCompanyParticipants)
                                                            ? analyticsData.topCompanyParticipants.filter(c => c).join(', ')
                                                            : 'None'}
                                                    </td>
                                                </tr>
                                                <tr style={{ borderBottom: '1px solid #eee' }}>
                                                    <td style={{ padding: '12px', borderRight: '1px solid #eee', fontWeight: '500', verticalAlign: 'top' }}>popularComponentCombinations</td>
                                                    <td style={{ padding: '12px' }}>
                                                        {Array.isArray(analyticsData.popularComponentCombinations) && analyticsData.popularComponentCombinations.length > 0 ? (
                                                            <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                                                {analyticsData.popularComponentCombinations.map((combo, idx) => (
                                                                    <li key={idx}>
                                                                        {Array.isArray(combo)
                                                                            ? `[${combo.join(', ')}]`
                                                                            : JSON.stringify(combo)}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        ) : (
                                                            'None'
                                                        )}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style={{ padding: '12px', borderRight: '1px solid #eee', fontWeight: '500', verticalAlign: 'top' }}>successRateByExperience</td>
                                                    <td style={{ padding: '12px' }}>
                                                        {analyticsData.successRateByExperience ? (
                                                            <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                                                {Object.entries(analyticsData.successRateByExperience).map(([key, value]) => (
                                                                    <li key={key}>{key}: {value}%</li>
                                                                ))}
                                                            </ul>
                                                        ) : (
                                                            'None'
                                                        )}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                )}

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