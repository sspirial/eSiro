import { mockUsers } from '../mock-data.js';

export class AuthService {
    static isLoggedIn() {
        return localStorage.getItem('user') !== null;
    }

    static getUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }

    static login(email, password) {
        // Find the user in the mock data
        const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
        
        if (user) {
            // In a real app, we would validate the password here
            // For demo purposes, we'll just log the user in
            localStorage.setItem('user', JSON.stringify(user));
            return { success: true, user };
        } else {
            return { success: false, message: 'Invalid email or password' };
        }
    }

    static register(userData) {
        // Check if email is already in use
        const existingUser = mockUsers.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
        
        if (existingUser) {
            return { success: false, message: 'Email is already in use' };
        }
        
        // In a real app, we would add the user to the database
        // For demo purposes, we'll just log the user in
        const newUser = {
            id: Date.now(),
            name: userData.name,
            email: userData.email,
            favoriteStores: [],
            recentOrders: [],
            role: 'buyer'
        };
        
        // Add to mock users (this won't persist after refresh, but it's fine for demo)
        mockUsers.push(newUser);
        
        // Log the user in
        localStorage.setItem('user', JSON.stringify(newUser));
        
        return { success: true, user: newUser };
    }

    static logout() {
        localStorage.removeItem('user');
    }

    static isVendor() {
        const user = this.getUser();
        return user && user.role === 'vendor';
    }

    static isBuyer() {
        const user = this.getUser();
        return user && user.role === 'buyer';
    }

    static updateUser(userData) {
        const currentUser = this.getUser();
        
        if (!currentUser) {
            return { success: false, message: 'User not logged in' };
        }
        
        // Update user data
        const updatedUser = { ...currentUser, ...userData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        return { success: true, user: updatedUser };
    }

    static addFavoriteStore(storeId) {
        const user = this.getUser();
        
        if (!user) {
            return { success: false, message: 'User not logged in' };
        }
        
        if (!user.favoriteStores.includes(storeId)) {
            user.favoriteStores.push(storeId);
            localStorage.setItem('user', JSON.stringify(user));
        }
        
        return { success: true, user };
    }

    static removeFavoriteStore(storeId) {
        const user = this.getUser();
        
        if (!user) {
            return { success: false, message: 'User not logged in' };
        }
        
        user.favoriteStores = user.favoriteStores.filter(id => id !== storeId);
        localStorage.setItem('user', JSON.stringify(user));
        
        return { success: true, user };
    }
}
