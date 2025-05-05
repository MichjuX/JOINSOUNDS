import React, { useState } from 'react';
import UserService from '../service/UserService';
import { useNavigate } from 'react-router-dom';

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
            
            // Jeśli dotarliśmy tutaj, to znaczy że rejestracja się powiodła
            setFormData({ name: '', email: '', password: '', role: '', city: '' });
            alert('User registered successfully');
            navigate(token ? '/admin/user-management' : '/login');
            
        } catch (error) {
            if (error.response) {
                // Błąd z odpowiedzi serwera
                if (error.response.status === 400) {
                    alert(error.response.data.error || 'User with this email or username already exists');
                } else {
                    alert('Registration failed: ' + (error.response.data.message || error.message));
                }
            } else {
                // Błąd sieciowy lub inny
                alert('Registration failed: ' + error.message);
            }
        }
    };

    return (
        <div className="auth-container">
            <h2>Registration</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Name:</label>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                    <label>Email:</label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                    <label>Password:</label>
                    <input type="password" name="password" value={formData.password} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                    <label>Role:</label>
                    <select 
                        name="role" 
                        value={formData.role} 
                        onChange={handleInputChange} 
                        required
                    >
                        <option value="">-- Select your role --</option>
                        <option value="ADMIN">Administrator</option>
                        <option value="MODERATOR">Moderator</option>
                        <option value="USER">User</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>City:</label>
                    <input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="Enter your city" required />
                </div>
                <button type="submit">Register</button>
            </form>
        </div>
    );
}

export default AdminRegistrationPage;