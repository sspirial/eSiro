import { mockStores } from '../mock-data.js';

export default class EsiroStore extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.addEventListener('click', this.handleClick.bind(this));
    }

    static get observedAttributes() {
        return ['name'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.renderDefault();
        }
    }

    connectedCallback() {
        this.renderDefault();
    }

    disconnectedCallback() {
        // Clean up event listeners
        this.removeEventListener('click', this.handleClick);
    }

    renderDefault() {
        const storeName = this.getAttribute('name');
        const store = mockStores.find(store => store.name === storeName);
        
        if (!store) {
            console.warn(`Store with name "${storeName}" not found in mock data`);
        }
        
        this.shadowRoot.innerHTML = `
            <style>
                .card {
                    padding: 16px;
                    border: 1px solid #ccc;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    cursor: pointer;
                    transition: transform 0.3s, box-shadow 0.3s;
                }
                .card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
                }
                h3 {
                    margin-top: 0;
                    margin-bottom: 8px;
                }
                p {
                    margin: 4px 0;
                    color: #666;
                }
            </style>
            <div class="card">
                <h3>${store ? store.name : 'Unknown Store'}</h3>
                <p>Location: ${store ? store.location : 'Unknown location'}</p>
                <p>Products: ${store ? store.products.length : 0} available</p>
            </div>
        `;
    }

    renderExpanded() {
        const storeName = this.getAttribute('name');
        const store = mockStores.find(store => store.name === storeName);
        
        this.shadowRoot.innerHTML = `
            <style>
                .expanded-card {
                    padding: 20px;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                }
                h2 {
                    margin-top: 0;
                    border-bottom: 1px solid #eee;
                    padding-bottom: 10px;
                }
                .info-row {
                    margin: 12px 0;
                }
                .label {
                    font-weight: bold;
                }
                button {
                    padding: 8px 16px;
                    background-color: #4299e1;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    margin-top: 16px;
                }
                button:hover {
                    background-color: #3182ce;
                }
            </style>
            <div class="expanded-card">
                <h2>${store ? store.name : 'Unknown Store'}</h2>
                <div class="info-row">
                    <span class="label">Location:</span> ${store ? store.location : 'Unknown location'}
                </div>
                <div class="info-row">
                    <span class="label">Store ID:</span> ${store ? store.id : 'N/A'}
                </div>
                <div class="info-row">
                    <span class="label">Available Products:</span> ${store ? store.products.length : 0}
                </div>
                <button id="close-btn">Close</button>
            </div>
        `;
        
        // Add event listener to close button
        this.shadowRoot.querySelector("#close-btn").addEventListener("click", (e) => {
            e.stopPropagation();
            this.collapseStore();
        });
    }

    handleClick(event) {
        if (event.target.closest('button')) {
            // If a button was clicked, let its own event handler handle it
            return;
        }
        
        if (!this.classList.contains("expanded")) {
            this.expandStore();
        }
    }

    expandStore() {
        this.classList.add("expanded");
        this.renderExpanded();
    }

    collapseStore() {
        this.classList.remove("expanded");
        this.renderDefault();
    }
}
