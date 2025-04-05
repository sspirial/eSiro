import { db } from '../db.js';
import { createVendorShop } from '../db.js';

/**
 * Authentication and user management service
 * Handles login, registration, and role management
 */
export class AuthService {
    /**
     * Check if a user is currently logged in
     * @returns {boolean} Login status
     */
    static isLoggedIn() {
        return localStorage.getItem('user') !== null;
    }

    /**
     * Get current user data from local storage
     * @returns {Object|null} User data or null if not logged in
     */
    static getUser() {
        const userData = localStorage.getItem('user');
        return userData ? JSON.parse(userData) : null;
    }
    
    /**
     * Log in a user with email and password
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<Object>} Login result with success status
     */
    static async login(email, password) {
        try {
            await db.cloud.signin({
                email,
                password
            });
            
            const user = await db.cloud.currentUser();
            
            if (user) {
                localStorage.setItem('user', JSON.stringify({
                    id: user.id,
                    email,
                    name: user.name || email.split('@')[0],
                    role: user.role || 'buyer'  // Default role is buyer
                }));
                
                return { success: true, user };
            }
            
            return { success: false, error: 'Authentication failed' };
        } catch (error) {
            console.error('Login error:', error);
            return { 
                success: false, 
                error: error.message || 'Authentication failed' 
            };
        }
    }
    
    /**
     * Log out the current user
     * @returns {Promise<Object>} Logout result
     */
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
    
    /**
     * Register a new user
     * @param {string} email - User email
     * @param {string} password - User password
     * @param {string} name - User's display name
     * @returns {Promise<Object>} Registration result
     */
    static async register(email, password, name) {
        try {
            const result = await db.cloud.register({
                email,
                password
            });
            
            if (result.id) {
                // Add user with buyer role by default
                await db.users.add({
                    id: result.id,
                    email,
                    name: name || email.split('@')[0],
                    role: 'buyer'
                });
                
                // Log the user in
                return await this.login(email, password);
            }
            
            return { success: false, error: 'Registration failed' };
        } catch (error) {
            console.error('Registration error:', error);
            return { 
                success: false, 
                error: error.message || 'Registration failed' 
            };
        }
    }
    
    /**
     * Convert a buyer to a vendor by creating a shop
     * @param {string} shopName - Name for the user's shop
     * @returns {Promise<Object>} Vendor conversion result
     */
    static async becomeVendor(shopName) {
        try {
            const user = this.getUser();
            if (!user) {
                throw new Error('User not logged in');
            }
            
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
    
    /**
     * Get realms associated with the current user
     * @returns {Promise<Array>} List of realms
     */
    static async getUserRealms() {
        try {
            if (!this.isLoggedIn()) {
                return [];
            }
            
            return await db.cloud.getRealmsForUser();
        } catch (error) {
            console.error('Get user realms error:', error);
            return [];
        }
    }
    
    /**
     * Check if current user is a vendor
     * @returns {boolean} Vendor status
     */
    static isVendor() {
        const user = this.getUser();
        return user && user.role === 'vendor';
    }
}
