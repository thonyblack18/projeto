let user = null;

try {
    user = JSON.parse(localStorage.getItem("velora_user"));
} catch (e) {}

if (!user) {
    window.location.href = "LoginCadastro.html";
} else if (user.account_type !== "developer") {
    window.location.href = "Catalogo.html"; 
}

// =================== FAVORITAR JOGOS ===================
const favoriteBtns = document.querySelectorAll('.favorite-btn');

favoriteBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation(); // Impede que o clique no card seja acionado
        
        const icon = btn.querySelector('i');
        
        if (btn.classList.contains('favorited')) {
            // Remove dos favoritos
            btn.classList.remove('favorited');
            icon.classList.remove('fas');
            icon.classList.add('far');
        } else {
            // Adiciona aos favoritos
            btn.classList.add('favorited');
            icon.classList.remove('far');
            icon.classList.add('fas');
            
            // Animação de feedback
            btn.style.transform = 'scale(1.3)';
            setTimeout(() => {
                btn.style.transform = 'scale(1)';
            }, 200);
        }
    });
});

// =================== CLIQUE NO CARD DO JOGO ===================
const gameRoutes = {
    'Dandara: Trials of Fear Edition': 'InfoJogos/dandara/Dandara.html',
    'Mullet Madjack':                  'jogos/mullet-madjack/',
    'Horizon Chase Turbo':             'jogos/horizon-chase/',
    'A.I.L.A':                        'jogos/aila/',
    'Kambulin':                        'jogos/kambulin/',
    'Momodora: Reverie Under the Moonlight': 'jogos/momodora/',
    'Knights of Pen and Paper II':     'jogos/knights/',
    'Chroma Squad':                    'jogos/chroma-squad/',
    'Mark of the Deep':                'jogos/mark-of-the-deep/',
    'Tupi: The Legend of Arariboia':   'jogos/tupi/',
    '171':                             'jogos/171/',
    'Sina':                            'jogos/sina/',
    '9Kings':                          'InfoJogos/9kings/9kings.html',
    'Gaúcho and the Grassland':        'jogos/gaucho/',
    'Pipistrello and the Cursed Yoyo': 'jogos/pipistrello/',
    'No Heroes Here':                  'jogos/no-heroes-here/',
    'Dragon Khan':                     'jogos/dragon-khan/',
    '99 Vidas':                        'jogos/99-vidas/',
    'Dandy Ace':                       'jogos/dandy-ace/',
    'Mombo Combo Legacy':              'jogos/mombo-combo/',
};

const gameCards = document.querySelectorAll('.game-card');

gameCards.forEach(card => {
    card.addEventListener('click', () => {
        const gameTitle = card.querySelector('.game-title').textContent;
        const route = gameRoutes[gameTitle];
        if (route) {
            window.location.href = route;
        }
    });
});
// =================== BUSCA DE JOGOS ===================
const searchInput = document.querySelector('.search-box input');

searchInput?.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    
    gameCards.forEach(card => {
        const title = card.querySelector('.game-title').textContent.toLowerCase();
        const genre = card.querySelector('.game-genre').textContent.toLowerCase();
        
        if (title.includes(searchTerm) || genre.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
});

// =================== ORDENAÇÃO DE JOGOS ===================
const sortSelect = document.querySelector('.sort-select');

sortSelect?.addEventListener('change', (e) => {
    const sortType = e.target.value;
    const gamesGrid = document.querySelector('.games-grid');
    const cardsArray = Array.from(gameCards);
    
    cardsArray.sort((a, b) => {
        const titleA = a.querySelector('.game-title').textContent;
        const titleB = b.querySelector('.game-title').textContent;
        const ratingA = parseFloat(a.querySelector('.game-rating').textContent.split(' ')[1]);
        const ratingB = parseFloat(b.querySelector('.game-rating').textContent.split(' ')[1]);
        
        switch(sortType) {
            case 'Mais populares':
                return ratingB - ratingA;
            case 'A-Z':
                return titleA.localeCompare(titleB);
            case 'Z-A':
                return titleB.localeCompare(titleA);
            default: // Mais recentes
                return 0;
        }
    });
    
    // Reorganiza os cards
    cardsArray.forEach(card => gamesGrid.appendChild(card));
});

// =================== NAVEGAÇÃO DO MENU ===================
const navItems = document.querySelectorAll('.nav-item');

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Remove active de todos
        navItems.forEach(nav => nav.classList.remove('active'));
        
        // Adiciona active no clicado
        item.classList.add('active');
        
        console.log('Navegando para:', item.textContent.trim());
    });
});

