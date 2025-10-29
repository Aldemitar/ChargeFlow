document.addEventListener('DOMContentLoaded', function () {
    // Elementos del DOM
    const passwordForm = document.getElementById('passwordForm');
    const cancelButton = document.getElementById('cancelButton');
    const passwordToggles = document.querySelectorAll('.password-toggle');
    const editProfileButton = document.querySelector('.edit-profile-button');
    const backButton = document.querySelector('.back-button');

    // Estado de visibilidad de contraseñas
    const passwordVisibility = {
        'current-password': false,
        'new-password': false,
        'confirm-password': false
    };

    // Alternar visibilidad de contraseñas
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function () {
            const targetId = this.getAttribute('data-target');
            const passwordInput = document.getElementById(targetId);
            const icon = this.querySelector('.material-symbols-outlined');

            if (passwordInput) {
                // Alternar tipo de input
                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                    icon.textContent = 'visibility';
                    passwordVisibility[targetId] = true;
                } else {
                    passwordInput.type = 'password';
                    icon.textContent = 'visibility_off';
                    passwordVisibility[targetId] = false;
                }
            }
        });
    });

    // Validación del formulario de contraseña
    passwordForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Obtener valores
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        // Validaciones
        let isValid = true;
        let errorMessage = '';

        // Limpiar estados anteriores
        clearValidationStates();

        // Validar contraseña actual
        if (!currentPassword) {
            showInputError('current-password', 'La contraseña actual es requerida');
            isValid = false;
        }

        // Validar nueva contraseña
        if (!newPassword) {
            showInputError('new-password', 'La nueva contraseña es requerida');
            isValid = false;
        } else if (newPassword.length < 8) {
            showInputError('new-password', 'La contraseña debe tener al menos 8 caracteres');
            isValid = false;
        }

        // Validar confirmación de contraseña
        if (!confirmPassword) {
            showInputError('confirm-password', 'Por favor confirma tu nueva contraseña');
            isValid = false;
        } else if (newPassword !== confirmPassword) {
            showInputError('confirm-password', 'Las contraseñas no coinciden');
            isValid = false;
        }

        // Si es válido, procesar el formulario
        if (isValid) {
            processPasswordChange(currentPassword, newPassword);
        }
    });

    // Botón cancelar
    cancelButton.addEventListener('click', function () {
        if (confirm('¿Estás seguro de que quieres cancelar? Los cambios no guardados se perderán.')) {
            passwordForm.reset();
            clearValidationStates();
        }
    });

    // Editar foto de perfil
    editProfileButton.addEventListener('click', function () {
        alert('Funcionalidad: Cambiar foto de perfil\nEn una implementación real, esto abriría un selector de archivos.');
    });

    // Botón volver
    backButton.addEventListener('click', function (e) {
        // Verificar si hay cambios sin guardar
        const hasChanges = Array.from(passwordForm.elements).some(input =>
            input.type === 'password' && input.value.trim() !== ''
        );

        if (hasChanges && !confirm('Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?')) {
            e.preventDefault();
        }
    });

    // Funciones auxiliares
    function showInputError(inputId, message) {
        const inputGroup = document.getElementById(inputId).closest('.input-group');
        inputGroup.classList.add('input-error');

        // Remover mensaje de error anterior si existe
        const existingError = inputGroup.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // Agregar nuevo mensaje de error
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        inputGroup.appendChild(errorElement);
    }

    function showInputSuccess(inputId, message) {
        const inputGroup = document.getElementById(inputId).closest('.input-group');
        inputGroup.classList.add('input-success');

        // Remover mensaje de éxito anterior si existe
        const existingSuccess = inputGroup.querySelector('.success-message');
        if (existingSuccess) {
            existingSuccess.remove();
        }

        // Agregar nuevo mensaje de éxito
        const successElement = document.createElement('div');
        successElement.className = 'success-message';
        successElement.textContent = message;
        inputGroup.appendChild(successElement);
    }

    function clearValidationStates() {
        // Limpiar clases de error/éxito
        document.querySelectorAll('.input-group').forEach(group => {
            group.classList.remove('input-error', 'input-success');
        });

        // Limpiar mensajes
        document.querySelectorAll('.error-message, .success-message').forEach(message => {
            message.remove();
        });
    }

    function processPasswordChange(currentPassword, newPassword) {
        const submitButton = passwordForm.querySelector('.primary-button');

        // Mostrar estado de carga
        submitButton.disabled = true;
        submitButton.classList.add('button-loading');

        // Simular llamada a API (2 segundos)
        setTimeout(() => {
            // Aquí normalmente enviarías los datos al servidor
            console.log('Cambiando contraseña:', {
                currentPassword,
                newPassword
            });

            // Simular respuesta exitosa
            const success = true; // En una implementación real, esto vendría del servidor

            if (success) {
                // Mostrar mensaje de éxito
                alert('¡Contraseña cambiada exitosamente!');

                // Limpiar formulario
                passwordForm.reset();
                clearValidationStates();

                // Restaurar iconos de visibilidad
                passwordToggles.forEach(toggle => {
                    const icon = toggle.querySelector('.material-symbols-outlined');
                    icon.textContent = 'visibility_off';
                });

                // Resetear estado de visibilidad
                Object.keys(passwordVisibility).forEach(key => {
                    passwordVisibility[key] = false;
                });
            } else {
                // Mostrar mensaje de error
                alert('Error al cambiar la contraseña. Por favor, verifica tu contraseña actual.');
            }

            // Restaurar botón
            submitButton.disabled = false;
            submitButton.classList.remove('button-loading');

        }, 2000);
    }

    // Validación en tiempo real
    document.querySelectorAll('.password-input').forEach(input => {
        input.addEventListener('input', function () {
            const inputGroup = this.closest('.input-group');
            inputGroup.classList.remove('input-error', 'input-success');

            // Remover mensajes
            const existingMessage = inputGroup.querySelector('.error-message, .success-message');
            if (existingMessage) {
                existingMessage.remove();
            }
        });
    });

    console.log('ChargeFlow Mi Cuenta inicializado correctamente');
});