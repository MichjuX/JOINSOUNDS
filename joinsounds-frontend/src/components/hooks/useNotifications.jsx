import { useState, useEffect, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import NotificationService from '../service/NotificationService';
import UserService from '../service/UserService';

export const useNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [stompClient, setStompClient] = useState(null);
    const [userId, setUserId] = useState(null);

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
            setNotifications(notificationsData);
            
            const count = await NotificationService.getUnreadCount(token);
            setUnreadCount(count);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    }, []);

    const setupWebSocket = useCallback(async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        // Pobierz userId przed utworzeniem WebSocket
        const currentUserId = await fetchUserId();
        if (!currentUserId) return;

        const client = new Client({
            webSocketFactory: () => new SockJS('http://172.24.188.59:8080/ws'),
            reconnectDelay: 5000,
            connectHeaders: {
                Authorization: `Bearer ${token}`
            },
            debug: (str) => {
                console.log('STOMP Debug:', str);
            },
            onConnect: () => {
                console.log('WebSocket connected for user:', currentUserId);
                
                // Subskrybuj na temat powiadomień dla tego użytkownika
                client.subscribe(`/topic/notifications.${currentUserId}`, (message) => {
                    console.log('Received notification:', message.body);
                    const notification = JSON.parse(message.body);
                    setNotifications(prev => [notification, ...prev]);
                    setUnreadCount(prev => prev + 1);
                    
                    // Pokazanie powiadomienia w przeglądarce
                    if ('Notification' in window && Notification.permission === 'granted') {
                        new Notification('Nowe powiadomienie', {
                            body: notification.message,
                            icon: '/logo.png'
                        });
                    }
                });

                // Dodatkowo subskrybuj na ogólny temat dla debugowania
                client.subscribe(`/topic/notifications`, (message) => {
                    console.log('Received general notification:', message.body);
                });
            },
            onDisconnect: () => {
                console.log('WebSocket disconnected');
            },
            onStompError: (frame) => {
                console.error('WebSocket error:', frame);
            },
            onWebSocketError: (error) => {
                console.error('WebSocket connection error:', error);
            }
        });
        
        client.activate();
        setStompClient(client);

        return client;
    }, [fetchUserId]);

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

            // Oznacz wszystkie nieprzeczytane powiadomienia
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
        let client = null;

        const initialize = async () => {
            if (UserService.isAuthenticated()) {
                await fetchNotifications();
                client = await setupWebSocket();
            }
        };

        initialize();

        return () => {
            if (stompClient) {
                stompClient.deactivate();
            }
            if (client) {
                client.deactivate();
            }
        };
    }, [fetchNotifications, setupWebSocket]);

    return { 
        notifications, 
        unreadCount, 
        markAsRead, 
        markAllAsRead, 
        fetchNotifications,
        userId 
    };
};