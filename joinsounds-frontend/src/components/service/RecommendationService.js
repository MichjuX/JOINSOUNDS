import axios from 'axios';

class RecommendationService {
    static BASE_URL = "http://172.24.188.59:8080"
    static async getRecommendedPosts(page = 0, size = 20, sortBy = 'createdAt', sortDirection = 'desc', config = {}, token) {
            try {
                const response = await axios.get(`${this.BASE_URL}/authenticated/recommendations`, {
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
                    console.error("Error getting posts:", error);
                    throw error;
                }
            }   
        }
    }

export default RecommendationService;
