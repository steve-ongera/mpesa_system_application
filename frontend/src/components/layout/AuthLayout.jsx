import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import './auth-layout.css'; // Import the CSS file

const AuthLayout = () => {
  return (
    <div className="auth-layout">
      {/* Left Side - Branding */}
      <div className="auth-brand">
        <div>
          <Link to="/" className="auth-logo">
            <div className="auth-logo-icon">
              <span>M</span>
            </div>
            <span className="auth-logo-text">M-Pesa System</span>
          </Link>

          <div className="auth-brand-content">
            <h1 className="auth-brand-title">
              Send Money,
              <br />
              Anytime, Anywhere
            </h1>
            <p className="auth-brand-subtitle">
              Fast, secure, and reliable mobile money transfer system. 
              Send money to anyone, deposit cash, and manage your finances with ease.
            </p>

            {/* Features */}
            <div className="auth-features">
              <div className="auth-feature">
                <svg className="auth-feature-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div className="auth-feature-content">
                  <h3 className="auth-feature-title">Instant Transfers</h3>
                  <p className="auth-feature-description">Send money instantly to any phone number</p>
                </div>
              </div>

              <div className="auth-feature">
                <svg className="auth-feature-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div className="auth-feature-content">
                  <h3 className="auth-feature-title">Secure Transactions</h3>
                  <p className="auth-feature-description">Bank-level security with PIN protection</p>
                </div>
              </div>

              <div className="auth-feature">
                <svg className="auth-feature-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div className="auth-feature-content">
                  <h3 className="auth-feature-title">24/7 Availability</h3>
                  <p className="auth-feature-description">Access your money anytime, anywhere</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom text */}
        <div className="auth-copyright">
          <p>© 2024 M-Pesa System. All rights reserved.</p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="auth-form-section">
        <div className="auth-form-container">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;