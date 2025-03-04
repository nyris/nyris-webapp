import ProtectedRoute from 'routes/ProctedRoute';
import Home from 'pages/Home';
import Login from 'pages/Login';
import Logout from 'pages/Logout';
import Results from 'pages/Result';
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';
import AppLayout from 'layouts/AppLayout';

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="login" element={<Login />} />
        <Route path="logout" element={<Logout />} />

        <Route element={<AppLayout />}>
          <Route
            index
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

          <Route
            path="result"
            element={
              <ProtectedRoute>
                <Results />
              </ProtectedRoute>
            }
          />

          <Route
            path="*"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
