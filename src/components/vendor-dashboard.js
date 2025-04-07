import { db } from '../db.js';
import { AuthService } from '../services/auth.js';
import { RouterService } from '../services/router.js';

export default class EsiroVendorDashboard extends HTMLElement {
    #vendorData = null;
    #storeData = null;
    #products = [];

    async connectedCallback() {
        try {
            // Verify that user is a vendor
            const user = AuthService.getUser();
            if (!user || user.role !== 'vendor') {
                this.renderError('You must be a vendor to access this dashboard. Please upgrade your account first.');
                return;
            }

            await this.loadVendorData();
            this.render();
            this.setupEventListeners();
        } catch (error) {
            console.error('Error loading vendor dashboard:', error);
            this.renderError('Failed to load vendor dashboard. Please try again later.');
        }
    }

    async loadVendorData() {
        try {
            const user = AuthService.getUser();
            this.#vendorData = user;
            
            // Get the store realm owned by this vendor
            const userMemberships = await db.members
                .where('userId')
                .equals(user.id)
                .and(member => member.roles && member.roles.includes('vendor'))
                .toArray();
            
            if (userMemberships.length === 0) {
                throw new Error('No vendor store found for this user');
            }
            
            // Get the store associated with this realm
            const vendorRealm = userMemberships[0].realmId;
            this.#storeData = await db.stores
                .where('realmId')
                .equals(vendorRealm)
                .first();
            
            if (!this.#storeData) {
                throw new Error('Store data not found');
            }
            
            // Load products for this store
            this.#products = await db.products
                .where('realmId')
                .equals(vendorRealm)
                .toArray();
        } catch (error) {
            console.error('Error loading vendor data:', error);
            throw error;
        }
    }

