import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import UserService from '../service/UserService';
import { Link } from 'react-router-dom';
import './LoginPage.css';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try{
            const userData = await UserService.login(email, password);
            if (userData.token) {
                localStorage.setItem('token', userData.token);
                localStorage.setItem('role', userData.role);
                localStorage.setItem('userId', userData.userId);
                window.location.reload();
                navigate('/');
            } else {
                setError("Invalid credentials. Please try again.");
                setTimeout(() => setError(''), 5000);
            }
        } catch (error) {
            console.error("Login failed:", error);
            setError("Login failed. Please check your credentials.");
            setTimeout(() => setError(''), 5000);
        }
    }
    
    return(
        <div className="login-page-container">
            <div className="auth-container">
                <p className="login-title">Login</p>
                {error && <p className="error-message">{error}</p>}
                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label className="form-label">Email:</label>
                        <input 
                            type="text" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)}
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password:</label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)}
                            className="form-input"
                        />
                    </div>
                    <button type="submit" className="submit-button">Login</button>
                </form>
                <Link to="/register" className="register-link">
                    Don't have an account? Click here to register.
                </Link>
            </div>
        </div>
    )
}

export default LoginPage;