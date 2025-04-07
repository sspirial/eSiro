import { AuthService } from '../services/auth.js';
import { RouterService } from '../services/router.js';
import { db } from '../db.js';

export default class EsiroAccount extends HTMLElement {
    async connectedCallback() {
        try {
            // Get the authenticated user
            const user = AuthService.getUser();
            
            // If no user is authenticated, redirect to login
            if (!user) {
                RouterService.navigate('/eSiro/');
                return;
            }

            this.innerHTML = `
                <div class="account-page">
                    <h1>My Account</h1>
                    ${this.renderUserAccount(user)}
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
                        .notification {
                            position: fixed;
                            top: 60px;
                            right: 20px;
                            padding: 10px 20px;
                            border-radius: var(--border-radius);
                            background-color: #4CAF50;
                            color: white;
                            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                            z-index: 1100;
                            transition: opacity 0.5s ease;
                        }
                        .notification.error {
                            background-color: #f44336;
                        }
                        .notification.fade-out {
                            opacity: 0;
                        }
                        .logout-btn {
                            padding: 8px 16px;
                            background-color: #f5f5f5;
                            color: #333;
                            border: 1px solid #ddd;
                            border-radius: var(--border-radius);
                            cursor: pointer;
                            margin-top: 10px;
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
                <form id="become-vendor-form" class="product-form">
                    <input type="text" id="store-name" placeholder="Store Name" required>
                    <textarea id="store-description" placeholder="Store Description" required></textarea>
                    <input type="text" id="store-image" value="https://via.placeholder.com/150" placeholder="Store Image URL">
                    <button type="submit" id="become-vendor-btn" class="become-vendor-btn">Become a Vendor</button>
                </form>
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
                    <input type="text" name="image" placeholder="Image URL" value="https://via.placeholder.com/150">
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

    setupEventListeners() {
        const logoutBtn = this.querySelector('#logout');
        const addProductForm = this.querySelector('#addProductForm');
        const becomeVendorForm = this.querySelector('#become-vendor-form');

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
                    image: addProductForm.image.value.trim(),
                    category: addProductForm.category.value,
                    stock: parseInt(addProductForm.stock.value),
                    createdAt: new Date().toISOString()
                };
                
                await this.addProduct(productData);
            });
        }

        if (becomeVendorForm) {
            becomeVendorForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const storeName = document.getElementById('store-name').value.trim();
                const storeDescription = document.getElementById('store-description').value.trim();
                const storeImage = document.getElementById('store-image').value.trim();
                
                await this.handleBecomeVendor(storeName, storeDescription, storeImage);
            });
        }
    }

    async handleBecomeVendor(storeName, storeDescription, storeImage) {
        try {
            const messageDiv = document.createElement('div');
            messageDiv.innerHTML = '<p>Processing your request...</p>';
            messageDiv.className = 'vendor-message';
            const becomeVendorSection = this.querySelector('.become-vendor-section');
            becomeVendorSection.appendChild(messageDiv);
            
            const user = AuthService.getUser();
            if (!user) {
                throw new Error('You must be logged in to become a vendor');
            }

            // 1. Create a new shop realm where the user will be the vendor
            const realmId = 'shop/' + storeName.toLowerCase().replace(/\s+/g, '-');
            
            // 2. Create a new store in the database
            const storeId = crypto.randomUUID();
            await db.stores.add({
                id: storeId,
                name: storeName,
                description: storeDescription,
                image: storeImage || 'https://via.placeholder.com/150',
                realmId: realmId,
                owner: user.id,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
            
            // 3. Create a new realm for this store
            await db.realms.add({
                realmId: realmId,
                type: 'shop',
                name: storeName,
                owner: user.id,
                represents: 'store'
            });
            
            // 4. Add the user as a member of this realm with the 'vendor' role
            await db.members.add({
                id: crypto.randomUUID(),
                realmId: realmId,
                userId: user.id,
                email: user.email,
                name: user.name,
                roles: ['vendor'],
                accepted: new Date().toISOString()
            });
            
            // 5. Update user role in the database
            await db.users.update(user.id, { role: 'vendor' });
            
            // 6. Update local user in session
            user.role = 'vendor';
            AuthService.updateCurrentUser(user);
            
            // 7. Show success message
            this.showNotification('Congratulations! You are now a vendor.');
            
            // 8. Redirect to vendor dashboard
            setTimeout(() => {
                RouterService.navigate('/eSiro/vendor-dashboard');
            }, 1500);
            
        } catch (error) {
            console.error('Error becoming vendor:', error);
            this.showNotification(`Error: ${error.message}`, 'error');
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
            
            // Find the realm where the user is a vendor
            const userMemberships = await db.members
                .where('userId')
                .equals(user.id)
                .and(member => member.roles && member.roles.includes('vendor'))
                .toArray();
            
            if (userMemberships.length === 0) {
                throw new Error('No vendor store found for this user');
            }
            
            // Get the first store realm where the user is a vendor
            const storeRealm = userMemberships[0].realmId;
            
            // Get the store associated with this realm
            const store = await db.stores
                .where('realmId')
                .equals(storeRealm)
                .first();
            
            if (!store) {
                throw new Error('Store not found');
            }
            
            // Add product to the same realm as the store
            const productId = crypto.randomUUID();
            const product = {
                id: productId,
                ...productData,
                vendorId: store.id,
                owner: user.id,
                realmId: storeRealm,
                categories: [productData.category]
            };
            
            await db.products.add(product);
            
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
            
            // Find the realm where the user is a vendor
            const userMemberships = await db.members
                .where('userId')
                .equals(user.id)
                .and(member => member.roles && member.roles.includes('vendor'))
                .toArray();
            
            if (userMemberships.length === 0) {
                productsDiv.innerHTML = '<p>You don\'t have any vendor stores yet.</p>';
                return;
            }
            
            // Get products for all realms where the user is a vendor
            const vendorRealms = userMemberships.map(m => m.realmId);
            let products = [];
            
            for (const realm of vendorRealms) {
                const realmProducts = await db.products
                    .where('realmId')
                    .equals(realm)
                    .toArray();
                
                products = [...products, ...realmProducts];
            }
            
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
                        <p>Category: ${product.category || (product.categories && product.categories[0]) || 'Uncategorized'}</p>
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
                                    <option value="electronics" ${(product.category === 'electronics' || (product.categories && product.categories.includes('electronics'))) ? 'selected' : ''}>Electronics</option>
                                    <option value="clothing" ${(product.category === 'clothing' || (product.categories && product.categories.includes('clothing'))) ? 'selected' : ''}>Clothing</option>
                                    <option value="food" ${(product.category === 'food' || (product.categories && product.categories.includes('food'))) ? 'selected' : ''}>Food</option>
                                    <option value="home" ${(product.category === 'home' || (product.categories && product.categories.includes('home'))) ? 'selected' : ''}>Home & Garden</option>
                                    <option value="beauty" ${(product.category === 'beauty' || (product.categories && product.categories.includes('beauty'))) ? 'selected' : ''}>Beauty & Health</option>
                                    <option value="other" ${(product.category === 'other' || (product.categories && product.categories.includes('other'))) ? 'selected' : ''}>Other</option>
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
                    categories: [form.category.value],
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
            
            // Verify product ownership or permissions
            const product = await db.products.get(productId);
            if (!product) {
                throw new Error('Product not found');
            }
            
            // Check if user is a vendor for this product's realm
            const membership = await db.members
                .where('[realmId+userId]')
                .equals([product.realmId, user.id])
                .and(member => member.roles && member.roles.includes('vendor'))
                .first();
                
            if (!membership && product.owner !== user.id) {
                throw new Error('You don\'t have permission to update this product');
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
            
            // Verify product ownership or permissions
            const product = await db.products.get(productId);
            if (!product) {
                throw new Error('Product not found');
            }
            
            // Check if user is a vendor for this product's realm
            const membership = await db.members
                .where('[realmId+userId]')
                .equals([product.realmId, user.id])
                .and(member => member.roles && member.roles.includes('vendor'))
                .first();
                
            if (!membership && product.owner !== user.id) {
                throw new Error('You don\'t have permission to delete this product');
            }
            
            // Delete the product
            await db.products.delete(productId);
            
            messageDiv.innerHTML = '<p class="success-message">Product deleted successfully!</p>';
            this.loadVendorProducts(); // Refresh the products list
        } catch (error) {
            console.error('Delete product error:', error);
            messageDiv.innerHTML = `<p class="error-message">Error: ${error.message}</p>`;
        }
    }
}