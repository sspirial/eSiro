import { db } from '../db.js';
import { createVendorShop } from '../db.js';

export class AuthService {
    static isLoggedIn() {
        return localStorage.getItem('user') !== null;
    }

    static getUser() {
        return JSON.parse(localStorage.getItem('user'));
    }
    
    static async login(email, password) {
        try {
            // For demo purposes - in a real app, you would authenticate against the server
            await db.cloud.signin({
                email: email,
                password: password
            });
            
            // Get the authenticated user
            const user = await db.cloud.currentUser();
            
            if (user) {
                // Store user info in localStorage
                localStorage.setItem('user', JSON.stringify({
                    id: user.id,
                    email: email,
                    name: user.name || email.split('@')[0],
                    role: user.role || 'buyer'  // Default role is buyer
                }));
                
                return { success: true, user };
            }
            
            return { success: false, error: 'Authentication failed' };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message || 'Authentication failed' };
        }
    }
    
    static async logout() {
        try {
            await db.cloud.signout();
            localStorage.removeItem('user');
            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            return { success: false, error: error.message };
        }
    }
    
    static async register(email, password, name) {
        try {
            // Create user in Dexie Cloud
            const result = await db.cloud.register({
                email: email,
                password: password
            });
            
            if (result.id) {
                // Add user to users table with buyer role by default
                await db.users.add({
                    id: result.id,
                    email: email,
                    name: name || email.split('@')[0],
                    role: 'buyer'
                });
                
                // Log the user in
                return await this.login(email, password);
            }
            
            return { success: false, error: 'Registration failed' };
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, error: error.message || 'Registration failed' };
        }
    }
    
    static async becomeVendor(shopName) {
        try {
            // Get current user
            const user = this.getUser();
            if (!user) {
                throw new Error('User not logged in');
            }
            
            // Create shop realm for this user
            const result = await createVendorShop(user.id, shopName);
            
            if (result) {
                // Update local user data
                user.role = 'vendor';
                localStorage.setItem('user', JSON.stringify(user));
                
                return { success: true, shopId: result.storeId };
            }
            
            return { success: false, error: 'Failed to create vendor shop' };
        } catch (error) {
            console.error('Become vendor error:', error);
            return { success: false, error: error.message };
        }
    }
    
    static async getUserRealms() {
        try {
            if (!this.isLoggedIn()) {
                return [];
            }
            
            // Get realms for current user
            const realms = await db.cloud.getRealmsForUser();
            return realms;
        } catch (error) {
            console.error('Get user realms error:', error);
            return [];
        }
    }
    
    static isVendor() {
        const user = this.getUser();
        return user && user.role === 'vendor';
    }
}
