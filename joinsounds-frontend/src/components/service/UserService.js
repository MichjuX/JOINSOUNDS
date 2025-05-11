import axios from 'axios';

class UserService {
    // static BASE_URL = "http://localhost:8080"
    static BASE_URL = "http://172.24.188.59:8080"

    static async login(email, password) {
        try {
            const response = await axios.post(`${this.BASE_URL}/auth/login`, { email, password });
            return response.data;
        } catch (error) {
            console.error("Error logging in:", error);
            throw error;
        }
    }

    static async register(userData, token = null) {
        try {
            const config = token ? {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            } : {
                headers: {
                    'Content-Type': 'application/json'
                }
            };
    
            const response = await axios.post(`${this.BASE_URL}/auth/register`, userData, config);
            return response.data;
        } catch (error) {
            console.error("Error registering user:", error);
            throw error;
        }
    }

    static async adminRegister(userData, token) {
        try{
            const response = await axios.post(`${UserService.BASE_URL}/admin/register`, userData, 
            {
                headers: {Authorization: `Bearer ${token}`}
            })
            return response.data;
        }catch(err){
            throw err;
        }
    }

    static async getAllUsers(token) {
        try {
            const response = await axios.get(`${this.BASE_URL}/admin/get-all-users`, {
                headers: {Authorization: `Bearer ${token}`}
            });
            return response.data;
        } catch (error) {
            console.error("Error registering user:", error);
            throw error;
        }
    }

    static async getYourProfile(token) {
        try {
            const response = await axios.get(`${this.BASE_URL}/authenticated/get-profile`, {
                headers: {Authorization: `Bearer ${token}`}
            });
            return response.data;
        } catch (error) {
            console.error("Error registering user:", error);
            throw error;
        }
    }

    static async getUserById(userId, token){
        try{
            const response = await axios.get(`${UserService.BASE_URL}/admin/get-users/${userId}`, 
            {
                headers: {Authorization: `Bearer ${token}`}
            })
            return response.data;
        }catch(err){
            throw err;
        }
    }

    static async deleteUser(userId, token) {
        try {
            const response = await axios.delete(`${this.BASE_URL}/admin/delete/${userId}`, {
                headers: {Authorization: `Bearer ${token}`}
            });
            return response.data;
        } catch (error) {
            console.error("Error registering user:", error);
            throw error;
        }
    }

    static async updateUser(userId, userData, token){
        try{
            const response = await axios.put(`${UserService.BASE_URL}/admin/update/${userId}`, userData,
            {
                headers: {Authorization: `Bearer ${token}`}
            })
            return response.data;
        }catch(err){
            throw err;
        }
    }
    static async getCurrentUserId(token){
        try{
            const response = await axios.get(`${UserService.BASE_URL}/public/getCurrentUserId`,
            {
                headers: {Authorization: `Bearer ${token}`}
            })
            console.log("Raw response:", response); // Debug całej odpowiedzi
            console.log("Response data:", response.data); // Debug danych
            return response.data;
        }catch(err){
            throw err;
        }
    }

    // AUTH CHECKER

    static logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
    }
   
    static isAuthenticated() {
        const token = localStorage.getItem("token");
        return !!token;
    }

    static isAdmin() {
        const role = localStorage.getItem("role");
        return role === "ADMIN";
    }

    static isModerator() {
        const role = localStorage.getItem("role");
        return role === "MODERATOR";
    }

    static isModeratorOrAdmin() {
        const role = localStorage.getItem("role");
        if (role === "ADMIN" || role === "MODERATOR") {
            return true;
        }
        else return false;
    }

    static isUser() {
        const role = localStorage.getItem("role");
        return role === "USER";
    }

    static adminOnly() {
        return this.isAuthenticated() && this.isAdmin();
    }


}

export default UserService;