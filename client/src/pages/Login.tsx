import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface LoginProps {
  userType?: 'brand' | 'creator';
}

export default function Login({ userType: defaultUserType }: LoginProps) {
  const navigate = useNavigate();
  const { login, user } = useAuth();

  const [userType, setUserType] = useState<'brand' | 'creator'>(defaultUserType || 'brand');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate(user.type === 'brand' ? '/dashboard' : '/creator/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password, userType);
      navigate(userType === 'brand' ? '/dashboard' : '/creator/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-900 bg-clip-text text-transparent">
            MNGR
          </Link>
          <p className="text-gray-600 mt-2">Welcome back</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* User Type Toggle */}
          {!defaultUserType && (
            <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
              <button
                type="button"
                onClick={() => setUserType('brand')}
                className={`flex-1 py-2 rounded-md font-medium transition ${
                  userType === 'brand'
                    ? 'bg-white shadow text-purple-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Brand
              </button>
              <button
                type="button"
                onClick={() => setUserType('creator')}
                className={`flex-1 py-2 rounded-md font-medium transition ${
                  userType === 'creator'
                    ? 'bg-white shadow text-purple-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Creator
              </button>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-900 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-gray-600 mt-6">
            Don't have an account?{' '}
            <Link to="/auth" className="text-purple-600 font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
