import Dexie from 'dexie';
import { dexieCloud } from 'dexie-cloud-addon';

// Create database instance with cloud support
const db = new Dexie('esiro', {
    addons: [dexieCloud]
});

// Define schema - using @ prefix for primary keys to enable cloud sync
db.version(1).stores({
    products: '@id, name, price, stock, vendorId, image, description, *categories, realmId, ownerId',
    stores: '@id, name, image, description, realmId, ownerId',
    cart: '@id, productId, quantity, userId, ownerId',
    orders: '@id, userId, total, status, date, realmId, ownerId',
    orderItems: '@id, orderId, productId, quantity, price, realmId, ownerId',
    users: '@id, email, name, role'
});

// Initialize database
async function initDB() {
    try {
        if (import.meta.env.VITE_DATABASE_URL) {
            // Configure cloud before opening database
            await db.cloud.configure({
                databaseUrl: import.meta.env.VITE_DATABASE_URL,
                // Enable sync for all tables (no unsyncedTables)
                accessControl: {
                    // Default access level for authenticated users
                    defaultAccess: 'authenticated',
                    
                    // Define realm types and access rules
                    realmTypes: {
                        // User's private realm - they are buyers by default
                        user: {
                            // Define default roles and permissions for user realms
                            defaultRole: 'buyer',
                            roles: {
                                buyer: {
                                    // Permissions for buyers
                                    cart: 'crud',      // Full access to their cart
                                    orders: 'crud',    // Full access to their orders
                                    orderItems: 'crud', // Full access to their order items
                                    products: 'r',     // Can only read products
                                    stores: 'r',       // Can only read stores
                                    users: {
                                        read: 'own',   // Can read own user data
                                        write: 'own'   // Can update own user data
                                    }
                                }
                            }
                        },
                        
                        // Shop realm - where vendors control their products
                        shop: {
                            // Define default roles and permissions for shop realms
                            defaultRole: 'vendor',
                            roles: {
                                vendor: {
                                    // Permissions for vendors in their shop realm
                                    products: 'crud',  // Full access to their products
                                    stores: 'crud',    // Full access to their store(s)
                                    orders: 'r',       // Can read orders related to their products
                                    orderItems: 'r',   // Can read order items related to their products
                                    users: 'r'         // Can read basic user info of customers
                                }
                            },
                            // Shop realms are public - their products are visible to all
                            publicAccess: {
                                products: 'r',
                                stores: 'r'
                            }
                        }
                    }
                }
            });
        }
        
        // Open database after configuration
        await db.open();
        
    } catch (error) {
        console.error('Failed to initialize database:', error);
        throw error;
    }
}

// Helper function to create a shop realm for a vendor
export async function createVendorShop(userId, shopName) {
    try {
        // First check if the user already has a shop realm
        const userRealms = await db.cloud.getRealmsForUser();
        const existingShopRealm = userRealms.find(realm => realm.type === 'shop');
        
        if (existingShopRealm) {
            console.log('User already has a shop realm:', existingShopRealm.name);
            return existingShopRealm;
        }
        
        // Create a new shop realm for the vendor
        const realmInfo = await db.cloud.createRealm({
            type: 'shop',
            name: shopName
        });
        
        console.log(`Created new shop realm: ${realmInfo.name} for user: ${userId}`);
        
        // Add a store for this vendor
        const storeId = crypto.randomUUID();
        await db.stores.add({
            id: storeId,
            name: shopName,
            image: "https://via.placeholder.com/150",
            description: `Welcome to ${shopName}`,
            ownerId: userId,
            realmId: realmInfo.name
        });
        
        // Update user role to include vendor status
        await db.users.update(userId, {
            role: 'vendor'
        });
        
        return { realmId: realmInfo.name, storeId };
    } catch (error) {
        console.error('Error creating vendor shop:', error);
        throw error;
    }
}

// Function to add product to vendor's shop
export async function addProductToShop(product) {
    try {
        // Get user's shop realm
        const userRealms = await db.cloud.getRealmsForUser();
        const shopRealm = userRealms.find(realm => realm.type === 'shop');
        
        if (!shopRealm) {
            throw new Error('User does not have a shop realm. Create one first.');
        }
        
        // Get store ID for this vendor
        const store = await db.stores
            .where('realmId')
            .equals(shopRealm.name)
            .first();
            
        if (!store) {
            throw new Error('Store not found for this vendor');
        }
        
        // Get current user ID
        const user = await db.cloud.currentUser();
        
        // Add product with proper realm and ownership
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
        throw error;
    }
}

// Export database instance and initialization functions
export { db, initDB };

// Export initialization function
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

// Seed data function
export async function seedData() {
    try {
        const productCount = await db.products.count();
        const storeCount = await db.stores.count();
        
        // For demo purposes only - in production these would be created when users register
        
        // Check if we need to seed demo data
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
        
        // Add sample users if needed
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
