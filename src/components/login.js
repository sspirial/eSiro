export default class EsiroLogin extends HTMLElement {
    connectedCallback() {
        this.render();
    }

    render() {
        this.innerHTML = `
            <div class="login-container">
                <h1>Login</h1>
                <form id="login-form">
                    <div>
                        <label for="username">Username:</label>
                        <input type="text" id="username" name="username" required />
                    </div>
                    <div>
                        <label for="password">Password:</label>
                        <input type="password" id="password" name="password" required />
                    </div>
                    <button type="submit">Login</button>
                </form>
            </div>
            <style>
                .login-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    background-color: #f5f5f5;
                }
                form {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                label {
                    font-weight: bold;
                }
                input {
                    padding: 8px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                }
                button {
                    padding: 10px;
                    background-color: #007bff;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }
                button:hover {
                    background-color: #0056b3;
                }
            </style>
        `;

        this.querySelector('#login-form').addEventListener('submit', (event) => {
            event.preventDefault();
            const username = this.querySelector('#username').value;
            const password = this.querySelector('#password').value;

            // Simulate login logic
            if (username === 'admin' && password === 'password') {
                this.dispatchEvent(new CustomEvent('login-success', { bubbles: true }));
            } else {
                alert('Invalid credentials');
            }
        });
    }
}
