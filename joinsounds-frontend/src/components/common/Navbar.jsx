import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import UserService from "../service/UserService";
import { useNotifications } from "../hooks/useNotifications";
import logo from "../../assets/images/JOINSOUNDS.png";
import "./Navbar.css";

function Navbar() {
    const [isAuthenticated, setIsAuthenticated] = useState(UserService.isAuthenticated());
    const [isAdmin, setIsAdmin] = useState(UserService.isAdmin());
    const [currentUserId, setCurrentUserId] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const navigate = useNavigate();
    
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

    useEffect(() => {
        const fetchUserId = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const userId = await UserService.getCurrentUserId(token);
                    setCurrentUserId(userId);
                } catch (error) {
                    console.error("Error fetching user ID:", error);
                }
            }
        };

        fetchUserId();
    }, [isAuthenticated]);

    const toggleMenu = () => setIsOpen(!isOpen);
    const closeMobileMenu = () => setIsOpen(false);

    const toggleNotifications = () => {
        setNotificationsOpen(!notificationsOpen);
    };

    const handleNotificationClick = (notification) => {
        markAsRead(notification.id);
        // Nawigacja w zależności od typu powiadomienia
        if (notification.relatedEntityType === 'POST') {
            navigate(`/post/${notification.relatedEntityId}`);
        }
        setNotificationsOpen(false);
    };

    const handleLogout = () => {
        UserService.logout();
        setIsAuthenticated(false);
        setIsAdmin(false);
        setCurrentUserId(null);
        setNotificationsOpen(false);
        window.location.href = "/login";
    };

    const requestNotificationPermission = () => {
        if ('Notification' in window) {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    console.log('Notification permission granted');
                }
            });
        }
    };

    useEffect(() => {
        setIsAuthenticated(UserService.isAuthenticated());
        setIsAdmin(UserService.isAdmin());
        
        // Poproś o pozwolenie na powiadomienia przy pierwszym renderowaniu
        if (isAuthenticated) {
            requestNotificationPermission();
        }
    }, [isAuthenticated]);

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
                    <img src={logo} alt="JoinSounds Logo" />
                </Link>
                <div className={`menu-icon ${isOpen ? "toggle" : ""}`} onClick={toggleMenu}>
                    <div className="line line1"></div>
                    <div className="line line2"></div>
                    <div className="line line3"></div>
                </div>
                <ul className={isOpen ? "nav-menu active" : "nav-menu"}>
                    {isAuthenticated && (
                        <li className="nav-item notification-item">
                            <div className="notification-bell-container">
                                <button 
                                    className="notification-bell-btn"
                                    onClick={toggleNotifications}
                                >
                                    🔔
                                    {unreadCount > 0 && (
                                        <span className="notification-badge">{unreadCount}</span>
                                    )}
                                </button>
                                
                                {notificationsOpen && (
                                    <div className="notification-dropdown">
                                        <div className="notification-header">
                                            <h3>Powiadomienia</h3>
                                            {unreadCount > 0 && (
                                                <button 
                                                    className="mark-all-read-btn"
                                                    onClick={markAllAsRead}
                                                >
                                                    Oznacz wszystkie jako przeczytane
                                                </button>
                                            )}
                                        </div>
                                        
                                        <div className="notification-list">
                                            {notifications.length === 0 ? (
                                                <p className="no-notifications">Brak powiadomień</p>
                                            ) : (
                                                notifications.map(notification => (
                                                    <div 
                                                        key={notification.id} 
                                                        className={`notification-item ${notification.read ? '' : 'unread'}`}
                                                        onClick={() => handleNotificationClick(notification)}
                                                    >
                                                        <div className="notification-content">
                                                            <p className="notification-message">{notification.message}</p>
                                                            <small className="notification-time">
                                                                {new Date(notification.createdAt).toLocaleString()}
                                                            </small>
                                                        </div>
                                                        {!notification.read && (
                                                            <div className="unread-dot"></div>
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </li>
                    )}
                    
                    {!isAuthenticated && (
                        <li className="nav-item">
                            <Link to="/login" className="nav-links" onClick={closeMobileMenu}>
                                Login
                            </Link>
                        </li>
                    )}
                    {!isAuthenticated && (
                        <li className="nav-item">
                            <Link to="/register" className="nav-links" onClick={closeMobileMenu}>
                                Register
                            </Link>
                        </li>
                    )}
                    {isAdmin && (
                        <li className="nav-item">
                            <Link to="/admin/user-management" className="nav-links" onClick={closeMobileMenu}>
                                User Management
                            </Link>
                        </li>
                    )}
                    {isAuthenticated && currentUserId && (
                        <li className="nav-item">
                            <Link to={`/profile/${currentUserId}`} className="nav-links" onClick={closeMobileMenu}>
                                Profile
                            </Link>
                        </li>
                    )}
                    {isAuthenticated && (
                        <li className="nav-item">
                            <Link to="/" className="nav-links" onClick={() => { closeMobileMenu(); handleLogout(); }}>
                                Logout
                            </Link>
                        </li>
                    )}
                </ul>
            </div>
        </nav>
    );
}

export default Navbar;