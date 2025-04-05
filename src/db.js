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
db.version(2).stores({
    products: '@id, name, price, stock, vendorId, image, description, *categories, realmId, ownerId',
    stores: '@id, name, image, description, realmId, ownerId',
    cart: '@id, productId, quantity, userId, ownerId',
    orders: '@id, userId, total, status, date, realmId, ownerId',
    orderItems: '@id, orderId, productId, quantity, price, realmId, ownerId',
    users: '@id, email, name, role'
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
                                    }
                                }
                            }
                        },
                        
                        // Shop realm - where vendors control their products
                        shop: {
                            defaultRole: 'vendor',
                            roles: {
                                vendor: {
                                    products: 'crud',
                                    stores: 'crud',
                                    orders: 'r',
                                    orderItems: 'r',
                                    users: 'r'
                                }
                            },
                            // Public access for shop products
                            publicAccess: {
                                products: 'r',
                                stores: 'r'
                            }
                        }
                    }
                }
            });
        }
        
        await db.open();
    } catch (error) {
        console.error('Failed to initialize database:', error);
        throw error;
    }
}

/**
 * Create a shop realm for a vendor
 * @param {string} userId - The ID of the user
 * @param {string} shopName - Name for the shop
 * @returns {Promise<Object>} - Result with realmId and storeId
 */
export async function createVendorShop(userId, shopName) {
    try {
        const userRealms = await db.cloud.getRealmsForUser();
        const existingShopRealm = userRealms.find(realm => realm.type === 'shop');
        
        if (existingShopRealm) {
            console.log('User already has a shop realm:', existingShopRealm.name);
            return existingShopRealm;
        }
        
        const realmInfo = await db.cloud.createRealm({
            type: 'shop',
            name: shopName
        });
        
        // Create store for this vendor
        const storeId = crypto.randomUUID();
        await db.stores.add({
            id: storeId,
            name: shopName,
            image: "https://via.placeholder.com/150",
            description: `Welcome to ${shopName}`,
            ownerId: userId,
            realmId: realmInfo.name
        });
        
        // Update user role
        await db.users.update(userId, { role: 'vendor' });
        
        return { realmId: realmInfo.name, storeId };
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
