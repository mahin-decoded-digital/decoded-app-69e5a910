import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Schedule from './pages/Schedule';
import Members from './pages/Members';
import Memberships from './pages/Memberships';
import Transactions from './pages/Transactions';
import Settings from './pages/Settings';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route element={<Layout />}>
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/schedule" 
          element={
            <ProtectedRoute>
              <Schedule />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/members" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'staff']}>
              <Members />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/memberships" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'member']}>
              <Memberships />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/transactions" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'finance']}>
              <Transactions />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Settings />
            </ProtectedRoute>
          } 
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