// =================== BOTÃO DE FILTRO (ABRE MODAL) ===================
const filterBtn = document.querySelector('.filter-btn');
const filterModal = document.getElementById('filterModal');
const closeModal = document.getElementById('closeModal');
const clearFilters = document.getElementById('clearFilters');
const applyFilters = document.getElementById('applyFilters');

filterBtn?.addEventListener('click', () => {
    filterModal.classList.add('active');
});

closeModal?.addEventListener('click', () => {
    filterModal.classList.remove('active');
});

// Fecha o modal ao clicar fora dele
filterModal?.addEventListener('click', (e) => {
    if (e.target === filterModal) {
        filterModal.classList.remove('active');
    }
});

// Limpar filtros
clearFilters?.addEventListener('click', () => {
    const checkboxes = filterModal.querySelectorAll('input[type="checkbox"]');
    const radios = filterModal.querySelectorAll('input[type="radio"]');
    
    checkboxes.forEach(cb => cb.checked = false);
    radios.forEach(radio => {
        if (radio.value === 'all') radio.checked = true;
    });
});

// Aplicar filtros
applyFilters?.addEventListener('click', () => {
    // Aqui você pode implementar a lógica de filtragem
    console.log('Filtros aplicados!');
    
    filterModal.classList.remove('active');
    
    // Exemplo de como pegar os filtros selecionados:
    const selectedGenres = Array.from(filterModal.querySelectorAll('input[type="checkbox"]:checked'))
        .map(cb => cb.value);
    const selectedRating = filterModal.querySelector('input[name="rating"]:checked').value;
    
    console.log('Gêneros:', selectedGenres);
    console.log('Avaliação:', selectedRating);
});

// =================== TRATAMENTO DE ERRO DE LOGO ===================
const headerLogo = document.getElementById('header-logo');

if (headerLogo) {
    headerLogo.addEventListener('error', function() {
        this.style.display = 'none';
    });
}

// Tratamento para logos dos jogos que não carregarem
const gameLogos = document.querySelectorAll('.game-logo');

gameLogos.forEach(logo => {
    logo.addEventListener('error', function() {
        // Cria um placeholder caso a imagem não carregue
        this.style.display = 'none';
        const placeholder = document.createElement('div');
        placeholder.style.cssText = `
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(212, 175, 55, 0.05));
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 48px;
            color: rgba(212, 175, 55, 0.5);
        `;
        placeholder.innerHTML = '<i class="fas fa-gamepad"></i>';
        this.parentElement.appendChild(placeholder);
    });
});

// =================== DROPDOWN DO USUÁRIO ===================
const userProfile = document.getElementById('userProfile');
const userDropdown = document.getElementById('userDropdown');

if (userProfile && userDropdown) {
    userProfile.style.position = 'relative';

    userProfile.addEventListener('click', (e) => {
        e.stopPropagation();
        userDropdown.classList.toggle('active');
        userProfile.classList.toggle('active');
    });

    document.addEventListener('click', () => {
        userDropdown.classList.remove('active');
        userProfile.classList.remove('active');
    });

    userDropdown.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // =================== MEU PERFIL — redireciona para PerfilDev.html ===================
    document.getElementById('dropMeuPerfil')?.addEventListener('click', () => {
        let user = null;
        try { user = JSON.parse(localStorage.getItem("velora_user")); } catch (e) {}

        if (!user) {
            window.location.href = "LoginCadastro.html";
        } else if (user.account_type === "developer") {
            window.location.href = "PerfilDev.html";
        } else {
            window.location.href = "PerfilUsuario.html";
        }
    });

    // =================== SUPORTE AO USUÁRIO — redireciona para SuporteUsuario.html ===================
    document.getElementById('dropSuporte')?.addEventListener('click', () => {
        window.location.href = "SuporteUsuario.html";
    });

    // =================== ADICIONAR JOGO — exclusivo do desenvolvedor ===================
    // O redirecionamento já é feito pelo href="AdicionarJogo.html" no próprio <a> do HTML.
    // Este listener é opcional, mas pode ser útil para futuros controles de permissão.
    document.getElementById('dropAdicionarJogo')?.addEventListener('click', (e) => {
        let user = null;
        try { user = JSON.parse(localStorage.getItem("velora_user")); } catch (err) {}

        // Segurança extra: se por algum motivo um não-dev acessar esta página,
        // bloqueia o redirecionamento e manda pro login.
        if (!user || user.account_type !== "developer") {
            e.preventDefault();
            window.location.href = "LoginCadastro.html";
        }
    });
    // ================================================================================

    // =================== SAIR — limpa sessão e redireciona ===================
    document.getElementById('dropSair')?.addEventListener('click', () => {
        localStorage.removeItem("velora_user");
        window.location.href = "LoginCadastro.html";
    });
}