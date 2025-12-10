import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import AdminLayout from '../components/AdminLayout';

interface Creator {
  id: string;
  username: string;
  email: string | null;
  platform: string;
  followerCount: number;
  engagementRate: number | null;
  verificationStatus: string;
  currentFeeTier: string;
  annualEarnings: number;
  createdAt: string;
  contentCategories: string[];
  dealsCount: number;
}

export default function AdminCreators() {
  const { token } = useAuth();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);

  useEffect(() => {
    fetchCreators();
  }, [token, filter]);

  const fetchCreators = async () => {
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('status', filter);
      if (search) params.append('search', search);

      const response = await fetch(`/api/admin/creators?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCreators(data.creators);
      }
    } catch (error) {
      console.error('Error fetching creators:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateVerification = async (creatorId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/creators/${creatorId}/verification`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        fetchCreators();
        setSelectedCreator(null);
      }
    } catch (error) {
      console.error('Error updating verification:', error);
    }
  };

  const updateTier = async (creatorId: string, tier: string) => {
    try {
      const response = await fetch(`/api/admin/creators/${creatorId}/tier`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tier }),
      });
      if (response.ok) {
        fetchCreators();
        setSelectedCreator(null);
      }
    } catch (error) {
      console.error('Error updating tier:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      verified: 'bg-green-500',
      pending: 'bg-yellow-500',
      rejected: 'bg-red-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  const getTierBadge = (tier: string) => {
    const colors: Record<string, string> = {
      launch: 'bg-purple-500',
      growth: 'bg-blue-500',
      scale: 'bg-indigo-500',
      partner: 'bg-pink-500',
    };
    return colors[tier] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <AdminLayout title="Creators">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Creators" subtitle="Manage creator accounts and verifications">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex gap-2">
          {['all', 'pending', 'verified', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition capitalize ${
                filter === status
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search creators..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchCreators()}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {/* Creators Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Creator</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Platform</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Followers</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Tier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Deals</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {creators.map((creator) => (
                <tr key={creator.id} className="hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-white font-medium">@{creator.username}</p>
                      <p className="text-gray-500 text-sm">{creator.email || 'No email'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-300 capitalize">
                    {creator.platform}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                    {creator.followerCount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusBadge(creator.verificationStatus)}`}>
                      {creator.verificationStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium text-white capitalize ${getTierBadge(creator.currentFeeTier)}`}>
                      {creator.currentFeeTier}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                    {creator.dealsCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => setSelectedCreator(creator)}
                      className="text-purple-400 hover:text-purple-300 font-medium"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Creator Modal */}
      {selectedCreator && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">@{selectedCreator.username}</h2>
                  <p className="text-gray-400 capitalize">{selectedCreator.platform}</p>
                </div>
                <button
                  onClick={() => setSelectedCreator(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Followers</p>
                  <p className="text-white text-xl font-bold">{selectedCreator.followerCount.toLocaleString()}</p>
                </div>
                <div className="bg-gray-900 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Engagement</p>
                  <p className="text-white text-xl font-bold">{selectedCreator.engagementRate?.toFixed(1) || 'N/A'}%</p>
                </div>
              </div>

              {/* Categories */}
              <div>
                <p className="text-gray-400 text-sm mb-2">Categories</p>
                <div className="flex flex-wrap gap-2">
                  {selectedCreator.contentCategories.map((cat) => (
                    <span key={cat} className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Verification Status */}
              <div>
                <p className="text-gray-400 text-sm mb-2">Verification Status</p>
                <div className="flex gap-2">
                  {['pending', 'verified', 'rejected'].map((status) => (
                    <button
                      key={status}
                      onClick={() => updateVerification(selectedCreator.id, status)}
                      className={`px-4 py-2 rounded-lg font-medium capitalize transition ${
                        selectedCreator.verificationStatus === status
                          ? `${getStatusBadge(status)} text-white`
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fee Tier */}
              <div>
                <p className="text-gray-400 text-sm mb-2">Fee Tier</p>
                <div className="flex gap-2">
                  {['launch', 'growth', 'scale', 'partner'].map((tier) => (
                    <button
                      key={tier}
                      onClick={() => updateTier(selectedCreator.id, tier)}
                      className={`px-4 py-2 rounded-lg font-medium capitalize transition ${
                        selectedCreator.currentFeeTier === tier
                          ? `${getTierBadge(tier)} text-white`
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {tier}
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
