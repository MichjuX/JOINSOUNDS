import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from './components/common/navbar';
import LoginPage from './components/auth/LoginPage';
import UserRegistrationPage from './components/auth/UserRegistrationPage';
import AdminRegistrationPage from './components/auth/AdminRegistrationPage';
import FooterComponent from './components/common/footer';
import UserService from './components/service/UserService';
import UpdateUser from './components/userspage/UpdateUser';
import UserManagementPage from './components/userspage/UserManagementPage';
import ProfilePage from './components/userspage/ProfilePage';
import HomePage from './components/pages/HomePage';
import FullPostPage from './components/pages/FullPostPage';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Navbar />
        <div className="content" style={{ minHeight: 'calc(100vh - 120px)' }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            {/* <Route path="/login" element={<LoginPage />} /> */}
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/post/:id" element={<FullPostPage />} />
            {/* <Route path="/register" element={<UserRegistrationPage />} /> */}

            {/* Check if user is authenticated and admin before rendering admin-only routes */}
            {UserService.adminOnly() && (
              <>
                <Route path="/admin/register" element={<AdminRegistrationPage />} />
                <Route path="/admin/user-management" element={<UserManagementPage />} />
                <Route path="/update-user/:userId" element={<UpdateUser />} />
              </>
            )}
            
            <Route path="*" element={<Navigate to="/" />} />
            {!UserService.isAuthenticated() && (
              <>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<UserRegistrationPage />} />
              </>
            )}
            {/* Redirect to login if not authenticated */}
          </Routes>
        </div>
        {/* <FooterComponent /> */}
      </div>
    </BrowserRouter>
  );
}

export default App;