import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CreatorLayout from '../components/CreatorLayout';

interface CreatorProfile {
  username: string;
  email: string;
  platform: string;
  followerCount: number;
  engagementRate: number | null;
  contentCategories: string[];
  minimumDealAmount: number;
  profileCompletion: number;
  currentFeeTier: string;
  annualEarnings: number;
}

interface StripeStatus {
  connected: boolean;
  status: 'not_connected' | 'pending' | 'active';
  chargesEnabled?: boolean;
  payoutsEnabled?: boolean;
  detailsSubmitted?: boolean;
}

export default function CreatorSettings() {
  const { token } = useAuth();
  const [searchParams] = useSearchParams();
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [stripeStatus, setStripeStatus] = useState<StripeStatus | null>(null);
  const [stripeLoading, setStripeLoading] = useState(false);

  const [formData, setFormData] = useState({
    minimumDealAmount: 1000,
    contentCategories: [] as string[],
  });

  useEffect(() => {
    fetchProfile();
    fetchStripeStatus();

    // Check for Stripe redirect
    const stripeResult = searchParams.get('stripe');
    if (stripeResult === 'success') {
      setMessage('Payment account connected successfully!');
      fetchStripeStatus();
    } else if (stripeResult === 'refresh') {
      setMessage('Please complete your payment account setup');
    }
  }, [token, searchParams]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/creator/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setFormData({
          minimumDealAmount: data.minimumDealAmount,
          contentCategories: data.contentCategories,
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStripeStatus = async () => {
    try {
      const response = await fetch('/api/payments/connect/status', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setStripeStatus(data);
      }
    } catch (error) {
      console.error('Error fetching Stripe status:', error);
    }
  };

  const handleStripeConnect = async () => {
    setStripeLoading(true);
    try {
      const response = await fetch('/api/payments/connect/onboarding', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        const data = await response.json();
        setMessage(data.message || 'Failed to start Stripe onboarding');
      }
    } catch (error) {
      setMessage('Error connecting to Stripe');
    } finally {
      setStripeLoading(false);
    }
  };

  const handleStripeDashboard = async () => {
    setStripeLoading(true);
    try {
      const response = await fetch('/api/payments/connect/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const { url } = await response.json();
        window.open(url, '_blank');
      }
    } catch (error) {
      setMessage('Error opening Stripe dashboard');
    } finally {
      setStripeLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/creator/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage('Settings saved successfully!');
        fetchProfile();
      } else {
        setMessage('Failed to save settings');
      }
    } catch (error) {
      setMessage('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const categoryOptions = [
    'Fashion', 'Beauty', 'Fitness', 'Food', 'Travel', 'Tech',
    'Gaming', 'Lifestyle', 'Parenting', 'Business', 'Education', 'Entertainment'
  ];

  const toggleCategory = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      contentCategories: prev.contentCategories.includes(category)
        ? prev.contentCategories.filter((c) => c !== category)
        : [...prev.contentCategories, category],
    }));
  };

  if (loading) {
    return (
      <CreatorLayout title="Profile Settings">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </CreatorLayout>
    );
  }

  return (
    <CreatorLayout title="Profile Settings" subtitle="Manage your creator profile and preferences">
      <div className="max-w-3xl">
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {message}
          </div>
        )}

        {/* Profile Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Overview</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Username</p>
              <p className="font-medium text-gray-900">@{profile?.username}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Platform</p>
              <p className="font-medium text-gray-900 capitalize">{profile?.platform}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Followers</p>
              <p className="font-medium text-gray-900">{profile?.followerCount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Engagement Rate</p>
              <p className="font-medium text-gray-900">
                {profile?.engagementRate ? `${profile.engagementRate.toFixed(1)}%` : 'N/A'}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-2">Profile Completion</p>
            <div className="bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-600 rounded-full h-2"
                style={{ width: `${profile?.profileCompletion || 0}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-400 mt-1">{profile?.profileCompletion || 0}% complete</p>
          </div>
        </div>

        {/* Payment Account */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Account</h2>
          <p className="text-gray-600 text-sm mb-4">
            Connect your bank account to receive payments from brands. We use Stripe for secure payment processing.
          </p>

          {stripeStatus?.status === 'active' ? (
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-green-900">Payment Account Connected</p>
                    <p className="text-sm text-green-700">You can receive payments from brands</p>
                  </div>
                </div>
                <button
                  onClick={handleStripeDashboard}
                  disabled={stripeLoading}
                  className="px-4 py-2 text-green-700 hover:text-green-800 font-medium"
                >
                  View Dashboard
                </button>
              </div>
            </div>
          ) : stripeStatus?.status === 'pending' ? (
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-yellow-900">Setup Incomplete</p>
                    <p className="text-sm text-yellow-700">Complete your payment account setup to receive payments</p>
                  </div>
                </div>
                <button
                  onClick={handleStripeConnect}
                  disabled={stripeLoading}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium disabled:opacity-50"
                >
                  {stripeLoading ? 'Loading...' : 'Complete Setup'}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">No Payment Account</p>
                    <p className="text-sm text-gray-600">Connect your bank account to get paid</p>
                  </div>
                </div>
                <button
                  onClick={handleStripeConnect}
                  disabled={stripeLoading}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium disabled:opacity-50"
                >
                  {stripeLoading ? 'Loading...' : 'Connect Account'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Fee Tier */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Fee Tier</h2>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-purple-900 capitalize text-lg">
                  {profile?.currentFeeTier} Tier
                </p>
                <p className="text-purple-700 text-sm">
                  Annual earnings: ${(profile?.annualEarnings || 0).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-purple-600">
                  {profile?.currentFeeTier === 'launch' && '18%'}
                  {profile?.currentFeeTier === 'growth' && '15%'}
                  {profile?.currentFeeTier === 'scale' && '12%'}
                  {profile?.currentFeeTier === 'partner' && '10%'}
                </p>
                <p className="text-sm text-purple-600">platform fee</p>
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-2 text-sm text-gray-600">
            <p><strong>Launch:</strong> $0 - $10K (18% fee)</p>
            <p><strong>Growth:</strong> $10K - $50K (15% fee)</p>
            <p><strong>Scale:</strong> $50K - $100K (12% fee)</p>
            <p><strong>Partner:</strong> $100K+ (10% fee)</p>
          </div>
        </div>

        {/* Deal Preferences */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Deal Preferences</h2>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Deal Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={formData.minimumDealAmount}
                onChange={(e) => setFormData({ ...formData, minimumDealAmount: Number(e.target.value) })}
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Brands won't see you in search results for deals below this amount
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content Categories
            </label>
            <div className="flex flex-wrap gap-2">
              {categoryOptions.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => toggleCategory(category)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                    formData.contentCategories.includes(category)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-900 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </CreatorLayout>
  );
}
