import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';

interface Creator {
  id: string;
  username: string;
  platform: string;
  followerCount: number;
  engagementRate: number | null;
  contentCategories: string[];
  matchScore?: number;
}

interface SearchResult {
  creators: Creator[];
  parsedIntent: {
    niche?: string;
    minFollowers?: number;
    maxFollowers?: number;
    platform?: string;
  };
}

interface DealFormData {
  dealAmount: number;
  dealDescription: string;
  deliverables: string[];
  deliveryWindow: string;
  usageRights: string;
  exclusivity: string;
  revisionRounds: number;
}

export default function Search() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [showDealModal, setShowDealModal] = useState(false);
  const [dealForm, setDealForm] = useState<DealFormData>({
    dealAmount: 500,
    dealDescription: '',
    deliverables: ['1 Instagram Post'],
    deliveryWindow: '7 days',
    usageRights: '30 days',
    exclusivity: 'none',
    revisionRounds: 2,
  });
  const [creatingDeal, setCreatingDeal] = useState(false);
  const [dealSuccess, setDealSuccess] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/creators/search?q=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError('Failed to search creators. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatFollowers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(0)}K`;
    return count.toString();
  };

  const openDealModal = (creator: Creator) => {
    setSelectedCreator(creator);
    setShowDealModal(true);
    setDealSuccess(false);
  };

  const closeDealModal = () => {
    setShowDealModal(false);
    setSelectedCreator(null);
    setDealSuccess(false);
  };

  const handleCreateDeal = async () => {
    if (!selectedCreator) return;
    setCreatingDeal(true);

    try {
      const response = await fetch('/api/deals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          creatorId: selectedCreator.id,
          dealAmount: dealForm.dealAmount,
          dealDescription: dealForm.dealDescription,
          deliverables: dealForm.deliverables,
          deliveryWindow: dealForm.deliveryWindow,
          usageRights: dealForm.usageRights,
          exclusivity: dealForm.exclusivity,
          revisionRounds: dealForm.revisionRounds,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create deal');
      }

      setDealSuccess(true);
      setTimeout(() => {
        closeDealModal();
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError('Failed to create deal. Please try again.');
    } finally {
      setCreatingDeal(false);
    }
  };

  const toggleDeliverable = (item: string) => {
    setDealForm((prev) => ({
      ...prev,
      deliverables: prev.deliverables.includes(item)
        ? prev.deliverables.filter((d) => d !== item)
        : [...prev.deliverables, item],
    }));
  };

  return (
    <DashboardLayout
      title="Find Creators"
      subtitle="Search for the perfect creators for your campaign"
    >
      <div className="max-w-4xl mx-auto">
        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., 'fitness creators with 50K-200K followers for a protein brand campaign'"
                className="w-full px-6 py-4 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-900 text-white rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                'Search'
              )}
            </button>
          </div>
        </form>

        {/* Example Queries */}
        {!results && !loading && (
          <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
            <h3 className="font-medium text-gray-900 mb-3">Try these example searches:</h3>
            <div className="space-y-2">
              {[
                'Beauty and skincare creators on Instagram with high engagement',
                'Tech reviewers on YouTube with 100K+ followers',
                'Food and cooking creators for a kitchen appliance campaign',
                'Fitness influencers in the 25K-100K follower range',
              ].map((example) => (
                <button
                  key={example}
                  onClick={() => setQuery(example)}
                  className="block w-full text-left px-4 py-2 text-gray-600 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition"
                >
                  "{example}"
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 mb-8">
            {error}
          </div>
        )}

        {/* Results */}
        {results && (
          <div>
            {/* Parsed Intent */}
            {results.parsedIntent && Object.keys(results.parsedIntent).length > 0 && (
              <div className="bg-purple-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-purple-700">
                  <span className="font-medium">AI understood: </span>
                  {results.parsedIntent.niche && `${results.parsedIntent.niche} niche`}
                  {results.parsedIntent.platform && ` on ${results.parsedIntent.platform}`}
                  {results.parsedIntent.minFollowers && ` with ${formatFollowers(results.parsedIntent.minFollowers)}+ followers`}
                </p>
              </div>
            )}

            {/* Creator Cards */}
            {results.creators.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No creators found matching your criteria. Try a different search.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {results.creators.map((creator) => (
                  <div
                    key={creator.id}
                    className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-purple-200 rounded-full flex items-center justify-center text-purple-700 font-bold text-xl">
                          {creator.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">@{creator.username}</h3>
                          <p className="text-gray-500 capitalize">{creator.platform}</p>
                          <div className="flex gap-2 mt-2">
                            {creator.contentCategories.slice(0, 3).map((cat) => (
                              <span
                                key={cat}
                                className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                              >
                                {cat}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {creator.matchScore && (
                          <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold mb-2">
                            {creator.matchScore}% match
                          </span>
                        )}
                        <div className="flex gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Followers</p>
                            <p className="font-semibold text-gray-900">{formatFollowers(creator.followerCount)}</p>
                          </div>
                          {creator.engagementRate && (
                            <div>
                              <p className="text-gray-500">Engagement</p>
                              <p className="font-semibold text-gray-900">{creator.engagementRate.toFixed(1)}%</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                      <button
                        onClick={() => openDealModal(creator)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                      >
                        Create Deal
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Deal Creation Modal */}
      {showDealModal && selectedCreator && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {dealSuccess ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Deal Sent!</h3>
                <p className="text-gray-600">Your offer has been sent to @{selectedCreator.username}</p>
              </div>
            ) : (
              <>
                <div className="p-6 border-b border-gray-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Create Deal</h3>
                      <p className="text-gray-500">with @{selectedCreator.username}</p>
                    </div>
                    <button
                      onClick={closeDealModal}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-5">
                  {/* Deal Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deal Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        min="100"
                        step="50"
                        value={dealForm.dealAmount}
                        onChange={(e) => setDealForm({ ...dealForm, dealAmount: Number(e.target.value) })}
                        className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Deliverables */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deliverables
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['1 Instagram Post', '1 Instagram Reel', '1 TikTok Video', '1 YouTube Video', 'Instagram Stories (3-5)', 'Product Review'].map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => toggleDeliverable(item)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                            dealForm.deliverables.includes(item)
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Campaign Brief
                    </label>
                    <textarea
                      value={dealForm.dealDescription}
                      onChange={(e) => setDealForm({ ...dealForm, dealDescription: e.target.value })}
                      placeholder="Describe your campaign goals, key messaging, and any specific requirements..."
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    />
                  </div>

                  {/* Delivery & Rights */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Delivery Window
                      </label>
                      <select
                        value={dealForm.deliveryWindow}
                        onChange={(e) => setDealForm({ ...dealForm, deliveryWindow: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="7 days">7 days</option>
                        <option value="14 days">14 days</option>
                        <option value="30 days">30 days</option>
                        <option value="60 days">60 days</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Usage Rights
                      </label>
                      <select
                        value={dealForm.usageRights}
                        onChange={(e) => setDealForm({ ...dealForm, usageRights: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="30 days">30 days</option>
                        <option value="90 days">90 days</option>
                        <option value="1 year">1 year</option>
                        <option value="Perpetual">Perpetual</option>
                      </select>
                    </div>
                  </div>

                  {/* Exclusivity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Exclusivity Period
                    </label>
                    <select
                      value={dealForm.exclusivity}
                      onChange={(e) => setDealForm({ ...dealForm, exclusivity: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="none">No exclusivity</option>
                      <option value="30_days">30 days</option>
                      <option value="60_days">60 days</option>
                      <option value="90_days">90 days</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Creator won't work with competing brands during this period
                    </p>
                  </div>

                  {/* Revisions */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Revision Rounds</p>
                      <p className="text-sm text-gray-500">Number of revision requests included</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setDealForm({ ...dealForm, revisionRounds: Math.max(1, dealForm.revisionRounds - 1) })}
                        className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-semibold">{dealForm.revisionRounds}</span>
                      <button
                        type="button"
                        onClick={() => setDealForm({ ...dealForm, revisionRounds: Math.min(5, dealForm.revisionRounds + 1) })}
                        className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-600">Total Deal Value</span>
                    <span className="text-2xl font-bold text-gray-900">${dealForm.dealAmount.toLocaleString()}</span>
                  </div>
                  <button
                    onClick={handleCreateDeal}
                    disabled={creatingDeal || dealForm.deliverables.length === 0}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-900 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50"
                  >
                    {creatingDeal ? 'Sending Offer...' : 'Send Offer'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
