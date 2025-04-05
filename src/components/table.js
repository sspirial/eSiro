import { db } from '../db.js';

export default class EsiroTable extends HTMLElement {
    constructor() {
        super();
        this.salesData = [];
    }

    async connectedCallback() {
        await this.loadSalesData();
        this.render();
    }

    async loadSalesData() {
        try {
            const products = await db.products.toArray();
            const orders = await db.orderItems.toArray();

            this.salesData = products.map(product => {
                const productOrders = orders.filter(order => order.productId === product.id);
                const totalSales = productOrders.reduce((sum, order) => sum + order.quantity, 0);
                const totalRevenue = productOrders.reduce((sum, order) => sum + (order.price * order.quantity), 0);
                
                return {
                    id: product.id,
                    name: product.name,
                    sales: totalSales,
                    revenue: totalRevenue
                };
            });
        } catch (error) {
            console.error('Error loading sales data:', error);
            this.salesData = [];
        }
    }

    render() {
        const totalSales = this.salesData.reduce((sum, item) => sum + item.sales, 0);
        const totalRevenue = this.salesData.reduce((sum, item) => sum + item.revenue, 0);

        this.innerHTML = `
        <div class="table-container">
            <h2>Sales Data</h2>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Product</th>
                        <th>Sales</th>
                        <th>Revenue</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.salesData.map(item => `
                        <tr>
                            <td>${item.id}</td>
                            <td>${item.name}</td>
                            <td>${item.sales}</td>
                            <td>$${item.revenue.toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="2">Total</td>
                        <td>${totalSales}</td>
                        <td>$${totalRevenue.toFixed(2)}</td>
                    </tr>
                </tfoot>
            </table>
        </div>
        <style>
            :host {
                display: block;
                width: 100%;
            }
            
            .table-container {
                max-width: 900px;
                margin: 0 auto;
                padding: 20px;
            }
            
            .data-table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
                background-color: var(--background);
                border-radius: var(--border-radius);
                overflow: hidden;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            
            .data-table th,
            .data-table td {
                padding: 12px 15px;
                text-align: left;
                border-bottom: 1px solid #eee;
            }
            
            .data-table thead tr {
                background-color: var(--primary-accent);
                color: white;
                text-transform: uppercase;
                font-size: 14px;
            }
            
            .data-table tbody tr:hover {
                background-color: rgba(0,0,0,0.02);
            }
            
            .data-table tfoot {
                font-weight: bold;
                background-color: rgba(0,0,0,0.03);
            }
            
            @media (max-width: 768px) {
                .table-container {
                    padding-bottom: calc(60px + 20px); /* Bottom nav height + padding */
                }
                
                .data-table {
                    font-size: 14px;
                    margin-bottom: 60px; /* Ensure table is visible above nav */
                }
                
                .data-table th,
                .data-table td {
                    padding: 8px 10px;
                }
            }
        </style>`;
    }
}