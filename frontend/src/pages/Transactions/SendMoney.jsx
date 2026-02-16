import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, DollarSign, Lock, ArrowRight } from 'lucide-react';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import { transactionAPI } from '../../services/api';
import { useAuthStore, useTransactionStore } from '../../store';
import toast from 'react-hot-toast';

const SendMoney = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const { addTransaction } = useTransactionStore();
  
  const [formData, setFormData] = useState({
    receiver_phone: '',
    amount: '',
    description: '',
    pin: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [transactionCost, setTransactionCost] = useState(0);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
    
    // Calculate transaction cost when amount changes
    if (field === 'amount' && value) {
      calculateTransactionCost(parseFloat(value));
    }
  };

  const calculateTransactionCost = (amount) => {
    // Simple fee structure (you can make this more sophisticated)
    if (amount <= 100) setTransactionCost(0);
    else if (amount <= 500) setTransactionCost(5);
    else if (amount <= 1000) setTransactionCost(10);
    else if (amount <= 2500) setTransactionCost(15);
    else if (amount <= 5000) setTransactionCost(25);
    else if (amount <= 10000) setTransactionCost(45);
    else setTransactionCost(105);
  };

  const validateForm = () => {
    if (!formData.receiver_phone) {
      setError('Please enter recipient phone number');
      return false;
    }

    if (!formData.receiver_phone.startsWith('254') || formData.receiver_phone.length !== 12) {
      setError('Phone number must be in format 254XXXXXXXXX');
      return false;
    }

    if (formData.receiver_phone === user?.phone_number) {
      setError('You cannot send money to yourself');
      return false;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid amount');
      return false;
    }

    if (parseFloat(formData.amount) < 10) {
      setError('Minimum amount to send is KES 10');
      return false;
    }

    const totalCost = parseFloat(formData.amount) + transactionCost;
    if (totalCost > user?.account_balance) {
      setError(`Insufficient balance. You need KES ${totalCost.toFixed(2)} (KES ${formData.amount} + KES ${transactionCost} fee)`);
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setShowConfirmModal(true);
    }
  };

  const handleConfirmTransaction = async () => {
    if (!formData.pin) {
      setError('Please enter your PIN');
      return;
    }

    if (formData.pin.length !== 4) {
      setError('PIN must be 4 digits');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await transactionAPI.sendMoney({
        receiver_phone: formData.receiver_phone,
        amount: formData.amount,
        pin: formData.pin,
        description: formData.description || 'Money transfer',
      });

      const transaction = response.data.data;
      
      // Update user balance
      const newBalance = user.account_balance - parseFloat(formData.amount) - transactionCost;
      updateUser({ account_balance: newBalance });
      
      // Add to transaction store
      addTransaction(transaction);
      
      toast.success('Money sent successfully!');
      setShowConfirmModal(false);
      
      // Navigate to transaction details
      navigate(`/transactions/${transaction.id}`);
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.errors?.pin?.[0] || 'Transaction failed';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(amount || 0);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Send Money</h1>
        <p className="text-gray-600">Transfer money to any M-Pesa user instantly</p>
      </div>

      {error && (
        <Alert 
          type="error" 
          message={error} 
          onClose={() => setError('')}
          className="mb-6"
        />
      )}

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Recipient Phone */}
          <Input
            label="Recipient Phone Number"
            type="tel"
            name="receiver_phone"
            value={formData.receiver_phone}
            onChange={(value) => handleChange('receiver_phone', value)}
            placeholder="254712345678"
            icon={<Phone size={20} />}
            required
            maxLength={12}
            helperText="Enter phone number in format 254XXXXXXXXX"
          />

          {/* Amount */}
          <Input
            label="Amount (KES)"
            type="number"
            name="amount"
            value={formData.amount}
            onChange={(value) => handleChange('amount', value)}
            placeholder="1000.00"
            icon={<DollarSign size={20} />}
            required
            helperText={`Available balance: ${formatCurrency(user?.account_balance)}`}
          />

          {/* Transaction Cost Display */}
          {formData.amount && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Amount to send:</span>
                <span className="text-sm font-medium">{formatCurrency(formData.amount)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Transaction fee:</span>
                <span className="text-sm font-medium">{formatCurrency(transactionCost)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-blue-200">
                <span className="text-sm font-semibold text-gray-900">Total cost:</span>
                <span className="text-sm font-bold text-gray-900">
                  {formatCurrency(parseFloat(formData.amount) + transactionCost)}
                </span>
              </div>
            </div>
          )}

          {/* Description (Optional) */}
          <Input
            label="Description (Optional)"
            type="text"
            name="description"
            value={formData.description}
            onChange={(value) => handleChange('description', value)}
            placeholder="What's this payment for?"
            maxLength={100}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            icon={<ArrowRight size={20} />}
          >
            Continue
          </Button>
        </form>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Important Information:</h4>
          <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
            <li>Minimum amount to send is KES 10</li>
            <li>Maximum amount per transaction is KES 150,000</li>
            <li>Transaction fees apply based on amount</li>
            <li>Money is sent instantly</li>
            <li>You will need your PIN to confirm</li>
          </ul>
        </div>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Transaction"
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Recipient:</span>
              <span className="font-medium">{formData.receiver_phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount:</span>
              <span className="font-medium">{formatCurrency(formData.amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Fee:</span>
              <span className="font-medium">{formatCurrency(transactionCost)}</span>
            </div>
            <div className="flex justify-between pt-3 border-t border-gray-200">
              <span className="font-semibold">Total:</span>
              <span className="font-bold text-lg text-green-600">
                {formatCurrency(parseFloat(formData.amount) + transactionCost)}
              </span>
            </div>
          </div>

          <Input
            label="Enter your PIN to confirm"
            type="password"
            name="pin"
            value={formData.pin}
            onChange={(value) => handleChange('pin', value)}
            placeholder="4-digit PIN"
            icon={<Lock size={20} />}
            required
            maxLength={4}
          />

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
              fullWidth
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmTransaction}
              fullWidth
              loading={loading}
              disabled={loading}
            >
              Confirm & Send
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SendMoney;