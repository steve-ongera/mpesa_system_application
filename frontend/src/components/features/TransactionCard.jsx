import React from 'react';
import { ArrowUpRight, ArrowDownLeft, ArrowUpFromLine, ArrowDownToLine } from 'lucide-react';
import Badge from '../common/Badge';
import Card from '../common/Card';
import { formatCurrency, formatDate } from '../../utils/formatters';

const TransactionCard = ({ transaction }) => {
  const getIcon = (type) => {
    switch(type) {
      case 'SEND': return <ArrowUpRight className="text-red-500" />;
      case 'RECEIVE': return <ArrowDownLeft className="text-green-500" />;
      case 'DEPOSIT': return <ArrowDownToLine className="text-blue-500" />;
      case 'WITHDRAW': return <ArrowUpFromLine className="text-orange-500" />;
      default: return null;
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      COMPLETED: 'success',
      PENDING: 'warning',
      FAILED: 'error',
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  return (
    <Card hover className="cursor-pointer">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            {getIcon(transaction.transaction_type)}
          </div>
          <div>
            <p className="font-medium text-gray-900">
              {transaction.transaction_type}
            </p>
            <p className="text-sm text-gray-500">
              {transaction.transaction_code}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className={`font-bold ${transaction.transaction_type === 'SEND' ? 'text-red-600' : 'text-green-600'}`}>
            {transaction.transaction_type === 'SEND' ? '-' : '+'}
            {formatCurrency(transaction.amount)}
          </p>
          <p className="text-xs text-gray-500">{formatDate(transaction.created_at)}</p>
        </div>
      </div>
    </Card>
  );
};

export default TransactionCard;