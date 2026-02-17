import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Shield, Clock, TrendingUp, Phone, Users, Globe, Award } from 'lucide-react';
import Button from '../../components/common/Button';
import './home.css'; // Import the CSS file

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Send,
      title: 'Instant Transfers',
      description: 'Send money to anyone, anywhere, instantly with just a phone number.',
    },
    {
      icon: Shield,
      title: 'Secure & Safe',
      description: 'Bank-level security with PIN protection and encrypted transactions.',
    },
    {
      icon: Clock,
      title: '24/7 Availability',
      description: 'Access your money anytime, anywhere, day or night.',
    },
    {
      icon: TrendingUp,
      title: 'Low Fees',
      description: 'Transparent pricing with the lowest transaction fees in the market.',
    },
  ];

  const steps = [
    {
      number: '1',
      title: 'Register',
      description: 'Create your account with just your phone number',
    },
    {
      number: '2',
      title: 'Add Money',
      description: 'Deposit cash at any of our agent locations',
    },
    {
      number: '3',
      title: 'Transact',
      description: 'Send, receive, and manage your money easily',
    },
  ];

  const stats = [
    { icon: Users, value: '50M+', label: 'Active Users' },
    { icon: Globe, value: '7', label: 'Countries' },
    { icon: Award, value: '450K+', label: 'Agents' },
    { icon: TrendingUp, value: '15+', label: 'Years of Trust' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-6 animate-fadeInUp">
              <div className="bg-mpesa-light">
                <Phone size={48} />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-safaricom-text mb-6 animate-fadeInUp" style={{animationDelay: '0.2s'}}>
              Send Money,
              <span className="text-safaricom-green"> Anytime, Anywhere</span>
            </h1>
            <p className="text-xl text-safaricom-text-light mb-8 max-w-2xl mx-auto animate-fadeInUp" style={{animationDelay: '0.3s'}}>
              Fast, secure, and reliable mobile money transfer system inspired by M-Pesa.
              Join millions of users managing their finances better.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeInUp" style={{animationDelay: '0.4s'}}>
              <button
                className="btn-primary btn-xl"
                onClick={() => navigate('/register')}
              >
                Get Started Free
              </button>
              <button
                className="btn-secondary btn-xl"
                onClick={() => navigate('/login')}
              >
                Sign In
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 flex flex-wrap justify-center gap-8 animate-fadeInUp" style={{animationDelay: '0.5s'}}>
              <div className="trust-indicator">
                <Shield size={20} />
                <span>Bank-level Security</span>
              </div>
              <div className="trust-indicator">
                <Clock size={20} />
                <span>24/7 Support</span>
              </div>
              <div className="trust-indicator">
                <TrendingUp size={20} />
                <span>50M+ Users</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <div className="bg-white py-16 border-y border-safaricom-border">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="stat-card animate-fadeInUp" style={{animationDelay: `${index * 0.1}s`}}>
                  <div className="flex justify-center mb-3">
                    <Icon size={32} />
                  </div>
                  <div className="stat-value">
                    {stat.value}
                  </div>
                  <div className="stat-label">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-safaricom-text mb-4 animate-fadeInUp">
              Why Choose M-Pesa System?
            </h2>
            <p className="text-xl text-safaricom-text-light animate-fadeInUp" style={{animationDelay: '0.1s'}}>
              Experience the future of mobile money
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="feature-card animate-fadeInUp" style={{animationDelay: `${index * 0.1 + 0.2}s`}}>
                  <div className="feature-icon">
                    <Icon />
                  </div>
                  <h3 className="text-xl font-semibold text-safaricom-text mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-safaricom-text-light">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-20 bg-mpesa-light">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-safaricom-text mb-4 animate-fadeInUp">
              How It Works
            </h2>
            <p className="text-xl text-safaricom-text-light animate-fadeInUp" style={{animationDelay: '0.1s'}}>
              Get started in just 3 simple steps
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {steps.map((step, index) => (
                <div key={index} className="step-card animate-fadeInUp" style={{animationDelay: `${index * 0.1 + 0.2}s`}}>
                  <div className="step-number">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-semibold text-safaricom-text mb-2">
                    {step.title}
                  </h3>
                  <p className="text-safaricom-text-light">
                    {step.description}
                  </p>
                  {index < steps.length - 1 && (
                    <div className="step-connector hidden md:block" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-12 animate-fadeInUp" style={{animationDelay: '0.5s'}}>
            <button
              className="btn-primary btn-lg"
              onClick={() => navigate('/register')}
            >
              Start Your Journey
            </button>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content text-center">
            <h2 className="text-4xl font-bold text-white mb-4 animate-fadeInUp">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-white/90 mb-8 animate-fadeInUp" style={{animationDelay: '0.1s'}}>
              Join millions of users already enjoying seamless transactions
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeInUp" style={{animationDelay: '0.2s'}}>
              <button
                className="btn-secondary btn-xl"
                onClick={() => navigate('/register')}
              >
                Create Free Account
              </button>
              <button
                onClick={() => navigate('/login')}
                className="btn-outline-light btn-xl"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container text-center">
          <p>
            © 2024 M-Pesa System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;