import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import BuildYourPerfectActuator from './BuildYourPerfectActuator';
import Analytics from './Analytics';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<BuildYourPerfectActuator />} />
                <Route path="/analytics" element={<Analytics />} />
            </Routes>
        </Router>
    );
}

export default App;