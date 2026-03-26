document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    const snackbar = document.getElementById('snackbar');
    const loginBox = document.querySelector('.login-box');

    // Load and Apply Theme (Initialization Only)
    const currentTheme = localStorage.getItem('theme') || 'light';
    if (currentTheme === 'dark') {
        document.body.classList.remove('light-theme');
        document.body.classList.add('dark-theme');
    }

    // Toggle Password Visibility
    if (togglePassword) {
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);

            // Toggle icon
            togglePassword.classList.toggle('fa-eye');
            togglePassword.classList.toggle('fa-eye-slash');
        });
    }

    // Function to show snackbar (Standardized Professional Style)
    function showSnackbar(message, type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        const duration = 3000;
        snackbar.innerHTML = `
            <i class="fas ${icons[type] || 'fa-info-circle'} snackbar-icon"></i>
            <span class="snackbar-message">${message}</span>
            <div class="snackbar-progress" style="animation-duration: ${duration}ms"></div>
        `;
        snackbar.className = `snackbar snackbar-${type}`;

        // Use a small delay for CSS transition
        setTimeout(() => snackbar.classList.add('show'), 10);

        setTimeout(() => {
            snackbar.classList.remove('show');
        }, duration);
    }

    // Form Submission
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const username = document.getElementById('username').value;
            const password = passwordInput.value;
            const submitBtn = loginForm.querySelector('.btn-login');

            // Start loading
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';

            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (response.ok) {
                    showSnackbar(data.message, 'success');

                    // Success animation
                    loginBox.style.transform = 'scale(1.02)';
                    setTimeout(() => {
                        loginBox.style.transform = 'scale(1)';
                        // Redirect to dashboard
                        window.location.href = '/inicio';
                    }, 1000);
                } else {
                    showSnackbar(data.message, 'error');

                    // Shake animation for error
                    loginBox.animate([
                        { transform: 'translateX(0)' },
                        { transform: 'translateX(-10px)' },
                        { transform: 'translateX(10px)' },
                        { transform: 'translateX(-10px)' },
                        { transform: 'translateX(10px)' },
                        { transform: 'translateX(0)' }
                    ], { duration: 400 });
                }
            } catch (error) {
                showSnackbar('Erro ao conectar com o servidor.', 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Entrar';
            }
        });
    }
});
