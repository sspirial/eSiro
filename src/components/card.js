export default class EsiroCard extends HTMLElement {
    connectedCallback() {
        this.render();
    }

    render() {
        this.innerHTML = `<div class="card">${this.getAttribute('title') || 'Card'}</div>`;
    }
}