import React from 'react';
import './About.css';

const AboutPage = ({setCurrentPage}) => {
    return (

        <div className="about-page">
            <nav className="navbar">
                <div className="navbar-brand"></div>
                <ul className="nav-links">
                    <li><a onClick={() => setCurrentPage("HOME_PAGE")}>Home</a></li>
                    <li><a onClick={() => setCurrentPage("ABOUT")}>About</a></li>
                    <li><a onClick={() => setCurrentPage("CONTACT")}>Contact</a></li>
                    {/* Add more navigation links as needed */}
                </ul>
            </nav>
            <h1 className='about-title'>About Geo-Chat</h1>
            <p className='about-title description'>Welcome to Geo-Chat, where anonymous chatting meets location-based interactions! Geo-Chat revolutionizes how people connect and communicate by combining the thrill of anonymity with the power of location-based features.</p>
            <h2 className='about-title features'>Features:</h2>
            <ol className='about-title features'>
                <li><strong>Anonymous Chatting:</strong> Explore conversations without revealing your identity.</li>
                <li><strong>Location-Based Interaction:</strong> Connect with users nearby or explore conversations in specific locations.</li>
                <li><strong>Real-Time Messaging:</strong> Experience seamless real-time messaging.</li>
            </ol>
            <p className='about-title footer'>Thank you for choosing Geo-Chat to enhance your chatting experience. Let's chat and explore the world together!</p>
        </div>
    );
};

export default AboutPage;
