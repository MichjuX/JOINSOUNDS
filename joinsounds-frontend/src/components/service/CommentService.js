import axios from 'axios';

class CommentService {
    // static BASE_URL = "http://localhost:8080"
    static BASE_URL = "http://172.24.188.59:8080"; // or your backend address

    static async createComment(commentData, token) {
        try {
            const response = await axios.post(
                `${this.BASE_URL}/authenticated/comment/create`,
                commentData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error("Error creating comment:", error);
            throw error;
        }
    }

    static async getCommentsByPostId(postId) {
        try {
            const response = await axios.get(
                `${this.BASE_URL}/public/comment/all/${postId}`,
                {
                    
                }
            );
            return response.data;
        } catch (error) {
            console.error("Error fetching comments:", error);
            throw error;
        }
    }

    static async deleteComment(commentId, token) {
        try {
            const response = await axios.delete(
                `${this.BASE_URL}/authenticated/comment/delete/${commentId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error("Error deleting comment:", error);
            throw error;
        }
    }
}

export default CommentService;