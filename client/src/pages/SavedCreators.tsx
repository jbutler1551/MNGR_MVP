import { useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';

interface SavedCreator {
  id: string;
  username: string;
  platform: string;
  followerCount: number;
  engagementRate: number;
  contentCategories: string[];
  savedAt: string;
}

export default function SavedCreators() {
  const [savedCreators] = useState<SavedCreator[]>([]);

  const formatFollowers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(0)}K`;
    return count.toString();
  };

  return (
    <DashboardLayout
      title="Saved Creators"
      subtitle="Creators you've bookmarked for later"
    >
      {savedCreators.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No saved creators yet</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Save creators you're interested in while searching.
            Build your shortlist for future campaigns.
          </p>
          <Link
            to="/search"
            className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
          >
            Find Creators to Save
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedCreators.map((creator) => (
            <div key={creator.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
                    {creator.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">@{creator.username}</h3>
                    <p className="text-sm text-gray-500 capitalize">{creator.platform}</p>
                  </div>
                </div>
                <button className="text-pink-500 hover:text-pink-600">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>

              <div className="flex gap-4 text-sm mb-4">
                <div>
                  <p className="text-gray-500">Followers</p>
                  <p className="font-semibold text-gray-900">{formatFollowers(creator.followerCount)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Engagement</p>
                  <p className="font-semibold text-gray-900">{creator.engagementRate.toFixed(1)}%</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {creator.contentCategories.slice(0, 3).map((cat) => (
                  <span key={cat} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                    {cat}
                  </span>
                ))}
              </div>

              <button className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium">
                Create Deal
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tips */}
      <div className="mt-8 bg-purple-50 rounded-xl p-6">
        <h4 className="font-semibold text-purple-900 mb-3">Pro Tips for Building Your Creator List</h4>
        <ul className="space-y-2 text-sm text-purple-800">
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Save creators across different niches to build a diverse roster
          </li>
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Look for creators with strong engagement rates over just follower count
          </li>
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Organize saved creators into campaigns when you're ready to launch
          </li>
        </ul>
      </div>
    </DashboardLayout>
  );
}
