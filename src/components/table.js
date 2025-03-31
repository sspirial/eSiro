import { mockUsers } from '../mock-data.js';

export default class EsiroTable extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['data-type'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.render();
        }
    }

    connectedCallback() {
        this.render();
    }

    disconnectedCallback() {
        // Clean up any event listeners if added in the future
    }

    render() {
        const dataType = this.getAttribute('data-type') || 'users';
        let tableContent = '';
        
        if (dataType === 'users') {
            tableContent = this.renderUsersTable();
        } else {
            tableContent = '<p>No data available for this type</p>';
        }
        
        this.shadowRoot.innerHTML = `
            <style>
                .table-container {
                    width: 100%;
                    overflow-x: auto;
                }
                .table {
                    width: 100%;
                    border-collapse: collapse;
                    min-width: 600px;
                }
                .table th,
                .table td {
                    border: 1px solid #ccc;
                    padding: 12px;
                    text-align: left;
                }
                .table th {
                    background-color: #f5f5f5;
                    font-weight: bold;
                }
                .table tbody tr:nth-child(even) {
                    background-color: rgba(0, 0, 0, 0.02);
                }
                .table tbody tr:hover {
                    background-color: rgba(0, 0, 0, 0.05);
                }
                .badge {
                    display: inline-block;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 0.8em;
                }
                .badge-buyer {
                    background-color: #ebf8ff;
                    color: #2b6cb0;
                }
                .badge-vendor {
                    background-color: #f0fff4;
                    color: #276749;
                }
                .badge-unregistered {
                    background-color: #fff5f5;
                    color: #c53030;
                }
            </style>
            <div class="table-container">
                ${tableContent}
            </div>
        `;
    }

    renderUsersTable() {
        return `
            <table class="table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Favorite Stores</th>
                        <th>Recent Orders</th>
                    </tr>
                </thead>
                <tbody>
                    ${mockUsers.map(user => `
                        <tr>
                            <td>${user.id}</td>
                            <td>${user.name}</td>
                            <td>${user.email}</td>
                            <td>
                                <span class="badge badge-${user.role}">
                                    ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                </span>
                            </td>
                            <td>${user.favoriteStores.length}</td>
                            <td>${user.recentOrders.length}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }
}
