import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UserService from '../service/UserService';

function Navbar() {
    const [isAuthenticated, setIsAuthenticated] = useState(UserService.isAuthenticated());
    const [isAdmin, setIsAdmin] = useState(UserService.isAdmin());

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

    return (
        <nav>
            <ul>
                {!isAuthenticated && <li><Link to="/">Gibon Agent</Link></li>}
                {isAuthenticated && <li><Link to="/profile">Profile</Link></li>}
                {isAdmin && <li><Link to="/admin/user-management">User Management</Link></li>}
                {isAuthenticated && <li><Link to="/" onClick={handleLogout}>Logout</Link></li>}
            </ul>
        </nav>
    );
}

export default Navbar;