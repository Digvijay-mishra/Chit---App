import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardAPI, groupsAPI } from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalGroups: 0,
    activeGroups: 0,
    closedGroups: 0,
    totalMembers: 0,
    activeMembers: 0,
    inactiveMembers: 0,
    totalCollection: 0,
    monthlyCollection: 0,
    totalPending: 0,
    overduePending: 0,
  });
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    totalChitAmount: '',
    maxMembers: 25,
    description: '',
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      console.log('Fetching dashboard data...');
      
      // Fetch stats and groups separately to handle errors independently
      let statsData = {
        totalGroups: 0,
        activeGroups: 0,
        closedGroups: 0,
        totalMembers: 0,
        activeMembers: 0,
        inactiveMembers: 0,
        totalCollection: 0,
        monthlyCollection: 0,
        totalPending: 0,
        overduePending: 0,
      };
      
      let groupsData = [];

      // Try to fetch stats
      try {
        const statsRes = await dashboardAPI.getStats();
        console.log('Dashboard stats:', statsRes.data);
        statsData = statsRes.data;
      } catch (statsError) {
        console.error('Error fetching stats (continuing anyway):', statsError);
      }

      // Try to fetch groups (this is critical)
      try {
        const groupsRes = await groupsAPI.getAll();
        console.log('Dashboard groups:', groupsRes.data);
        groupsData = groupsRes.data;
      } catch (groupsError) {
        console.error('Error fetching groups:', groupsError);
        alert('Failed to load groups. Please refresh the page.');
      }

      setStats(statsData);
      setGroups(groupsData);
      
      console.log('State updated - Stats:', statsData);
      console.log('State updated - Groups:', groupsData);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      console.error('Error details:', error.response || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('=== GROUP SUBMISSION STARTED ===');
    console.log('Form data:', formData);
    
    try {
      const data = {
        ...formData,
        totalChitAmount: parseFloat(formData.totalChitAmount),
        maxMembers: parseInt(formData.maxMembers),
      };

      console.log('Parsed data:', data);
      console.log('Editing group:', editingGroup);

      if (editingGroup) {
        console.log('Updating group ID:', editingGroup.id);
        const response = await groupsAPI.update(editingGroup.id, data);
        console.log('Update response:', response);
        alert('Group updated successfully!');
      } else {
        console.log('Creating new group...');
        console.log('API call to:', '/api/groups/');
        const response = await groupsAPI.create(data);
        console.log('Create response:', response);
        console.log('Created group:', response.data);
        alert('Group created successfully!');
      }

      console.log('Closing modal and refreshing...');
      setShowGroupModal(false);
      resetForm();
      await fetchDashboardData(); // Use await to ensure it completes
      console.log('=== GROUP SUBMISSION COMPLETED ===');
    } catch (error) {
      console.error('=== GROUP SUBMISSION ERROR ===');
      console.error('Error object:', error);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);
      
      const errorMessage = error.response?.data?.detail 
        || error.response?.statusText 
        || error.message 
        || 'Unknown error occurred';
      
      alert(`Failed to save group: ${errorMessage}\n\nCheck console (F12) for details.`);
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
    setShowGroupModal(true);
  };

  const handleDelete = async (groupId) => {
    if (window.confirm('Are you sure you want to delete this group? This will also delete all members.')) {
      try {
        console.log('Deleting group ID:', groupId);
        const response = await groupsAPI.delete(groupId);
        console.log('Delete response:', response);
        alert('Group deleted successfully!');
        await fetchDashboardData();
      } catch (error) {
        console.error('Error deleting group:', error);
        console.error('Error details:', error.response || error.message);
        alert(`Failed to delete group: ${error.response?.data?.detail || error.message}`);
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
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-gray-600 font-semibold">Total Groups</h3>
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
              <i className="fas fa-users text-xl"></i>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-800 mb-2">
            {stats.totalGroups}
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Active: {stats.activeGroups}</span>
            <span>Closed: {stats.closedGroups}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-gray-600 font-semibold">Total Members</h3>
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
              <i className="fas fa-user-friends text-xl"></i>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-800 mb-2">
            {stats.totalMembers}
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Active: {stats.activeMembers}</span>
            <span>Inactive: {stats.inactiveMembers}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-gray-600 font-semibold">Total Collection</h3>
            <div className="w-12 h-12 bg-cyan-100 text-cyan-600 rounded-lg flex items-center justify-center">
              <i className="fas fa-rupee-sign text-xl"></i>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-800 mb-2">
            {formatCurrency(stats.totalCollection)}
          </div>
          <div className="text-sm text-gray-500">
            This Month: {formatCurrency(stats.monthlyCollection)}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-gray-600 font-semibold">Pending Payments</h3>
            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center">
              <i className="fas fa-clock text-xl"></i>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-800 mb-2">
            {formatCurrency(stats.totalPending)}
          </div>
          <div className="text-sm text-gray-500">
            Overdue: {formatCurrency(stats.overduePending)}
          </div>
        </div>
      </div>

      {/* Groups Section */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Chit Fund Groups ({groups.length} groups)
          </h2>
          <button
            onClick={() => { resetForm(); setShowGroupModal(true); }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <i className="fas fa-plus"></i> Add New Group
          </button>
        </div>

        {console.log('Groups array:', groups)}
        {console.log('Groups length:', groups.length)}
        {console.log('Groups length === 0?', groups.length === 0)}

        {!groups || groups.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">No groups found. Create your first group!</p>
            <button
              onClick={() => { resetForm(); setShowGroupModal(true); }}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
            >
              <i className="fas fa-plus"></i> Create First Group
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <div key={group.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 relative">
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button onClick={() => handleEdit(group)} className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors">
                      <i className="fas fa-edit text-sm"></i>
                    </button>
                    <button onClick={() => handleDelete(group.id)} className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors">
                      <i className="fas fa-trash text-sm"></i>
                    </button>
                  </div>
                  <h3 className="text-lg font-bold mb-1">{group.name}</h3>
                  <p className="text-xs opacity-90">{group.description || 'No description'}</p>
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-semibold">{formatCurrency(group.totalChitAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Monthly EMI:</span>
                    <span className="font-semibold">{formatCurrency(group.emiAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Members:</span>
                    <span className="font-semibold">{group.membersCount}/{group.maxMembers}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Vacancies:</span>
                    <span className="font-semibold text-orange-600">{group.vacancies}</span>
                  </div>
                  <button
                    onClick={() => navigate(`/members/${group.id}`)}
                    className="w-full mt-3 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <i className="fas fa-eye"></i> View Members ({group.membersCount})
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Group Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-gray-800">{editingGroup ? 'Edit Group' : 'Add New Group'}</h3>
              <button onClick={() => { setShowGroupModal(false); resetForm(); }} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Group Name *</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter group name" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Total Chit Amount (₹) *</label>
                <input type="number" required value={formData.totalChitAmount} onChange={(e) => setFormData({ ...formData, totalChitAmount: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter total amount" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Maximum Members *</label>
                <input type="number" required value={formData.maxMembers} onChange={(e) => setFormData({ ...formData, maxMembers: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter maximum members" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description (Optional)</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows="3" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter group description" />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => { setShowGroupModal(false); resetForm(); }} className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">{editingGroup ? 'Update Group' : 'Create Group'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
