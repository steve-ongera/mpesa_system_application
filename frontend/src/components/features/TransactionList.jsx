import React from 'react';
import TransactionCard from './TransactionCard';
import Spinner from '../common/Spinner';

const TransactionList = ({ transactions, loading }) => {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="lg" text="Loading transactions..." />
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No transactions found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <TransactionCard key={transaction.id} transaction={transaction} />
      ))}
    </div>
  );
};

export default TransactionList;