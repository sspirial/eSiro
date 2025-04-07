import { AuthService } from '../services/auth.js';
import { ProductService } from '../services/products.js';
import { RouterService } from '../services/router.js';
import { db } from '../db.js';

export default class EsiroAccount extends HTMLElement {
    connectedCallback() {
        try {
            const user = AuthService.getUser();
            if (!user) {
                this.renderError('User not logged in. Please log in to access your account.');
                return;
            }

            this.innerHTML = `
                <div class="account-page">
                    <h1>My Account</h1>
                    ${user ? this.renderUserAccount(user) : this.renderLogin()}
                    <style>
                        .account-page {
                            padding: 20px;
                            max-width: 800px;
                            margin: 0 auto;
                        }
                        .error-message {
                            color: red;
                            font-weight: bold;
                        }
                        .success-message {
                            color: green;
                            font-weight: bold;
                        }
                        .account-details {
                            margin-bottom: 30px;
                            padding: 20px;
                            background-color: var(--background);
                            border-radius: var(--border-radius);
                            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                        }
                        .vendor-section {
                            margin-top: 30px;
                            padding: 20px;
                            background-color: var(--background);
                            border-radius: var(--border-radius);
                            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                        }
                        .become-vendor-section {
                            margin-top: 30px;
                            padding: 20px;
                            background-color: var(--background);
                            border-radius: var(--border-radius);
                            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                            text-align: center;
                        }
                        .become-vendor-btn {
                            background-color: var(--primary-accent);
                            color: white;
                            padding: 12px 24px;
                            border: none;
                            border-radius: var(--border-radius);
                            cursor: pointer;
                            font-size: 16px;
                            font-weight: bold;
                            transition: background-color 0.3s ease;
                        }
                        .become-vendor-btn:hover {
                            background-color: var(--primary-accent-dark, #0056b3);
                        }
                        .product-form {
                            display: flex;
                            flex-direction: column;
                            gap: 10px;
                            margin-top: 15px;
                        }
                        .product-form input, 
                        .product-form textarea, 
                        .product-form select {
                            padding: 8px;
                            border: 1px solid #ccc;
                            border-radius: var(--border-radius);
                        }
                        .product-form button {
                            padding: 10px;
                            background-color: var(--primary-accent);
                            color: white;
                            border: none;
                            border-radius: var(--border-radius);
                            cursor: pointer;
                        }
                        .products-list {
                            margin-top: 20px;
                        }
                        .product-item {
                            padding: 15px;
                            margin-bottom: 15px;
                            border: 1px solid #eee;
                            border-radius: var(--border-radius);
                        }
                        .product-actions {
                            margin-top: 10px;
                            display: flex;
                            gap: 10px;
                        }
                        .product-actions button {
                            padding: 5px 10px;
                            background-color: var(--background);
                            border: 1px solid #ccc;
                            border-radius: var(--border-radius);
                            cursor: pointer;
                        }
                        .edit-product-btn {
                            color: var(--primary-accent);
                        }
                        .delete-product-btn {
                            color: #dc3545;
                        }
                        .hidden {
                            display: none;
                        }
                        .edit-form {
                            margin-top: 15px;
                            padding-top: 15px;
                            border-top: 1px solid #eee;
                        }
                        .edit-product-form {
                            display: flex;
                            flex-direction: column;
                            gap: 10px;
                        }
                    </style>
                </div>`;

            if (user.role === 'vendor') {
                this.loadVendorProducts();
            }

            this.setupEventListeners();
        } catch (error) {
            console.error('Error loading account page:', error);
            this.renderError('An error occurred while loading your account. Please try again later.');
        }
    }

    renderError(message) {
        this.innerHTML = `
            <div class="account-page">
                <h1>My Account</h1>
                <p class="error-message">${message}</p>
            </div>`;
    }

    renderUserAccount(user) {
        return `
            <div class="account-details">
                <h2>Account Details</h2>
                <p>Name: ${user.name || 'User'}</p>
                <p>Email: ${user.email || 'user@example.com'}</p>
                <p>Role: ${user.role || 'buyer'}</p>
                <button id="logout" class="logout-btn">Logout</button>
            </div>
            ${user.role === 'vendor' 
                ? this.renderVendorSection(user) 
                : this.renderBecomeVendorSection()}`;
    }

