import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import UserService from '../service/UserService';
import logo from '../../assets/images/JOINSOUNDS.png';
import userService from '../service/UserService';

function Navbar() {
    const [isAuthenticated, setIsAuthenticated] = useState(UserService.isAuthenticated());
    const [isAdmin, setIsAdmin] = useState(UserService.isAdmin());
    const [currentUserId, setCurrentUserId] = useState(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const fetchUserId = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const userId = await userService.getCurrentUserId(token);
                    setCurrentUserId(userId);
                } catch (error) {
                    console.error('Error fetching user ID:', error);
                }
            }
        };

        fetchUserId();
    }, [isAuthenticated]); // Re-fetch when authentication changes

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const closeMobileMenu = () => setIsOpen(false);

    const handleLogout = () => {
        UserService.logout();
        setIsAuthenticated(false);
        setIsAdmin(false);
        setCurrentUserId(null);
        window.location.href = '/login';
    };

    useEffect(() => {
        setIsAuthenticated(UserService.isAuthenticated());
        setIsAdmin(UserService.isAdmin());
    }, []);

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
                    <img src={logo} alt="JoinSounds Logo" />
                </Link>
                <div className={`menu-icon ${isOpen ? 'toggle' : ''}`} onClick={toggleMenu}>
                    <div className="line line1"></div>
                    <div className="line line2"></div>
                    <div className="line line3"></div>
                </div>
                <ul className={isOpen ? 'nav-menu active' : 'nav-menu'}>
                    {!isAuthenticated && <li className='nav-item'>
                        <Link to='/login' className='nav-links' onClick={closeMobileMenu}>
                            Login
                        </Link>
                    </li>}
                    {!isAuthenticated && <li className='nav-item'>
                        <Link to='/register' className='nav-links' onClick={closeMobileMenu}>
                            Register
                        </Link>
                    </li>}
                    {isAdmin && <li className='nav-item'>
                        <Link to='/admin/user-management' className='nav-links' onClick={closeMobileMenu}>
                            User Management
                        </Link>
                    </li>}
                    {isAuthenticated && currentUserId && <li className='nav-item'>
                        <Link to={`/profile/${currentUserId}`} className='nav-links' onClick={closeMobileMenu}>
                            Profile
                        </Link>
                    </li>}
                    {isAuthenticated && <li className='nav-item'>
                        <Link to='/' className='nav-links' onClick={() => { closeMobileMenu(); handleLogout(); }}>
                            Logout
                        </Link>
                    </li>}
                </ul>
            </div>
        </nav>
    );
}

export default Navbar;