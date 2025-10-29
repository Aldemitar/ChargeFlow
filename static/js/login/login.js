document.addEventListener('DOMContentLoaded', function () {
  const loginForm = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const togglePassword = document.getElementById('togglePassword');
  const loginMessage = document.getElementById('loginMessage');
  const submitButton = loginForm.querySelector('button[type="submit"]');

  let isPasswordVisible = false;

  togglePassword.addEventListener('click', function () {
    isPasswordVisible = !isPasswordVisible;
    if (isPasswordVisible) {
      passwordInput.type = 'text';
      togglePassword.innerHTML = '<span class="material-symbols-outlined">visibility_off</span>';
    } else {
      passwordInput.type = 'password';
      togglePassword.innerHTML = '<span class="material-symbols-outlined">visibility</span>';
    }
  });

  loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!validateEmail(email)) {
      showMessage('Por favor, introduce un email válido.', 'error');
      return;
    }
    if (password.length < 6) {
      showMessage('La contraseña debe tener al menos 6 caracteres.', 'error');
      return;
    }

    submitButton.disabled = true;
    submitButton.classList.add('opacity-50', 'cursor-not-allowed');

    const formData = new FormData(loginForm);

    try {
      const response = await fetch('/login', {
        method: 'POST',
        body: formData,
      });

      if (response.redirected) {
        window.location.href = response.url; // ✅ Redirige al dashboard
        return;
      }

      if (!response.ok) {
        const html = await response.text();
        document.body.innerHTML = html; // Renderiza la plantilla con el error
        return;
      }

    } catch (error) {
      showMessage('Error al conectar con el servidor.', 'error');
      console.error('Error en el login:', error);
    } finally {
      submitButton.disabled = false;
      submitButton.classList.remove('opacity-50', 'cursor-not-allowed');
    }
  });

  function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function showMessage(message, type = 'info') {
    loginMessage.textContent = message;
    loginMessage.className = 'text-center text-sm mt-2';
    if (type === 'error') {
      loginMessage.classList.add('text-red-400');
    } else if (type === 'success') {
      loginMessage.classList.add('text-green-400');
    } else {
      loginMessage.classList.add('text-[#9dabb9]');
    }
  }
});
