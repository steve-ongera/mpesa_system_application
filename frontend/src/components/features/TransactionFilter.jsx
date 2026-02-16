import React from 'react';
import { Filter } from 'lucide-react';
import Button from '../common/Button';

const TransactionFilter = ({ filters, onFilterChange, onApply }) => {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <Filter size={20} />
        <h3 className="font-medium">Filters</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <select
            value={filters.transaction_type}
            onChange={(e) => onFilterChange('transaction_type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="ALL">All Types</option>
            <option value="SEND">Send</option>
            <option value="RECEIVE">Receive</option>
            <option value="DEPOSIT">Deposit</option>
            <option value="WITHDRAW">Withdraw</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="ALL">All Status</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>

        <div className="flex items-end">
          <Button onClick={onApply} fullWidth>
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TransactionFilter;