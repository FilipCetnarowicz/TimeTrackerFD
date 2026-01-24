import { store } from './store.js';
import { initUI } from './ui.js';
import { initRouter } from './router.js';

initRouter();
// initUI();
initUI(store);

await checkAuth();

async function checkAuth() {
    const loginContainer = document.getElementById('loginContainer');
    const mainApp = document.querySelector('main');
    const aside = document.querySelector('aside');
    const header = document.querySelector('header');
    const footer = document.querySelector('footer');

    const res = await fetch('/api/auth/login', {
        credentials: 'include'
    });

    if (res.ok) {
        window.user = await res.json();
        loginContainer.hidden = true; // Ukryj okno logowania
        mainApp.hidden = false; // Pokaż główną aplikację
        aside.hidden = false;
        header.hidden = false;
        footer.hidden = false;
    } else {
        loginContainer.hidden = false; // Pokaż okno logowania
        mainApp.hidden = true; // Ukryj główną aplikację
        aside.hidden = true;
        header.hidden = true;
        footer.hidden = true;

        const loginForm = document.getElementById('loginForm');
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            const loginRes = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
                credentials: 'include',
            });

            if (loginRes.ok) {
                window.user = await loginRes.json();
                loginContainer.hidden = true; // Ukryj okno logowania
                mainApp.hidden = false; // Pokaż główną aplikację
                aside.hidden = false;
                header.hidden = false;
                footer.hidden = false;
            } else {
                alert('Invalid credentials. Please try again.');
            }
        });
    }
}