import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import CreatorLayout from '../components/CreatorLayout';

interface EarningsData {
  totalEarnings: number;
  pendingEarnings: number;
  paidEarnings: number;
  currentTier: string;
  tierProgress: number;
  nextTierThreshold: number;
  transactions: Transaction[];
}

interface Transaction {
  id: string;
  brandCompanyName: string;
  dealAmount: number;
  platformFee: number;
  netEarnings: number;
  status: string;
  paidAt: string | null;
  createdAt: string;
}

export default function CreatorEarnings() {
  const { token } = useAuth();
  const [data, setData] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEarnings();
  }, [token]);

  const fetchEarnings = async () => {
    try {
      const [statsRes, dealsRes] = await Promise.all([
        fetch('/api/creator/stats', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/creator/deals', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (statsRes.ok && dealsRes.ok) {
        const stats = await statsRes.json();
        const deals = await dealsRes.json();

        // Calculate earnings from deals
        const completedDeals = deals.filter((d: any) => ['completed', 'paid'].includes(d.status));
        const pendingPaymentDeals = completedDeals.filter((d: any) => d.status === 'completed');
        const paidDeals = completedDeals.filter((d: any) => d.status === 'paid');

        const pendingEarnings = pendingPaymentDeals.reduce((sum: number, d: any) =>
          sum + Math.round(d.dealAmount * (1 - d.platformFee / 100)), 0);
        const paidEarnings = paidDeals.reduce((sum: number, d: any) =>
          sum + Math.round(d.dealAmount * (1 - d.platformFee / 100)), 0);

        // Map deals to transactions
        const transactions = deals
          .filter((d: any) => ['completed', 'paid'].includes(d.status))
          .map((d: any) => ({
            id: d.id,
            brandCompanyName: d.brandCompanyName,
            dealAmount: d.dealAmount,
            platformFee: d.platformFee,
            netEarnings: Math.round(d.dealAmount * (1 - d.platformFee / 100)),
            status: d.status,
            paidAt: d.paidAt || null,
            createdAt: d.createdAt,
          }));

        // Tier thresholds
        const tierThresholds: Record<string, number> = {
          launch: 10000,
          growth: 50000,
          scale: 100000,
          partner: Infinity,
        };

        setData({
          totalEarnings: stats.totalEarnings || 0,
          pendingEarnings,
          paidEarnings,
          currentTier: stats.currentTier || 'launch',
          tierProgress: stats.tierProgress || 0,
          nextTierThreshold: tierThresholds[stats.currentTier || 'launch'],
          transactions,
        });
      }
    } catch (error) {
      console.error('Error fetching earnings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTierInfo = (tier: string) => {
    const tiers: Record<string, { fee: number; color: string; label: string }> = {
      launch: { fee: 18, color: 'text-purple-500', label: 'Launch' },
      growth: { fee: 15, color: 'text-purple-600', label: 'Growth' },
      scale: { fee: 12, color: 'text-purple-700', label: 'Scale' },
      partner: { fee: 10, color: 'text-purple-800', label: 'Partner' },
    };
    return tiers[tier] || tiers.launch;
  };

  if (loading) {
    return (
      <CreatorLayout title="Earnings">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </CreatorLayout>
    );
  }

  return (
    <CreatorLayout title="Earnings" subtitle="Track your income and payment history">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Total Earnings</p>
          <p className="text-3xl font-bold text-gray-900">
            ${(data?.totalEarnings || 0).toLocaleString()}
          </p>
          <p className="text-xs text-gray-400 mt-1">Lifetime earnings</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Pending Payout</p>
          <p className="text-3xl font-bold text-yellow-600">
            ${(data?.pendingEarnings || 0).toLocaleString()}
          </p>
          <p className="text-xs text-gray-400 mt-1">Awaiting payment</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Paid Out</p>
          <p className="text-3xl font-bold text-green-600">
            ${(data?.paidEarnings || 0).toLocaleString()}
          </p>
          <p className="text-xs text-gray-400 mt-1">Successfully transferred</p>
        </div>
      </div>

      {/* Tier Progress */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Fee Tier Progress</h2>
          <span className={`font-semibold ${getTierInfo(data?.currentTier || 'launch').color}`}>
            {getTierInfo(data?.currentTier || 'launch').label} Tier ({getTierInfo(data?.currentTier || 'launch').fee}% fee)
          </span>
        </div>

        <div className="mb-2">
          <div className="bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-purple-500 to-purple-700 rounded-full h-3 transition-all"
              style={{ width: `${Math.min((data?.tierProgress || 0), 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="flex justify-between text-sm text-gray-500">
          <span>${(data?.totalEarnings || 0).toLocaleString()} earned</span>
          {data?.currentTier !== 'partner' && (
            <span>${(data?.nextTierThreshold || 0).toLocaleString()} to next tier</span>
          )}
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs">
          <div className={`p-2 rounded ${data?.currentTier === 'launch' ? 'bg-purple-100 text-purple-700 font-medium' : 'bg-gray-50 text-gray-500'}`}>
            <p>Launch</p>
            <p>18%</p>
          </div>
          <div className={`p-2 rounded ${data?.currentTier === 'growth' ? 'bg-purple-100 text-purple-700 font-medium' : 'bg-gray-50 text-gray-500'}`}>
            <p>Growth</p>
            <p>15%</p>
          </div>
          <div className={`p-2 rounded ${data?.currentTier === 'scale' ? 'bg-purple-100 text-purple-700 font-medium' : 'bg-gray-50 text-gray-500'}`}>
            <p>Scale</p>
            <p>12%</p>
          </div>
          <div className={`p-2 rounded ${data?.currentTier === 'partner' ? 'bg-purple-100 text-purple-700 font-medium' : 'bg-gray-50 text-gray-500'}`}>
            <p>Partner</p>
            <p>10%</p>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Payment History</h2>
        </div>

        {(!data?.transactions || data.transactions.length === 0) ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No payments yet</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              Complete deals with brands to start earning. Your payment history will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deal Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Your Earnings</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-gray-900">{tx.brandCompanyName}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      ${tx.dealAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {tx.platformFee}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold text-green-600">${tx.netEarnings.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        tx.status === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {tx.status === 'paid' ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {tx.paidAt
                        ? new Date(tx.paidAt).toLocaleDateString()
                        : new Date(tx.createdAt).toLocaleDateString()
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payout Info */}
      <div className="mt-8 bg-purple-50 rounded-xl p-6">
        <h3 className="font-semibold text-purple-900 mb-2">Payout Information</h3>
        <p className="text-purple-700 text-sm">
          Payouts are processed within 7-14 business days after a deal is marked as completed.
          Make sure your payment information is up to date in your profile settings.
        </p>
      </div>
    </CreatorLayout>
  );
}
