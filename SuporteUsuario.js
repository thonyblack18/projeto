/* ============================================
   ARQUIVO: script.js
   PROJETO: Velora - Plataforma de Games Indies
   ============================================ */

// ==================== CONFIGURAÇÃO INICIAL ====================
document.addEventListener('DOMContentLoaded', () => {
    initializeSearchFunctionality();
    initializeCategoryCards();
    initializeContactButton();
    initializeAnimations();
});

// ==================== FUNCIONALIDADE DE PESQUISA ====================
function initializeSearchFunctionality() {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    
    // Evento de clique no botão de pesquisa
    searchButton.addEventListener('click', () => {
        performSearch(searchInput.value);
    });
    
    // Evento de pressionar Enter no campo de pesquisa
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch(searchInput.value);
        }
    });
    
    // Adiciona efeito visual ao digitar
    searchInput.addEventListener('input', (e) => {
        if (e.target.value.length > 0) {
            searchButton.style.transform = 'translateY(-50%) scale(1.05)';
        } else {
            searchButton.style.transform = 'translateY(-50%) scale(1)';
        }
    });
}

function performSearch(query) {
    if (!query.trim()) {
        showNotification('Por favor, digite algo para pesquisar', 'warning');
        return;
    }
    
    console.log('Pesquisando por:', query);
    showNotification(`Pesquisando por: "${query}"`, 'info');
    
    // INTEGRAÇÃO: Aqui você conectaria com sua API de pesquisa
    // Exemplo:
    // fetch(`/api/search?q=${encodeURIComponent(query)}`)
    //     .then(response => response.json())
    //     .then(data => displaySearchResults(data))
    //     .catch(error => console.error('Erro na pesquisa:', error));
}

// ==================== FUNCIONALIDADE DOS CARDS ====================
function initializeCategoryCards() {
    const categoryCards = document.querySelectorAll('.category-card');
    
    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            const category = card.getAttribute('data-category');
            handleCategoryClick(category);
        });
        
        // Efeito de hover com som (opcional)
        card.addEventListener('mouseenter', () => {
            card.style.zIndex = '10';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.zIndex = '1';
        });
    });
}

function handleCategoryClick(category) {
    console.log('Categoria clicada:', category);
    
    // REDIRECIONAMENTO PARA PÁGINA DE FAQ
    // Redireciona para a página FAQ com a categoria específica
    window.location.href = `faq.html?categoria=${category}`;
    
    // ALTERNATIVA: Se as páginas estiverem em diretórios diferentes, ajuste o caminho:
    // window.location.href = `/suporte/faq.html?categoria=${category}`;
    // window.location.href = `../pages/faq.html?categoria=${category}`;
}

function getCategoryName(category) {
    const categoryNames = {
        'conta': 'Conta e Segurança',
        'desenvolvedores': 'Para Desenvolvedores',
        'apoio': 'Apoio e Doações',
        'catalogo': 'Catálogo de Jogos',
        'comunidade': 'Comunidade',
        'problemas': 'Problemas Técnicos'
    };
    return categoryNames[category] || category;
}

// ==================== BOTÃO DE CONTATO ====================
function initializeContactButton() {
    const contactButton = document.querySelector('.contact-button');
    
    contactButton.addEventListener('click', () => {
        handleContactClick();
    });
}

function handleContactClick() {
    // REDIRECIONAMENTO PARA PÁGINA DE FAQ
    // Redireciona para a página FAQ sem categoria específica
    window.location.href = 'faq.html';
    
    // ALTERNATIVA: Redirecionar para formulário de contato
    // window.location.href = '/contato';
    
    // ALTERNATIVA: Abrir modal de contato
    // openContactModal();
}

// ==================== SISTEMA DE NOTIFICAÇÕES ====================
function showNotification(message, type = 'info') {
    // Remove notificação anterior se existir
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Cria nova notificação
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Estilo da notificação
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '16px 24px',
        borderRadius: '12px',
        backgroundColor: getNotificationColor(type),
        color: '#FFFFFF',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        zIndex: '9999',
        fontWeight: '500',
        fontSize: '0.95rem',
        maxWidth: '400px',
        animation: 'slideIn 0.3s ease-out',
        backdropFilter: 'blur(10px)'
    });
    
    document.body.appendChild(notification);
    
    // Remove após 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function getNotificationColor(type) {
    const colors = {
        'info': 'rgba(212, 175, 55, 0.95)',
        'success': 'rgba(76, 175, 80, 0.95)',
        'warning': 'rgba(255, 152, 0, 0.95)',
        'error': 'rgba(244, 67, 54, 0.95)'
    };
    return colors[type] || colors.info;
}

// ==================== ANIMAÇÕES E EFEITOS ====================
function initializeAnimations() {
    // Adiciona animações de entrada
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
    
    // Anima elementos ao carregar
    animateOnScroll();
}

function animateOnScroll() {
    const cards = document.querySelectorAll('.category-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.animation = 'fadeInUp 0.6s ease-out forwards';
                    entry.target.style.opacity = '1';
                }, index * 100);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });
    
    cards.forEach(card => {
        card.style.opacity = '0';
        observer.observe(card);
    });
}

// ==================== FUNÇÕES AUXILIARES ====================

// Função para validar formulários (útil para expansão futura)
function validateForm(formData) {
    const errors = [];
    
    if (!formData.email || !formData.email.includes('@')) {
        errors.push('Email inválido');
    }
    
    if (!formData.message || formData.message.trim().length < 10) {
        errors.push('Mensagem muito curta (mínimo 10 caracteres)');
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

// Função para debounce (útil para pesquisa ao digitar)
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Função para fazer scroll suave
function smoothScrollTo(element) {
    element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

// ==================== EVENTOS GLOBAIS ====================

// Previne comportamento padrão em alguns elementos
document.addEventListener('click', (e) => {
    // Adicione lógica global de cliques aqui se necessário
});

// Log de erros para debug
window.addEventListener('error', (e) => {
    console.error('Erro capturado:', e.error);
});

// ==================== EXPORTS (para módulos futuros) ====================
// Se você estiver usando módulos ES6, pode exportar funções:
// export { performSearch, handleCategoryClick, showNotification };

console.log('🎮 Velora Support Page - JavaScript carregado com sucesso!');