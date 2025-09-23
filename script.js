document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('betriser-form');
    const submitBtn = document.querySelector('.submit-btn');
    const btnText = document.querySelector('.btn-text');
    const spinner = document.querySelector('.spinner');
    const successMessage = document.querySelector('.success-message');

    $('#whatsapp').mask('(00) 00000-0000', {
        placeholder: '(11) 99999-9999'
    });

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
            if (!value.trim()) return 'Telegram é obrigatório';
            if (!value.startsWith('@')) return 'Telegram deve começar com @';
            if (value.length < 6) return 'Telegram inválido';
            return null;
        },

        discord: function(value) {
            if (!value.trim()) return 'Discord é obrigatório';
            if (!value.includes('#')) return 'Discord deve conter # e números';
            const parts = value.split('#');
            if (parts.length !== 2 || parts[1].length !== 4 || !/^\d{4}$/.test(parts[1])) {
                return 'Discord deve estar no formato: usuario#1234';
            }
            return null;
        },

        instagram: function(value) {
            if (!value.trim()) return 'Instagram é obrigatório';
            if (!value.startsWith('@')) return 'Instagram deve começar com @';
            if (value.length < 5) return 'Instagram inválido';
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
        const errorElement = input.parentElement.querySelector('.error-message');

        input.classList.add('error');
        input.classList.remove('success');
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }

    function showSuccess(field) {
        const input = document.getElementById(field);
        const errorElement = input.parentElement.querySelector('.error-message');

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
        e.preventDefault();

        let isValid = true;
        const formData = {};

        Object.keys(validators).forEach(field => {
            const input = document.getElementById(field);
            formData[field] = field === 'confirm-registration' ? input.checked : input.value;

            if (!validateField(field)) {
                isValid = false;
            }
        });

        if (!isValid) {
            const firstError = document.querySelector('.input.error, input.error');
            if (firstError) {
                firstError.focus();
            }
            return;
        }

        submitBtn.disabled = true;
        btnText.style.opacity = '0';
        spinner.style.display = 'block';

        try {
            await new Promise(resolve => setTimeout(resolve, 2000));

            form.style.display = 'none';
            successMessage.style.display = 'block';

            console.log('Dados do formulário:', formData);

        } catch (error) {
            console.error('Erro ao enviar formulário:', error);

            submitBtn.disabled = false;
            btnText.style.opacity = '1';
            spinner.style.display = 'none';

            alert('Ocorreu um erro ao enviar o formulário. Tente novamente.');
        }
    });

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