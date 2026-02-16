import React from 'react';
import { Heart } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left */}
          <div className="text-center md:text-left">
            <p className="text-sm text-gray-600">
              © {currentYear} M-Pesa System. All rights reserved.
            </p>
          </div>

          {/* Center */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Made with</span>
            <Heart size={16} className="text-red-500 fill-current" />
            <span>by Developers</span>
          </div>

          {/* Right */}
          <div className="flex items-center gap-6 text-sm">
            <a href="#" className="text-gray-600 hover:text-green-600 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-600 hover:text-green-600 transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-gray-600 hover:text-green-600 transition-colors">
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;