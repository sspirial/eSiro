import { db } from '../db.js';
import { AuthService } from './auth.js';

/**
 * Product management service
 * Handles CRUD operations for products
 */
export class ProductService {
    /**
     * Get all products
     * @param {Object} options - Filter options
     * @returns {Promise<Array>} List of products
     */
    static async getAllProducts(options = {}) {
        try {
            // Apply filters, sorting, etc.
            const query = {};
            
            if (options.category) {
                query.category = options.category;
            }
            
            if (options.minPrice || options.maxPrice) {
                query.price = {};
                if (options.minPrice) query.price.$gte = options.minPrice;
                if (options.maxPrice) query.price.$lte = options.maxPrice;
            }
            
            // Pagination
            const limit = options.limit || 50;
            const skip = options.page ? (options.page - 1) * limit : 0;
            
            return await db.products.find(query)
                .sort(options.sort || { createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .toArray();
        } catch (error) {
            console.error('Get all products error:', error);
            return [];
        }
    }
    
    /**
     * Get products for display in the UI
     * This is an alias for getAllProducts with default options
     * @returns {Promise<Array>} List of products
     */
    static async getProducts() {
        try {
            await db.open(); // Ensure database is open
            return await db.products.toArray();
        } catch (error) {
            console.error('Get products error:', error);
            return [];
        }
    }
    
    /**
     * Get a single product by ID
     * @param {string} productId - Product ID
     * @returns {Promise<Object|null>} Product object or null if not found
     */
    static async getProductById(productId) {
        try {
            return await db.products.findOne({ _id: productId });
        } catch (error) {
            console.error('Get product by ID error:', error);
            return null;
        }
    }
    
    /**
     * Add a new product (vendor only)
     * @param {Object} productData - Product data
     * @returns {Promise<string|null>} Product ID or null if failed
     */
    static async addProduct(productData) {
        try {
            const user = AuthService.getUser();
            
            if (!user || !AuthService.isVendor()) {
                throw new Error('Only vendors can add products');
            }
            
            // Add vendor information to the product
            const product = {
                ...productData,
                vendorId: user.id,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            const result = await db.products.insertOne(product);
            return result.insertedId;
        } catch (error) {
            console.error('Add product error:', error);
            return null;
        }
    }
    
    /**
     * Update a product (vendor only)
     * @param {string} productId - Product ID
     * @param {Object} updateData - Updated product data
     * @returns {Promise<boolean>} Success status
     */
    static async updateProduct(productId, updateData) {
        try {
            const user = AuthService.getUser();
            
            if (!user || !AuthService.isVendor()) {
                throw new Error('Only vendors can update products');
            }
            
            // Verify ownership
            const product = await this.getProductById(productId);
            if (!product || product.vendorId !== user.id) {
                throw new Error('Product not found or you don\'t have permission to update it');
            }
            
            // Update the product
            const result = await db.products.updateOne(
                { _id: productId },
                { 
                    $set: {
                        ...updateData,
                        updatedAt: new Date().toISOString()
                    }
                }
            );
            
            return result.modifiedCount > 0;
        } catch (error) {
            console.error('Update product error:', error);
            return false;
        }
    }
    
    /**
     * Delete a product (vendor only)
     * @param {string} productId - Product ID
     * @returns {Promise<boolean>} Success status
     */
    static async deleteProduct(productId) {
        try {
            const user = AuthService.getUser();
            
            if (!user || !AuthService.isVendor()) {
                throw new Error('Only vendors can delete products');
            }
            
            // Verify ownership
            const product = await this.getProductById(productId);
            if (!product || product.vendorId !== user.id) {
                throw new Error('Product not found or you don\'t have permission to delete it');
            }
            
            // Delete the product
            const result = await db.products.deleteOne({ _id: productId });
            
            return result.deletedCount > 0;
        } catch (error) {
            console.error('Delete product error:', error);
            return false;
        }
    }
    
    /**
     * Get products for the current vendor
     * @returns {Promise<Array>} List of vendor's products
     */
    static async getMyProducts() {
        try {
            const user = AuthService.getUser();
            
            if (!user || !AuthService.isVendor()) {
                throw new Error('Only vendors can access their products');
            }
            
            return await db.products.find({ vendorId: user.id })
                .sort({ createdAt: -1 })
                .toArray();
        } catch (error) {
            console.error('Get vendor products error:', error);
            return [];
        }
    }
}
