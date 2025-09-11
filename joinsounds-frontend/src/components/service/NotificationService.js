import axios from 'axios';

class NotificationService {
    static BASE_URL = "http://172.24.188.59:8080";

    static async getUserNotifications(token) {
        try {
            const response = await axios.get(
                `${this.BASE_URL}/authenticated/notifications`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error("Error fetching user notifications:", error);
            throw error;
        }
    }

    static async getUnreadCount(token) {
        try {
            const response = await axios.get(
                `${this.BASE_URL}/authenticated/notifications/unread-count`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error("Error fetching notification count:", error);
            throw error;
        }
    }

    static async markAsRead(notificationId, token) {
        try {
            const response = await axios.post(
                `${this.BASE_URL}/authenticated/notifications/mark-as-read/${notificationId}`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error("Error marking notification as read:", error);
            throw error;
        }
    }

    static async markAllAsRead(token) {
        try {
            const response = await axios.post(
                `${this.BASE_URL}/authenticated/notifications/mark-all-as-read`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error("Error marking all notifications as read:", error);
            throw error;
        }
    }
}

export default NotificationService;