import { db } from '../db.js';
import { AuthService } from '../services/auth.js';

/**
 * Table component for displaying structured data
 * Supports sorting, filtering, and different data sources
 */
export default class EsiroTable extends HTMLElement {
    /**
     * Data to be displayed in the table
     * @type {Array}
     */
    #data = [];
    
    /**
     * Current sort configuration
     * @type {Object}
     */
    #sortConfig = {
        key: null,
        direction: 'asc'
    };
    
    /**
     * Current data source
     * @type {string}
     */
    #dataSource = 'sales';
    
    /**
     * Current filter value
     * @type {string}
     */
    #filterValue = '';

    constructor() {
        super();
    }

    /**
     * Web Component lifecycle - called when component is added to DOM
     */
    async connectedCallback() {
        this.#dataSource = this.getAttribute('data-source') || 'sales';
        await this.loadData();
        this.render();
    }
    
    /**
     * Web Component lifecycle - observe these attributes
     * @returns {string[]} Attributes to watch
     */
    static get observedAttributes() {
        return ['data-source'];
    }
    
    /**
     * Web Component lifecycle - called when attributes change
     * @param {string} name - Attribute name
     * @param {string} oldValue - Previous value
     * @param {string} newValue - New value
     */
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'data-source' && oldValue !== newValue && this.isConnected) {
            this.#dataSource = newValue;
            this.loadData().then(() => this.render());
        }
    }

    /**
     * Load data based on selected data source
     */
    async loadData() {
        try {
            switch (this.#dataSource) {
                case 'sales':
                    await this.loadSalesData();
                    break;
                case 'inventory':
                    await this.loadInventoryData();
                    break;
                case 'customers':
                    await this.loadCustomerData();
                    break;
                default:
                    await this.loadSalesData();
            }
        } catch (error) {
            console.error(`Error loading ${this.#dataSource} data:`, error);
            this.#data = [];
        }
    }

    /**
     * Load sales data from the database
     * @private
     */
    async loadSalesData() {
        try {
            await db.open();
            
            // Get current user for permission check
            const currentUser = AuthService.getUser();
            const isVendor = currentUser?.role === 'vendor';
            const vendorId = isVendor ? currentUser.id : null;
            
            // Get products and order items
            let products = await db.products.toArray();
            const orders = await db.orderItems.toArray();
            
            // Filter by vendor if user is a vendor
            if (isVendor && vendorId) {
                products = products.filter(product => product.vendorId === vendorId);
            }

            // Generate sales data
            this.#data = products.map(product => {
                const productOrders = orders.filter(order => order.productId === product.id);
                const totalSales = productOrders.reduce((sum, order) => sum + order.quantity, 0);
                const totalRevenue = productOrders.reduce((sum, order) => sum + (order.price * order.quantity), 0);
                
                return {
                    id: product.id,
                    name: product.name,
                    vendor: product.vendorId,
                    sales: totalSales,
                    revenue: totalRevenue,
                    averagePrice: totalSales > 0 ? totalRevenue / totalSales : product.price
                };
            });
            
            // Filter out products with no sales if filtered view is selected
            if (this.#filterValue === 'withSales') {
                this.#data = this.#data.filter(item => item.sales > 0);
            }
        } catch (error) {
            console.error('Error loading sales data:', error);
            this.#data = [];
        }
    }
    
    /**
     * Load inventory data from the database
     * @private
     */
    async loadInventoryData() {
        try {
            await db.open();
            
            // Get current user for permission check
            const currentUser = AuthService.getUser();
            const isVendor = currentUser?.role === 'vendor';
            const vendorId = isVendor ? currentUser.id : null;
            
            // Get products
            let products = await db.products.toArray();
            
            // Filter by vendor if user is a vendor
            if (isVendor && vendorId) {
                products = products.filter(product => product.vendorId === vendorId);
            }
            
            // Get stores for vendor names
            const stores = await db.stores.toArray();
            const storeMap = new Map(stores.map(store => [store.id, store]));
            
            // Generate inventory data
            this.#data = products.map(product => {
                const store = storeMap.get(product.vendorId);
                return {
                    id: product.id,
                    name: product.name,
                    vendor: store ? store.name : 'Unknown Vendor',
                    stock: product.stock || 0,
                    price: product.price,
                    value: (product.stock || 0) * product.price,
                    status: this.getStockStatus(product.stock || 0)
                };
            });
            
            // Apply filter if needed
            if (this.#filterValue === 'lowStock') {
                this.#data = this.#data.filter(item => item.stock < 10);
            }
        } catch (error) {
            console.error('Error loading inventory data:', error);
            this.#data = [];
        }
    }
    
    /**
     * Get stock status label based on quantity
     * @param {number} stock - Stock quantity
     * @returns {string} Status label
     * @private
     */
    getStockStatus(stock) {
        if (stock <= 0) return 'Out of Stock';
        if (stock < 5) return 'Critical';
        if (stock < 10) return 'Low';
        return 'In Stock';
    }
    
    /**
     * Load customer data from the database
     * @private
     */
    async loadCustomerData() {
        try {
            await db.open();
            
            // Check if user has admin role
            const currentUser = AuthService.getUser();
            if (currentUser?.role !== 'admin') {
                this.#data = [];
                return;
            }
            
            // Get users, orders, and order items
            const users = await db.users.where('role').equals('buyer').toArray();
            const orders = await db.orders.toArray();
            const orderItems = await db.orderItems.toArray();
            
            // Generate customer data
            this.#data = users.map(user => {
                const userOrders = orders.filter(order => order.userId === user.id);
                const totalOrders = userOrders.length;
                const totalSpent = userOrders.reduce((sum, order) => sum + (order.total || 0), 0);
                
                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    orders: totalOrders,
                    spent: totalSpent,
                    lastOrder: userOrders.length > 0 
                        ? new Date(Math.max(...userOrders.map(o => new Date(o.date).getTime())))
                            .toLocaleDateString() 
                        : 'Never'
                };
            });
        } catch (error) {
            console.error('Error loading customer data:', error);
            this.#data = [];
        }
    }
    
    /**
     * Sort data by specified key
     * @param {string} key - Key to sort by
     * @private
     */
    sortData(key) {
        // Toggle sort direction if sorting by the same key
        if (this.#sortConfig.key === key) {
            this.#sortConfig.direction = this.#sortConfig.direction === 'asc' ? 'desc' : 'asc';
        } else {
            this.#sortConfig.key = key;
            this.#sortConfig.direction = 'asc';
        }
        
        // Sort the data
        this.#data.sort((a, b) => {
            let valueA = a[key];
            let valueB = b[key];
            
            // Handle string comparison
            if (typeof valueA === 'string' && typeof valueB === 'string') {
                return this.#sortConfig.direction === 'asc' 
                    ? valueA.localeCompare(valueB)
                    : valueB.localeCompare(valueA);
            }
            
            // Handle number comparison
            return this.#sortConfig.direction === 'asc' 
                ? valueA - valueB
                : valueB - valueA;
        });
        
        this.render();
    }
    
    /**
     * Handle filter change
     * @param {string} value - Filter value
     * @private
     */
    applyFilter(value) {
        this.#filterValue = value;
        this.loadData().then(() => this.render());
    }

    /**
     * Render the table component
     */
    render() {
        // Define table headers based on data source
        const headers = this.getTableHeaders();
        
        // Calculate totals for footer
        const totals = this.calculateTotals();
        
        this.innerHTML = `
        <div class="table-container">
            <div class="table-header">
                <h2>${this.getTableTitle()}</h2>
                <div class="table-actions">
                    ${this.renderDataSourceSelector()}
                    ${this.renderFilterSelector()}
                </div>
            </div>
            
            ${this.#data.length === 0 ? this.renderEmptyState() : ''}
            
            ${this.#data.length > 0 ? `
            <div class="table-scroll">
                <table class="data-table">
                    <thead>
                        <tr>
                            ${headers.map(header => `
                                <th data-sort="${header.key}" class="${this.#sortConfig.key === header.key ? 'sorted-' + this.#sortConfig.direction : ''}">
                                    ${header.label}
                                    <span class="sort-icon">${this.getSortIcon(header.key)}</span>
                                </th>
                            `).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${this.renderTableRows(headers)}
                    </tbody>
                    <tfoot>
                        <tr>
                            ${this.renderTableFooter(headers, totals)}
                        </tr>
                    </tfoot>
                </table>
            </div>
            ` : ''}
        </div>
        <style>
            :host {
                display: block;
                width: 100%;
            }
            
            .table-container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 20px;
            }
            
            .table-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
                gap: 15px;
                margin-bottom: 20px;
            }
            
            .table-actions {
                display: flex;
                gap: 10px;
                align-items: center;
            }
            
            .data-source-selector, .filter-selector {
                padding: 8px 12px;
                border: 1px solid #ddd;
                border-radius: var(--border-radius);
                background-color: var(--background);
            }
            
            .table-scroll {
                overflow-x: auto;
                border-radius: var(--border-radius);
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            
            .data-table {
                width: 100%;
                border-collapse: collapse;
                background-color: var(--background);
                border-radius: var(--border-radius);
            }
            
            .data-table th,
            .data-table td {
                padding: 12px 15px;
                text-align: left;
                border-bottom: 1px solid #eee;
            }
            
            .data-table th {
                position: relative;
                cursor: pointer;
                user-select: none;
                white-space: nowrap;
            }
            
            .data-table th:hover {
                background-color: rgba(0,0,0,0.05);
            }
            
            .sort-icon {
                margin-left: 5px;
                font-size: 12px;
            }
            
            .data-table thead tr {
                background-color: var(--primary-accent);
                color: white;
                text-transform: uppercase;
                font-size: 14px;
            }
            
            .data-table tbody tr:hover {
                background-color: rgba(0,0,0,0.03);
            }
            
            .data-table tfoot {
                font-weight: bold;
                background-color: rgba(0,0,0,0.03);
            }
            
            .sorted-asc, .sorted-desc {
                background-color: rgba(255,255,255,0.2);
            }
            
            .empty-state {
                padding: 40px;
                text-align: center;
                background-color: var(--background);
                border-radius: var(--border-radius);
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            
            .status-pill {
                display: inline-block;
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: bold;
                text-transform: uppercase;
            }
            
            .status-in-stock {
                background-color: #e6f7ed;
                color: #0d6832;
            }
            
            .status-low {
                background-color: #fff8e6;
                color: #b86e00;
            }
            
            .status-critical {
                background-color: #ffe6e6;
                color: #c92a2a;
            }
            
            .status-out-of-stock {
                background-color: #f0f0f0;
                color: #666;
            }
            
            @media (max-width: 768px) {
                .table-container {
                    padding-bottom: calc(60px + 20px); /* Bottom nav height + padding */
                }
                
                .table-header {
                    flex-direction: column;
                    align-items: flex-start;
                }
                
                .data-table {
                    font-size: 14px;
                }
                
                .data-table th,
                .data-table td {
                    padding: 8px 10px;
                }
            }
        </style>`;
        
        this.setupEventListeners();
    }
    
    /**
     * Set up event listeners for table interactions
     * @private
     */
    setupEventListeners() {
        // Sort header click handlers
        const sortHeaders = this.querySelectorAll('th[data-sort]');
        sortHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const sortKey = header.dataset.sort;
                this.sortData(sortKey);
            });
        });
        
        // Data source selector
        const dataSourceSelector = this.querySelector('.data-source-selector');
        if (dataSourceSelector) {
            dataSourceSelector.addEventListener('change', (e) => {
                this.#dataSource = e.target.value;
                this.#sortConfig = { key: null, direction: 'asc' };
                this.#filterValue = '';
                this.loadData().then(() => this.render());
            });
        }
        
        // Filter selector
        const filterSelector = this.querySelector('.filter-selector');
        if (filterSelector) {
            filterSelector.addEventListener('change', (e) => {
                this.applyFilter(e.target.value);
            });
        }
    }
    
    /**
     * Get table headers based on current data source
     * @returns {Array} Table headers
     * @private
     */
    getTableHeaders() {
        switch (this.#dataSource) {
            case 'sales':
                return [
                    { key: 'id', label: 'ID' },
                    { key: 'name', label: 'Product' },
                    { key: 'sales', label: 'Units Sold' },
                    { key: 'revenue', label: 'Revenue' },
                    { key: 'averagePrice', label: 'Avg. Price' }
                ];
            case 'inventory':
                return [
                    { key: 'id', label: 'ID' },
                    { key: 'name', label: 'Product' },
                    { key: 'vendor', label: 'Vendor' },
                    { key: 'stock', label: 'Stock' },
                    { key: 'price', label: 'Price' },
                    { key: 'value', label: 'Value' },
                    { key: 'status', label: 'Status' }
                ];
            case 'customers':
                return [
                    { key: 'id', label: 'ID' },
                    { key: 'name', label: 'Customer' },
                    { key: 'email', label: 'Email' },
                    { key: 'orders', label: 'Orders' },
                    { key: 'spent', label: 'Total Spent' },
                    { key: 'lastOrder', label: 'Last Order' }
                ];
            default:
                return [
                    { key: 'id', label: 'ID' },
                    { key: 'name', label: 'Item' }
                ];
        }
    }
    
    /**
     * Get table title based on current data source
     * @returns {string} Table title
     * @private
     */
    getTableTitle() {
        switch (this.#dataSource) {
            case 'sales': return 'Sales Data';
            case 'inventory': return 'Inventory Status';
            case 'customers': return 'Customer Analytics';
            default: return 'Data Table';
        }
    }
    
    /**
     * Calculate totals for table footer
     * @returns {Object} Totals object
     * @private
     */
    calculateTotals() {
        switch (this.#dataSource) {
            case 'sales':
                return {
                    sales: this.#data.reduce((sum, item) => sum + item.sales, 0),
                    revenue: this.#data.reduce((sum, item) => sum + item.revenue, 0),
                    averagePrice: this.#data.length > 0 
                        ? this.#data.reduce((sum, item) => sum + item.revenue, 0) / 
                          this.#data.reduce((sum, item) => sum + item.sales, 0)
                        : 0
                };
            case 'inventory':
                return {
                    stock: this.#data.reduce((sum, item) => sum + item.stock, 0),
                    value: this.#data.reduce((sum, item) => sum + item.value, 0)
                };
            case 'customers':
                return {
                    orders: this.#data.reduce((sum, item) => sum + item.orders, 0),
                    spent: this.#data.reduce((sum, item) => sum + item.spent, 0)
                };
            default:
                return {};
        }
    }
    
    /**
     * Render table rows based on current data
     * @param {Array} headers - Table headers
     * @returns {string} HTML for table rows
     * @private
     */
    renderTableRows(headers) {
        return this.#data.map(item => `
            <tr>
                ${headers.map(header => {
                    const value = item[header.key];
                    
                    // Format based on header key and value type
                    if (header.key === 'revenue' || header.key === 'price' || 
                        header.key === 'value' || header.key === 'spent' || 
                        header.key === 'averagePrice') {
                        return `<td>$${typeof value === 'number' ? value.toFixed(2) : '0.00'}</td>`;
                    }
                    
                    if (header.key === 'status') {
                        const statusClass = value.toLowerCase().replace(/\s+/g, '-');
                        return `<td><span class="status-pill status-${statusClass}">${value}</span></td>`;
                    }
                    
                    return `<td>${value !== undefined ? value : ''}</td>`;
                }).join('')}
            </tr>
        `).join('');
    }
    
    /**
     * Render table footer with totals
     * @param {Array} headers - Table headers
     * @param {Object} totals - Calculated totals
     * @returns {string} HTML for table footer
     * @private
     */
    renderTableFooter(headers, totals) {
        switch (this.#dataSource) {
            case 'sales':
                return `
                    <td colspan="2">Total</td>
                    <td>${totals.sales}</td>
                    <td>$${totals.revenue.toFixed(2)}</td>
                    <td>$${(totals.averagePrice || 0).toFixed(2)}</td>
                `;
            case 'inventory':
                return `
                    <td colspan="3">Total</td>
                    <td>${totals.stock}</td>
                    <td></td>
                    <td>$${totals.value.toFixed(2)}</td>
                    <td></td>
                `;
            case 'customers':
                return `
                    <td colspan="3">Total</td>
                    <td>${totals.orders}</td>
                    <td>$${totals.spent.toFixed(2)}</td>
                    <td></td>
                `;
            default:
                return `<td colspan="${headers.length}">Total: ${this.#data.length} items</td>`;
        }
    }
    
    /**
     * Render data source selector
     * @returns {string} HTML for data source selector
     * @private
     */
    renderDataSourceSelector() {
        // Only show selector to admins and vendors
        const currentUser = AuthService.getUser();
        if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'vendor')) {
            return '';
        }
        
        return `
            <select class="data-source-selector" aria-label="Select data view">
                <option value="sales" ${this.#dataSource === 'sales' ? 'selected' : ''}>Sales</option>
                <option value="inventory" ${this.#dataSource === 'inventory' ? 'selected' : ''}>Inventory</option>
                ${currentUser.role === 'admin' ? 
                    `<option value="customers" ${this.#dataSource === 'customers' ? 'selected' : ''}>Customers</option>` 
                    : ''}
            </select>
        `;
    }
    
    /**
     * Render filter selector based on current data source
     * @returns {string} HTML for filter selector
     * @private
     */
    renderFilterSelector() {
        switch (this.#dataSource) {
            case 'sales':
                return `
                    <select class="filter-selector" aria-label="Filter sales data">
                        <option value="" ${this.#filterValue === '' ? 'selected' : ''}>All Products</option>
                        <option value="withSales" ${this.#filterValue === 'withSales' ? 'selected' : ''}>With Sales Only</option>
                    </select>
                `;
            case 'inventory':
                return `
                    <select class="filter-selector" aria-label="Filter inventory data">
                        <option value="" ${this.#filterValue === '' ? 'selected' : ''}>All Stock</option>
                        <option value="lowStock" ${this.#filterValue === 'lowStock' ? 'selected' : ''}>Low Stock</option>
                    </select>
                `;
            default:
                return '';
        }
    }
    
    /**
     * Render empty state message
     * @returns {string} HTML for empty state
     * @private
     */
    renderEmptyState() {
        return `
            <div class="empty-state">
                <h3>No data available</h3>
                <p>There are no records to display for the selected view.</p>
            </div>
        `;
    }
    
    /**
     * Get sort icon based on current sort configuration
     * @param {string} key - Column key
     * @returns {string} Sort icon
     * @private
     */
    getSortIcon(key) {
        if (this.#sortConfig.key !== key) {
            return '⇵';
        }
        return this.#sortConfig.direction === 'asc' ? '↑' : '↓';
    }
}