import Dexie from 'dexie';
import { dexieCloud } from 'dexie-cloud-addon';

/**
 * Database configuration with Dexie Cloud integration
 * Implements buyer/vendor role system with proper realm structure
 */
const db = new Dexie('esiro', {
    addons: [dexieCloud]
});

// Schema definition - @ prefix enables cloud sync
db.version(5).stores({
    // Application tables
    products: '@id, name, price, stock, vendorId, image, description, *categories, realmId, owner',
    stores: '@id, name, image, description, realmId, owner',
    cart: '@id, productId, quantity, userId, owner',
    orders: '@id, userId, total, status, date, realmId, owner',
    orderItems: '@id, orderId, productId, quantity, price, realmId, owner',
    users: '@id, email, name, role',

    // Access Control tables
    realms: '@realmId, type, name, owner, represents',
    members: '@id, [realmId+email], realmId, userId, email, name, invite, invited, accepted, rejected, roles, permissions',
    roles: '[realmId+name], realmId, name, permissions'
});

/**
 * Initialize the database with proper cloud configuration
 * Sets up realm types and access control
 */
async function initDB() {
    try {
        if (import.meta.env.VITE_DATABASE_URL) {
            await db.cloud.configure({
                databaseUrl: import.meta.env.VITE_DATABASE_URL,
                requireAuth: true, // Require authentication for database access
                accessControl: {
                    defaultAccess: 'authenticated',
                    
                    // Define realm types and access rules
                    realmTypes: {
                        // User's private realm - they are buyers by default
                        user: {
                            defaultRole: 'buyer',
                            roles: {
                                buyer: {
                                    cart: 'crud',
                                    orders: 'crud',
                                    orderItems: 'crud',
                                    products: 'r',
                                    stores: 'r',
                                    users: {
                                        read: 'own',
                                        write: 'own'
                                    },
                                    members: {
                                        read: 'own'
                                    }
                                }
                            }
                        },
                        
                        // Shop realm - where vendors control their products and staff
                        shop: {
                            defaultRole: 'vendor',
                            roles: {
                                vendor: {
                                    products: 'crud',
                                    stores: 'crud',
                                    orders: 'r',
                                    orderItems: 'r',
                                    users: 'r',
                                    members: 'crud',
                                    roles: 'crud'
                                },
                                staff: {
                                    products: 'crud',
                                    orders: 'r',
                                    orderItems: 'r'
                                }
                            },
                            publicAccess: {
                                products: 'r',
                                stores: 'r'
                            }
                        },
                        
                        // Admin realm - full system access
                        admin: {
                            defaultRole: 'admin',
                            roles: {
                                admin: {
                                    products: 'crud',
                                    stores: 'crud',
                                    orders: 'crud',
                                    orderItems: 'crud',
                                    users: 'crud',
                                    members: 'crud',
                                    roles: 'crud',
                                    realms: 'crud'
                                }
                            }
                        }
                    }
                }
            });
        }
        
        await db.open();
        
        // Initialize default roles if they don't exist
        const roles = await db.roles.count();
        if (roles === 0) {
            await db.roles.bulkAdd([
                { realmId: 'user', name: 'buyer', permissions: ['read:products', 'crud:cart', 'crud:orders'] },
                { realmId: 'shop', name: 'vendor', permissions: ['crud:products', 'crud:store', 'read:orders'] },
                { realmId: 'shop', name: 'staff', permissions: ['crud:products', 'read:orders'] },
                { realmId: 'admin', name: 'admin', permissions: ['crud:*'] }
            ]);
        }
    } catch (error) {
        console.error('Failed to initialize database:', error);
        throw error;
    }
}

/**
 * Create a shop realm for a vendor
 * @param {string} userId - User ID
 * @param {string} shopName - Name of the shop
 * @returns {Promise<Object>} Created store data
 */
export async function createVendorShop(userId, shopName) {
    try {
        // Create a new shop realm with vendor role
        const shopRealm = await db.cloud.sync.createRealm('shop', {
            name: shopName,
            roles: {
                [userId]: 'vendor'
            }
        });
        
        // Create the store record
        const storeId = crypto.randomUUID();
        await db.stores.add({
            id: storeId,
            name: shopName,
            image: 'https://via.placeholder.com/150',
            description: `Welcome to ${shopName}`,
            ownerId: userId,
            realmId: shopRealm.realmId
        });

        // Update user role and assign to shop realm
        await db.users.where('id').equals(userId).modify(user => {
            user.role = 'vendor';
            user.realmId = shopRealm.realmId;
        });
        
        return {
            success: true,
            storeId,
            realmId: shopRealm.realmId
        };
    } catch (error) {
        console.error('Error creating vendor shop:', error);
        throw error;
    }
}

/**
 * Add a product to a vendor's shop
 * @param {Object} product - Product data to add
 * @returns {Promise<string|null>} - Product ID if successful
 */
export async function addProductToShop(product) {
    try {
        const userRealms = await db.cloud.getRealmsForUser();
        const shopRealm = userRealms.find(realm => realm.type === 'shop');
        
        if (!shopRealm) {
            throw new Error('User does not have a shop realm. Create one first.');
        }
        
        const store = await db.stores
            .where('realmId')
            .equals(shopRealm.name)
            .first();
            
        if (!store) {
            throw new Error('Store not found for this vendor');
        }
        
        const user = await db.cloud.currentUser();
        
        const productId = crypto.randomUUID();
        await db.products.add({
            ...product,
            id: productId,
            vendorId: store.id,
            ownerId: user.id,
            realmId: shopRealm.name
        });
        
        return productId;
    } catch (error) {
        console.error('Error adding product to shop:', error);
        return null;
    }
}

