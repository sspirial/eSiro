import { AuthService } from '../services/auth.js';
import { ProductService } from '../services/products.js';
import { RouterService } from '../services/router.js';

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
                <p>Name: ${user.name}</p>
                <p>Email: ${user.email}</p>
                <p>Role: ${user.role || 'buyer'}</p>
                <button id="logout">Logout</button>
            </div>
            ${user.role === 'vendor' ? this.renderVendorSection(user) : ''}`;
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
                    <input type="text" name="imageUrl" placeholder="Image URL (optional)">
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
                    imageUrl: addProductForm.imageUrl.value.trim() || null,
                    category: addProductForm.category.value,
                    stock: parseInt(addProductForm.stock.value),
                    createdAt: new Date().toISOString()
                };
                
                await this.addProduct(productData);
            });
        }
    }

    async addProduct(productData) {
        const messageDiv = this.querySelector('#vendor-message');
        messageDiv.innerHTML = '<p>Adding product...</p>';
        
        try {
            const productId = await ProductService.addProduct(productData);
            
            if (productId) {
                messageDiv.innerHTML = '<p class="success-message">Product added successfully!</p>';
                this.querySelector('#addProductForm').reset();
                this.loadVendorProducts(); // Refresh the products list
            } else {
                messageDiv.innerHTML = '<p class="error-message">Failed to add product</p>';
            }
        } catch (error) {
            messageDiv.innerHTML = `<p class="error-message">Error: ${error.message}</p>`;
        }
    }

    async loadVendorProducts() {
        const productsDiv = this.querySelector('#vendorProducts');
        
        try {
            const products = await ProductService.getMyProducts();
            
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
                                <input type="text" name="imageUrl" value="${product.imageUrl || ''}">
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
                    imageUrl: form.imageUrl.value.trim() || null,
                    category: form.category.value,
                    stock: parseInt(form.stock.value)
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
            const result = await ProductService.updateProduct(productId, productData);
            
            if (result) {
                messageDiv.innerHTML = '<p class="success-message">Product updated successfully!</p>';
                this.loadVendorProducts(); // Refresh the products list
            } else {
                messageDiv.innerHTML = '<p class="error-message">Failed to update product</p>';
            }
        } catch (error) {
            messageDiv.innerHTML = `<p class="error-message">Error: ${error.message}</p>`;
        }
    }
    
    async deleteProduct(productId) {
        const messageDiv = this.querySelector('#vendor-message');
        messageDiv.innerHTML = '<p>Deleting product...</p>';
        
        try {
            const result = await ProductService.deleteProduct(productId);
            
            if (result) {
                messageDiv.innerHTML = '<p class="success-message">Product deleted successfully!</p>';
                this.loadVendorProducts(); // Refresh the products list
            } else {
                messageDiv.innerHTML = '<p class="error-message">Failed to delete product</p>';
            }
        } catch (error) {
            messageDiv.innerHTML = `<p class="error-message">Error: ${error.message}</p>`;
        }
    }
}