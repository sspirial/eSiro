import Dexie from 'dexie';
import { dexieCloud } from 'dexie-cloud-addon';

// Create database instance with cloud support
const db = new Dexie('esiro', {
    addons: [dexieCloud]
});

// Define schema - remove autoincrement (++) and use explicit id
db.version(1).stores({
    products: 'id, name, price, stock, vendorId, image, description',
    stores: 'id, name, image, description',
    cart: 'id, productId, quantity, userId',
    orders: 'id, userId, total, status, date',
    orderItems: 'id, orderId, productId, quantity, price'
});

// Initialize database
async function initDB() {
    try {
        if (import.meta.env.VITE_DATABASE_URL) {
            // Configure cloud before opening database
            await db.cloud.configure({
                databaseUrl: import.meta.env.VITE_DATABASE_URL,
                // Blacklist autoIncremented tables from sync
                unsyncedTables: [
                    'products',
                    'stores',
                    'cart',
                    'orders',
                    'orderItems'
                ],
                accessControl: {
                    defaultAccess: 'authenticated',
                    realms: {
                        'user/*': {
                            role: 'buyer',
                            rules: {
                                products: 'none'
                            }
                        },
                        'shop/*': {
                            role: 'vendor',
                            rules: {
                                products: {
                                    read: 'public',
                                    write: 'owner'
                                }
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
        
        if (productCount === 0) {
            await db.products.bulkAdd([
                { 
                    id: '1',
                    name: "Product 1", 
                    price: 19.99, 
                    stock: 100, 
                    image: "https://via.placeholder.com/150", 
                    description: "Description for Product 1",
                    vendorId: '1'
                },
                { 
                    id: '2',
                    name: "Product 2", 
                    price: 24.99, 
                    stock: 50, 
                    image: "https://via.placeholder.com/150", 
                    description: "Description for Product 2",
                    vendorId: '1'
                },
                { 
                    id: '3',
                    name: "Product 3", 
                    price: 15.99, 
                    stock: 75, 
                    image: "https://via.placeholder.com/150", 
                    description: "Description for Product 3",
                    vendorId: '2'
                }
            ]);
        }
        
        if (storeCount === 0) {
            await db.stores.bulkAdd([
                { 
                    id: '1',
                    name: "Fashion Store", 
                    image: "https://via.placeholder.com/150", 
                    description: "Your one-stop fashion destination" 
                },
                { 
                    id: '2',
                    name: "Grocery Market", 
                    image: "https://via.placeholder.com/150", 
                    description: "Fresh produce and essentials" 
                },
                { 
                    id: '3',
                    name: "Electronics Shop", 
                    image: "https://via.placeholder.com/150", 
                    description: "Latest gadgets and technology" 
                }
            ]);
        }
    } catch (error) {
        console.error('Error seeding data:', error);
        throw error;
    }
}