    render() {
        if (!this.#storeData) {
            this.renderError('Store data not available. Please try again later.');
            return;
        }

        this.innerHTML = `
            <div class="vendor-dashboard">
                <div class="dashboard-header">
                    <div class="store-info">
                        <img src="${this.#storeData.image || 'https://via.placeholder.com/150'}" alt="${this.#storeData.name}" class="store-image">
                        <div class="store-details">
                            <h1>${this.#storeData.name}</h1>
                            <p>${this.#storeData.description || 'No store description available.'}</p>
                        </div>
                    </div>
                    <div class="dashboard-actions">
                        <button id="edit-store-btn" class="btn primary">Edit Store</button>
                    </div>
                </div>
                
                <div class="dashboard-stats">
                    <div class="stat-card">
                        <span class="stat-value">${this.#products.length}</span>
                        <span class="stat-label">Products</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-value">0</span>
                        <span class="stat-label">Orders</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-value">$0.00</span>
                        <span class="stat-label">Revenue</span>
                    </div>
                </div>
                
                <div class="dashboard-content">
                    <div class="content-section">
                        <div class="section-header">
                            <h2>Products</h2>
                            <button id="add-product-btn" class="btn primary">Add Product</button>
                        </div>
                        
                        <div class="product-form-container hidden">
                            <h3>Add New Product</h3>
                            <form id="add-product-form" class="product-form">
                                <div class="form-group">
                                    <label for="product-name">Product Name</label>
                                    <input type="text" id="product-name" name="name" required>
                                </div>
                                <div class="form-group">
                                    <label for="product-description">Description</label>
                                    <textarea id="product-description" name="description" required></textarea>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="product-price">Price ($)</label>
                                        <input type="number" id="product-price" name="price" min="0.01" step="0.01" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="product-stock">Stock Quantity</label>
                                        <input type="number" id="product-stock" name="stock" min="0" required>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label for="product-image">Image URL</label>
                                    <input type="text" id="product-image" name="image" value="https://via.placeholder.com/150">
                                </div>
                                <div class="form-group">
                                    <label for="product-category">Category</label>
                                    <select id="product-category" name="category" required>
                                        <option value="">Select Category</option>
                                        <option value="electronics">Electronics</option>
                                        <option value="clothing">Clothing</option>
                                        <option value="food">Food</option>
                                        <option value="home">Home & Garden</option>
                                        <option value="beauty">Beauty & Health</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div class="form-actions">
                                    <button type="button" id="cancel-add-product" class="btn secondary">Cancel</button>
                                    <button type="submit" class="btn primary">Save Product</button>
                                </div>
                            </form>
                        </div>
                        
                        <div class="products-table-container">
                            ${this.renderProductsTable()}
                        </div>
                    </div>
                </div>
            </div>
            <style>
                .vendor-dashboard {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 20px;
                }
                
                .dashboard-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 1px solid #eee;
                }
                
                .store-info {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                }
                
                .store-image {
                    width: 80px;
                    height: 80px;
                    object-fit: cover;
                    border-radius: var(--border-radius);
                }
                
                .store-details h1 {
                    margin: 0 0 10px 0;
                }
                
                .store-details p {
                    margin: 0;
                    color: var(--text-secondary);
                }
                
                .dashboard-stats {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 20px;
                    margin-bottom: 30px;
                }
                
                .stat-card {
                    background-color: var(--background);
                    padding: 20px;
                    border-radius: var(--border-radius);
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    text-align: center;
                }
                
                .stat-value {
                    display: block;
                    font-size: 24px;
                    font-weight: bold;
                    margin-bottom: 5px;
                    color: var(--primary-accent);
                }
                
                .stat-label {
                    color: var(--text-secondary);
                }
                
                .content-section {
                    background-color: var(--background);
                    border-radius: var(--border-radius);
                    padding: 20px;
                    margin-bottom: 30px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                
                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }
                
                .section-header h2 {
                    margin: 0;
                }
                
                .btn {
                    padding: 8px 16px;
                    border-radius: var(--border-radius);
                    border: none;
                    cursor: pointer;
                    font-size: 14px;
                }
                
                .btn.primary {
                    background-color: var(--primary-accent);
                    color: white;
                }
                
                .btn.secondary {
                    background-color: #f5f5f5;
                    color: #333;
                    border: 1px solid #ddd;
                }
                
                .hidden {
                    display: none;
                }
                
                .product-form-container {
                    margin-bottom: 30px;
                    padding: 20px;
                    background-color: #f9f9f9;
                    border-radius: var(--border-radius);
                }
                
                .product-form {
                    display: grid;
                    gap: 15px;
                }
                
                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 15px;
                }
                
                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                }
                
                .form-group label {
                    font-weight: bold;
                    font-size: 14px;
                }
                
                .form-group input,
                .form-group textarea,
                .form-group select {
                    padding: 8px;
                    border: 1px solid #ddd;
                    border-radius: var(--border-radius);
                }
                
                .form-group textarea {
                    min-height: 100px;
                }
                
                .form-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                    margin-top: 10px;
                }
                
                .products-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                
                .products-table th,
                .products-table td {
                    padding: 12px;
                    text-align: left;
                    border-bottom: 1px solid #eee;
                }
                
                .products-table th {
                    background-color: #f5f5f5;
                    font-weight: bold;
                }
                
                .products-table tr:hover {
                    background-color: #f9f9f9;
                }
                
                .product-actions {
                    display: flex;
                    gap: 5px;
                }
                
                .product-actions button {
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-size: 16px;
                }
                
                .edit-product {
                    color: var(--primary-accent);
                }
                
                .delete-product {
                    color: #dc3545;
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
                
                @media (max-width: 768px) {
                    .dashboard-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 15px;
                    }
                    
                    .dashboard-actions {
                        width: 100%;
                    }
                    
                    .dashboard-stats {
                        grid-template-columns: 1fr;
                    }
                    
                    .form-row {
                        grid-template-columns: 1fr;
                    }
                    
                    .products-table {
                        font-size: 14px;
                    }
                    
                    .products-table th,
                    .products-table td {
                        padding: 8px;
                    }
                }
            </style>`;
    }

