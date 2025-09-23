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

            if (cleaned.length === 10) {
                const ddd = cleaned.slice(0, 2);
                if (parseInt(ddd) < 11 || parseInt(ddd) > 99) {
                    return 'DDD inválido';
                }
            } else if (cleaned.length === 11) {
                const ddd = cleaned.slice(0, 2);
                if (parseInt(ddd) < 11 || parseInt(ddd) > 99) {
                    return 'DDD inválido';
                }
            } else if (cleaned.length === 12) {
                const ddd = cleaned.slice(2, 4);
                if (parseInt(ddd) < 11 || parseInt(ddd) > 99) {
                    return 'DDD inválido';
                }
            } else if (cleaned.length === 13) {
                const ddd = cleaned.slice(2, 4);
                if (parseInt(ddd) < 11 || parseInt(ddd) > 99) {
                    return 'DDD inválido';
                }
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

        const errorElement = input.parentElement.querySelector('.error-message');
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

        const errorElement = input.parentElement.querySelector('.error-message');
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

        try {
            console.log('Starting webhook submission...');
            const webhookUrl = 'https://n8n.hivebot.cloud/webhook/ativacao-betriser';

            const payload = {
                ...formData,
                timestamp: new Date().toISOString(),
                source: 'betriser-activation-form'
            };

            console.log('Payload to send:', payload);

            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const responseData = await response.json();
            console.log('Response data:', responseData);

            form.style.display = 'none';
            successMessage.style.display = 'block';

            console.log('Formulário enviado com sucesso:', responseData);

        } catch (error) {
            console.error('Erro ao enviar formulário:', error);
            console.error('Error details:', {
                name: error.name,
                message: error.message,
                stack: error.stack
            });

            submitBtn.disabled = false;
            btnText.style.opacity = '1';
            spinner.style.display = 'none';

            let errorMessage = 'Ocorreu um erro ao enviar o formulário. Tente novamente.';

            if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
            } else if (error.message.includes('HTTP error! status:')) {
                errorMessage = 'Erro no servidor. Tente novamente em alguns instantes.';
            }

            console.log('Showing error message:', errorMessage);
            alert(errorMessage);
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