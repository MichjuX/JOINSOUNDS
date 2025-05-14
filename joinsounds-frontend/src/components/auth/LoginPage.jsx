import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import UserService from '../service/UserService';
import './LoginPage.css';
import '../common/Buttons.css';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await UserService.login(email, password);

            if (response.token) {
                localStorage.setItem('token', response.token);
                localStorage.setItem('role', response.role);
                localStorage.setItem('userId', response.userId);
                navigate('/');
                window.location.reload();
            }
        } catch (error) {
            console.error('Login error:', error); // Dodaj to dla debugowania

            // Poprawiona obsługa błędów
            if (error.response) {
                // Axios error
                if (error.response.data && error.response.data.message) {
                    setError(error.response.data.message);
                } else {
                    setError(`Error: ${error.response.status} - ${error.response.statusText}`);
                }
            } else if (error.request) {
                // Request was made but no response
                setError('No response from server. Please try again.');
            } else {
                // Other errors
                setError(error.message || 'Login failed. Please try again.');
            }

            // setTimeout(() => setError(''), 5000);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="login-page-container">
            <div className="auth-container">
                <h1 className="login-title">Login</h1>

                {/* Poprawione wyświetlanie błędu */}
                {error && (
                    <div className="error-message">
                        {error}
                        {error.includes("Verify your account first") && (
                            <div className="verification-help">
                                Didn't receive the verification email?
                                <button
                                    className="submit-btn"
                                    onClick={() => navigate('/resend-verification')}
                                    disabled={isLoading}
                                >
                                    Resend verification email
                                </button>
                            </div>
                        )}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">Email or username:</label>
                        <input
                            id="email"
                            type="text"
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)}
                            className="form-input"
                            required
                            autoComplete="username"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="form-label">Password:</label>
                        <input
                            id="password"
                            type="password"
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)}
                            className="form-input"
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="submit-button"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div className="auth-footer">
                    <Link to="/register" className="register-link">
                        Don't have an account? Register here.
                    </Link>
                    <Link to="/forgot-password" className="register-link">
                        Forgot your password?
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;