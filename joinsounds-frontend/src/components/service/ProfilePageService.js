import axios from 'axios';

class ProfileService {
    // static BASE_URL = "http://localhost:8080";
    static BASE_URL = "http://172.24.188.59:8080";

    static async getUserProfile(userId) {
        try {
            const response = await axios.get(`${this.BASE_URL}/public/user/profile/${userId}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching user profile:", error);
            throw error;
        }
    }

    static async updateUserProfile(profileData, token) {
        try {
            const response = await axios.put(
                `${this.BASE_URL}/authenticated/user/profile/update`,
                profileData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error("Error updating profile:", error);
            throw error;
        }
    }

    static async uploadProfilePicture(file, token, onProgress) {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await axios.post(
                `${this.BASE_URL}/authenticated/user/profile/upload-picture`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    },
                    onUploadProgress: (progressEvent) => {
                        if (onProgress && progressEvent.total) {
                            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                            onProgress(progress);
                        }
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error("Error uploading profile picture:", error);
            throw error;
        }
    }

    static async removeProfilePicture(token) {
        try {
            const response = await axios.delete(
                `${this.BASE_URL}/authenticated/user/profile/remove-picture`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error("Error removing profile picture:", error);
            throw error;
        }
    }

    static getProfilePictureUrl(filename) {
        if (!filename) return null;
        return `${this.BASE_URL}/public/file/${encodeURIComponent(filename)}`;
    }
}

export default ProfileService;