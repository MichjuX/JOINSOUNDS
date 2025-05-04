import React, { useState, useEffect } from 'react';
import UserService from '../service/UserService';
import { Link } from 'react-router-dom';



function ProfilePage() {
    const [profileInfo, setProfileInfo] = useState(null);

    useEffect(() => {
        fetchProfileInfo();
    }, []);

    const fetchProfileInfo = async () => {
        try {

            const token = localStorage.getItem('token'); // Retrieve the token from localStorage
            const response = await UserService.getYourProfile(token);
            console.log(response); // Add this to see actual response structure
            setProfileInfo(response.user); // Adjust based on actual response
            // setProfileInfo(response.ourUsers);
        } catch (error) {
            console.error('Error fetching profile information:', error);
        }
    };

    if (!profileInfo) {
        return <div>Loading profile...</div>; // Add loading state
    }

    return (
        <div className="profile-page-container">
            <h2>Profile Information</h2>
            <p>Name: {profileInfo?.name || 'Not available'}</p>
            <p>Email: {profileInfo?.email || 'Not available'}</p>
            <p>City: {profileInfo?.city || 'Not available'}</p>
            {profileInfo?.role === "ADMIN" && (
                <button><Link to={`/update-user/${profileInfo.id}`}>Update This Profile</Link></button>
            )}
        </div>
    );
}

export default ProfilePage;