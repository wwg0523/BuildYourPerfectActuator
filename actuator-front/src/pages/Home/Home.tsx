import React from 'react';
import './Home.scss';

interface HomeProps {
    onStartGame: () => void;
}

const Home: React.FC<HomeProps> = ({ onStartGame }) => {
    return (
        <div className="page-home">
            <div className="home-dummy">
                <h1> Home Page</h1>
                <p>This page is currently a placeholder.</p>
                <button onClick={onStartGame}>Go to Guide</button>
            </div>
        </div>
    );
};

export default Home;
