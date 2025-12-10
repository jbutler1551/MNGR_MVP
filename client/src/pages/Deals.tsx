import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import PaymentModal from '../components/PaymentModal';

interface Deal {
  id: string;
  creatorUsername: string;
  dealAmount: number;
  platformFee: number;
  status: string;
  createdAt: string;
  deliverables?: string[];
}

export default function Deals() {
  const { token } = useAuth();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [paymentDeal, setPaymentDeal] = useState<Deal | null>(null);

  useEffect(() => {
    fetchDeals();
  }, [token]);

  const fetchDeals = async () => {
    try {
      const response = await fetch('/api/deals', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setDeals(data);
      }
    } catch (error) {
      console.error('Error fetching deals:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateDealStatus = async (dealId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/deals/${dealId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        fetchDeals();
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
      pending: 'Pending',
      accepted: 'Accepted',
      in_progress: 'In Progress',
      completed: 'Completed',
      paid: 'Paid',
      rejected: 'Rejected',
    };
    return labels[status] || status;
  };

  const filteredDeals = filter === 'all'
    ? deals
    : deals.filter(d => d.status === filter);

  const statusCounts = {
    all: deals.length,
    pending: deals.filter(d => d.status === 'pending').length,
    accepted: deals.filter(d => d.status === 'accepted').length,
    in_progress: deals.filter(d => d.status === 'in_progress').length,
    completed: deals.filter(d => d.status === 'completed').length,
  };

  return (
    <DashboardLayout
      title="My Deals"
      subtitle="Manage all your creator partnerships"
    >
      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { key: 'all', label: 'All Deals' },
          { key: 'pending', label: 'Pending' },
          { key: 'accepted', label: 'Accepted' },
          { key: 'in_progress', label: 'In Progress' },
          { key: 'completed', label: 'Completed' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
              filter === tab.key
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {tab.label}
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
              filter === tab.key ? 'bg-white/20' : 'bg-gray-100'
            }`}>
              {statusCounts[tab.key as keyof typeof statusCounts]}
            </span>
          </button>
        ))}
      </div>

      {/* Deals List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          </div>
        ) : filteredDeals.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No deals found</h3>
            <p className="text-gray-500">
              {filter === 'all' ? 'Start by finding creators' : `No ${filter.replace('_', ' ')} deals`}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredDeals.map((deal) => (
              <div key={deal.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-lg">
                      {deal.creatorUsername.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">@{deal.creatorUsername}</h3>
                      <p className="text-gray-500 text-sm mt-1">
                        Created {new Date(deal.createdAt).toLocaleDateString()}
                      </p>
                      {deal.deliverables && deal.deliverables.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {deal.deliverables.map((d, i) => (
                            <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                              {d}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(deal.status)}`}>
                      {getStatusLabel(deal.status)}
                    </span>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      ${deal.dealAmount.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {deal.platformFee}% platform fee
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 pt-4 border-t border-gray-100 flex gap-3 justify-end">
                  {deal.status === 'pending' && (
                    <button
                      onClick={() => updateDealStatus(deal.id, 'cancelled')}
                      className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
                    >
                      Cancel Offer
                    </button>
                  )}
                  {deal.status === 'accepted' && (
                    <span className="px-4 py-2 text-blue-600 font-medium">
                      Waiting for creator to start...
                    </span>
                  )}
                  {deal.status === 'in_progress' && (
                    <span className="px-4 py-2 text-purple-600 font-medium">
                      Creator is working...
                    </span>
                  )}
                  {deal.status === 'completed' && (
                    <button
                      onClick={() => setPaymentDeal(deal)}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
                    >
                      Pay Creator
                    </button>
                  )}
                  {deal.status === 'paid' && (
                    <span className="px-4 py-2 text-emerald-600 font-medium">
                      Payment Complete
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {paymentDeal && (
        <PaymentModal
          dealId={paymentDeal.id}
          dealAmount={paymentDeal.dealAmount}
          creatorUsername={paymentDeal.creatorUsername}
          onClose={() => setPaymentDeal(null)}
          onSuccess={() => {
            setPaymentDeal(null);
            fetchDeals();
          }}
        />
      )}
    </DashboardLayout>
  );
}
