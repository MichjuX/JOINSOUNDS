import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import UserService from '../service/UserService';

export const WebSocketContext = createContext();

export const useWebSocket = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocket must be used within a WebSocketProvider');
    }
    return context;
};

export const WebSocketProvider = ({ children }) => {
    const [stompClient, setStompClient] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const clientRef = useRef(null);
    const reconnectAttemptRef = useRef(0);

    useEffect(() => {
        let isMounted = true;

        const connectWebSocket = async () => {
            if (!UserService.isAuthenticated()) {
                console.log('User not authenticated, skipping WebSocket connection');
                return;
            }

            const token = localStorage.getItem("token");
            if (!token) {
                console.log('No token found, skipping WebSocket connection');
                return;
            }

            try {
                const userId = await UserService.getCurrentUserId(token);
                if (!userId) {
                    console.log('No user ID found, skipping WebSocket connection');
                    return;
                }

                console.log('Creating WebSocket connection for user:', userId);

                // Clean up existing connection first
                if (clientRef.current) {
                    try {
                        clientRef.current.deactivate();
                    } catch (error) {
                        console.error('Error deactivating previous connection:', error);
                    }
                }

                const clientInstance = new Client({
                    webSocketFactory: () => new SockJS('http://172.24.188.59:8080/ws'),
                    reconnectDelay: 5000,
                    connectHeaders: { 
                        Authorization: `Bearer ${token}` 
                    },
                    // debug: (str) => console.log('STOMP Debug:', str),
                    onConnect: () => {
                        if (!isMounted) return;
                        console.log('WebSocket connected successfully');
                        setIsConnected(true);
                        reconnectAttemptRef.current = 0;
                    },
                    onDisconnect: () => {
                        if (!isMounted) return;
                        console.log('WebSocket disconnected');
                        setIsConnected(false);
                    },
                    onStompError: (frame) => {
                        if (!isMounted) return;
                        console.error('STOMP error:', frame);
                        setIsConnected(false);
                    },
                    onWebSocketError: (error) => {
                        if (!isMounted) return;
                        console.error('WebSocket error:', error);
                        setIsConnected(false);
                    }
                });

                clientRef.current = clientInstance;
                setStompClient(clientInstance);
                clientInstance.activate();

            } catch (error) {
                console.error('WebSocket connection error:', error);
            }
        };

        // Check authentication status periodically
        const checkAuthAndConnect = () => {
            if (UserService.isAuthenticated()) {
                connectWebSocket();
            } else {
                // Clean up if not authenticated
                if (clientRef.current) {
                    clientRef.current.deactivate();
                    setStompClient(null);
                    setIsConnected(false);
                }
            }
        };

        // Initial connection
        checkAuthAndConnect();

        // Set up interval to check authentication status
        const authCheckInterval = setInterval(checkAuthAndConnect, 30000); // Check every 30 seconds

        return () => {
            isMounted = false;
            clearInterval(authCheckInterval);
            
            console.log('Cleaning up WebSocket connection');
            if (clientRef.current) {
                try {
                    clientRef.current.deactivate();
                } catch (error) {
                    console.error('Error deactivating WebSocket:', error);
                }
            }
            setStompClient(null);
            setIsConnected(false);
        };
    }, []);

    const value = {
        stompClient,
        isConnected
    };

    return (
        <WebSocketContext.Provider value={value}>
            {children}
        </WebSocketContext.Provider>
    );
};