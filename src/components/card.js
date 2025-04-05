/**
 * Base card component for displaying content in a consistent style
 * Supports various content layouts and styling options
 */
export default class EsiroCard extends HTMLElement {
    /**
     * Web Component lifecycle - called when component is added to DOM
     */
    connectedCallback() {
        this.render();
    }
    
    /**
     * Web Component lifecycle - observe these attributes
     * @returns {string[]} Attributes to watch
     */
    static get observedAttributes() {
        return ['title', 'subtitle', 'image', 'variant', 'elevation'];
    }
    
    /**
     * Web Component lifecycle - called when attributes change
     * @param {string} name - Attribute name
     * @param {string} oldValue - Previous value
     * @param {string} newValue - New value
     */
    attributeChangedCallback(name, oldValue, newValue) {
        if (this.isConnected && oldValue !== newValue) {
            this.render();
        }
    }

    /**
     * Render the card component
     */
    render() {
        const title = this.getAttribute('title') || '';
        const subtitle = this.getAttribute('subtitle') || '';
        const image = this.getAttribute('image') || '';
        const variant = this.getAttribute('variant') || 'default';
        const elevation = this.getAttribute('elevation') || '1';
        
        let content = '';
        
        // Check if card has custom content in light DOM
        if (this.innerHTML.trim() && !this.innerHTML.includes('class="card"')) {
            content = this.innerHTML;
        }
        
        this.innerHTML = `
        <div class="card card-${variant}" data-elevation="${elevation}">
            ${image ? `<div class="card-image">
                <img src="${image}" alt="${title}">
            </div>` : ''}
            
            <div class="card-content">
                ${title ? `<h3 class="card-title">${title}</h3>` : ''}
                ${subtitle ? `<p class="card-subtitle">${subtitle}</p>` : ''}
                ${content ? `<div class="card-body">${content}</div>` : ''}
                <slot></slot>
            </div>
        </div>
        <style>
            :host {
                display: block;
                margin-bottom: 20px;
            }
            
            .card {
                border-radius: var(--border-radius);
                background-color: var(--background);
                overflow: hidden;
                transition: all var(--transition-speed);
                height: 100%;
                display: flex;
                flex-direction: column;
            }
            
            .card[data-elevation="1"] {
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            
            .card[data-elevation="2"] {
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }
            
            .card[data-elevation="3"] {
                box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
            }
            
            .card:hover {
                transform: translateY(-5px);
                box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
            }
            
            .card-image {
                width: 100%;
                aspect-ratio: 16 / 9;
                overflow: hidden;
            }
            
            .card-image img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                transition: transform 0.3s ease;
            }
            
            .card:hover .card-image img {
                transform: scale(1.05);
            }
            
            .card-content {
                padding: 15px;
                display: flex;
                flex-direction: column;
                gap: 10px;
                flex-grow: 1;
            }
            
            .card-title {
                margin: 0;
                font-size: 18px;
                color: var(--text-primary);
            }
            
            .card-subtitle {
                margin: 0;
                font-size: 14px;
                color: var(--text-secondary);
            }
            
            .card-body {
                margin-top: 10px;
            }
            
            /* Variants */
            .card-outline {
                box-shadow: none;
                border: 1px solid #ddd;
            }
            
            .card-accent {
                border-left: 4px solid var(--primary-accent);
            }
            
            .card-minimal {
                box-shadow: none;
                background: transparent;
            }
            
            .card-minimal:hover {
                transform: none;
                box-shadow: none;
                background: rgba(0, 0, 0, 0.02);
            }
            
            /* Responsive */
            @media (max-width: 768px) {
                .card {
                    margin-bottom: 10px;
                }
                
                .card-content {
                    padding: 12px;
                }
            }
        </style>`;
    }
}