    renderBecomeVendorSection() {
        return `
            <div class="become-vendor-section">
                <h2>Become a Vendor</h2>
                <p>Want to sell products on our platform? Become a vendor today!</p>
                <button id="become-vendor-btn" class="become-vendor-btn">Become a Vendor</button>
            </div>`;
    }

    renderVendorSection(user) {
        return `
            <div class="vendor-section">
                <h2>Vendor Dashboard</h2>
                <div id="vendor-message"></div>
                
                <h3>Add New Product</h3>
                <form id="addProductForm" class="product-form">
                    <input type="text" name="name" placeholder="Product Name" required>
                    <textarea name="description" placeholder="Product Description" required></textarea>
                    <input type="number" name="price" placeholder="Price" min="0" step="0.01" required>
                    <input type="text" name="image" placeholder="Image URL (optional)">
                    <select name="category" required>
                        <option value="">Select Category</option>
                        <option value="electronics">Electronics</option>
                        <option value="clothing">Clothing</option>
                        <option value="food">Food</option>
                        <option value="home">Home & Garden</option>
                        <option value="beauty">Beauty & Health</option>
                        <option value="other">Other</option>
                    </select>
                    <input type="number" name="stock" placeholder="Stock Quantity" min="0" required>
                    <button type="submit">Add Product</button>
                </form>
                
                <h3>My Products</h3>
                <div id="vendorProducts" class="products-list">
                    <p>Loading products...</p>
                </div>
            </div>`;
    }

    renderLogin() {
        return `
            <div class="login-form">
                <form id="loginForm">
                    <input type="email" placeholder="Email" required>
                    <input type="password" placeholder="Password" required>
                    <button type="submit">Login</button>
                </form>
            </div>`;
    }

