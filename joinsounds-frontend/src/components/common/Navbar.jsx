import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import UserService from '../service/UserService';
import { useEffect } from 'react';
import logo from '../../assets/images/JOINSOUNDS.png';


function Navbar() {
    const [isAuthenticated, setIsAuthenticated] = useState(UserService.isAuthenticated());
    const [isAdmin, setIsAdmin] = useState(UserService.isAdmin());  
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const closeMobileMenu = () => setIsOpen(false);

    const handleLogout = () => {
        // const confirmDelete = window.confirm('Are you sure you want to logout?');
        // if (confirmDelete) {
            UserService.logout();
            // Wymuś aktualizację stanu
            setIsAuthenticated(false);
            setIsAdmin(false);
            // Możesz też przekierować
            window.location.href = '/login'; // Opcjonalne
        // }
    };

    // Nasłuchuj zmian w autentykacji
    useEffect(() => {
        const handleAuthChange = () => {
            setIsAuthenticated(UserService.isAuthenticated());
            setIsAdmin(UserService.isAdmin());
        };

        // Możesz dodać event listener jeśli UserService emituje zdarzenia
        // Lub odświeżaj przy każdej zmianie (mniej efektywne)
        handleAuthChange();
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
            </li> }
            {!isAuthenticated && <li className='nav-item'>
                <Link to='/register' className='nav-links' onClick={closeMobileMenu}>
                Register
                </Link>
            </li> }
            {isAdmin && <li className='nav-item'>
                <Link to='/admin/user-management' className='nav-links' onClick={closeMobileMenu}>
                User Management
                </Link>
            </li> }
            {isAuthenticated && <li className='nav-item'>
                <Link to='/profile' className='nav-links' onClick={closeMobileMenu}>
                Profile
                </Link>
            </li> }
            {isAuthenticated && <li className='nav-item'>
                <Link to='/' className='nav-links' onClick={() => { closeMobileMenu(); handleLogout(); }}>
                Logout
                </Link>
            </li> }
            </ul>
        </div>
        </nav>
    );
}

export default Navbar;