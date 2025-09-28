import axios from 'axios';

class ReviewService {
    // static BASE_URL = "http://localhost:8080"
    static BASE_URL = "http://172.24.188.59:8080"

    static async createReview(reviewData, token) {
        try {
            const response = await axios.post(`${this.BASE_URL}/authenticated/review/create`, reviewData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error creating review:", error);
            throw error;
        }
    }

    static async getAllReviewsForUser(userId, page = 0, size = 20, sortBy = 'createdAt', sortDirection = 'desc', config = {}, token) {
        try {
            const response = await axios.get(`${this.BASE_URL}/public/all/review/about/${userId}`, {
                params: { 
                    page, 
                    size,
                    sort: `${sortBy},${sortDirection}`
                },
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                ...config
            });
            return response.data;
        } catch (error) {
            if (!axios.isCancel(error)) {
                console.error("Error getting reviews:", error);
                throw error;
            }
        }
    }

    static async updateReview(reviewId, reviewData, token) {
        try {
            const params = {};

            const response = await axios.put(
                `${this.BASE_URL}/authenticated/review/update/${reviewId}`, 
                reviewData, 
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    params: params
                }
            );
            return response.data;
        } catch (error) {
            console.error("Error updating review:", error);
            throw error;
        }
    }

    static async deleteReview(reviewId, token) {
        try {
            const response = await axios.delete(`${this.BASE_URL}/authenticated/review/delete/${reviewId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error deleting review:", error);
            throw error;
        }
    }
}

export default ReviewService;