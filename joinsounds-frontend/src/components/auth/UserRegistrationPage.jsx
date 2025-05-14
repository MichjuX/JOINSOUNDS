import React, { useState } from 'react';
import UserService from '../service/UserService';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Select from 'react-select';
import './LoginPage.css';
import { countries } from './countries' 
// Lista państw - możesz rozszerzyć tę listę według potrzeb


function UserRegistrationPage() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: '',
        country: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleCountryChange = (selectedOption) => {
        setFormData({ ...formData, country: selectedOption ? selectedOption.value : '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name.trim()) {
            alert('Username cannot be empty or contain only spaces');
            return;
        }
        
        if (formData.name.trim().length < 3) {
            alert('Username must be at least 3 characters long');
            return;
        }


        
        try {
            const token = localStorage.getItem('token');
            const response = await UserService.register(formData, token);
    
            setFormData({
                name: '',
                email: '',
                password: '',
                country: ''
            });
            alert('User registered successfully');
            navigate(`/verify-account/${response.user.id}`);
    
        } catch (error) {
            console.error('Error registering user:', error);
            alert('An error occurred while registering user');
        }
    };

    // Znajdź aktualnie wybrany kraj dla Select
    const selectedCountry = countries.find(country => country.value === formData.country);

    return (
        <div className="login-page-container">
            <div className="auth-container">
                <h2 className="login-title">Registration</h2>
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
                        <label className="form-label">Country:</label>
                        <Select
                            value={selectedCountry}
                            onChange={handleCountryChange}
                            options={countries}
                            isSearchable={true}
                            placeholder="Select or search a country..."
                            classNamePrefix="country-select"
                            required
                            styles={{
                                input: (provided) => ({
                                    ...provided,
                                    color: '#ffffff',
                                }),
                                singleValue: (provided) => ({
                                    ...provided,
                                    color: '#ffffff',
                                }),
                            }}
                            theme={(theme) => ({
                                ...theme,
                                colors: {
                                    ...theme.colors,
                                    primary: '#ff5100',
                                    primary25: '#313131',
                                    primary50: '#ff5100',
                                    neutral0: '#131313',
                                    neutral20: '#313131',
                                    neutral30: '#ff5100',
                                    neutral40: '#ff5100',
                                    neutral50: '#ffffff',
                                    neutral60: '#ffffff',
                                    neutral70: '#ffffff',
                                    neutral80: '#ffffff',
                                    neutral90: '#ffffff',
                                },
                            })}
                        />
                    </div>
                    
                    <button type="submit" className="submit-button">Register</button>
                </form>
                <Link to="/login" className="register-link">
                    Already have an account? Login here
                </Link>
            </div>
        </div>
    );
}

export default UserRegistrationPage;