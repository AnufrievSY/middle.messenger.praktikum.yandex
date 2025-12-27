document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.input-form');
    if (!form) return;

    const inputs = Array.from(form.querySelectorAll('input'));

    form.addEventListener('submit', (e) => {
        let valid = true;

        inputs.forEach(input => {
            if (input.hasAttribute('required') && !input.value.trim()) {
                input.classList.add('input-error');
                valid = false;
            } else {
                input.classList.remove('input-error');
            }
        });

        const password = form.querySelector('input[name="password"]');
        const password2 = form.querySelector('input[name="repeat-password"]');

        if (password && password2) {
            if (password.value !== password2.value) {
                password.classList.add('input-error');
                password2.classList.add('input-error');
                valid = false;
            }
        }

        if (!valid) {
            e.preventDefault();
        }
    });
});
