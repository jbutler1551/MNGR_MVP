import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import CreatorLayout from '../components/CreatorLayout';

interface Deal {
  id: string;
  brandCompanyName: string;
  dealAmount: number;
  platformFee: number;
  status: string;
  createdAt: string;
  deliverables: string[];
  dealDescription: string;
  deliveryWindow: string;
  usageRights: string;
  exclusivity: string;
}

export default function CreatorDeals() {
  const { token } = useAuth();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchDeals();
  }, [token]);

  const fetchDeals = async () => {
    try {
      const response = await fetch('/api/creator/deals', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setDeals(await response.json());
      }
    } catch (error) {
      console.error('Error fetching deals:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateDealStatus = async (dealId: string, status: string) => {
    try {
      const response = await fetch(`/api/creator/deals/${dealId}/status`, {
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
      console.error('Error updating deal:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      paid: 'bg-emerald-100 text-emerald-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Pending Review',
      accepted: 'Accepted',
      in_progress: 'In Progress',
      completed: 'Completed',
      paid: 'Paid',
      rejected: 'Declined',
    };
    return labels[status] || status;
  };

  const filteredDeals = deals.filter((deal) => {
    if (filter === 'all') return true;
    if (filter === 'active') return ['accepted', 'in_progress'].includes(deal.status);
    return deal.status === filter;
  });

  if (loading) {
    return (
      <CreatorLayout title="My Deals">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </CreatorLayout>
    );
  }

  return (
    <CreatorLayout title="My Deals" subtitle="Manage your brand partnerships">
      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'all', label: 'All Deals' },
          { key: 'pending', label: 'Pending' },
          { key: 'active', label: 'Active' },
          { key: 'completed', label: 'Completed' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === tab.key
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Deals List */}
      {filteredDeals.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No deals found</h3>
          <p className="text-gray-500 max-w-sm mx-auto">
            {filter === 'all'
              ? "You don't have any deals yet. Brands will reach out when they find you through our search."
              : `No ${filter} deals at the moment.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDeals.map((deal) => (
            <div
              key={deal.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition cursor-pointer"
              onClick={() => setSelectedDeal(deal)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{deal.brandCompanyName}</h3>
                  <p className="text-gray-500 text-sm mt-1">{deal.dealDescription || 'No description provided'}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(deal.status)}`}>
                  {getStatusLabel(deal.status)}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Amount:</span>
                  <span className="ml-1 font-semibold text-gray-900">${deal.dealAmount.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-500">Your Earnings:</span>
                  <span className="ml-1 font-semibold text-green-600">
                    ${Math.round(deal.dealAmount * (1 - deal.platformFee / 100)).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Fee:</span>
                  <span className="ml-1 text-gray-600">{deal.platformFee}%</span>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1">
                {deal.deliverables.map((d, i) => (
                  <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                    {d}
                  </span>
                ))}
              </div>

              <p className="text-xs text-gray-400 mt-3">
                Created {new Date(deal.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Deal Detail Modal */}
      {selectedDeal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedDeal.brandCompanyName}</h2>
                  <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedDeal.status)}`}>
                    {getStatusLabel(selectedDeal.status)}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedDeal(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Financial Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-gray-500">Deal Amount</p>
                    <p className="text-xl font-bold text-gray-900">${selectedDeal.dealAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Platform Fee</p>
                    <p className="text-xl font-bold text-gray-600">{selectedDeal.platformFee}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Your Earnings</p>
                    <p className="text-xl font-bold text-green-600">
                      ${Math.round(selectedDeal.dealAmount * (1 - selectedDeal.platformFee / 100)).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {selectedDeal.dealDescription && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Brief</h3>
                  <p className="text-gray-600">{selectedDeal.dealDescription}</p>
                </div>
              )}

              {/* Deliverables */}
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Deliverables</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedDeal.deliverables.map((d, i) => (
                    <span key={i} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              {/* Terms */}
              <div className="grid md:grid-cols-2 gap-4">
                {selectedDeal.deliveryWindow && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Delivery Window</h3>
                    <p className="text-gray-600">{selectedDeal.deliveryWindow}</p>
                  </div>
                )}
                {selectedDeal.usageRights && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Usage Rights</h3>
                    <p className="text-gray-600">{selectedDeal.usageRights}</p>
                  </div>
                )}
                {selectedDeal.exclusivity && selectedDeal.exclusivity !== 'none' && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Exclusivity</h3>
                    <p className="text-gray-600 capitalize">{selectedDeal.exclusivity}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              {selectedDeal.status === 'pending' && (
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => updateDealStatus(selectedDeal.id, 'accepted')}
                    className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-purple-900 text-white rounded-lg font-semibold hover:shadow-lg transition"
                  >
                    Accept Deal
                  </button>
                  <button
                    onClick={() => updateDealStatus(selectedDeal.id, 'rejected')}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                  >
                    Decline
                  </button>
                </div>
              )}

              {selectedDeal.status === 'accepted' && (
                <div className="pt-4 border-t border-gray-100">
                  <button
                    onClick={() => updateDealStatus(selectedDeal.id, 'in_progress')}
                    className="w-full py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
                  >
                    Start Working
                  </button>
                </div>
              )}

              {selectedDeal.status === 'in_progress' && (
                <div className="pt-4 border-t border-gray-100">
                  <button
                    onClick={() => updateDealStatus(selectedDeal.id, 'completed')}
                    className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                  >
                    Mark as Completed
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </CreatorLayout>
  );
}
