import React from 'react';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import Card from '../common/Card';

const StatisticsCard = ({ title, value, change, trend, icon: Icon }) => {
  const isPositive = trend === 'up';

  return (
    <Card padding="normal" hover>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
          {change && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span>{change}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
            <Icon className="text-green-600" size={24} />
          </div>
        )}
      </div>
    </Card>
  );
};

export default StatisticsCard;