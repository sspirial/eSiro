import { AuthService } from '../services/auth.js';
import { db } from '../db.js';

export default class EsiroVendorDashboard extends HTMLElement {
    #vendorData = null;

    async connectedCallback() {
        const user = AuthService.getUser();
        if (!user || user.role !== 'vendor') {
            RouterService.navigate('/eSiro/');
            return;
        }

        await this.loadVendorData();
        this.render();
        this.setupEventListeners();
    }

    async loadVendorData() {
        try {
            const user = AuthService.getUser();
            const storeData = await db.stores.where('ownerId').equals(user.id).first();
            const products = await db.products.where('vendorId').equals(storeData.id).toArray();
            const orders = await db.orders.where('vendorId').equals(storeData.id).toArray();
            
            this.#vendorData = {
                store: storeData,
                products,
                orders,
                stats: {
                    totalProducts: products.length,
                    totalOrders: orders.length,
                    revenue: orders.reduce((sum, order) => sum + order.total, 0)
                }
            };
        } catch (error) {
            console.error('Error loading vendor data:', error);
        }
    }

    render() {
        const { store, stats } = this.#vendorData || { store: {}, stats: {} };
        
        this.innerHTML = `
            <div class="vendor-dashboard">
                <h1>Vendor Dashboard</h1>
                
                <div class="dashboard-stats">
                    <div class="stat-card">
                        <h3>Total Products</h3>
                        <p>${stats.totalProducts || 0}</p>
                    </div>
                    <div class="stat-card">
                        <h3>Total Orders</h3>
                        <p>${stats.totalOrders || 0}</p>
                    </div>
                    <div class="stat-card">
                        <h3>Revenue</h3>
                        <p>$${(stats.revenue || 0).toFixed(2)}</p>
                    </div>
                </div>

                <div class="store-management">
                    <h2>Store Management</h2>
                    <form id="storeForm" class="store-form">
                        <input type="text" name="name" value="${store.name || ''}" placeholder="Store Name" required>
                        <textarea name="description" placeholder="Store Description">${store.description || ''}</textarea>
                        <input type="text" name="imageUrl" value="${store.image || ''}" placeholder="Store Image URL">
                        <button type="submit">Update Store</button>
                    </form>
                </div>

                <div class="product-management">
                    <h2>Product Management</h2>
                    <button id="addProductBtn" class="primary-button">Add New Product</button>
                    <div id="productsList" class="products-list"></div>
                </div>
            </div>
            <style>
                .vendor-dashboard {
                    padding: 20px;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .dashboard-stats {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                    margin: 20px 0;
                }

                .stat-card {
                    background: var(--background);
                    padding: 20px;
                    border-radius: var(--border-radius);
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    text-align: center;
                }

                .store-form {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                    max-width: 600px;
                    margin: 20px 0;
                }

                .store-form input,
                .store-form textarea {
                    padding: 10px;
                    border: 1px solid #ccc;
                    border-radius: var(--border-radius);
                }

                .primary-button {
                    background: var(--primary-accent);
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: var(--border-radius);
                    cursor: pointer;
                }

                .products-list {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 20px;
                    margin-top: 20px;
                }

                @media (max-width: 768px) {
                    .vendor-dashboard {
                        padding: 15px;
                    }
                }
            </style>
        `;
    }

    setupEventListeners() {
        this.querySelector('#storeForm')?.addEventListener('submit', this.handleStoreUpdate.bind(this));
        this.querySelector('#addProductBtn')?.addEventListener('click', this.handleAddProduct.bind(this));
        this.renderProducts();
    }

    async handleStoreUpdate(event) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);
        
        try {
            const user = AuthService.getUser();
            const storeData = {
                name: formData.get('name'),
                description: formData.get('description'),
                image: formData.get('imageUrl'),
                ownerId: user.id
            };

            if (this.#vendorData?.store?.id) {
                await db.stores.update(this.#vendorData.store.id, storeData);
            } else {
                const id = crypto.randomUUID();
                await db.stores.add({ ...storeData, id });
            }

            this.showNotification('Store updated successfully');
            await this.loadVendorData();
            this.render();
        } catch (error) {
            console.error('Error updating store:', error);
            this.showNotification('Error updating store', 'error');
        }
    }

    async handleAddProduct() {
        const productForm = document.createElement('form');
        productForm.innerHTML = `
            <h3>Add New Product</h3>
            <input type="text" name="name" placeholder="Product Name" required>
            <textarea name="description" placeholder="Product Description" required></textarea>
            <input type="number" name="price" placeholder="Price" min="0" step="0.01" required>
            <input type="number" name="stock" placeholder="Stock Quantity" min="0" required>
            <input type="text" name="imageUrl" placeholder="Product Image URL">
            <button type="submit">Add Product</button>
        `;

        // Show form in modal
        this.showModal(productForm);

        productForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(productForm);
            
            try {
                const productData = {
                    id: crypto.randomUUID(),
                    name: formData.get('name'),
                    description: formData.get('description'),
                    price: parseFloat(formData.get('price')),
                    stock: parseInt(formData.get('stock')),
                    image: formData.get('imageUrl'),
                    vendorId: this.#vendorData.store.id
                };

                await db.products.add(productData);
                this.showNotification('Product added successfully');
                await this.loadVendorData();
                this.renderProducts();
                this.closeModal();
            } catch (error) {
                console.error('Error adding product:', error);
                this.showNotification('Error adding product', 'error');
            }
        });
    }

    async renderProducts() {
        const productsList = this.querySelector('#productsList');
        if (!productsList || !this.#vendorData?.products) return;

        productsList.innerHTML = this.#vendorData.products.map(product => `
            <div class="product-card" data-id="${product.id}">
                <img src="${product.image || 'https://via.placeholder.com/150'}" alt="${product.name}">
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p>$${product.price}</p>
                    <p>Stock: ${product.stock}</p>
                    <div class="product-actions">
                        <button class="edit-product" data-id="${product.id}">Edit</button>
                        <button class="delete-product" data-id="${product.id}">Delete</button>
                    </div>
                </div>
            </div>
        `).join('');

        // Add event listeners for edit and delete buttons
        productsList.querySelectorAll('.edit-product').forEach(button => {
            button.addEventListener('click', () => this.handleEditProduct(button.dataset.id));
        });

        productsList.querySelectorAll('.delete-product').forEach(button => {
            button.addEventListener('click', () => this.handleDeleteProduct(button.dataset.id));
        });
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    showModal(content) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <button class="close-modal">&times;</button>
                <div class="modal-body"></div>
            </div>
        `;

        modal.querySelector('.modal-body').appendChild(content);
        document.body.appendChild(modal);

        modal.querySelector('.close-modal').addEventListener('click', () => this.closeModal());
    }

    closeModal() {
        const modal = document.querySelector('.modal');
        if (modal) modal.remove();
    }
}