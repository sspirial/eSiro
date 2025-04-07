import { db } from '../db.js';

export const AuthService = {
    async login(email, password) {
        const user = await db.users.get({ email, password });
        if (!user) {
            throw new Error('Invalid email or password');
        }

        // Check if the user has already selected a role
        if (!user.role) {
            const role = await this.promptUserRole();
            await db.users.update(user.id, { role });
            user.role = role;
        }

        // Store user session
        sessionStorage.setItem('user', JSON.stringify(user));

        // Redirect based on role
        if (user.role === 'vendor') {
            window.location.href = '/vendor-dashboard';
        } else {
            window.location.href = '/';
        }
    },

    async promptUserRole() {
        return new Promise((resolve) => {
            const roleSelectionModal = document.createElement('div');
            roleSelectionModal.innerHTML = `
                <div class="role-selection-modal">
                    <h2>Select Your Role</h2>
                    <button id="vendor-role">Vendor</button>
                    <button id="buyer-role">Buyer</button>
                </div>
                <style>
                    .role-selection-modal {
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        background: white;
                        padding: 20px;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                        z-index: 1000;
                        text-align: center;
                    }
                    .role-selection-modal button {
                        margin: 10px;
                        padding: 10px 20px;
                        font-size: 16px;
                        cursor: pointer;
                    }
                </style>
            `;

            document.body.appendChild(roleSelectionModal);

            roleSelectionModal.querySelector('#vendor-role').addEventListener('click', () => {
                document.body.removeChild(roleSelectionModal);
                resolve('vendor');
            });

            roleSelectionModal.querySelector('#buyer-role').addEventListener('click', () => {
                document.body.removeChild(roleSelectionModal);
                resolve('buyer');
            });
        });
    },

    isLoggedIn() {
        return !!sessionStorage.getItem('user');
    },

    getUser() {
        return JSON.parse(sessionStorage.getItem('user'));
    },

    async logout() {
        sessionStorage.removeItem('user');
        window.location.href = '/';
    }
};
