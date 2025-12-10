import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Login from './pages/Login';
import BrandDashboard from './pages/BrandDashboard';
import Search from './pages/Search';
import Deals from './pages/Deals';
import Campaigns from './pages/Campaigns';
import SavedCreators from './pages/SavedCreators';
import Settings from './pages/Settings';
import CreatorDashboard from './pages/CreatorDashboard';
import CreatorDeals from './pages/CreatorDeals';
import CreatorEarnings from './pages/CreatorEarnings';
import CreatorSettings from './pages/CreatorSettings';
import CreatorClaim from './pages/CreatorClaim';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminCreators from './pages/AdminCreators';
import AdminBrands from './pages/AdminBrands';
import AdminDeals from './pages/AdminDeals';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/login" element={<Login />} />
      <Route path="/creator/login" element={<Login userType="creator" />} />
      <Route path="/creator/claim" element={<CreatorClaim />} />

      {/* Protected Brand Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute userType="brand">
          <BrandDashboard />
        </ProtectedRoute>
      } />
      <Route path="/search" element={
        <ProtectedRoute userType="brand">
          <Search />
        </ProtectedRoute>
      } />
      <Route path="/deals" element={
        <ProtectedRoute userType="brand">
          <Deals />
        </ProtectedRoute>
      } />
      <Route path="/campaigns" element={
        <ProtectedRoute userType="brand">
          <Campaigns />
        </ProtectedRoute>
      } />
      <Route path="/saved" element={
        <ProtectedRoute userType="brand">
          <SavedCreators />
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute userType="brand">
          <Settings />
        </ProtectedRoute>
      } />

      {/* Protected Creator Routes */}
      <Route path="/creator/dashboard" element={
        <ProtectedRoute userType="creator">
          <CreatorDashboard />
        </ProtectedRoute>
      } />
      <Route path="/creator/deals" element={
        <ProtectedRoute userType="creator">
          <CreatorDeals />
        </ProtectedRoute>
      } />
      <Route path="/creator/earnings" element={
        <ProtectedRoute userType="creator">
          <CreatorEarnings />
        </ProtectedRoute>
      } />
      <Route path="/creator/settings" element={
        <ProtectedRoute userType="creator">
          <CreatorSettings />
        </ProtectedRoute>
      } />

      {/* Admin Routes (hidden, not linked from main UI) */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={
        <ProtectedRoute userType="admin">
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/creators" element={
        <ProtectedRoute userType="admin">
          <AdminCreators />
        </ProtectedRoute>
      } />
      <Route path="/admin/brands" element={
        <ProtectedRoute userType="admin">
          <AdminBrands />
        </ProtectedRoute>
      } />
      <Route path="/admin/deals" element={
        <ProtectedRoute userType="admin">
          <AdminDeals />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default App;
