import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Branding */}
      <div className="lg:w-1/2 bg-gradient-to-br from-green-600 to-green-800 p-8 lg:p-12 flex flex-col justify-between text-white">
        <div>
          <Link to="/" className="flex items-center gap-2 mb-12">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
              <span className="text-green-600 font-bold text-2xl">M</span>
            </div>
            <span className="text-2xl font-bold">M-Pesa System</span>
          </Link>

          <div className="max-w-md">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              Send Money,
              <br />
              Anytime, Anywhere
            </h1>
            <p className="text-lg text-green-100 mb-8">
              Fast, secure, and reliable mobile money transfer system. 
              Send money to anyone, deposit cash, and manage your finances with ease.
            </p>

            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="font-semibold">Instant Transfers</h3>
                  <p className="text-green-100 text-sm">Send money instantly to any phone number</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="font-semibold">Secure Transactions</h3>
                  <p className="text-green-100 text-sm">Bank-level security with PIN protection</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="font-semibold">24/7 Availability</h3>
                  <p className="text-green-100 text-sm">Access your money anytime, anywhere</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom text */}
        <div className="text-sm text-green-100 mt-8">
          <p>© 2024 M-Pesa System. All rights reserved.</p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;