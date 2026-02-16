import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Shield, Clock, TrendingUp } from 'lucide-react';
import Button from '../../components/common/Button';

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Send Money,
            <span className="text-green-600"> Anytime, Anywhere</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Fast, secure, and reliable mobile money transfer system.
            Join thousands of users managing their finances better.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="primary"
              size="xl"
              onClick={() => navigate('/register')}
            >
              Get Started Free
            </Button>
            <Button
              variant="outline"
              size="xl"
              onClick={() => navigate('/login')}
            >
              Sign In
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Shield size={20} className="text-green-600" />
              <span>Bank-level Security</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={20} className="text-green-600" />
              <span>24/7 Support</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp size={20} className="text-green-600" />
              <span>10,000+ Users</span>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose M-Pesa System?
            </h2>
            <p className="text-xl text-gray-600">
              Experience the future of mobile money
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="text-green-600" size={32} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Get started in just 3 simple steps
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {steps.map((step, index) => (
                <div key={index} className="text-center relative">
                  <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">
                    {step.description}
                  </p>
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-green-200 -translate-x-1/2" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-12">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/register')}
            >
              Start Your Journey
            </Button>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Join thousands of users already enjoying seamless transactions
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="secondary"
              size="xl"
              onClick={() => navigate('/register')}
            >
              Create Free Account
            </Button>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 text-lg font-medium text-white border-2 border-white rounded-lg hover:bg-white hover:text-green-600 transition-all"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2024 M-Pesa System. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;