export default class EsiroTable extends HTMLElement {
    connectedCallback() {
        this.render();
    }

    render() {
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
                    <tr>
                        <td>1</td>
                        <td>Product 1</td>
                        <td>50</td>
                        <td>$999.50</td>
                    </tr>
                    <tr>
                        <td>2</td>
                        <td>Product 2</td>
                        <td>70</td>
                        <td>$1,749.30</td>
                    </tr>
                    <tr>
                        <td>3</td>
                        <td>Product 3</td>
                        <td>30</td>
                        <td>$479.70</td>
                    </tr>
                    <tr>
                        <td>4</td>
                        <td>Product 4</td>
                        <td>45</td>
                        <td>$1,349.55</td>
                    </tr>
                    <tr>
                        <td>5</td>
                        <td>Product 5</td>
                        <td>60</td>
                        <td>$2,099.40</td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="2">Total</td>
                        <td>255</td>
                        <td>$6,677.45</td>
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