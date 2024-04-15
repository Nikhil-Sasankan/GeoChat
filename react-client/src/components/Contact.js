// ContactPage.js

import React from 'react';
import './Contact.css'

const ContactPage = ({ setCurrentPage }) => {
    return (
        <div className="contact-page">
            <nav className="navbar">
                <div className="navbar-brand"></div>
                <ul className="nav-links">
                    <li><a onClick={() => setCurrentPage("HOME_PAGE")}>Home</a></li>
                    <li><a onClick={() => setCurrentPage("ABOUT")}>About</a></li>
                    <li><a onClick={() => setCurrentPage("CONTACT")}>Contact</a></li>
                    {/* Add more navigation links as needed */}
                </ul>
            </nav>
            <h1 className='contact-title'>Contact</h1>
            <div className='image-container'>
                <div class="rotating-border"></div><div class="rotating-border"></div>
                <div class="rotating-border"></div><div class="rotating-border"></div>
                <img src='profile.jpg' className='image' ></img>
                
            </div>

            <div className="contact-links">
                <a href="https://github.com/Nikhil-Sasankan" target="_blank" rel="noopener noreferrer">
                    <img src="github_logo.png" className='rounded-image' alt="GitHub" />
                </a>
                <a href="https://www.linkedin.com/in/nikhil-sasankan-1621b51aa/" target="_blank" rel="noopener noreferrer">
                    <img src="linkedin_logo.png" className='rounded-image' alt="LinkedIn" />
                </a>
                <a href="mailto:nikhilsasankan@gmail.com" target="_blank" rel="noopener noreferrer">
                    <img src="email.png" className='rounded-image' alt="LinkedIn" />
                </a>
            </div>
        </div>
    );
};

export default ContactPage;
