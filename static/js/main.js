// ==================== INICIALIZAÇÃO ====================

function initEventListeners() {
    const orgInput = document.getElementById('orgInput');
    if (orgInput) orgInput.addEventListener('input', applyFiltersDebounced);

    const filialInput = document.getElementById('filialInput');
    if (filialInput) filialInput.addEventListener('input', applyFiltersDebounced);

    const sistemaInput = document.getElementById('sistemaInput');
    if (sistemaInput) sistemaInput.addEventListener('input', applyFiltersDebounced);

    const dataInicio = document.getElementById('dataInicio');
    if (dataInicio) {
        dataInicio.addEventListener('change', applyFilters);
        dataInicio.addEventListener('input', applyFiltersDebounced);
    }

    const dataFim = document.getElementById('dataFim');
    if (dataFim) {
        dataFim.addEventListener('change', applyFilters);
        dataFim.addEventListener('input', applyFiltersDebounced);
    }

    const anoFiltro = document.getElementById('anoFiltro');
    if (anoFiltro) {
        anoFiltro.addEventListener('change', applyFilters);
        anoFiltro.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
            applyFiltersDebounced();
        });
    }


    const clearFiltersBtn = document.getElementById('clearFiltersBtn');
    if (clearFiltersBtn) clearFiltersBtn.addEventListener('click', clearFilters);

    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) loadMoreBtn.addEventListener('click', loadMore);

    const pendingCard = document.getElementById('pendingCard');
    if (pendingCard) pendingCard.addEventListener('click', mostrarPendencias);

    const inProgressCard = document.getElementById('inProgressCard');
    if (inProgressCard) inProgressCard.addEventListener('click', mostrarEmProcesso);

    const riskCard = document.getElementById('riskCard');
    if (riskCard) riskCard.addEventListener('click', mostrarEmRisco);

    const futureCard = document.getElementById('futureCard');
    if (futureCard) futureCard.addEventListener('click', mostrarPrevisaoFutura);

    const valorTotalCard = document.getElementById('valorTotalCard');
    if (valorTotalCard) valorTotalCard.addEventListener('click', mostrarDetalhesValorTotal);

    const comissaoCard = document.getElementById('comissaoCard');
    if (comissaoCard) comissaoCard.addEventListener('click', mostrarDetalhesComissao);

    document.querySelectorAll('.valor-tag[data-tipo="erp"]').forEach(el => {
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            mostrarFiliaisPorTipoValor('erp');
        });
    });

    document.querySelectorAll('.valor-tag[data-tipo="agregado"]').forEach(el => {
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            mostrarFiliaisPorTipoValor('agregado');
        });
    });
}

function initFilterMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const filtersContainer = document.getElementById('filtersContainer');
    const menuOverlay = document.getElementById('menuOverlay');

    if (!menuToggle || !filtersContainer || !menuOverlay) return;

    const toggleMenu = (forceClose = null) => {
        const isOpen = forceClose === null ? !filtersContainer.classList.contains('open') : !forceClose;

        if (isOpen) {
            filtersContainer.classList.add('open');
            menuOverlay.classList.add('show');
            if (window.innerWidth <= 768) document.body.style.overflow = 'hidden';

            // On mobile, text label is shown only when menu is open or in its specific button
            menuToggle.classList.add('active');
        } else {
            filtersContainer.classList.remove('open');
            menuOverlay.classList.remove('show');
            document.body.style.overflow = '';
            menuToggle.classList.remove('active');
        }

        const icon = menuToggle.querySelector('.material-icons');
        if (icon) icon.textContent = filtersContainer.classList.contains('open') ? 'close' : 'filter_list';
    };

    menuToggle.onclick = (e) => { e.preventDefault(); e.stopPropagation(); toggleMenu(); };
    menuOverlay.onclick = () => toggleMenu(true);

    document.getElementById('clearFiltersBtn')?.addEventListener('click', () => {
        if (window.innerWidth <= 768) setTimeout(() => toggleMenu(true), 500);
    });
}

function init() {
    initTheme();
    initFilterMenu();
    initOverview();
    criarModal();

    loadData(false, false).then(() => {
        const anoFiltro = document.getElementById('anoFiltro');
        if (anoFiltro && !anoFiltro.value) {
            anoFiltro.value = CONFIG.ANO_PADRAO;
            setTimeout(() => { if (typeof applyFilters === 'function') applyFilters(); }, 100);
        }
        initEventListeners();
    });

    setInterval(() => { if (!state.isLoading) loadData(true, false); }, CONFIG.AUTO_REFRESH_INTERVAL);
}

document.addEventListener('DOMContentLoaded', init);
