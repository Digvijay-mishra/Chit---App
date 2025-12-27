import React, { useState, useEffect } from 'react';
import { membersAPI, groupsAPI, paymentsAPI } from '../services/api';

const Expenses = () => {
  const [activeTab, setActiveTab] = useState('business');
  const [businessData, setBusinessData] = useState({
    totalReceived: 0,
    totalSent: 0,
    balance: 0,
    transactions: [],
  });
  const [personalData, setPersonalData] = useState({
    totalReceived: 0,
    totalSent: 0,
    balance: 0,
    transactions: [],
  });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [expenseType, setExpenseType] = useState('business');
  const [transactionType, setTransactionType] = useState('received');
  const [formData, setFormData] = useState({
    amount: '',
    bcHolder: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  const bcControllers = [
    'KALYMAN_SADAMANO JAMARKAR (N08553)',
    'RAJESH PATEL (N08554)',
    'PRIYA SHARMA (N08555)',
    'AMIT KUMAR (N08556)',
    'SNEHA SINGH (N08557)',
    'VIKRAM REDDY (N08558)',
  ];

  useEffect(() => {
    fetchExpenseData();
  }, []);

  const fetchExpenseData = async () => {
    try {
      // For now, using mock data. You can integrate with backend later
      const mockBusinessTransactions = [
        { id: 1, type: 'received', amount: 50000, bcHolder: 'KALYMAN_SADAMANO JAMARKAR (N08553)', description: 'EMI Collection', date: '2025-12-20' },
        { id: 2, type: 'sent', amount: 20000, bcHolder: 'RAJESH PATEL (N08554)', description: 'Commission Payment', date: '2025-12-22' },
        { id: 3, type: 'received', amount: 30000, bcHolder: 'PRIYA SHARMA (N08555)', description: 'EMI Collection', date: '2025-12-24' },
      ];

      const mockPersonalTransactions = [
        { id: 1, type: 'sent', amount: 5000, description: 'Office Supplies', date: '2025-12-18' },
        { id: 2, type: 'sent', amount: 3000, description: 'Travel Expenses', date: '2025-12-21' },
        { id: 3, type: 'received', amount: 10000, description: 'Personal Income', date: '2025-12-23' },
      ];

      const businessReceived = mockBusinessTransactions.filter(t => t.type === 'received').reduce((sum, t) => sum + t.amount, 0);
      const businessSent = mockBusinessTransactions.filter(t => t.type === 'sent').reduce((sum, t) => sum + t.amount, 0);

      const personalReceived = mockPersonalTransactions.filter(t => t.type === 'received').reduce((sum, t) => sum + t.amount, 0);
      const personalSent = mockPersonalTransactions.filter(t => t.type === 'sent').reduce((sum, t) => sum + t.amount, 0);

      setBusinessData({
        totalReceived: businessReceived,
        totalSent: businessSent,
        balance: businessReceived - businessSent,
        transactions: mockBusinessTransactions,
      });

      setPersonalData({
        totalReceived: personalReceived,
        totalSent: personalSent,
        balance: personalReceived - personalSent,
        transactions: mockPersonalTransactions,
      });
    } catch (error) {
      console.error('Error fetching expense data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newTransaction = {
      id: Date.now(),
      type: transactionType,
      amount: parseFloat(formData.amount),
      bcHolder: expenseType === 'business' ? formData.bcHolder : undefined,
      description: formData.description,
      date: formData.date,
    };

    if (expenseType === 'business') {
      setBusinessData(prev => ({
        ...prev,
        transactions: [newTransaction, ...prev.transactions],
        totalReceived: transactionType === 'received' ? prev.totalReceived + newTransaction.amount : prev.totalReceived,
        totalSent: transactionType === 'sent' ? prev.totalSent + newTransaction.amount : prev.totalSent,
        balance: transactionType === 'received' 
          ? prev.balance + newTransaction.amount 
          : prev.balance - newTransaction.amount,
      }));
    } else {
      setPersonalData(prev => ({
        ...prev,
        transactions: [newTransaction, ...prev.transactions],
        totalReceived: transactionType === 'received' ? prev.totalReceived + newTransaction.amount : prev.totalReceived,
        totalSent: transactionType === 'sent' ? prev.totalSent + newTransaction.amount : prev.totalSent,
        balance: transactionType === 'received' 
          ? prev.balance + newTransaction.amount 
          : prev.balance - newTransaction.amount,
      }));
    }

    setShowModal(false);
    resetForm();
    alert('Transaction added successfully!');
  };

  const resetForm = () => {
    setFormData({
      amount: '',
      bcHolder: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const currentData = activeTab === 'business' ? businessData : personalData;

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-xl text-gray-600">Loading...</div></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Expenses Management</h2>
        <button
          onClick={() => { setExpenseType(activeTab); resetForm(); setShowModal(true); }}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <i className="fas fa-plus"></i> Add Transaction
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('business')}
          className={`px-6 py-3 font-semibold transition-all ${
            activeTab === 'business'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          <i className="fas fa-briefcase mr-2"></i> Business
        </button>
        <button
          onClick={() => setActiveTab('personal')}
          className={`px-6 py-3 font-semibold transition-all ${
            activeTab === 'personal'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          <i className="fas fa-user mr-2"></i> Personal
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 font-semibold">Total Received</h3>
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
              <i className="fas fa-arrow-down text-xl"></i>
            </div>
          </div>
          <div className="text-3xl font-bold text-green-600">
            {formatCurrency(currentData.totalReceived)}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 font-semibold">Total Sent</h3>
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-lg flex items-center justify-center">
              <i className="fas fa-arrow-up text-xl"></i>
            </div>
          </div>
          <div className="text-3xl font-bold text-red-600">
            {formatCurrency(currentData.totalSent)}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 font-semibold">Balance</h3>
            <div className={`w-12 h-12 ${currentData.balance >= 0 ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'} rounded-lg flex items-center justify-center`}>
              <i className="fas fa-wallet text-xl"></i>
            </div>
          </div>
          <div className={`text-3xl font-bold ${currentData.balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
            {formatCurrency(currentData.balance)}
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800">Recent Transactions</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Type</th>
                {activeTab === 'business' && (
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">BC Holder</th>
                )}
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Description</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentData.transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{formatDate(transaction.date)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      transaction.type === 'received' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {transaction.type === 'received' ? '↓ Received' : '↑ Sent'}
                    </span>
                  </td>
                  {activeTab === 'business' && (
                    <td className="px-6 py-4 text-sm text-gray-600">{transaction.bcHolder || 'N/A'}</td>
                  )}
                  <td className="px-6 py-4 text-sm text-gray-900">{transaction.description}</td>
                  <td className={`px-6 py-4 text-sm font-semibold text-right ${
                    transaction.type === 'received' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'received' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-gray-800">Add {expenseType === 'business' ? 'Business' : 'Personal'} Transaction</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Transaction Type *</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setTransactionType('received')}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                      transactionType === 'received'
                        ? 'border-green-600 bg-green-50 text-green-700'
                        : 'border-gray-300 hover:border-green-600'
                    }`}
                  >
                    <i className="fas fa-arrow-down mr-2"></i> Money Received
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransactionType('sent')}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                      transactionType === 'sent'
                        ? 'border-red-600 bg-red-50 text-red-700'
                        : 'border-gray-300 hover:border-red-600'
                    }`}
                  >
                    <i className="fas fa-arrow-up mr-2"></i> Money Sent
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Amount (₹) *</label>
                <input
                  type="number"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter amount"
                />
              </div>

              {expenseType === 'business' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">BC Holder</label>
                  <select
                    value={formData.bcHolder}
                    onChange={(e) => setFormData({ ...formData, bcHolder: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select BC (Optional)</option>
                    {bcControllers.map((bc) => (
                      <option key={bc} value={bc}>{bc}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter description"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Date *</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Add Transaction</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
