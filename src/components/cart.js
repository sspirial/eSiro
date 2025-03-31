export default class EsiroCart extends HTMLElement {
    connectedCallback() {
        this.render();
    }

    render() {
        this.innerHTML = `<form>
            <input type="text" placeholder="Name" required>
            <input type="text" placeholder="Address" required>
            <button type="submit">Checkout</button>
        </form>`;
    }
}