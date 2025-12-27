import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { membersAPI, groupsAPI } from '../services/api';

const Members = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [transferMember, setTransferMember] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    bcHolder: '',
    joinDate: new Date().toISOString().split('T')[0],
    status: 'active',
  });

  const [transferData, setTransferData] = useState({
    newBc: '',
    transferDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // BC Controllers list
  const bcControllers = [
    'KALYMAN_SADAMANO JAMARKAR (N08553)',
    'RAJESH PATEL (N08554)',
    'PRIYA SHARMA (N08555)',
    'AMIT KUMAR (N08556)',
    'SNEHA SINGH (N08557)',
    'VIKRAM REDDY (N08558)',
  ];

  useEffect(() => {
    fetchData();
  }, [groupId]);

  const fetchData = async () => {
    try {
      const [groupRes, membersRes] = await Promise.all([
        groupsAPI.getById(groupId),
        membersAPI.getByGroup(groupId),
      ]);
      setGroup(groupRes.data);
      setMembers(membersRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        groupId,
        joinDate: new Date(formData.joinDate).toISOString(),
      };

      if (editingMember) {
        await membersAPI.update(editingMember.id, data);
        alert('Member updated successfully!');
      } else {
        await membersAPI.create(data);
        alert('Member added successfully!');
      }

      setShowMemberModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving member:', error);
      alert('Failed to save member');
    }
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      phone: member.phone,
      email: member.email || '',
      address: member.address || '',
      bcHolder: member.bcHolder,
      joinDate: new Date(member.joinDate).toISOString().split('T')[0],
      status: member.status,
    });
    setShowMemberModal(true);
  };

  const handleDelete = async (memberId) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      try {
        await membersAPI.delete(memberId);
        alert('Member deleted successfully!');
        fetchData();
      } catch (error) {
        console.error('Error deleting member:', error);
        alert('Failed to delete member');
      }
    }
  };

  const handleTransferBC = async (e) => {
    e.preventDefault();
    try {
      await membersAPI.transferBC({
        memberId: transferMember.id,
        newBc: transferData.newBc,
        transferDate: new Date(transferData.transferDate).toISOString(),
      });
      alert('BC transferred successfully!');
      setShowTransferModal(false);
      setTransferMember(null);
      setTransferData({ newBc: '', transferDate: new Date().toISOString().split('T')[0], notes: '' });
      fetchData();
    } catch (error) {
      console.error('Error transferring BC:', error);
      alert('Failed to transfer BC');
    }
  };

  const openTransferModal = (member) => {
    setTransferMember(member);
    setTransferData({
      newBc: '',
      transferDate: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setShowTransferModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      bcHolder: '',
      joinDate: new Date().toISOString().split('T')[0],
      status: 'active',
    });
    setEditingMember(null);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-xl text-gray-600">Loading...</div></div>;
  }

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => navigate('/groups')}
          className="text-blue-600 hover:text-blue-700 flex items-center gap-2 mb-4"
        >
          <i className="fas fa-arrow-left"></i> Back to Groups
        </button>
        
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">{group?.name} - Members</h2>
            <p className="text-gray-600 mt-1">Total Members: {members.length}/{group?.maxMembers}</p>
          </div>
          <button
            onClick={() => { resetForm(); setShowMemberModal(true); }}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <i className="fas fa-user-plus"></i> Add Member
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((member) => {
          const initials = member.name.split(' ').map(n => n[0]).join('').toUpperCase();
          return (
            <div key={member.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 relative">
                <div className="absolute top-4 right-4 flex gap-2">
                  <button onClick={() => handleEdit(member)} className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors">
                    <i className="fas fa-edit"></i>
                  </button>
                  <button onClick={() => handleDelete(member.id)} className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors">
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
                <div className="w-16 h-16 rounded-full bg-white text-purple-600 flex items-center justify-center text-xl font-bold mb-3">
                  {initials}
                </div>
                <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                <p className="text-sm opacity-90">ID: CFM{member.id.substring(0, 4).toUpperCase()}</p>
              </div>

              <div className="p-6 space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Phone</span>
                  <span className="font-semibold">{member.phone}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Email</span>
                  <span className="font-semibold text-sm">{member.email || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">BC Holder</span>
                  <span className="font-semibold text-sm">{member.bcHolder}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Join Date</span>
                  <span className="font-semibold">{formatDate(member.joinDate)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">EMI Paid</span>
                  <span className="font-semibold">{member.emiPaidCount}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Pending</span>
                  <span className={`font-semibold ${member.pendingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(member.pendingAmount)}
                  </span>
                </div>
                
                <button
                  onClick={() => openTransferModal(member)}
                  className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <i className="fas fa-exchange-alt"></i> Transfer BC
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Member Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-gray-800">{editingMember ? 'Edit Member' : 'Add New Member'}</h3>
              <button onClick={() => { setShowMemberModal(false); resetForm(); }} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter full name" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                <input type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter phone number" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter email" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                <textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} rows="2" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter address" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">BC Holder *</label>
                <select required value={formData.bcHolder} onChange={(e) => setFormData({ ...formData, bcHolder: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Select BC</option>
                  {bcControllers.map((bc) => (
                    <option key={bc} value={bc}>{bc}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Join Date *</label>
                <input type="date" required value={formData.joinDate} onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status *</label>
                <select required value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => { setShowMemberModal(false); resetForm(); }} className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">{editingMember ? 'Update Member' : 'Add Member'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer BC Modal */}
      {showTransferModal && transferMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full">
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-gray-800">Transfer BC</h3>
              <button onClick={() => { setShowTransferModal(false); setTransferMember(null); }} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>

            <form onSubmit={handleTransferBC} className="p-6 space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Member Details</h4>
                <p><strong>{transferMember.name}</strong></p>
                <p className="text-sm text-gray-600">Phone: {transferMember.phone}</p>
                <p className="text-sm text-gray-600">Group: {group?.name}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Current BC</h4>
                <p>{transferMember.bcHolder}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Transfer to BC *</label>
                <select required value={transferData.newBc} onChange={(e) => setTransferData({ ...transferData, newBc: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Select New BC</option>
                  {bcControllers.filter(bc => bc !== transferMember.bcHolder).map((bc) => (
                    <option key={bc} value={bc}>{bc}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Transfer Date *</label>
                <input type="date" required value={transferData.transferDate} onChange={(e) => setTransferData({ ...transferData, transferDate: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Notes (Optional)</label>
                <textarea value={transferData.notes} onChange={(e) => setTransferData({ ...transferData, notes: e.target.value })} rows="3" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter transfer notes" />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => { setShowTransferModal(false); setTransferMember(null); }} className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                  <i className="fas fa-exchange-alt"></i> Transfer BC
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Members;
