import React from 'react';
import { Heart, Shield, Clock, Users, CheckCircle, Facebook, Twitter, Instagram } from 'lucide-react';
import './footer.css'; // Import the CSS file

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="footer-container">
        <div className="footer-content">
          {/* Top Section */}
          <div className="footer-top">
            {/* Left */}
            <div className="footer-left">
              <div className="footer-copyright">
                <p>
                  <span className="highlight">M-Pesa System</span>
                </p>
                <p>
                  © <span className="current-year">{currentYear}</span> All rights reserved.
                </p>
                <div className="footer-legal-badge">
                  <CheckCircle size={14} />
                  Licensed and Regulated
                </div>
              </div>
            </div>

            {/* Center */}
            <div className="footer-center">
              <div className="footer-made-with">
                <span>Made with</span>
                <Heart className="footer-heart-icon" />
                <span>by</span>
                <span className="footer-developer">Developers</span>
              </div>
            </div>

            {/* Right */}
            <div className="footer-right">
              <div className="footer-links">
                <a href="/privacy" className="footer-link">
                  Privacy Policy
                </a>
                <a href="/terms" className="footer-link">
                  Terms of Service
                </a>
                <a href="/support" className="footer-link">
                  Support
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Section with Additional Info */}
          <div className="footer-bottom">
            <div className="footer-stats">
              <div className="footer-stat">
                <span className="footer-stat-dot"></span>
                <span>24/7 Support</span>
              </div>
              <div className="footer-stat">
                <Clock size={14} />
                <span>Instant Transfers</span>
              </div>
              <div className="footer-stat">
                <Users size={14} />
                <span>1M+ Users</span>
              </div>
            </div>

            <div className="footer-security">
              <span className="footer-badge">
                <Shield size={14} />
                SSL Secure
              </span>
              <span className="footer-badge">
                <CheckCircle size={14} />
                Verified
              </span>
            </div>
          </div>

          {/* Social Links (Optional) */}
          <div className="footer-social">
            <a 
              href="https://facebook.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="footer-social-link"
              aria-label="Facebook"
            >
              <Facebook size={16} />
            </a>
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="footer-social-link"
              aria-label="Twitter"
            >
              <Twitter size={16} />
            </a>
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="footer-social-link"
              aria-label="Instagram"
            >
              <Instagram size={16} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;