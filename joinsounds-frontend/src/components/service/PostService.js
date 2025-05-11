import axios from 'axios';

class PostService {
    // static BASE_URL = "http://localhost:8080"
    static BASE_URL = "http://172.24.188.59:8080"

    static getAuthorizedFileUrl(filename) {
        if (!filename) return '';
        return `${this.BASE_URL}/public/file/${encodeURIComponent(filename)}`;
        // Token NIE jest już w URL!
    }

    static async getFile(filename, token) {
        try {
            const response = await axios.get(this.getAuthorizedFileUrl(filename), {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'ResponseType': 'blob' // Ważne dla plików binarnych
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching file:", error);
            throw error;
        }
    }

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

    static async uploadFile(file, token, onProgress) {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await axios.post(
                `${this.BASE_URL}/authenticated/file/upload`, 
                formData, 
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    },
                    onUploadProgress: (progressEvent) => {
                        if (onProgress) {
                            // Dodajemy zabezpieczenie przed brakującymi wartościami
                            const progress = progressEvent.total 
                                ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
                                : 0;
                            onProgress(progress);
                        }
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error("Error uploading file:", error);
            throw error;
        }
    }

    static async getAllPosts(page = 0, size = 20, sortBy = 'createdAt', sortDirection = 'desc', config = {}) {
        try {
            const response = await axios.get(`${this.BASE_URL}/public/post/all`, {
                params: { 
                    page, 
                    size,
                    sort: `${sortBy},${sortDirection}`
                },
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

    static async getPostById(postId, token) {
        try {
            const response = await axios.get(`${this.BASE_URL}/public/post/${postId}`);
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
            const response = await axios.delete(`${this.BASE_URL}/authenticated/post/delete/${postId}`, {
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