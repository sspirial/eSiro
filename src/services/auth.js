import { db } from '../db.js';

export const AuthService = {
    async login(email, password) {
        try {
            await db.open();
            const user = await db.users.get({ email, password });
            if (!user) {
                throw new Error('Invalid email or password');
            }

            // Check if the user has already selected a role
            if (!user.role) {
                user.role = 'buyer'; // Default role is buyer
                await db.users.update(user.id, { role: user.role });
            }

            // Store user session
            sessionStorage.setItem('user', JSON.stringify(user));

            return user;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    isLoggedIn() {
        return !!sessionStorage.getItem('user');
    },

    getUser() {
        const userJson = sessionStorage.getItem('user');
        if (!userJson) return null;
        
        try {
            return JSON.parse(userJson);
        } catch (error) {
            console.error('Error parsing user data:', error);
            return null;
        }
    },

    async logout() {
        sessionStorage.removeItem('user');
    },
    
    /**
     * Update current user in session storage
     * @param {Object} user - Updated user object 
     */
    updateCurrentUser(user) {
        if (!user) return;
        sessionStorage.setItem('user', JSON.stringify(user));
    },
    
    /**
     * Check if current user is a vendor
     * @returns {boolean} True if user is a vendor
     */
    isVendor() {
        const user = this.getUser();
        return user && user.role === 'vendor';
    },
    
    /**
     * Creates a new user account
     * @param {Object} userData - User data for new account
     * @returns {Promise<string>} New user ID
     */
    async register(userData) {
        try {
            await db.open();
            
            // Check if email already exists
            const existingUser = await db.users.where('email').equals(userData.email).first();
            if (existingUser) {
                throw new Error('Email already in use');
            }
            
            // Create new user with buyer role by default
            const userId = crypto.randomUUID();
            const user = {
                id: userId,
                ...userData,
                role: 'buyer',
                createdAt: new Date().toISOString()
            };
            
            await db.users.add(user);
            
            // Store user session
            sessionStorage.setItem('user', JSON.stringify(user));
            
            return userId;
        } catch (error) {
            console.error('Register error:', error);
            throw error;
        }
    },
    
    /**
     * Initialize a demo user if no user exists
     * @returns {Promise<Object>} Demo user object
     */
    async initDemoUser() {
        try {
            await db.open();
            
            // Check if any user exists
            const userCount = await db.users.count();
            
            if (userCount === 0) {
                // Create demo user
                const demoUser = {
                    id: crypto.randomUUID(),
                    name: 'Demo User',
                    email: 'demo@example.com',
                    password: 'password123',
                    role: 'buyer',
                    createdAt: new Date().toISOString()
                };
                
                await db.users.add(demoUser);
                
                // Store in session
                sessionStorage.setItem('user', JSON.stringify(demoUser));
                
                return demoUser;
            } else {
                // If user exists in DB but not in session, try to get first user
                if (!this.isLoggedIn()) {
                    const firstUser = await db.users.toCollection().first();
                    if (firstUser) {
                        sessionStorage.setItem('user', JSON.stringify(firstUser));
                        return firstUser;
                    }
                }
                
                return this.getUser();
            }
        } catch (error) {
            console.error('Init demo user error:', error);
            return null;
        }
    }
};
