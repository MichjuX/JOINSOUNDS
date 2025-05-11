import React, { useState, useEffect } from 'react';
import UserService from '../service/UserService';
import { Link } from 'react-router-dom';
import './ProfilePage.css';

function ProfilePage() {
    const [profileInfo, setProfileInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfileInfo();
    }, []);

    const fetchProfileInfo = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await UserService.getYourProfile(token);
            setProfileInfo(response.user);
        } catch (error) {
            console.error('Error fetching profile information:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="profile-page-container">
                <div className="loading">Loading profile...</div>
            </div>
        );
    }

    if (!profileInfo) {
        return (
            <div className="profile-page-container">
                <div className="error">Failed to load profile information</div>
            </div>
        );
    }

    return (
        <div className="profile-page-container">
            <h2>Profile Information</h2>
            <p data-label="Name:">{profileInfo.name || 'Not available'}</p>
            <p data-label="Email:">{profileInfo.email || 'Not available'}</p>
            <p data-label="Country:">{profileInfo.country || 'Not available'}</p>
            {profileInfo.role === "ADMIN" && (
                <button>
                    <Link to={`/update-user/${profileInfo.id}`}>Update This Profile</Link>
                </button>
            )}
        </div>
    );
}

export default ProfilePage;