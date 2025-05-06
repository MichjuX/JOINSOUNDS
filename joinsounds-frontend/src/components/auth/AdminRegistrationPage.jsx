import React, { useState } from 'react';
import UserService from '../service/UserService';
import { useNavigate, Link } from 'react-router-dom';
import './LoginPage.css'; // Używamy tego samego pliku CSS

function AdminRegistrationPage() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: '',
        city: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await UserService.register(formData, token);
            
            setFormData({ name: '', email: '', password: '', role: '', city: '' });
            alert('User registered successfully');
            navigate(token ? '/admin/user-management' : '/login');
            
        } catch (error) {
            if (error.response) {
                if (error.response.status === 400) {
                    alert(error.response.data.error || 'User with this email or username already exists');
                } else {
                    alert('Registration failed: ' + (error.response.data.message || error.message));
                }
            } else {
                alert('Registration failed: ' + error.message);
            }
        }
    };

    return (
        <div className="login-page-container">
            <div className="auth-container">
                <h2 className="login-title">Admin Registration</h2>
                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label className="form-label">Username:</label>
                        <input 
                            type="text" 
                            name="name" 
                            value={formData.name} 
                            onChange={handleInputChange} 
                            className="form-input"
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email:</label>
                        <input 
                            type="email" 
                            name="email" 
                            value={formData.email} 
                            onChange={handleInputChange} 
                            className="form-input"
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password:</label>
                        <input 
                            type="password" 
                            name="password" 
                            value={formData.password} 
                            onChange={handleInputChange} 
                            className="form-input"
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Role:</label>
                        <select 
                            name="role" 
                            value={formData.role} 
                            onChange={handleInputChange} 
                            className="form-input"
                            required
                        >
                            <option value="">-- Select your role --</option>
                            <option value="ADMIN">Administrator</option>
                            <option value="MODERATOR">Moderator</option>
                            <option value="USER">User</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">City:</label>
                        <input 
                            type="text" 
                            name="city" 
                            value={formData.city} 
                            onChange={handleInputChange} 
                            className="form-input"
                            placeholder="Enter your city" 
                            required 
                        />
                    </div>
                    <button type="submit" className="submit-button">Register</button>
                </form>
                <Link to="/admin/user-management" className="register-link">
                    Back to User Management
                </Link>
            </div>
        </div>
    );
}

export default AdminRegistrationPage;