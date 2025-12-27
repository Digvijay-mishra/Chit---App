import React, { useState, useEffect } from 'react';
import { membersAPI, groupsAPI } from '../services/api';

const TallySheet = () => {
  const [tallyData, setTallyData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRemindModal, setShowRemindModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  
  // Filters
  const [filterGroup, setFilterGroup] = useState('');
  const [filterName, setFilterName] = useState('');
  const [availableGroups, setAvailableGroups] = useState([]);

  const [reminderData, setReminderData] = useState({
    mode: 'sms',
    message: '',
    scheduleDate: new Date().toISOString().split('T')[0],
    scheduleTime: '10:00',
  });

  useEffect(() => {
    fetchTallyData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filterGroup, filterName, tallyData]);

  const fetchTallyData = async () => {
    try {
      const [membersRes, groupsRes] = await Promise.all([
        membersAPI.getAll(),
        groupsAPI.getAll(),
      ]);

      const members = membersRes.data;
      const groups = groupsRes.data;
      
      setAvailableGroups(groups);

      // Include ALL members (not just those with pending)
      const allMembers = members.map((m) => {
        const group = groups.find((g) => g.id === m.groupId);
        return {
          ...m,
          groupName: group?.name || 'Unknown',
          groupEmi: group?.emiAmount || 0,
        };
      });

      setTallyData(allMembers);
      setFilteredData(allMembers);
    } catch (error) {
      console.error('Error fetching tally data:', error);
      alert('Failed to fetch tally data');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...tallyData];

    // Filter by group
    if (filterGroup) {
      filtered = filtered.filter((item) => item.groupName === filterGroup);
    }

    // Filter by name
    if (filterName) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(filterName.toLowerCase())
      );
    }

    setFilteredData(filtered);
  };

  const handleRemindClick = (member) => {
    setSelectedMember(member);
    
    // Calculate penalty if applicable
    const penalty = calculatePenalty(member);
    const totalDue = member.pendingAmount + penalty;
    
    const defaultMessage = `Dear ${member.name},

This is a reminder for your installment payment for ${member.groupName}.

Pending Amount: ₹${member.pendingAmount.toLocaleString()}${penalty > 0 ? `\nPenalty (Late Payment): ₹${penalty.toLocaleString()}\nTotal Due: ₹${totalDue.toLocaleString()}` : ''}
EMI Amount: ₹${member.groupEmi.toLocaleString()}
EMI Paid: ${member.emiPaidCount}

Please make the payment at your earliest convenience.

Thank you,
KA Associates`;

    setReminderData({
      mode: 'sms',
      message: defaultMessage,
      scheduleDate: new Date().toISOString().split('T')[0],
      scheduleTime: '10:00',
    });
    setShowRemindModal(true);
  };

  const calculatePenalty = (member) => {
    // If no pending, no penalty
    if (member.pendingAmount <= 0) return 0;
    
    // Check if payment is late (more than 1 month overdue)
    const joinDate = new Date(member.joinDate);
    const now = new Date();
    const monthsSinceJoin = (now.getFullYear() - joinDate.getFullYear()) * 12 + (now.getMonth() - joinDate.getMonth());
    
    // If they should have paid more installments than they did
    if (monthsSinceJoin > member.emiPaidCount) {
      // Determine if prized or not (you can add prized status to member model later)
      const isPrized = member.isPrized || false;
      const penaltyRate = isPrized ? 0.06 : 0.03; // 6% for prized, 3% for unprized
      return Math.round(member.pendingAmount * penaltyRate);
    }
    
    return 0;
  };

  const handleSendReminder = async () => {
    try {
      console.log('Sending reminder:', {
        member: selectedMember,
        ...reminderData,
      });

      alert(
        `Reminder scheduled!\n\nMode: ${reminderData.mode.toUpperCase()}\nTo: ${selectedMember.name} (${selectedMember.phone})\nDate: ${reminderData.scheduleDate} at ${reminderData.scheduleTime}\n\nMessage will be sent via ${reminderData.mode.toUpperCase()}.`
      );

      setShowRemindModal(false);
      setSelectedMember(null);
    } catch (error) {
      console.error('Error sending reminder:', error);
      alert('Failed to send reminder');
    }
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

  const totalPending = filteredData.reduce((sum, item) => sum + item.pendingAmount, 0);
  const totalPenalties = filteredData.reduce((sum, item) => sum + calculatePenalty(item), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Tally Sheet - All Members</h2>
        <button
          onClick={() => window.print()}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <i className="fas fa-download"></i> Export as PDF
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <h3 className="text-lg font-semibold mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Group</label>
            <select
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Groups</option>
              {availableGroups.map((group) => (
                <option key={group.id} value={group.name}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Search by Name</label>
            <input
              type="text"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              placeholder="Enter member name..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {(filterGroup || filterName) && (
          <button
            onClick={() => { setFilterGroup(''); setFilterName(''); }}
            className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-semibold"
          >
            <i className="fas fa-times mr-1"></i> Clear Filters
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <h3 className="text-xl font-bold mb-4">Payment Status Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm opacity-90">Total Members</div>
              <div className="text-3xl font-bold">{filteredData.length}</div>
            </div>
            <div>
              <div className="text-sm opacity-90">Total Pending</div>
              <div className="text-3xl font-bold">{formatCurrency(totalPending)}</div>
            </div>
            <div>
              <div className="text-sm opacity-90">Total Penalties</div>
              <div className="text-3xl font-bold text-red-200">{formatCurrency(totalPenalties)}</div>
            </div>
            <div>
              <div className="text-sm opacity-90">Grand Total Due</div>
              <div className="text-3xl font-bold">{formatCurrency(totalPending + totalPenalties)}</div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Group</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Member</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Phone</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">BC Holder</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">EMI Amount</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">EMI Paid</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Pending</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Penalty</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Total Due</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredData.map((item) => {
                const penalty = calculatePenalty(item);
                const totalDue = item.pendingAmount + penalty;
                
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{item.groupName}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.phone}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.bcHolder}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right">{formatCurrency(item.groupEmi)}</td>
                    <td className="px-6 py-4 text-sm text-center text-gray-600">{item.emiPaidCount}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-orange-600 text-right">
                      {formatCurrency(item.pendingAmount)}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-red-600 text-right">
                      {penalty > 0 ? formatCurrency(penalty) : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-red-700 text-right">
                      {formatCurrency(totalDue)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          item.pendingAmount === 0
                            ? 'bg-green-100 text-green-700'
                            : item.pendingAmount > item.groupEmi * 2
                            ? 'bg-red-100 text-red-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}
                      >
                        {item.pendingAmount === 0 ? 'Paid' : item.pendingAmount > item.groupEmi * 2 ? 'Overdue' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleRemindClick(item)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-2 mx-auto"
                      >
                        <i className="fas fa-bell"></i> Remind
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Remind Modal - Same as before */}
      {showRemindModal && selectedMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-gray-800">Send Payment Reminder</h3>
              <button onClick={() => { setShowRemindModal(false); setSelectedMember(null); }} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Recipient Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div><span className="text-sm text-gray-600">Name:</span><p className="font-semibold">{selectedMember.name}</p></div>
                  <div><span className="text-sm text-gray-600">Phone:</span><p className="font-semibold">{selectedMember.phone}</p></div>
                  <div><span className="text-sm text-gray-600">Group:</span><p className="font-semibold">{selectedMember.groupName}</p></div>
                  <div><span className="text-sm text-gray-600">Pending + Penalty:</span><p className="font-semibold text-red-600">{formatCurrency(selectedMember.pendingAmount + calculatePenalty(selectedMember))}</p></div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Select Notification Mode *</label>
                <div className="grid grid-cols-3 gap-4">
                  <button type="button" onClick={() => setReminderData({ ...reminderData, mode: 'sms' })} className={`p-4 rounded-lg border-2 transition-all ${reminderData.mode === 'sms' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-blue-600'}`}>
                    <i className="fas fa-sms text-2xl mb-2 text-blue-600"></i><p className="font-semibold">SMS</p>
                  </button>
                  <button type="button" onClick={() => setReminderData({ ...reminderData, mode: 'whatsapp' })} className={`p-4 rounded-lg border-2 transition-all ${reminderData.mode === 'whatsapp' ? 'border-green-600 bg-green-50' : 'border-gray-300 hover:border-green-600'}`}>
                    <i className="fab fa-whatsapp text-2xl mb-2 text-green-600"></i><p className="font-semibold">WhatsApp</p>
                  </button>
                  <button type="button" onClick={() => setReminderData({ ...reminderData, mode: 'email' })} className={`p-4 rounded-lg border-2 transition-all ${reminderData.mode === 'email' ? 'border-purple-600 bg-purple-50' : 'border-gray-300 hover:border-purple-600'}`}>
                    <i className="fas fa-envelope text-2xl mb-2 text-purple-600"></i><p className="font-semibold">Email</p>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-semibold text-gray-700 mb-2">Schedule Date *</label><input type="date" value={reminderData.scheduleDate} onChange={(e) => setReminderData({ ...reminderData, scheduleDate: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" /></div>
                <div><label className="block text-sm font-semibold text-gray-700 mb-2">Schedule Time *</label><input type="time" value={reminderData.scheduleTime} onChange={(e) => setReminderData({ ...reminderData, scheduleTime: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" /></div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Custom Message *</label>
                <textarea value={reminderData.message} onChange={(e) => setReminderData({ ...reminderData, message: e.target.value })} rows="8" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter your custom message..." />
              </div>

              <div className="flex gap-4 pt-4">
                <button onClick={() => { setShowRemindModal(false); setSelectedMember(null); }} className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                <button onClick={handleSendReminder} className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"><i className="fas fa-paper-plane"></i>Schedule Reminder</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TallySheet;