    renderProductsTable() {
        if (this.#products.length === 0) {
            return `
                <div class="empty-state">
                    <p>You don't have any products yet. Add your first product to start selling!</p>
                </div>
            `;
        }

        return `
            <table class="products-table">
                <thead>
                    <tr>
                        <th>Image</th>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Category</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.#products.map(product => `
                        <tr data-id="${product.id}">
                            <td><img src="${product.image || 'https://via.placeholder.com/150'}" alt="${product.name}" width="50" height="50" style="object-fit: cover; border-radius: 4px;"></td>
                            <td>${product.name}</td>
                            <td>$${product.price.toFixed(2)}</td>
                            <td>${product.stock}</td>
                            <td>${product.category || (product.categories && product.categories[0]) || 'Uncategorized'}</td>
                            <td class="product-actions">
                                <button class="edit-product" title="Edit product"><span class="fas fa-edit"></span></button>
                                <button class="delete-product" title="Delete product"><span class="fas fa-trash"></span></button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    renderError(message) {
        this.innerHTML = `
            <div class="error-container">
                <h2>Error</h2>
                <p>${message}</p>
                <button id="go-to-account" class="btn primary">Go to Account</button>
            </div>
            <style>
                .error-container {
                    max-width: 500px;
                    margin: 100px auto;
                    padding: 30px;
                    background-color: var(--background);
                    border-radius: var(--border-radius);
                    text-align: center;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                }
                
                .btn {
                    padding: 8px 16px;
                    border-radius: var(--border-radius);
                    border: none;
                    cursor: pointer;
                    font-size: 14px;
                    margin-top: 20px;
                }
                
                .btn.primary {
                    background-color: var(--primary-accent);
                    color: white;
                }
            </style>
        `;

        this.querySelector('#go-to-account')?.addEventListener('click', () => {
            RouterService.navigate('/eSiro/account');
        });
    }

    setupEventListeners() {
        // Edit store button
        this.querySelector('#edit-store-btn')?.addEventListener('click', this.handleEditStore.bind(this));

        // Add product button and form
        this.querySelector('#add-product-btn')?.addEventListener('click', this.toggleAddProductForm.bind(this));
        this.querySelector('#cancel-add-product')?.addEventListener('click', this.toggleAddProductForm.bind(this));
        this.querySelector('#add-product-form')?.addEventListener('submit', this.handleAddProduct.bind(this));

        // Product actions (edit, delete)
        this.querySelectorAll('.edit-product').forEach(button => {
            button.addEventListener('click', this.handleEditProduct.bind(this));
        });

        this.querySelectorAll('.delete-product').forEach(button => {
            button.addEventListener('click', this.handleDeleteProduct.bind(this));
        });
    }

    toggleAddProductForm() {
        const formContainer = this.querySelector('.product-form-container');
        formContainer.classList.toggle('hidden');
    }

    async handleAddProduct(event) {
        event.preventDefault();
        
        try {
            const form = event.target;
            const formData = new FormData(form);
            
            const productData = {
                name: formData.get('name'),
                description: formData.get('description'),
                price: parseFloat(formData.get('price')),
                stock: parseInt(formData.get('stock')),
                image: formData.get('image'),
                category: formData.get('category'),
                categories: [formData.get('category')],
                createdAt: new Date().toISOString()
            };
            
            const user = AuthService.getUser();
            
            // Get the user's vendor realm
            const userMemberships = await db.members
                .where('userId')
                .equals(user.id)
                .and(member => member.roles && member.roles.includes('vendor'))
                .toArray();
            
            if (userMemberships.length === 0) {
                throw new Error('No vendor store found for this user');
            }
            
            const vendorRealm = userMemberships[0].realmId;
            
            // Create new product in the same realm as the store
            const productId = crypto.randomUUID();
            await db.products.add({
                id: productId,
                ...productData,
                vendorId: this.#storeData.id,
                owner: user.id,
                realmId: vendorRealm
            });
            
            // Refresh data and render
            await this.loadVendorData();
            this.render();
            this.setupEventListeners();
            
            // Show success notification
            this.showNotification('Product added successfully!');
            
        } catch (error) {
            console.error('Error adding product:', error);
            this.showNotification('Failed to add product. Please try again.', 'error');
        }
    }

    async handleEditProduct(event) {
        const productRow = event.target.closest('tr');
        const productId = productRow.dataset.id;
        
        try {
            const product = await db.products.get(productId);
            if (!product) {
                throw new Error('Product not found');
            }
            
            // Create edit form modal
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Edit Product</h3>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="edit-product-form" class="product-form">
                            <div class="form-group">
                                <label for="edit-product-name">Product Name</label>
                                <input type="text" id="edit-product-name" name="name" value="${product.name}" required>
                            </div>
                            <div class="form-group">
                                <label for="edit-product-description">Description</label>
                                <textarea id="edit-product-description" name="description" required>${product.description || ''}</textarea>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="edit-product-price">Price ($)</label>
                                    <input type="number" id="edit-product-price" name="price" min="0.01" step="0.01" value="${product.price}" required>
                                </div>
                                <div class="form-group">
                                    <label for="edit-product-stock">Stock Quantity</label>
                                    <input type="number" id="edit-product-stock" name="stock" min="0" value="${product.stock}" required>
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="edit-product-image">Image URL</label>
                                <input type="text" id="edit-product-image" name="image" value="${product.image || 'https://via.placeholder.com/150'}">
                            </div>
                            <div class="form-group">
                                <label for="edit-product-category">Category</label>
                                <select id="edit-product-category" name="category" required>
                                    <option value="electronics" ${(product.category === 'electronics' || (product.categories && product.categories.includes('electronics'))) ? 'selected' : ''}>Electronics</option>
                                    <option value="clothing" ${(product.category === 'clothing' || (product.categories && product.categories.includes('clothing'))) ? 'selected' : ''}>Clothing</option>
                                    <option value="food" ${(product.category === 'food' || (product.categories && product.categories.includes('food'))) ? 'selected' : ''}>Food</option>
                                    <option value="home" ${(product.category === 'home' || (product.categories && product.categories.includes('home'))) ? 'selected' : ''}>Home & Garden</option>
                                    <option value="beauty" ${(product.category === 'beauty' || (product.categories && product.categories.includes('beauty'))) ? 'selected' : ''}>Beauty & Health</option>
                                    <option value="other" ${(product.category === 'other' || (product.categories && product.categories.includes('other'))) ? 'selected' : ''}>Other</option>
                                </select>
                            </div>
                            <input type="hidden" name="productId" value="${productId}">
                            <div class="form-actions">
                                <button type="button" class="btn secondary cancel-edit">Cancel</button>
                                <button type="submit" class="btn primary">Update Product</button>
                            </div>
                        </form>
                    </div>
                </div>
                <style>
                    .modal {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background-color: rgba(0, 0, 0, 0.5);
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        z-index: 1000;
                    }
                    
                    .modal-content {
                        background-color: var(--background);
                        border-radius: var(--border-radius);
                        width: 90%;
                        max-width: 600px;
                        max-height: 90vh;
                        overflow-y: auto;
                    }
                    
                    .modal-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 15px 20px;
                        border-bottom: 1px solid #eee;
                    }
                    
                    .modal-header h3 {
                        margin: 0;
                    }
                    
                    .close-modal {
                        background: none;
                        border: none;
                        font-size: 24px;
                        cursor: pointer;
                    }
                    
                    .modal-body {
                        padding: 20px;
                    }
                </style>
            `;
            
            document.body.appendChild(modal);
            
            // Add event listeners for modal
            modal.querySelector('.close-modal').addEventListener('click', () => {
                modal.remove();
            });
            
            modal.querySelector('.cancel-edit').addEventListener('click', () => {
                modal.remove();
            });
            
            modal.querySelector('#edit-product-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const formData = new FormData(e.target);
                const updatedProductData = {
                    name: formData.get('name'),
                    description: formData.get('description'),
                    price: parseFloat(formData.get('price')),
                    stock: parseInt(formData.get('stock')),
                    image: formData.get('image'),
                    category: formData.get('category'),
                    categories: [formData.get('category')],
                    updatedAt: new Date().toISOString()
                };
                
                try {
                    await db.products.update(productId, updatedProductData);
                    
                    // Refresh data and render
                    await this.loadVendorData();
                    this.render();
                    this.setupEventListeners();
                    
                    // Remove modal
                    modal.remove();
                    
                    // Show success notification
                    this.showNotification('Product updated successfully!');
                } catch (error) {
                    console.error('Error updating product:', error);
                    this.showNotification('Failed to update product. Please try again.', 'error');
                }
            });
            
        } catch (error) {
            console.error('Error editing product:', error);
            this.showNotification('Failed to edit product. Please try again.', 'error');
        }
    }

    async handleDeleteProduct(event) {
        const productRow = event.target.closest('tr');
        const productId = productRow.dataset.id;
        
        if (!confirm('Are you sure you want to delete this product?')) {
            return;
        }
        
        try {
            await db.products.delete(productId);
            
            // Refresh data and render
            await this.loadVendorData();
            this.render();
            this.setupEventListeners();
            
            this.showNotification('Product deleted successfully!');
        } catch (error) {
            console.error('Error deleting product:', error);
            this.showNotification('Failed to delete product. Please try again.', 'error');
        }
    }

    async handleEditStore() {
        try {
            // Create edit form modal for store
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Edit Store</h3>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="edit-store-form" class="product-form">
                            <div class="form-group">
                                <label for="edit-store-name">Store Name</label>
                                <input type="text" id="edit-store-name" name="name" value="${this.#storeData.name}" required>
                            </div>
                            <div class="form-group">
                                <label for="edit-store-description">Description</label>
                                <textarea id="edit-store-description" name="description" required>${this.#storeData.description || ''}</textarea>
                            </div>
                            <div class="form-group">
                                <label for="edit-store-image">Store Image URL</label>
                                <input type="text" id="edit-store-image" name="image" value="${this.#storeData.image || 'https://via.placeholder.com/150'}">
                            </div>
                            <div class="form-actions">
                                <button type="button" class="btn secondary cancel-edit">Cancel</button>
                                <button type="submit" class="btn primary">Update Store</button>
                            </div>
                        </form>
                    </div>
                </div>
                <style>
                    .modal {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background-color: rgba(0, 0, 0, 0.5);
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        z-index: 1000;
                    }
                    
                    .modal-content {
                        background-color: var(--background);
                        border-radius: var(--border-radius);
                        width: 90%;
                        max-width: 600px;
                        max-height: 90vh;
                        overflow-y: auto;
                    }
                    
                    .modal-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 15px 20px;
                        border-bottom: 1px solid #eee;
                    }
                    
                    .modal-header h3 {
                        margin: 0;
                    }
                    
                    .close-modal {
                        background: none;
                        border: none;
                        font-size: 24px;
                        cursor: pointer;
                    }
                    
                    .modal-body {
                        padding: 20px;
                    }
                </style>
            `;
            
            document.body.appendChild(modal);
            
            // Add event listeners for modal
            modal.querySelector('.close-modal').addEventListener('click', () => {
                modal.remove();
            });
            
            modal.querySelector('.cancel-edit').addEventListener('click', () => {
                modal.remove();
            });
            
            modal.querySelector('#edit-store-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const formData = new FormData(e.target);
                const updatedStoreData = {
                    name: formData.get('name'),
                    description: formData.get('description'),
                    image: formData.get('image'),
                    updatedAt: new Date().toISOString()
                };
                
                try {
                    await db.stores.update(this.#storeData.id, updatedStoreData);
                    
                    // Update realm name to match store name if changed
                    if (updatedStoreData.name !== this.#storeData.name) {
                        await db.realms.update(this.#storeData.realmId, { 
                            name: updatedStoreData.name 
                        });
                    }
                    
                    // Refresh data and render
                    await this.loadVendorData();
                    this.render();
                    this.setupEventListeners();
                    
                    // Remove modal
                    modal.remove();
                    
                    // Show success notification
                    this.showNotification('Store updated successfully!');
                } catch (error) {
                    console.error('Error updating store:', error);
                    this.showNotification('Failed to update store. Please try again.', 'error');
                }
            });
            
        } catch (error) {
            console.error('Error editing store:', error);
            this.showNotification('Failed to edit store. Please try again.', 'error');
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
}