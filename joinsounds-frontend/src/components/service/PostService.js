import axios from 'axios';

class PostService {
    // static BASE_URL = "http://localhost:8080"
    static BASE_URL = "http://172.24.188.59:8080"

    static async createPost(postData, token) {
        try {
            const response = await axios.post(`${this.BASE_URL}/authenticated/post/create`, postData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error creating post:", error);
            throw error;
        }
    }

    static async uploadFile(file, token) {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await axios.post(`${this.BASE_URL}/authenticated/file/upload`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data; // Zmiana: backend zwraca string, nie obiekt z filePath
        } catch (error) {
            console.error("Error uploading file:", error);
            throw error;
        }
    }

    static async getAllPosts(token) {
        try {
            const response = await axios.get(`${this.BASE_URL}/posts/all`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error getting posts:", error);
            throw error;
        }
    }

    static async getPostById(postId, token) {
        try {
            const response = await axios.get(`${this.BASE_URL}/posts/${postId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error getting post:", error);
            throw error;
        }
    }

    static async getUserPosts(userId, token) {
        try {
            const response = await axios.get(`${this.BASE_URL}/posts/user/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error getting user posts:", error);
            throw error;
        }
    }

    static async updatePost(postId, postData, token) {
        try {
            const response = await axios.put(`${this.BASE_URL}/posts/update/${postId}`, postData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error updating post:", error);
            throw error;
        }
    }

    static async deletePost(postId, token) {
        try {
            const response = await axios.delete(`${this.BASE_URL}/posts/delete/${postId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error deleting post:", error);
            throw error;
        }
    }

    // COMMENT METHODS
    static async addComment(postId, commentData, token) {
        try {
            const response = await axios.post(`${this.BASE_URL}/posts/${postId}/comments`, commentData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error adding comment:", error);
            throw error;
        }
    }

    static async getPostComments(postId, token) {
        try {
            const response = await axios.get(`${this.BASE_URL}/posts/${postId}/comments`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error getting comments:", error);
            throw error;
        }
    }

    static async deleteComment(commentId, token) {
        try {
            const response = await axios.delete(`${this.BASE_URL}/posts/comments/${commentId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error deleting comment:", error);
            throw error;
        }
    }
}

export default PostService;