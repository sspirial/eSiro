import { db } from '../db.js';

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

    static async addToCart(productId, userId = 'current-user') {
        try {
            const existingItem = await db.cart
                .where({ productId, userId })
                .first();

            if (existingItem) {
                await db.cart.update(existingItem.id, {
                    quantity: existingItem.quantity + 1
                });
            } else {
                await db.cart.add({
                    productId,
                    userId,
                    quantity: 1
                });
            }
            return true;
        } catch (error) {
            console.error('Error adding to cart:', error);
            return false;
        }
    }
}