    setupEventListeners() {
        const loginForm = this.querySelector('#loginForm');
        const logoutBtn = this.querySelector('#logout');
        const addProductForm = this.querySelector('#addProductForm');
        const becomeVendorBtn = this.querySelector('#become-vendor-btn');

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                // Implement login logic here
            });
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                await AuthService.logout();
                RouterService.navigate('/eSiro/');
            });
        }

        if (addProductForm) {
            addProductForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const productData = {
                    name: addProductForm.name.value.trim(),
                    description: addProductForm.description.value.trim(),
                    price: parseFloat(addProductForm.price.value),
                    image: addProductForm.image.value.trim() || 'https://via.placeholder.com/150',
                    category: addProductForm.category.value,
                    stock: parseInt(addProductForm.stock.value),
                    createdAt: new Date().toISOString()
                };
                
                await this.addProduct(productData);
            });
        }

        if (becomeVendorBtn) {
            becomeVendorBtn.addEventListener('click', async () => {
                await this.handleBecomeVendor();
            });
        }
    }

    async handleBecomeVendor() {
        try {
            const user = AuthService.getUser();
            if (!user) {
                throw new Error('You must be logged in to become a vendor');
            }

            // 1. Change user role to seller/vendor
            await this.updateUserRole(user.id, 'vendor');

            // 2. Create a new store (public realm) in the database
            const storeId = await this.createStore(user);

            // 3. Show success message and redirect to vendor dashboard
            this.showNotification('Congratulations! You are now a vendor.');
            
            // 4. Refresh the page to show vendor dashboard
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (error) {
            console.error('Error becoming vendor:', error);
            this.showNotification(`Error: ${error.message}`, 'error');
        }
    }

    async updateUserRole(userId, role) {
        try {
            await db.open();
            const user = await db.users.get(userId);
            
            if (!user) {
                throw new Error('User not found');
            }

            // Update user role
            user.role = role;
            await db.users.put(user);

            // Update local user in AuthService
            AuthService.updateCurrentUser(user);

            return true;
        } catch (error) {
            console.error('Error updating user role:', error);
            throw error;
        }
    }

    async createStore(user) {
        try {
            await db.open();
            
            // Create a new store
            const storeId = crypto.randomUUID();
            const store = {
                id: storeId,
                name: `${user.name || 'User'}'s Store`,
                description: `Welcome to ${user.name || 'User'}'s Store!`,
                image: 'https://via.placeholder.com/300',
                ownerId: user.id,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                productCount: 0
            };

            await db.stores.add(store);
            return storeId;
        } catch (error) {
            console.error('Error creating store:', error);
            throw error;
        }
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.setAttribute('role', 'alert');
        
        document.body.appendChild(notification);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }

    async addProduct(productData) {
        const messageDiv = this.querySelector('#vendor-message');
        messageDiv.innerHTML = '<p>Adding product...</p>';
        
        try {
            await db.open();
            const user = AuthService.getUser();
            
            if (!user || user.role !== 'vendor') {
                throw new Error('Only vendors can add products');
            }
            
            // Get the user's store
            const store = await db.stores.where('ownerId').equals(user.id).first();
            
            if (!store) {
                throw new Error('Store not found');
            }
            
            // Add product to database
            const productId = crypto.randomUUID();
            const product = {
                id: productId,
                ...productData,
                vendorId: store.id,
                ownerId: user.id
            };
            
            await db.products.add(product);
            
            // Update store product count
            store.productCount = (store.productCount || 0) + 1;
            store.updatedAt = new Date().toISOString();
            await db.stores.put(store);
            
            messageDiv.innerHTML = '<p class="success-message">Product added successfully!</p>';
            this.querySelector('#addProductForm').reset();
            this.loadVendorProducts(); // Refresh the products list
        } catch (error) {
            console.error('Add product error:', error);
            messageDiv.innerHTML = `<p class="error-message">Error: ${error.message}</p>`;
        }
    }

    async loadVendorProducts() {
        const productsDiv = this.querySelector('#vendorProducts');
        
        try {
            await db.open();
            const user = AuthService.getUser();
            
            if (!user || user.role !== 'vendor') {
                throw new Error('Only vendors can access their products');
            }
            
            // Get the user's store
            const store = await db.stores.where('ownerId').equals(user.id).first();
            
            if (!store) {
                throw new Error('Store not found');
            }
            
            // Get products for this store
            const products = await db.products.where('vendorId').equals(store.id).toArray();
            
            if (products.length === 0) {
                productsDiv.innerHTML = '<p>You don\'t have any products yet.</p>';
                return;
            }
            
            let html = '';
            products.forEach(product => {
                html += `
                    <div class="product-item" data-id="${product.id}">
                        <h4>${product.name}</h4>
                        <p>${product.description}</p>
                        <p>Price: $${product.price.toFixed(2)}</p>
                        <p>Category: ${product.category}</p>
                        <p>Stock: ${product.stock}</p>
                        <div class="product-actions">
                            <button class="edit-product-btn">Edit</button>
                            <button class="delete-product-btn">Delete</button>
                        </div>
                        <div class="edit-form hidden">
                            <form class="edit-product-form">
                                <input type="text" name="name" value="${product.name}" required>
                                <textarea name="description" required>${product.description}</textarea>
                                <input type="number" name="price" value="${product.price}" min="0" step="0.01" required>
                                <input type="text" name="image" value="${product.image || ''}">
                                <select name="category" required>
                                    <option value="electronics" ${product.category === 'electronics' ? 'selected' : ''}>Electronics</option>
                                    <option value="clothing" ${product.category === 'clothing' ? 'selected' : ''}>Clothing</option>
                                    <option value="food" ${product.category === 'food' ? 'selected' : ''}>Food</option>
                                    <option value="home" ${product.category === 'home' ? 'selected' : ''}>Home & Garden</option>
                                    <option value="beauty" ${product.category === 'beauty' ? 'selected' : ''}>Beauty & Health</option>
                                    <option value="other" ${product.category === 'other' ? 'selected' : ''}>Other</option>
                                </select>
                                <input type="number" name="stock" value="${product.stock}" min="0" required>
                                <button type="submit">Update</button>
                                <button type="button" class="cancel-edit-btn">Cancel</button>
                            </form>
                        </div>
                    </div>
                `;
            });
            
            productsDiv.innerHTML = html;
            this.setupProductEventListeners();
            
        } catch (error) {
            console.error('Error loading products:', error);
            productsDiv.innerHTML = `<p class="error-message">Error loading products: ${error.message}</p>`;
        }
    }

    setupProductEventListeners() {
        // Edit button event listeners
        const editButtons = this.querySelectorAll('.edit-product-btn');
        editButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const productItem = e.target.closest('.product-item');
                const editForm = productItem.querySelector('.edit-form');
                editForm.classList.toggle('hidden');
            });
        });
        
        // Cancel edit button event listeners
        const cancelButtons = this.querySelectorAll('.cancel-edit-btn');
        cancelButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const editForm = e.target.closest('.edit-form');
                editForm.classList.add('hidden');
            });
        });
        
        // Edit form submit event listeners
        const editForms = this.querySelectorAll('.edit-product-form');
        editForms.forEach(form => {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const productItem = e.target.closest('.product-item');
                const productId = productItem.dataset.id;
                
                const productData = {
                    name: form.name.value.trim(),
                    description: form.description.value.trim(),
                    price: parseFloat(form.price.value),
                    image: form.image.value.trim() || 'https://via.placeholder.com/150',
                    category: form.category.value,
                    stock: parseInt(form.stock.value),
                    updatedAt: new Date().toISOString()
                };
                
                await this.updateProduct(productId, productData);
            });
        });
        
        // Delete button event listeners
        const deleteButtons = this.querySelectorAll('.delete-product-btn');
        deleteButtons.forEach(button => {
            button.addEventListener('click', async (e) => {
                if (confirm('Are you sure you want to delete this product?')) {
                    const productItem = e.target.closest('.product-item');
                    const productId = productItem.dataset.id;
                    await this.deleteProduct(productId);
                }
            });
        });
    }
    
    async updateProduct(productId, productData) {
        const messageDiv = this.querySelector('#vendor-message');
        messageDiv.innerHTML = '<p>Updating product...</p>';
        
        try {
            await db.open();
            const user = AuthService.getUser();
            
            if (!user || user.role !== 'vendor') {
                throw new Error('Only vendors can update products');
            }
            
            // Verify product ownership
            const product = await db.products.get(productId);
            if (!product || product.ownerId !== user.id) {
                throw new Error('Product not found or you don\'t have permission to update it');
            }
            
            // Update the product
            await db.products.update(productId, productData);
            
            messageDiv.innerHTML = '<p class="success-message">Product updated successfully!</p>';
            this.loadVendorProducts(); // Refresh the products list
        } catch (error) {
            console.error('Update product error:', error);
            messageDiv.innerHTML = `<p class="error-message">Error: ${error.message}</p>`;
        }
    }
    
    async deleteProduct(productId) {
        const messageDiv = this.querySelector('#vendor-message');
        messageDiv.innerHTML = '<p>Deleting product...</p>';
        
        try {
            await db.open();
            const user = AuthService.getUser();
            
            if (!user || user.role !== 'vendor') {
                throw new Error('Only vendors can delete products');
            }
            
            // Verify product ownership
            const product = await db.products.get(productId);
            if (!product || product.ownerId !== user.id) {
                throw new Error('Product not found or you don\'t have permission to delete it');
            }
            
            // Get the user's store to update product count
            const store = await db.stores.where('ownerId').equals(user.id).first();
            
            // Delete the product
            await db.products.delete(productId);
            
            // Update store product count
            if (store) {
                store.productCount = Math.max((store.productCount || 0) - 1, 0);
                store.updatedAt = new Date().toISOString();
                await db.stores.put(store);
            }
            
            messageDiv.innerHTML = '<p class="success-message">Product deleted successfully!</p>';
            this.loadVendorProducts(); // Refresh the products list
        } catch (error) {
            console.error('Delete product error:', error);
            messageDiv.innerHTML = `<p class="error-message">Error: ${error.message}</p>`;
        }
    }
}