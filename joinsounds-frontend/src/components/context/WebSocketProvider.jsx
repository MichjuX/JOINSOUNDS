import { createContext, useContext, useState, useEffect } from 'react';
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

    useEffect(() => {
        let clientInstance = null;

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

                clientInstance = new Client({
                    webSocketFactory: () => new SockJS('http://172.24.188.59:8080/ws'),
                    reconnectDelay: 5000,
                    connectHeaders: { 
                        Authorization: `Bearer ${token}` 
                    },
                    debug: (str) => console.log('STOMP Debug:', str),
                    onConnect: () => {
                        console.log('WebSocket connected successfully');
                        setIsConnected(true);
                    },
                    onDisconnect: () => {
                        console.log('WebSocket disconnected');
                        setIsConnected(false);
                    },
                    onStompError: (frame) => {
                        console.error('STOMP error:', frame);
                        setIsConnected(false);
                    },
                    onWebSocketError: (error) => {
                        console.error('WebSocket error:', error);
                        setIsConnected(false);
                    }
                });

                clientInstance.activate();
                setStompClient(clientInstance);

            } catch (error) {
                console.error('WebSocket connection error:', error);
            }
        };

        connectWebSocket();

        return () => {
            console.log('Cleaning up WebSocket connection');
            if (clientInstance) {
                try {
                    clientInstance.deactivate();
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