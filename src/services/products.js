import { db } from '../db.js';
import { AuthService } from './auth.js';

export class ProductService {
    static async getProducts() {
        try {
            await db.open(); // Ensure database is open
            return await db.products.toArray();
        } catch (error) {
            console.error('Error fetching products:', error);
            return [];
        }
    }

    static async getProductById(id) {
        try {
            await db.open();
            const product = await db.products.get(id);
            
            if (product && product.vendorId) {
                // Load store data and attach it to the product
                const store = await db.stores.get(product.vendorId);
                if (store) {
                    product.storeData = store;
                }
            }
            
            return product;
        } catch (error) {
            console.error('Error fetching product by ID:', error);
            return null;
        }
    }

    static async getProductsByStore(storeId) {
        try {
            await db.open();
            return await db.products
                .where('vendorId')
                .equals(storeId)
                .toArray();
        } catch (error) {
            console.error('Error fetching products by store:', error);
            return [];
        }
    }

    static async addToCart(productId, userId = null) {
        try {
            // Get current user ID if not provided
            if (!userId) {
                const user = AuthService.getUser();
                if (!user) {
                    throw new Error('User not logged in');
                }
                userId = user.id;
            }
            
            const product = await this.getProductById(productId);
            if (!product) {
                throw new Error('Product not found');
            }
            
            const existingItem = await db.cart
                .where({ productId, userId })
                .first();

            if (existingItem) {
                await db.cart.update(existingItem.id, {
                    quantity: existingItem.quantity + 1
                });
            } else {
                // Add cart item with current user as owner
                await db.cart.add({
                    id: crypto.randomUUID(),
                    productId,
                    userId,
                    quantity: 1,
                    ownerId: userId
                });
            }
            return true;
        } catch (error) {
            console.error('Error adding to cart:', error);
            return false;
        }
    }

    static async updateProduct(productData) {
        try {
            await db.open();
            if (!productData.id) {
                throw new Error('Product ID required for update');
            }
            
            // Check if user is the vendor who owns this product
            const user = AuthService.getUser();
            if (!user || !AuthService.isVendor()) {
                throw new Error('Permission denied: only vendors can update products');
            }
            
            const product = await db.products.get(productData.id);
            if (!product) {
                throw new Error('Product not found');
            }
            
            // Check if this product belongs to the user's realm
            const userRealms = await AuthService.getUserRealms();
            const shopRealm = userRealms.find(realm => realm.type === 'shop');
            
            if (!shopRealm || product.realmId !== shopRealm.name) {
                throw new Error('Permission denied: you can only update products in your shop');
            }
            
            // Update the product
            await db.products.update(productData.id, {
                ...productData,
                // Keep ownership and realm data
                ownerId: product.ownerId,
                realmId: product.realmId
            });
            
            return true;
        } catch (error) {
            console.error('Error updating product:', error);
            return false;
        }
    }

    static async addProduct(productData) {
        try {
            // Check if user is a vendor
            const user = AuthService.getUser();
            if (!user || !AuthService.isVendor()) {
                throw new Error('Permission denied: only vendors can add products');
            }
            
            // Get user's shop realm
            const userRealms = await AuthService.getUserRealms();
            const shopRealm = userRealms.find(realm => realm.type === 'shop');
            
            if (!shopRealm) {
                throw new Error('Vendor shop not found. Please create a shop first.');
            }
            
            // Get store for this vendor
            const store = await db.stores
                .where('realmId')
                .equals(shopRealm.name)
                .first();
                
            if (!store) {
                throw new Error('Store not found for this vendor');
            }
            
            // Add product with proper realm and ownership details
            const productId = crypto.randomUUID();
            await db.products.add({
                ...productData,
                id: productId,
                vendorId: store.id,
                ownerId: user.id,
                realmId: shopRealm.name
            });
            
            // Update product count for the store
            await this.updateStoreProductCount(store.id);
            
            return productId;
        } catch (error) {
            console.error('Error adding product:', error);
            return null;
        }
    }

    static async deleteProduct(productId) {
        try {
            // Check if user is a vendor
            const user = AuthService.getUser();
            if (!user || !AuthService.isVendor()) {
                throw new Error('Permission denied: only vendors can delete products');
            }
            
            // Get the product
            const product = await db.products.get(productId);
            if (!product) {
                throw new Error('Product not found');
            }
            
            // Verify ownership
            const userRealms = await AuthService.getUserRealms();
            const shopRealm = userRealms.find(realm => realm.type === 'shop');
            
            if (!shopRealm || product.realmId !== shopRealm.name) {
                throw new Error('Permission denied: you can only delete products in your shop');
            }
            
            // Capture vendorId before deletion
            const vendorId = product.vendorId;
            
            // Delete the product
            await db.products.delete(productId);
            
            // Update store product count
            if (vendorId) {
                await this.updateStoreProductCount(vendorId);
            }
            
            return true;
        } catch (error) {
            console.error('Error deleting product:', error);
            return false;
        }
    }

    static async updateStoreProductCount(storeId) {
        try {
            const productCount = await db.products
                .where('vendorId')
                .equals(storeId)
                .count();
            
            // Update store.productCount field if it exists
            const store = await db.stores.get(storeId);
            if (store) {
                await db.stores.update(storeId, { 
                    ...store,
                    productCount
                });
            }
            
            // Update all visible store components with this ID
            const storeElements = document.querySelectorAll(`esiro-store[store-id="${storeId}"]`);
            storeElements.forEach(storeElement => {
                storeElement.setAttribute('product-count', productCount.toString());
                
                // If the store is in expanded mode, refresh its products
                if (storeElement.classList.contains('expanded')) {
                    this.getProductsByStore(storeId).then(products => {
                        if (typeof storeElement.storeProducts !== 'undefined') {
                            storeElement.storeProducts = products;
                        }
                        if (typeof storeElement.renderStoreProducts === 'function') {
                            storeElement.renderStoreProducts(products);
                        }
                    });
                }
            });
            
        } catch (error) {
            console.error('Error updating store product count:', error);
        }
    }
    
    // Get products from the current vendor's shop
    static async getMyProducts() {
        try {
            // Check if user is a vendor
            const user = AuthService.getUser();
            if (!user || !AuthService.isVendor()) {
                return [];
            }
            
            // Get user's shop realm
            const userRealms = await AuthService.getUserRealms();
            const shopRealm = userRealms.find(realm => realm.type === 'shop');
            
            if (!shopRealm) {
                return [];
            }
            
            // Get products in this realm
            return await db.products
                .where('realmId')
                .equals(shopRealm.name)
                .toArray();
        } catch (error) {
            console.error('Error fetching vendor products:', error);
            return [];
        }
    }
}
