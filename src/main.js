import {
  EsiroCard,
  EsiroStore,
  EsiroProduct,
  EsiroHeader,
  EsiroNav,
  EsiroMain,
  EsiroTable,
  EsiroCart,
} from "./components/index.js";

import { mockStores, mockProducts, mockUsers } from "./mock-data.js";
import { RouterService } from "./services/router.js";

export default class EsiroNetwork extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = `
    <style>
      :root {
        /* Color Palette */
        --dark-moss: hsla(86, 24%, 28%, 1);
        --eerie-black: hsla(84, 12%, 8%, 1);
        --chamoisee: hsla(37, 39%, 43%, 1);
        --black: hsla(0, 0%, 0%, 1);
        --auburn: hsla(4, 66%, 36%, 1);

        /* Theme Variables - Light Mode */
        --background: #F4F4F4;
        --primary-accent: var(--chamoisee);
        --secondary-accent: var(--auburn);
        --success: var(--dark-moss);
        --text-primary: var(--eerie-black);
        --text-secondary: var(--black);
        --border-radius: 12px;
        --transition-speed: 0.3s;
      }

      [data-theme="dark"] {
        --background: var(--eerie-black);
        --primary-accent: var(--chamoisee);
        --secondary-accent: var(--auburn);
        --success: var(--dark-moss);
        --text-primary: #F4F4F4;
        --text-secondary: #A5A5A5;
      }

      body {
        background-color: var(--background);
        color: var(--text-primary);
        font-family: Arial, sans-serif;
        margin: 0;
        display: flex;
        flex-direction: column;
        height: 100vh;
      }
      header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px;
        border-bottom: 1px solid #ccc;
      }
      nav {
        display: flex;
        flex-direction: column;
        width: 200px;
        border-right: 1px solid #ccc;
        padding: 10px;
      }
      main {
        flex: 1;
        padding: 20px;
        overflow-y: auto;
        position: relative;  /* Add this to contain absolute positioned children */
      }
      .hidden {
        display: none;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
      }
      .card {
        background-color: var(--background);
        border: 1px solid #ccc;
        padding: 10px;
        border-radius: var(--border-radius);
        cursor: pointer;
        border-color: var(--text-secondary);
        transition: transform var(--transition-speed), box-shadow var(--transition-speed);
      }
      .card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
      .expanded {
        position: absolute;  /* Changed from fixed to absolute */
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: white;
        z-index: 100;
        padding: 20px;
        overflow-y: auto;
        border: 1px solid #ccc;  /* Optional: adds visual boundary */
        border-radius: var(--border-radius);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      }
      .table {
        width: 100%;
        border-collapse: collapse;
      }
      .table th,
      .table td {
        border: 1px solid #ccc;
        padding: 8px;
        text-align: left;
      }
      .bottom-nav {
        display: none;
      }
      @media (max-width: 768px) {
        nav {
          display: none;
        }
        .bottom-nav {
          display: flex;
          justify-content: space-around;
          border-top: 1px solid #ccc;
          padding: 10px;
          position: fixed;
          bottom: 0;
          width: 100%;
          background: white;
        }
      }

      button {
        background-color: var(--primary-accent);
        color: var(--background);
        border: none;
        transition: all var(--transition-speed);
        border-radius: var(--border-radius);
      }

      button:hover {
        background-color: var(--secondary-accent);
        filter: brightness(1.1);
      }

      input {
        border-radius: var(--border-radius);
        transition: border var(--transition-speed);
      }
    </style>
    <esiro-header></esiro-header>
    <div style="display: flex; flex: 1; overflow: hidden">
      <esiro-nav></esiro-nav>
      <esiro-main></esiro-main>
    </div>
    <div class="bottom-nav">
      <button onclick="document.querySelector('esiro-network').showSection('stores')">Stores</button>
      <button onclick="document.querySelector('esiro-network').showSection('products')">Products</button>
      <button onclick="document.querySelector('esiro-network').showSection('data')">Data</button>
      <button onclick="document.querySelector('esiro-network').showSection('cart')">Cart</button>
    </div>
    `;
  }

  showSection(section) {
    RouterService.navigateToSection(section);
    this.showMockData(section);
  }

  showMockData(section) {
    let data;
    switch (section) {
      case "stores":
        data = mockStores;
        break;
      case "products":
        data = mockProducts;
        break;
      case "data":
        data = mockUsers;
        break;
      case "cart":
        data = mockProducts; // Assuming cart contains products
        break;
      default:
        data = [];
    }
    console.log(`Showing data for ${section}:`, data);
  }
}

customElements.define("esiro-network", EsiroNetwork);
customElements.define("esiro-store", EsiroStore);
customElements.define("esiro-product", EsiroProduct);
customElements.define("esiro-header", EsiroHeader);
customElements.define("esiro-nav", EsiroNav);
customElements.define("esiro-main", EsiroMain);
customElements.define("esiro-card", EsiroCard);
customElements.define("esiro-table", EsiroTable);
customElements.define("esiro-cart", EsiroCart);
