import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { groupsAPI } from '../services/api';

const Groups = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    totalChitAmount: '',
    maxMembers: 25,
    description: '',
  });

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      console.log('Fetching groups...');
      const response = await groupsAPI.getAll();
      console.log('Groups response:', response.data);
      setGroups(response.data);
    } catch (error) {
      console.error('Error fetching groups:', error);
      console.error('Error details:', error.response || error.message);
      alert(`Failed to fetch groups: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        totalChitAmount: parseFloat(formData.totalChitAmount),
        maxMembers: parseInt(formData.maxMembers),
      };

      console.log('Submitting group data:', data);

      if (editingGroup) {
        const response = await groupsAPI.update(editingGroup.id, data);
        console.log('Update response:', response.data);
        alert('Group updated successfully!');
      } else {
        const response = await groupsAPI.create(data);
        console.log('Create response:', response.data);
        alert('Group created successfully!');
      }

      setShowModal(false);
      resetForm();
      fetchGroups();
    } catch (error) {
      console.error('Error saving group:', error);
      console.error('Error details:', error.response || error.message);
      alert(`Failed to save group: ${error.response?.data?.detail || error.message}`);
    }
  };

  const handleEdit = (group) => {
    setEditingGroup(group);
    setFormData({
      name: group.name,
      totalChitAmount: group.totalChitAmount,
      maxMembers: group.maxMembers,
      description: group.description || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (groupId) => {
    if (window.confirm('Are you sure you want to delete this group? This will also delete all members.')) {
      try {
        await groupsAPI.delete(groupId);
        alert('Group deleted successfully!');
        fetchGroups();
      } catch (error) {
        console.error('Error deleting group:', error);
        alert('Failed to delete group');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      totalChitAmount: '',
      maxMembers: 25,
      description: '',
    });
    setEditingGroup(null);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-xl text-gray-600">Loading...</div></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Chit Fund Groups</h2>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <i className="fas fa-plus"></i> Add New Group
        </button>
      </div>

      {groups.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg mb-4">No groups found. Create your first group!</p>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
          >
            <i className="fas fa-plus"></i> Create First Group
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
          <div key={group.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 relative">
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={() => handleEdit(group)}
                  className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                >
                  <i className="fas fa-edit"></i>
                </button>
                <button
                  onClick={() => handleDelete(group.id)}
                  className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
              <h3 className="text-2xl font-bold mb-2">{group.name}</h3>
              <p className="text-sm opacity-90">{group.description || 'No description'}</p>
              <div className="flex justify-between mt-4">
                <div>
                  <div className="text-xs opacity-75">Total Amount</div>
                  <div className="text-lg font-bold">{formatCurrency(group.totalChitAmount)}</div>
                </div>
                <div>
                  <div className="text-xs opacity-75">Monthly EMI</div>
                  <div className="text-lg font-bold">{formatCurrency(group.emiAmount)}</div>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Total Members</span>
                <span className="font-semibold">{group.membersCount}/{group.maxMembers}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Vacancies</span>
                <span className="font-semibold text-orange-600">{group.vacancies}</span>
              </div>
              <button
                onClick={() => navigate(`/members/${group.id}`)}
                className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <i className="fas fa-eye"></i> View Members ({group.membersCount})
              </button>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-gray-800">
                {editingGroup ? 'Edit Group' : 'Add New Group'}
              </h3>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Group Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter group name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Total Chit Amount (₹) *
                </label>
                <input
                  type="number"
                  required
                  value={formData.totalChitAmount}
                  onChange={(e) => setFormData({ ...formData, totalChitAmount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter total amount"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Maximum Members *
                </label>
                <input
                  type="number"
                  required
                  value={formData.maxMembers}
                  onChange={(e) => setFormData({ ...formData, maxMembers: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter maximum members"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter group description"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingGroup ? 'Update Group' : 'Create Group'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Groups;
