import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import UserService from '../service/UserService';
import '../auth/LoginPage.css';

function UpdateUser() {
  const navigate = useNavigate();
  const { userId } = useParams();


  const [userData, setUserData] = useState({
    name: '',
    email: '',
    role: '',
    city: ''
  });

  useEffect(() => {
    fetchUserDataById(userId); // Pass the userId to fetchUserDataById
  }, [userId]); //wheen ever there is a chane in userId, run this

  const fetchUserDataById = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await UserService.getUserById(userId, token); // Pass userId to getUserById
      const { name, email, role, city } = response.user;
      setUserData({ name, email, role, city });
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevUserData) => ({
      ...prevUserData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const confirmDelete = window.confirm('Are you sure you want to update this user?');
      if (confirmDelete) {
        const token = localStorage.getItem('token');
        const res = await UserService.updateUser(userId, userData, token);
        console.log(res)
        // Redirect to profile page or display a success message
        navigate("/admin/user-management")
      }

    } catch (error) {
      console.error('Error updating user profile:', error);
      alert(error)
    }
  };

  return (
    <div className="login-page-container">
      <div className="auth-container">
        <p className="login-title">Update user</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name:</label>
            <input type="text" name="name" value={userData.name} onChange={handleInputChange} className='form-input' />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input type="email" name="email" value={userData.email} onChange={handleInputChange} className='form-input' />
          </div>
          {/* <div className="form-group">
            <label>Role:</label>
            <input type="text" name="role" value={userData.role} onChange={handleInputChange} />
          </div> */}
          <div className="form-group">
                      <label>Role:</label>
                      <select 
                          name="role" 
                          value={userData.role} 
                          onChange={handleInputChange} 
                          required
                          className='form-input'
                      >
                          <option value="">-- Select your role --</option>
                          <option value="ADMIN">Administrator</option>
                          <option value="MODERATOR">Moderator</option>
                          <option value="USER">User</option>
                      </select>
                  </div>
          <div className="form-group">
            <label>City:</label>
            <input type="text" name="city" value={userData.city} onChange={handleInputChange} className='form-input' />
          </div>
          <button type="submit">Update</button>
        </form>
    </div>
  </div>
  );
}

export default UpdateUser;