import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import AdminLayout from '../components/AdminLayout';

interface Deal {
  id: string;
  dealAmount: number;
  platformFee: number | null;
  platformFeeAmount: number | null;
  status: string;
  deliverables: string[];
  dealDescription: string | null;
  createdAt: string;
  completedAt: string | null;
  creator: {
    id: string;
    username: string;
    platform: string;
    email: string | null;
  };
  brand: {
    id: string;
    companyName: string | null;
    email: string;
  };
}

export default function AdminDeals() {
  const { token } = useAuth();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

  useEffect(() => {
    fetchDeals();
  }, [token, filter]);

  const fetchDeals = async () => {
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('status', filter);

      const response = await fetch(`/api/admin/deals?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setDeals(data.deals);
      }
    } catch (error) {
      console.error('Error fetching deals:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateDealStatus = async (dealId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/deals/${dealId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        fetchDeals();
        setSelectedDeal(null);
      }
    } catch (error) {
      console.error('Error updating deal status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500',
      accepted: 'bg-blue-500',
      in_progress: 'bg-purple-500',
      completed: 'bg-green-500',
      paid: 'bg-emerald-500',
      cancelled: 'bg-red-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  // Calculate summary stats
  const totalGMV = deals.reduce((sum, d) => sum + d.dealAmount, 0);
  const totalFees = deals.reduce((sum, d) => sum + (d.platformFeeAmount || 0), 0);

  if (loading) {
    return (
      <AdminLayout title="Deals">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Deals" subtitle="View and manage all platform deals">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <p className="text-gray-400 text-sm">Total Deals</p>
          <p className="text-3xl font-bold text-white mt-1">{deals.length}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <p className="text-gray-400 text-sm">Total GMV</p>
          <p className="text-3xl font-bold text-white mt-1">${totalGMV.toLocaleString()}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <p className="text-gray-400 text-sm">Platform Revenue</p>
          <p className="text-3xl font-bold text-green-400 mt-1">${totalFees.toLocaleString()}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <p className="text-gray-400 text-sm">Avg Deal Size</p>
          <p className="text-3xl font-bold text-white mt-1">
            ${deals.length > 0 ? Math.round(totalGMV / deals.length).toLocaleString() : 0}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['all', 'pending', 'accepted', 'in_progress', 'completed', 'paid', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition capitalize ${
              filter === status
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {status.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Deals Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Creator</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Brand</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Fee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {deals.map((deal) => (
                <tr key={deal.id} className="hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-white font-medium">@{deal.creator.username}</p>
                      <p className="text-gray-500 text-sm capitalize">{deal.creator.platform}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                    {deal.brand.companyName || deal.brand.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-white font-medium">
                    ${deal.dealAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                    {deal.platformFee}% (${(deal.platformFeeAmount || 0).toLocaleString()})
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(deal.status)}`}>
                      {deal.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                    {new Date(deal.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => setSelectedDeal(deal)}
                      className="text-purple-400 hover:text-purple-300 font-medium"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
              {deals.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No deals found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deal Modal */}
      {selectedDeal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Deal Details</h2>
                  <p className="text-gray-400">ID: {selectedDeal.id.slice(0, 8)}...</p>
                </div>
                <button
                  onClick={() => setSelectedDeal(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Parties */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Creator</p>
                  <p className="text-white font-medium">@{selectedDeal.creator.username}</p>
                  <p className="text-gray-500 text-sm capitalize">{selectedDeal.creator.platform}</p>
                </div>
                <div className="bg-gray-900 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Brand</p>
                  <p className="text-white font-medium">{selectedDeal.brand.companyName || 'N/A'}</p>
                  <p className="text-gray-500 text-sm">{selectedDeal.brand.email}</p>
                </div>
              </div>

              {/* Financials */}
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-gray-400 text-sm">Deal Amount</p>
                    <p className="text-white text-xl font-bold">${selectedDeal.dealAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Platform Fee</p>
                    <p className="text-white text-xl font-bold">{selectedDeal.platformFee || 0}%</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Revenue</p>
                    <p className="text-green-400 text-xl font-bold">${(selectedDeal.platformFeeAmount || 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {selectedDeal.dealDescription && (
                <div>
                  <p className="text-gray-400 text-sm mb-2">Description</p>
                  <p className="text-gray-300">{selectedDeal.dealDescription}</p>
                </div>
              )}

              {/* Deliverables */}
              <div>
                <p className="text-gray-400 text-sm mb-2">Deliverables</p>
                <div className="flex flex-wrap gap-2">
                  {selectedDeal.deliverables.map((d, i) => (
                    <span key={i} className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm">
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              {/* Status Update */}
              <div>
                <p className="text-gray-400 text-sm mb-2">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {['pending', 'accepted', 'in_progress', 'completed', 'paid', 'cancelled'].map((status) => (
                    <button
                      key={status}
                      onClick={() => updateDealStatus(selectedDeal.id, status)}
                      className={`px-4 py-2 rounded-lg font-medium capitalize transition ${
                        selectedDeal.status === status
                          ? `${getStatusColor(status)} text-white`
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {status.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
