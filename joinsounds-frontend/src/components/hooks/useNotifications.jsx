import { useState, useEffect, useCallback, useContext, useRef } from 'react';
import NotificationService from '../service/NotificationService';
import UserService from '../service/UserService';
import { WebSocketContext } from '../context/WebSocketProvider';

export const useNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [userId, setUserId] = useState(null);
    
    const { stompClient, isConnected } = useContext(WebSocketContext);
    const subscriptionRef = useRef(null);
    const userIdRef = useRef(userId);

    // Keep ref in sync with state
    useEffect(() => {
        userIdRef.current = userId;
    }, [userId]);

    const fetchUserId = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return null;
            
            const userId = await UserService.getCurrentUserId(token);
            setUserId(userId);
            return userId;
        } catch (error) {
            console.error('Error fetching user ID:', error);
            return null;
        }
    }, []);

    const fetchNotifications = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const notificationsData = await NotificationService.getUserNotifications(token);
            
            const uniqueNotifications = Array.from(
                new Map(notificationsData.map(item => [item.id, item])).values()
            );
            
            setNotifications(uniqueNotifications);
            
            const count = await NotificationService.getUnreadCount(token);
            setUnreadCount(count);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    }, []);

    const markAsRead = async (notificationId) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            await NotificationService.markAsRead(notificationId, token);
            setNotifications(prev => 
                prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const unreadNotifications = notifications.filter(n => !n.read);
            for (const notification of unreadNotifications) {
                await NotificationService.markAsRead(notification.id, token);
            }
            
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    useEffect(() => {
        if (UserService.isAuthenticated()) {
            fetchNotifications();
            fetchUserId();
        }
    }, [fetchNotifications, fetchUserId]);

    useEffect(() => {
        // Cleanup function for subscription
        return () => {
            if (subscriptionRef.current) {
                try {
                    subscriptionRef.current.unsubscribe();
                    console.log('Cleaned up notification subscription');
                } catch (error) {
                    console.error('Error cleaning up subscription:', error);
                }
            }
        };
    }, []);

    useEffect(() => {
        // Setup WebSocket subscription when everything is ready
        const setupSubscription = () => {
            if (!stompClient || !isConnected || !userId) {
                console.log('WebSocket not ready for subscription:', { 
                    hasStompClient: !!stompClient, 
                    isConnected, 
                    hasUserId: !!userId 
                });
                return;
            }

            console.log('Setting up notification subscription for user:', userId);

            try {
                // Clean up existing subscription first
                if (subscriptionRef.current) {
                    try {
                        subscriptionRef.current.unsubscribe();
                        console.log('Unsubscribed from previous notifications');
                    } catch (error) {
                        console.error('Error unsubscribing from previous:', error);
                    }
                }

                const subscription = stompClient.subscribe(
                    `/topic/notifications.${userId}`, 
                    (message) => {
                        try {
                            console.log('Received notification:', message.body);
                            const notification = JSON.parse(message.body);
                            
                            setNotifications(prev => {
                                const alreadyExists = prev.some(n => n.id === notification.id);
                                if (alreadyExists) {
                                    console.warn('Duplicate notification detected:', notification.id);
                                    return prev;
                                }
                                console.log('Adding new notification:', notification.id);
                                return [notification, ...prev];
                            });
                            
                            setUnreadCount(prev => prev + 1);
                            
                            if ('Notification' in window && Notification.permission === 'granted') {
                                new Notification('Nowe powiadomienie', {
                                    body: notification.message,
                                    icon: '/logo.png'
                                });
                            }
                        } catch (error) {
                            console.error('Error processing notification:', error);
                        }
                    }
                );

                subscriptionRef.current = subscription;
                console.log('Successfully subscribed to notifications');

            } catch (error) {
                console.error('Error setting up subscription:', error);
            }
        };

        setupSubscription();

    }, [stompClient, isConnected, userId]); // Only depend on these values

    return { 
        notifications, 
        unreadCount, 
        markAsRead, 
        markAllAsRead, 
        fetchNotifications,
        userId
    };
};