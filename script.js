document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing form...');

    const form = document.getElementById('betriser-form');
    const submitBtn = document.querySelector('.submit-btn');
    const btnText = document.querySelector('.btn-text');
    const spinner = document.querySelector('.spinner');
    const successMessage = document.querySelector('.success-message');

    console.log('Form elements:', { form, submitBtn, btnText, spinner, successMessage });

    // Check if jQuery is loaded
    if (typeof $ === 'undefined') {
        console.error('jQuery is not loaded!');
    } else {
        console.log('jQuery is loaded, applying mask...');
        $('#whatsapp').mask('(00) 00000-0000', {
            placeholder: '(11) 99999-9999'
        });
    }

    const validators = {
        'confirm-registration': function(value) {
            if (!value) return 'Você precisa confirmar que possui cadastro na BetRiser';
            return null;
        },

        nome: function(value) {
            if (!value.trim()) return 'Nome é obrigatório';
            if (value.trim().length < 3) return 'Nome deve ter pelo menos 3 caracteres';
            if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(value)) return 'Nome deve conter apenas letras';
            return null;
        },

        email: function(value) {
            if (!value.trim()) return 'Email é obrigatório';
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) return 'Email inválido';
            return null;
        },

        telegram: function(value) {
            if (value.trim() && value.length < 5) return 'Telegram inválido';
            return null;
        },

        discord: function(value) {
            return null;
        },

        instagram: function(value) {
            if (value.trim() && value.length < 3) return 'Instagram inválido';
            return null;
        },

        whatsapp: function(value) {
            if (!value.trim()) return 'WhatsApp é obrigatório';

            const cleaned = value.replace(/\D/g, '');
            if (cleaned.length < 10 || cleaned.length > 13) {
                return 'WhatsApp deve conter DDD + número (ex: 11999999999)';
            }

            // Optimized DDD validation
            let ddd;
            if (cleaned.length <= 11) {
                ddd = cleaned.slice(0, 2);
            } else {
                ddd = cleaned.slice(2, 4);
            }

            const dddNum = parseInt(ddd);
            if (dddNum < 11 || dddNum > 99) {
                return 'DDD inválido';
            }

            return null;
        }
    };

    function showError(field, message) {
        const input = document.getElementById(field);
        if (!input) {
            console.error(`Input element not found for field: ${field}`);
            return;
        }

        let errorElement;
        if (field === 'confirm-registration') {
            // For checkbox, the error message is in the form-group (grandparent)
            errorElement = input.parentElement.parentElement.querySelector('.error-message');
        } else {
            // For other fields, the error message is in the parent
            errorElement = input.parentElement.querySelector('.error-message');
        }

        if (!errorElement) {
            console.error(`Error message element not found for field: ${field}`);
            console.error('Input parent element:', input.parentElement);
            return;
        }

        input.classList.add('error');
        input.classList.remove('success');
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }

    function showSuccess(field) {
        const input = document.getElementById(field);
        if (!input) {
            console.error(`Input element not found for field: ${field}`);
            return;
        }

        let errorElement;
        if (field === 'confirm-registration') {
            // For checkbox, the error message is in the form-group (grandparent)
            errorElement = input.parentElement.parentElement.querySelector('.error-message');
        } else {
            // For other fields, the error message is in the parent
            errorElement = input.parentElement.querySelector('.error-message');
        }

        if (!errorElement) {
            console.error(`Error message element not found for field: ${field}`);
            console.error('Input parent element:', input.parentElement);
            return;
        }

        input.classList.remove('error');
        input.classList.add('success');
        errorElement.classList.remove('show');
    }

    function validateField(field) {
        const input = document.getElementById(field);
        const value = field === 'confirm-registration' ? input.checked : input.value;
        const error = validators[field](value);

        if (error) {
            showError(field, error);
            return false;
        } else {
            showSuccess(field);
            return true;
        }
    }


    Object.keys(validators).forEach(field => {
        const input = document.getElementById(field);

        if (field === 'confirm-registration') {
            input.addEventListener('change', () => validateField(field));
        } else {
            input.addEventListener('blur', () => validateField(field));

            input.addEventListener('input', function() {
                if (this.classList.contains('error')) {
                    validateField(field);
                }
            });
        }
    });

    form.addEventListener('submit', async function(e) {
        console.log('Form submitted!');
        e.preventDefault();

        let isValid = true;
        const formData = {};

        console.log('Starting validation...');
        Object.keys(validators).forEach(field => {
            const input = document.getElementById(field);
            console.log(`Validating field: ${field}, element:`, input);

            if (!input) {
                console.error(`Input element not found for field: ${field}`);
                isValid = false;
                return;
            }

            formData[field] = field === 'confirm-registration' ? input.checked : input.value;
            console.log(`Field ${field} value:`, formData[field]);

            if (!validateField(field)) {
                console.log(`Validation failed for field: ${field}`);
                isValid = false;
            }
        });

        console.log('Validation result:', isValid);
        console.log('Form data:', formData);

        if (!isValid) {
            const firstError = document.querySelector('.input.error, input.error');
            if (firstError) {
                firstError.focus();
            }
            console.log('Form submission blocked due to validation errors');
            return;
        }

        submitBtn.disabled = true;
        btnText.style.opacity = '0';
        spinner.style.display = 'block';

        // Update loading text to show progress
        const loadingSteps = [
            'Validando seus dados...',
            'Verificando cadastro...',
            'Processando ativação...',
            'Quase pronto...'
        ];

        let currentStep = 0;
        const updateLoadingText = () => {
            if (currentStep < loadingSteps.length) {
                console.log(loadingSteps[currentStep]);
                currentStep++;
                setTimeout(updateLoadingText, 2000); // Update every 2 seconds
            }
        };
        updateLoadingText();

        try {
            console.log('Starting webhook submission...');
            const webhookUrl = 'https://n8n.hivebot.cloud/webhook/ativacao-betriser';

            const payload = {
                ...formData,
                timestamp: new Date().toISOString(),
                source: 'betriser-activation-form'
            };

            console.log('Payload to send:', payload);

            // Send to webhook and check response
            try {
                // Create AbortController for timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout

                const response = await fetch(webhookUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                console.log('Response status:', response.status);
                console.log('Response ok:', response.ok);

                if (response.ok) {
                    const responseData = await response.json();
                    console.log('Response data:', responseData);

                    // Check if user is registered
                    if (responseData.response === 'fail') {
                        // User is not registered, show error
                        submitBtn.disabled = false;
                        btnText.style.opacity = '1';
                        spinner.style.display = 'none';

                        showError('email', 'Este email não está cadastrado na plataforma BetRiser. Por favor, crie sua conta primeiro.');
                        return;
                    } else if (responseData.response === 'success') {
                        // User is registered, continue to success page
                        console.log('User validated, redirecting to success page...');
                        window.location.href = 'success.html';
                        return;
                    }
                } else {
                    // Handle HTTP error response
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            } catch (webhookError) {
                console.error('Webhook failed:', webhookError);

                // Check if it's a timeout error
                if (webhookError.name === 'AbortError') {
                    console.log('Webhook timeout, redirecting anyway...');
                    // Fallback: redirect to success page even if webhook times out
                    window.location.href = 'success.html';
                    return;
                }

                submitBtn.disabled = false;
                btnText.style.opacity = '1';
                spinner.style.display = 'none';

                // Show specific error messages based on error type
                let errorMessage = 'Não foi possível verificar seu cadastro. Por favor, tente novamente mais tarde.';
                let errorTitle = 'Erro na Conexão';

                if (webhookError.name === 'NetworkError' || webhookError.message.includes('NetworkError')) {
                    errorMessage = 'Sem conexão com a internet. Verifique sua conexão e tente novamente.';
                    errorTitle = 'Sem Conexão';
                } else if (webhookError.message.includes('Failed to fetch')) {
                    errorMessage = 'Servidor indisponível no momento. Por favor, tente novamente em alguns minutos.';
                    errorTitle = 'Servidor Indisponível';
                }

                const errorDiv = document.createElement('div');
                errorDiv.className = 'api-error-message';
                errorDiv.innerHTML = `
                    <div class="error-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div class="error-content">
                        <h3>${errorTitle}</h3>
                        <p>${errorMessage}</p>
                    </div>
                `;

                form.appendChild(errorDiv);

                // Remove error message after 5 seconds
                setTimeout(() => {
                    errorDiv.remove();
                }, 5000);

                return;
            }

        } catch (error) {
            console.error('Critical error in form submission:', error);
            console.error('Error details:', {
                name: error.name,
                message: error.message,
                stack: error.stack
            });

            // Even in case of critical error, redirect to success page
            console.log('Redirecting to success page despite error...');
            window.location.href = 'success.html';
        }
    });

    // Add global error handler
    window.addEventListener('error', function(e) {
        console.error('Global JavaScript error:', e.error);
        console.error('Error details:', {
            message: e.message,
            filename: e.filename,
            lineno: e.lineno,
            colno: e.colno,
            error: e.error
        });
    });

    // Add unhandled promise rejection handler
    window.addEventListener('unhandledrejection', function(e) {
        console.error('Unhandled promise rejection:', e.reason);
    });

    console.log('Form initialization completed successfully');

    const inputs = document.querySelectorAll('input');
    inputs.forEach((input, index) => {
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const nextInput = inputs[index + 1];
                if (nextInput) {
                    nextInput.focus();
                } else {
                    submitBtn.focus();
                }
            }
        });
    });

    const formGroups = document.querySelectorAll('.form-group');
    formGroups.forEach(group => {
        const input = group.querySelector('input');
        const label = group.querySelector('label');

        input.addEventListener('focus', () => {
            label.style.color = '#2a5298';
            label.style.transform = 'scale(1.02)';
        });

        input.addEventListener('blur', () => {
            label.style.color = '#1e3c72';
            label.style.transform = 'scale(1)';
        });
    });
});