import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from './components/common/Navbar';
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
import EditPostPage from './components/pages/EditPostPage';
import AccountVerificationPage from './components/auth/AccountVerificationPage';
import TagPage from './components/pages/TagPage';
import UserPostsPage from './components/pages/UserPostsPage';
import { ConfirmPopup, confirmPopup } from 'primereact/confirmpopup';
import { WebSocketProvider } from './components/context/WebSocketProvider'
import RecommendedPostPage from './components/pages/RecommendedPostPage';

function App() {
  return (
    <BrowserRouter>
    <WebSocketProvider>
      <div className="App">
        <Navbar />
        <ConfirmPopup />
        <div className="content" style={{ minHeight: 'calc(100vh - 120px)' }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            {/* <Route path="/login" element={<LoginPage />} /> */}
            {/* <Route path="/profile" element={<ProfilePage />} /> */}
            <Route path="/post/:id" element={<FullPostPage />} />
            <Route path="/tag/:tag" element={<TagPage />} />
            <Route path="/posts/user/:userId" element={<UserPostsPage />} />
            <Route path="/profile/:userId" element={<ProfilePage />} />
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
                <Route path="/verify-account/:userId/:token?" element={<AccountVerificationPage />} />
              </>
            )}

            {UserService.isAuthenticated() && (
              <>
                <Route path="/post/edit/:id" element={<EditPostPage />} />
                <Route path="/recommendations" element={<RecommendedPostPage />} />
              </>
            )}
            {/* Redirect to login if not authenticated */}
          </Routes>
        </div>
        {/* <FooterComponent /> */}
      </div>
    </WebSocketProvider>
    </BrowserRouter>
  );
}

export default App;