import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, ArrowDownToLine, ArrowUpFromLine, History } from 'lucide-react';
import Card from '../common/Card';

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      title: 'Send Money',
      icon: Send,
      color: 'bg-green-500',
      path: '/send-money',
    },
    {
      title: 'Deposit',
      icon: ArrowDownToLine,
      color: 'bg-blue-500',
      path: '/deposit',
    },
    {
      title: 'Withdraw',
      icon: ArrowUpFromLine,
      color: 'bg-orange-500',
      path: '/withdraw',
    },
    {
      title: 'History',
      icon: History,
      color: 'bg-purple-500',
      path: '/transactions',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.path}
            onClick={() => navigate(action.path)}
            className="p-6 bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-200 group"
          >
            <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              <Icon className="text-white" size={24} />
            </div>
            <p className="text-sm font-medium text-gray-900">{action.title}</p>
          </button>
        );
      })}
    </div>
  );
};

export default QuickActions;