// Export database instance and functions
export { db, initDB };

/**
 * Initialize database and seed with demo data
 * @returns {Promise<boolean>} - Success status
 */
export const initializeDatabase = async () => {
    try {
        await initDB();
        await seedData();
        return true;
    } catch (error) {
        console.error('Database initialization error:', error);
        return false;
    }
};

/**
 * Seed the database with demo data
 */
export async function seedData() {
    try {
        const productCount = await db.products.count();
        const storeCount = await db.stores.count();
        
        // Only seed if database is empty
        if (productCount === 0) {
            const demoShopRealm1 = 'shop/fashion-store';
            const demoShopRealm2 = 'shop/grocery-market';
            
            await db.products.bulkAdd([
                { 
                    id: crypto.randomUUID(),
                    name: "Product 1", 
                    price: 19.99, 
                    stock: 100, 
                    image: "https://via.placeholder.com/150", 
                    description: "Description for Product 1",
                    vendorId: '1',
                    ownerId: 'vendor1',
                    realmId: demoShopRealm1,
                    categories: ['fashion', 'apparel']
                },
                { 
                    id: crypto.randomUUID(),
                    name: "Product 2", 
                    price: 24.99, 
                    stock: 50, 
                    image: "https://via.placeholder.com/150", 
                    description: "Description for Product 2",
                    vendorId: '1',
                    ownerId: 'vendor1',
                    realmId: demoShopRealm1,
                    categories: ['fashion', 'accessories']
                },
                { 
                    id: crypto.randomUUID(),
                    name: "Product 3", 
                    price: 15.99, 
                    stock: 75, 
                    image: "https://via.placeholder.com/150", 
                    description: "Description for Product 3",
                    vendorId: '2',
                    ownerId: 'vendor2',
                    realmId: demoShopRealm2,
                    categories: ['grocery', 'food']
                }
            ]);
        }
        
        if (storeCount === 0) {
            const demoShopRealm1 = 'shop/fashion-store';
            const demoShopRealm2 = 'shop/grocery-market';
            const demoShopRealm3 = 'shop/electronics';
            
            await db.stores.bulkAdd([
                { 
                    id: '1',
                    name: "Fashion Store", 
                    image: "https://via.placeholder.com/150", 
                    description: "Your one-stop fashion destination",
                    ownerId: 'vendor1',
                    realmId: demoShopRealm1
                },
                { 
                    id: '2',
                    name: "Grocery Market", 
                    image: "https://via.placeholder.com/150", 
                    description: "Fresh produce and essentials",
                    ownerId: 'vendor2', 
                    realmId: demoShopRealm2
                },
                { 
                    id: '3',
                    name: "Electronics Shop", 
                    image: "https://via.placeholder.com/150", 
                    description: "Latest gadgets and technology",
                    ownerId: 'vendor3',
                    realmId: demoShopRealm3
                }
            ]);
        }
        
        // Add sample users
        const userCount = await db.users.count();
        if (userCount === 0) {
            await db.users.bulkAdd([
                {
                    id: 'buyer1',
                    email: 'buyer@example.com',
                    name: 'Demo Buyer',
                    role: 'buyer'
                },
                {
                    id: 'vendor1',
                    email: 'fashion@example.com',
                    name: 'Fashion Vendor',
                    role: 'vendor'
                },
                {
                    id: 'vendor2',
                    email: 'grocery@example.com',
                    name: 'Grocery Vendor',
                    role: 'vendor'
                }
            ]);
        }
    } catch (error) {
        console.error('Error seeding data:', error);
        throw error;
    }
}

/**
 * Invite a user to join a realm with specific roles
 * @param {string} realmId - The realm to invite to
 * @param {string} email - Email of the user to invite
 * @param {string[]} roles - Roles to assign
 * @returns {Promise<boolean>} Success status
 */
export async function inviteUserToRealm(realmId, email, roles) {
    try {
        const realm = await db.realms.get(realmId);
        if (!realm) throw new Error('Realm not found');

        const inviteId = crypto.randomUUID();
        await db.members.add({
            id: inviteId,
            realmId,
            email,
            roles,
            invite: true,
            invited: new Date().toISOString(),
            accepted: null,
            rejected: null
        });

        return true;
    } catch (error) {
        console.error('Error inviting user:', error);
        return false;
    }
}

/**
 * Accept a realm invitation
 * @param {string} inviteId - The invitation ID
 * @returns {Promise<boolean>} Success status
 */
export async function acceptRealmInvite(inviteId) {
    try {
        const invite = await db.members.get(inviteId);
        if (!invite) throw new Error('Invitation not found');

        await db.members.update(inviteId, {
            accepted: new Date().toISOString(),
            rejected: null
        });

        return true;
    } catch (error) {
        console.error('Error accepting invitation:', error);
        return false;
    }
}

/**
 * Update member roles in a realm
 * @param {string} realmId - The realm ID
 * @param {string} userId - The user ID
 * @param {string[]} roles - New roles to assign
 * @returns {Promise<boolean>} Success status
 */
export async function updateMemberRoles(realmId, userId, roles) {
    try {
        const member = await db.members
            .where('[realmId+userId]')
            .equals([realmId, userId])
            .first();

        if (!member) throw new Error('Member not found in realm');

        await db.members.update(member.id, { roles });
        return true;
    } catch (error) {
        console.error('Error updating member roles:', error);
        return false;
    }
}
