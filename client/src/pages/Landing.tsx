import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Landing() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-900 bg-clip-text text-transparent">
            MNGR
          </Link>
          <div className="flex items-center gap-6">
            <a href="#how-it-works" className="text-gray-700 hover:text-purple-600 font-medium hidden md:block">
              How It Works
            </a>
            <a href="#for-brands" className="text-gray-700 hover:text-purple-600 font-medium hidden md:block">
              For Brands
            </a>
            <a href="#for-creators" className="text-gray-700 hover:text-purple-600 font-medium hidden md:block">
              For Creators
            </a>
            <Link
              to="/auth"
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-900 text-white rounded-lg font-semibold hover:shadow-lg transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-purple-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full mb-6">
                <span className="w-2 h-2 bg-purple-600 rounded-full animate-pulse"></span>
                <span className="text-purple-700 font-medium text-sm">AI-Powered Creator Discovery</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Connect Brands with
                <span className="bg-gradient-to-r from-purple-600 to-purple-900 bg-clip-text text-transparent"> Perfect Creators</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                MNGR uses AI to match brands with creators based on audience fit, engagement quality, and campaign goals.
                Find your perfect partnership in minutes, not weeks.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/auth?type=brand"
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-900 text-white rounded-xl font-semibold text-lg hover:shadow-xl transition text-center"
                >
                  I'm a Brand
                </Link>
                <Link
                  to="/auth?type=creator"
                  className="px-8 py-4 border-2 border-purple-600 text-purple-600 rounded-xl font-semibold text-lg hover:bg-purple-50 transition text-center"
                >
                  I'm a Creator
                </Link>
              </div>
              <div className="flex flex-wrap items-center gap-6 mt-10 text-sm">
                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold text-green-700">100% Free for Brands</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold text-green-700">No Subscriptions Ever</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-3xl p-8 shadow-2xl">
                <div className="bg-white rounded-2xl p-6 shadow-lg mb-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-purple-900 rounded-full flex items-center justify-center text-white font-bold">
                      AI
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">MNGR Assistant</p>
                      <p className="text-sm text-gray-500">Finding creators...</p>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4">
                    Based on your fitness campaign needs, I found 3 creators that match your criteria:
                  </p>
                  <div className="space-y-3">
                    {[
                      { name: 'wellness_emma', match: 85, followers: '94K' },
                      { name: 'fitwithjess', match: 78, followers: '125K' },
                      { name: 'healthylifestyle', match: 72, followers: '210K' },
                    ].map((creator) => (
                      <div key={creator.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center text-purple-700 font-bold text-sm">
                            {creator.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">@{creator.name}</p>
                            <p className="text-xs text-gray-500">{creator.followers} followers</p>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                          {creator.match}% match
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white rounded-xl p-4 shadow-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Deal Created!</p>
                    <p className="text-sm text-gray-500">$5,000 campaign</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: '10K+', label: 'Creators' },
              { number: '500+', label: 'Brands' },
              { number: '$2M+', label: 'Deals Completed' },
              { number: '85%', label: 'Match Rate' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-900 bg-clip-text text-transparent">
                  {stat.number}
                </p>
                <p className="text-gray-600 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How MNGR Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our AI-powered platform makes finding and managing creator partnerships seamless
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Describe Your Campaign',
                description: 'Tell our AI assistant about your campaign goals, target audience, and budget. Natural language, no complicated filters.',
              },
              {
                step: '02',
                title: 'Get Smart Matches',
                description: 'Our AI analyzes thousands of creators and surfaces the best matches with detailed compatibility scores.',
              },
              {
                step: '03',
                title: 'Create & Manage Deals',
                description: 'Send deal proposals, negotiate terms, and manage your campaigns all in one place with built-in contracts.',
              },
            ].map((item) => (
              <div key={item.step} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 mb-6">
                  <span className="text-2xl font-bold">{item.step}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mt-2 mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Brands Section */}
      <section id="for-brands" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-purple-600 font-semibold">FOR BRANDS</span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">100% FREE</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Find creators that actually convert
              </h2>
              <p className="text-xl text-gray-600 mb-4">
                Stop scrolling through endless profiles. Our AI understands your brand and finds creators
                whose audience actually matches your target market.
              </p>
              <p className="text-lg text-green-700 font-medium mb-8 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                No subscription fees. No platform fees. Pay only what you offer creators.
              </p>
              <ul className="space-y-4">
                {[
                  'AI-powered matching based on audience demographics',
                  'Engagement quality analysis, not just follower counts',
                  'Built-in contract templates and payment processing',
                  'Campaign performance tracking and analytics',
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/auth?type=brand"
                className="inline-block mt-8 px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-900 text-white rounded-xl font-semibold text-lg hover:shadow-xl transition"
              >
                Start Finding Creators
              </Link>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h4 className="font-semibold text-gray-900 mb-4">Campaign Dashboard</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Active Campaigns</p>
                      <p className="text-sm text-gray-500">3 campaigns running</p>
                    </div>
                    <span className="text-2xl font-bold text-purple-600">3</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Total Spend</p>
                      <p className="text-sm text-gray-500">This month</p>
                    </div>
                    <span className="text-2xl font-bold text-green-600">$24,500</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Avg. Engagement</p>
                      <p className="text-sm text-gray-500">Across all creators</p>
                    </div>
                    <span className="text-2xl font-bold text-blue-600">8.2%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Creators Section */}
      <section id="for-creators" className="py-20 bg-purple-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 bg-white rounded-2xl p-8">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Free to Use, Always</h4>
                    <p className="text-sm text-gray-500">No monthly fees, no hidden costs</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">
                  Unlike other platforms that charge monthly subscriptions, MNGR only takes a small percentage when you get paid. Starting at 18%, dropping to as low as 10% as you grow.
                </p>
                <div className="bg-white rounded-lg p-4 border border-green-100">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Your earnings on a $5,000 deal:</span>
                    <span className="text-2xl font-bold text-green-600">$4,100</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">At Launch tier (18%) • Drops to 10% as you earn more</p>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-purple-600 font-semibold">FOR CREATORS</span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">FREE ACCESS</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Get discovered by brands that fit
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                No more cold outreach. No subscriptions. Brands come to you with deals that match your niche,
                audience, and rates. Focus on creating, we'll handle the rest.
              </p>
              <ul className="space-y-4">
                {[
                  'Free forever - no monthly fees or subscriptions',
                  'Reverse discovery - brands find and reach out to you',
                  'Small success fee only when you get paid',
                  'Secure payments and contract protection',
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/auth?type=creator"
                className="inline-block mt-8 px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-900 text-white rounded-xl font-semibold text-lg hover:shadow-xl transition"
              >
                Join as Creator
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-purple-900">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to transform your creator partnerships?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Join thousands of brands and creators already using MNGR to build better partnerships.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/auth?type=brand"
              className="px-8 py-4 bg-white text-purple-600 rounded-xl font-semibold text-lg hover:bg-purple-50 transition"
            >
              Start as Brand
            </Link>
            <Link
              to="/auth?type=creator"
              className="px-8 py-4 border-2 border-white text-white rounded-xl font-semibold text-lg hover:bg-white/10 transition"
            >
              Join as Creator
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <span className="text-2xl font-bold text-white">MNGR</span>
              <p className="text-gray-400 mt-1">AI-powered creator partnerships</p>
            </div>
            <div className="flex gap-8 text-gray-400">
              <a href="#" className="hover:text-white transition">Terms</a>
              <a href="#" className="hover:text-white transition">Privacy</a>
              <a href="#" className="hover:text-white transition">Support</a>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
            © 2024 MNGR. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
