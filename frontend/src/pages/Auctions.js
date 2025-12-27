import React, { useState, useEffect } from 'react';
import { auctionsAPI, groupsAPI, membersAPI } from '../services/api';

const Auctions = () => {
  const [auctions, setAuctions] = useState([]);
  const [filteredAuctions, setFilteredAuctions] = useState([]);
  const [groups, setGroups] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAuction, setEditingAuction] = useState(null);
  
  // Filter
  const [selectedGroup, setSelectedGroup] = useState('');
  
  const [formData, setFormData] = useState({
    groupNo: '',
    ticketNo: '',
    customerName: '',
    mobileNo: '',
    appuiDate: '',
    instOngoing: '',
    status: 'Non-Prx',
    previousArrear: '0',
    currentAmount: '',
    cumShare: '',
    toBeCollected: '',
    unclaimedAmt: '0',
    agentCode: 'N08553',
  });

  const agentCodes = ['N08553', 'N08554', 'N08555', 'N08556', 'N08557', 'N08558'];

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [selectedGroup, auctions]);

  const fetchData = async () => {
    try {
      const [auctionsRes, groupsRes, membersRes] = await Promise.all([
        auctionsAPI.getAll(),
        groupsAPI.getAll(),
        membersAPI.getAll(),
      ]);
      setAuctions(auctionsRes.data);
      setGroups(groupsRes.data);
      setMembers(membersRes.data);
      setFilteredAuctions(auctionsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    if (!selectedGroup) {
      setFilteredAuctions(auctions);
    } else {
      setFilteredAuctions(auctions.filter(a => a.groupNo === selectedGroup));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        instOngoing: parseInt(formData.instOngoing),
        previousArrear: parseFloat(formData.previousArrear),
        currentAmount: parseFloat(formData.currentAmount),
        cumShare: parseFloat(formData.cumShare),
        toBeCollected: parseFloat(formData.toBeCollected),
        unclaimedAmt: parseFloat(formData.unclaimedAmt),
      };

      console.log('Submitting auction data:', data);

      if (editingAuction) {
        console.log('Updating auction ID:', editingAuction.id);
        const response = await auctionsAPI.update(editingAuction.id, data);
        console.log('Update response:', response.data);
        alert('Auction updated successfully!');
      } else {
        const response = await auctionsAPI.create(data);
        console.log('Create response:', response.data);
        alert('Auction created successfully!');
      }

      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving auction:', error);
      console.error('Error details:', error.response || error.message);
      alert(`Failed to save auction: ${error.response?.data?.detail || error.message}`);
    }
  };

  const handleEdit = (auction) => {
    setEditingAuction(auction);
    setFormData({
      groupNo: auction.groupNo,
      ticketNo: auction.ticketNo,
      customerName: auction.customerName,
      mobileNo: auction.mobileNo,
      appuiDate: auction.appuiDate,
      instOngoing: auction.instOngoing.toString(),
      status: auction.status,
      previousArrear: auction.previousArrear.toString(),
      currentAmount: auction.currentAmount.toString(),
      cumShare: auction.cumShare.toString(),
      toBeCollected: auction.toBeCollected.toString(),
      unclaimedAmt: auction.unclaimedAmt.toString(),
      agentCode: auction.agentCode,
    });
    setShowModal(true);
  };

  const handleDelete = async (auctionId) => {
    if (window.confirm('Are you sure you want to delete this auction record?')) {
      try {
        console.log('Deleting auction ID:', auctionId);
        await auctionsAPI.delete(auctionId);
        alert('Auction deleted successfully!');
        fetchData();
      } catch (error) {
        console.error('Error deleting auction:', error);
        console.error('Error details:', error.response || error.message);
        alert(`Failed to delete auction: ${error.response?.data?.detail || error.message}`);
      }
    }
  };

  const handleMarkAsPrized = async (auctionId) => {
    try {
      const auction = auctions.find(a => a.id === auctionId);
      if (!auction) return;

      // Update this auction to Prized
      await auctionsAPI.update(auctionId, { ...auction, status: 'Prized' });

      // Update all other auctions in the same group to Non-Prx
      const sameGroupAuctions = auctions.filter(a => a.groupNo === auction.groupNo && a.id !== auctionId);
      for (const otherAuction of sameGroupAuctions) {
        await auctionsAPI.update(otherAuction.id, { ...otherAuction, status: 'Non-Prx' });
      }

      alert('Auction marked as Prized! All others in this group are now Non-Prized.');
      fetchData();
    } catch (error) {
      console.error('Error marking as prized:', error);
      alert('Failed to update auction status');
    }
  };

  const resetForm = () => {
    setFormData({
      groupNo: '',
      ticketNo: '',
      customerName: '',
      mobileNo: '',
      appuiDate: '',
      instOngoing: '',
      status: 'Non-Prx',
      previousArrear: '0',
      currentAmount: '',
      cumShare: '',
      toBeCollected: '',
      unclaimedAmt: '0',
      agentCode: 'N08553',
    });
    setEditingAuction(null);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-xl text-gray-600">Loading...</div></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Auction List</h2>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <i className="fas fa-plus"></i> Add Auction Record
        </button>
      </div>

      {/* Group Filter */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Group</label>
        <div className="flex gap-4 items-center">
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Groups</option>
            {groups.map((group) => (
              <option key={group.id} value={group.name}>{group.name}</option>
            ))}
          </select>
          {selectedGroup && (
            <button
              onClick={() => setSelectedGroup('')}
              className="px-4 py-2 text-blue-600 hover:text-blue-700 font-semibold"
            >
              <i className="fas fa-times mr-1"></i> Clear
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <h2 className="text-2xl font-bold mb-2">ARESUS STATEMENT</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="bg-white/10 p-3 rounded-lg">
              <div className="text-xs opacity-75">AGENT NAME</div>
              <div className="font-semibold">KALYMAN_SADAMANO JAMARKAR</div>
            </div>
            <div className="bg-white/10 p-3 rounded-lg">
              <div className="text-xs opacity-75">AGENT CODE</div>
              <div className="font-semibold">N08553</div>
            </div>
            <div className="bg-white/10 p-3 rounded-lg">
              <div className="text-xs opacity-75">STATEMENT DATE</div>
              <div className="font-semibold">{new Date().toLocaleDateString('en-IN')}</div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">SR NO</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">GROUP</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">TICKET</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">CUSTOMER</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">MOBILE</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700">INST</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700">STATUS</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">TO COLLECT</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAuctions.map((auction, index) => (
                <tr key={auction.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3 font-semibold">{auction.groupNo}</td>
                  <td className="px-4 py-3">{auction.ticketNo}</td>
                  <td className="px-4 py-3">{auction.customerName}</td>
                  <td className="px-4 py-3">{auction.mobileNo}</td>
                  <td className="px-4 py-3 text-center">{auction.instOngoing}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      auction.status === 'Prized' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                    }`}>
                      {auction.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">{formatCurrency(auction.toBeCollected)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      {auction.status !== 'Prized' && (
                        <button
                          onClick={() => handleMarkAsPrized(auction.id)}
                          className="text-green-600 hover:text-green-700 px-2 py-1 rounded bg-green-50 hover:bg-green-100"
                          title="Mark as Prized"
                        >
                          <i className="fas fa-trophy"></i>
                        </button>
                      )}
                      <button onClick={() => handleEdit(auction)} className="text-blue-600 hover:text-blue-700">
                        <i className="fas fa-edit"></i>
                      </button>
                      <button onClick={() => handleDelete(auction.id)} className="text-red-600 hover:text-red-700">
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-gray-800">{editingAuction ? 'Edit Auction' : 'Add Auction Record'}</h3>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Group *</label>
                  <select required value={formData.groupNo} onChange={(e) => setFormData({ ...formData, groupNo: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Select Group</option>
                    {groups.map((group) => (
                      <option key={group.id} value={group.name}>{group.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Ticket No *</label>
                  <input type="text" required value={formData.ticketNo} onChange={(e) => setFormData({ ...formData, ticketNo: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Customer Name *</label>
                  <input type="text" required value={formData.customerName} onChange={(e) => setFormData({ ...formData, customerName: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Mobile *</label>
                  <input type="text" required value={formData.mobileNo} onChange={(e) => setFormData({ ...formData, mobileNo: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Date (DD-MM-YYYY) *</label>
                  <input type="text" required value={formData.appuiDate} onChange={(e) => setFormData({ ...formData, appuiDate: e.target.value })} placeholder="25-12-2023" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Installment *</label>
                  <input type="number" required value={formData.instOngoing} onChange={(e) => setFormData({ ...formData, instOngoing: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Previous Arrear *</label>
                  <input type="number" step="0.01" required value={formData.previousArrear} onChange={(e) => setFormData({ ...formData, previousArrear: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Current Amount *</label>
                  <input type="number" step="0.01" required value={formData.currentAmount} onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Cumulative Share *</label>
                  <input type="number" step="0.01" required value={formData.cumShare} onChange={(e) => setFormData({ ...formData, cumShare: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">To Be Collected *</label>
                  <input type="number" step="0.01" required value={formData.toBeCollected} onChange={(e) => setFormData({ ...formData, toBeCollected: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Unclaimed *</label>
                  <input type="number" step="0.01" required value={formData.unclaimedAmt} onChange={(e) => setFormData({ ...formData, unclaimedAmt: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Agent Code *</label>
                  <select required value={formData.agentCode} onChange={(e) => setFormData({ ...formData, agentCode: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    {agentCodes.map((code) => (
                      <option key={code} value={code}>{code}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">{editingAuction ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Auctions;
