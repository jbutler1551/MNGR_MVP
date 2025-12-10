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
}

interface CreatorStats {
  totalEarnings: number;
  pendingDeals: number;
  completedDeals: number;
  currentTier: string;
  tierProgress: number;
}

export default function CreatorDashboard() {
  const { user, token } = useAuth();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [stats, setStats] = useState<CreatorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTierInfo, setShowTierInfo] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  const fetchDashboardData = async () => {
    try {
      const [dealsRes, statsRes] = await Promise.all([
        fetch('/api/creator/deals', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/creator/stats', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (dealsRes.ok) {
        setDeals(await dealsRes.json());
      }
      if (statsRes.ok) {
        setStats(await statsRes.json());
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      paid: 'bg-emerald-100 text-emerald-800',
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
    };
    return labels[status] || status;
  };

  const getTierInfo = (tier: string) => {
    const tiers: Record<string, { fee: string; color: string; nextTier: string | null; nextThreshold: string }> = {
      launch: { fee: '18%', color: 'text-purple-500', nextTier: 'Growth', nextThreshold: '$10K' },
      growth: { fee: '15%', color: 'text-purple-600', nextTier: 'Scale', nextThreshold: '$50K' },
      scale: { fee: '12%', color: 'text-purple-700', nextTier: 'Partner', nextThreshold: '$100K' },
      partner: { fee: '10%', color: 'text-purple-800', nextTier: null, nextThreshold: '' },
    };
    return tiers[tier] || tiers.launch;
  };

  if (loading) {
    return (
      <CreatorLayout title="Dashboard">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </CreatorLayout>
    );
  }

  return (
    <CreatorLayout
      title={`Welcome back, ${user?.firstName || user?.username || 'Creator'}!`}
      subtitle="Manage your brand partnerships"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Earnings</p>
              <p className="text-3xl font-bold text-gray-900">
                ${(stats?.totalEarnings || 0).toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Pending Deals</p>
              <p className="text-3xl font-bold text-yellow-600">
                {stats?.pendingDeals || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Completed</p>
              <p className="text-3xl font-bold text-green-600">
                {stats?.completedDeals || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 relative">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Current Tier</p>
              <p className={`text-2xl font-bold capitalize ${getTierInfo(stats?.currentTier || 'launch').color}`}>
                {stats?.currentTier || 'Launch'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {getTierInfo(stats?.currentTier || 'launch').fee} platform fee
              </p>
            </div>
            <button
              onClick={() => setShowTierInfo(!showTierInfo)}
              className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-500 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>

          {/* Tier Info Tooltip */}
          {showTierInfo && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-10">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-semibold text-gray-900">Fee Tiers</h4>
                <button
                  onClick={() => setShowTierInfo(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-2 text-sm">
                <div className={`flex justify-between ${stats?.currentTier === 'launch' ? 'font-semibold text-purple-600' : 'text-gray-600'}`}>
                  <span>Launch</span>
                  <span>18% (up to $10K)</span>
                </div>
                <div className={`flex justify-between ${stats?.currentTier === 'growth' ? 'font-semibold text-purple-600' : 'text-gray-600'}`}>
                  <span>Growth</span>
                  <span>15% ($10K - $50K)</span>
                </div>
                <div className={`flex justify-between ${stats?.currentTier === 'scale' ? 'font-semibold text-purple-600' : 'text-gray-600'}`}>
                  <span>Scale</span>
                  <span>12% ($50K - $100K)</span>
                </div>
                <div className={`flex justify-between ${stats?.currentTier === 'partner' ? 'font-semibold text-purple-600' : 'text-gray-600'}`}>
                  <span>Partner</span>
                  <span>10% ($100K+)</span>
                </div>
              </div>
              {getTierInfo(stats?.currentTier || 'launch').nextTier && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    Earn {getTierInfo(stats?.currentTier || 'launch').nextThreshold} total to unlock {getTierInfo(stats?.currentTier || 'launch').nextTier} tier
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recent Deals */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Your Deals</h2>
        </div>

        {deals.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No deals yet</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              Brands will reach out when they find you through our search.
              Make sure your profile is complete!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deliverables</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {deals.map((deal) => (
                  <tr key={deal.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-gray-900">{deal.brandCompanyName}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <span className="font-semibold text-gray-900">${deal.dealAmount.toLocaleString()}</span>
                        <p className="text-xs text-gray-400">{deal.platformFee}% fee</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {deal.deliverables.slice(0, 2).map((d, i) => (
                          <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                            {d}
                          </span>
                        ))}
                        {deal.deliverables.length > 2 && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                            +{deal.deliverables.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(deal.status)}`}>
                        {getStatusLabel(deal.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {new Date(deal.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button className="text-purple-600 hover:text-purple-700 font-medium text-sm">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </CreatorLayout>
  );
}
