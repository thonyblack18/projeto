/* ============================================
   ARQUIVO: faq-script.js
   PROJETO: Velora - Funcionalidades da FAQ
   ============================================ */

// ==================== INICIALIZAÇÃO ====================
document.addEventListener('DOMContentLoaded', () => {
    initializeTabs();
    initializeFaqItems();
    initializeSearch();
    initializeHelpButtons();
    loadCategoryFromURL();
});

// ==================== GERENCIAMENTO DE TABS ====================
function initializeTabs() {
    const tabs = document.querySelectorAll('.tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const category = tab.getAttribute('data-category');
            switchCategory(category);
            
            // Atualiza URL sem recarregar página
            updateURL(category);
        });
    });
}

function switchCategory(category) {
    // Remove classe active de todas as tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Adiciona classe active na tab clicada
    const activeTab = document.querySelector(`.tab[data-category="${category}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    // Esconde todas as seções
    document.querySelectorAll('.faq-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Mostra a seção correspondente
    const activeSection = document.querySelector(`.faq-section[data-category="${category}"]`);
    if (activeSection) {
        activeSection.classList.add('active');
    }
    
    // Fecha todos os FAQs abertos ao trocar de categoria
    closeAllFaqItems();
    
    // Scroll suave para o topo do conteúdo
    window.scrollTo({
        top: 300,
        behavior: 'smooth'
    });
    
    // Limpa busca ao trocar categoria
    const searchInput = document.getElementById('faqSearch');
    if (searchInput) {
        searchInput.value = '';
        resetSearch();
    }
}

// ==================== ACORDEÃO FAQ ====================
function initializeFaqItems() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const faqItem = question.parentElement;
            const isActive = faqItem.classList.contains('active');
            
            // Fecha todos os outros items (comportamento acordeão)
            // Para permitir múltiplos abertos, comente as linhas abaixo
            const allItems = faqItem.parentElement.querySelectorAll('.faq-item');
            allItems.forEach(item => {
                if (item !== faqItem) {
                    item.classList.remove('active');
                }
            });
            
            // Toggle do item clicado
            if (isActive) {
                faqItem.classList.remove('active');
            } else {
                faqItem.classList.add('active');
                
                // Analytics - registra qual pergunta foi aberta
                trackFaqView(question.querySelector('h3').textContent);
            }
        });
    });
}

function closeAllFaqItems() {
    document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
    });
}

// ==================== SISTEMA DE BUSCA ====================
function initializeSearch() {
    const searchInput = document.getElementById('faqSearch');
    
    if (!searchInput) return;
    
    // Debounce para melhor performance
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            performFaqSearch(e.target.value);
        }, 300);
    });
}

function performFaqSearch(query) {
    const searchTerm = query.toLowerCase().trim();
    
    // Pega a seção ativa
    const activeSection = document.querySelector('.faq-section.active');
    if (!activeSection) return;
    
    const faqItems = activeSection.querySelectorAll('.faq-item');
    let visibleCount = 0;
    
    if (searchTerm === '') {
        resetSearch();
        return;
    }
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question h3').textContent.toLowerCase();
        const answer = item.querySelector('.faq-answer').textContent.toLowerCase();
        
        if (question.includes(searchTerm) || answer.includes(searchTerm)) {
            item.classList.remove('hidden');
            item.style.display = 'block';
            visibleCount++;
            
            // Destaca o termo pesquisado (opcional)
            highlightSearchTerm(item, searchTerm);
        } else {
            item.classList.add('hidden');
            item.style.display = 'none';
        }
    });
    
    // Mostra mensagem se não encontrou resultados
    showNoResultsMessage(activeSection, visibleCount, searchTerm);
}

function resetSearch() {
    const activeSection = document.querySelector('.faq-section.active');
    if (!activeSection) return;
    
    // Remove mensagem de "sem resultados"
    const noResults = activeSection.querySelector('.no-results');
    if (noResults) {
        noResults.remove();
    }
    
    // Mostra todos os items
    activeSection.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('hidden');
        item.style.display = 'block';
        
        // Remove highlight
        removeHighlight(item);
    });
}

function highlightSearchTerm(item, term) {
    // Implementação básica - pode ser melhorada
    const question = item.querySelector('.faq-question h3');
    const originalText = question.getAttribute('data-original') || question.textContent;
    
    if (!question.getAttribute('data-original')) {
        question.setAttribute('data-original', originalText);
    }
    
    const regex = new RegExp(`(${term})`, 'gi');
    const highlightedText = originalText.replace(regex, '<mark style="background: rgba(212, 175, 55, 0.3); color: var(--gold-light); padding: 2px 4px; border-radius: 3px;">$1</mark>');
    
    question.innerHTML = highlightedText;
}

function removeHighlight(item) {
    const question = item.querySelector('.faq-question h3');
    const originalText = question.getAttribute('data-original');
    
    if (originalText) {
        question.textContent = originalText;
    }
}

function showNoResultsMessage(section, count, searchTerm) {
    // Remove mensagem anterior se existir
    const existingMessage = section.querySelector('.no-results');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    if (count === 0) {
        const noResultsDiv = document.createElement('div');
        noResultsDiv.className = 'no-results';
        noResultsDiv.innerHTML = `
            <h3>🔍 Nenhum resultado encontrado</h3>
            <p>Não encontramos nada para "<strong>${searchTerm}</strong>"</p>
            <p>Tente usar outras palavras-chave ou navegue pelas perguntas frequentes.</p>
        `;
        section.appendChild(noResultsDiv);
    }
}

// ==================== BOTÕES DE AJUDA ====================
function initializeHelpButtons() {
    const contactButton = document.querySelector('.contact-button');
    
    if (contactButton) {
        contactButton.addEventListener('click', () => {
            openContactSupport();
        });
    }
}

function openContactSupport() {
    // INTEGRAÇÃO: Aqui você pode:
    // 1. Abrir um modal com formulário de contato
    // 2. Redirecionar para página de contato
    // 3. Abrir chat ao vivo
    
    showNotification('Abrindo formulário de contato...', 'info');
    
    // Exemplo de redirecionamento:
    // window.location.href = '/contato';
    
    // Exemplo de modal:
    // openContactModal();
    
    console.log('Contato com suporte solicitado');
}

// ==================== URL E HISTÓRICO ====================
function updateURL(category) {
    const url = new URL(window.location);
    url.searchParams.set('categoria', category);
    window.history.pushState({ category }, '', url);
}

function loadCategoryFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('categoria');
    
    if (category) {
        switchCategory(category);
    }
}

// Detecta navegação com botões voltar/avançar
window.addEventListener('popstate', (event) => {
    if (event.state && event.state.category) {
        switchCategory(event.state.category);
    }
});

// ==================== ANALYTICS E TRACKING ====================
function trackFaqView(question) {
    // INTEGRAÇÃO: Envia evento para Google Analytics, Mixpanel, etc.
    
    console.log('FAQ visualizada:', question);
    
    // Exemplo Google Analytics 4:
    // if (typeof gtag !== 'undefined') {
    //     gtag('event', 'faq_view', {
    //         'event_category': 'FAQ',
    //         'event_label': question
    //     });
    // }
    
    // Exemplo de API própria:
    // fetch('/api/analytics/faq-view', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ question, timestamp: Date.now() })
    // });
}

// ==================== SISTEMA DE NOTIFICAÇÕES ====================
function showNotification(message, type = 'info') {
    // Remove notificação anterior
    const existing = document.querySelector('.notification-toast');
    if (existing) {
        existing.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification-toast notification-${type}`;
    notification.textContent = message;
    
    const colors = {
        info: 'rgba(212, 175, 55, 0.95)',
        success: 'rgba(76, 175, 80, 0.95)',
        warning: 'rgba(255, 152, 0, 0.95)',
        error: 'rgba(244, 67, 54, 0.95)'
    };
    
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '16px 24px',
        borderRadius: '12px',
        backgroundColor: colors[type] || colors.info,
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: '0.95rem',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        zIndex: '10000',
        animation: 'slideInRight 0.3s ease-out',
        maxWidth: '400px'
    });
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Adiciona animações CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ==================== ATALHOS DE TECLADO ====================
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K para focar na busca
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('faqSearch');
        if (searchInput) {
            searchInput.focus();
        }
    }
    
    // ESC para fechar FAQs abertos
    if (e.key === 'Escape') {
        closeAllFaqItems();
        
        // Limpa busca também
        const searchInput = document.getElementById('faqSearch');
        if (searchInput && searchInput.value) {
            searchInput.value = '';
            resetSearch();
        }
    }
});

// ==================== FUNÇÕES AUXILIARES ====================
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

// ==================== LOG DE INICIALIZAÇÃO ====================
console.log('🎮 Velora FAQ - Sistema carregado com sucesso!');
console.log('💡 Dica: Pressione Ctrl/Cmd + K para buscar');
console.log('💡 Dica: Pressione ESC para fechar FAQs abertos');