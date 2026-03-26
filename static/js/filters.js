// ==================== FILTROS ====================

function getFilterValues() {
    return {
        organizacao: document.getElementById('orgInput')?.value.trim().toLowerCase() || '',
        filial: document.getElementById('filialInput')?.value.trim().toLowerCase() || '',
        sistema: document.getElementById('sistemaInput')?.value.trim().toLowerCase() || '',
        dataInicio: document.getElementById('dataInicio')?.value || '',
        dataFim: document.getElementById('dataFim')?.value || '',
        ano: document.getElementById('anoFiltro')?.value || ''
    };
}

const applyFiltersDebounced = debounce(() => {
    applyFilters();
}, CONFIG.DEBOUNCE_DELAY);

function applyFilters() {
    if (typeof showFilterLoading === 'function') showFilterLoading(true);

    setTimeout(() => {
        const f = getFilterValues();
        state.filteredData = state.globalData.filter(item => {
            if (f.organizacao && !item.organizacao_codigo_busca.includes(f.organizacao) && !item.organizacao_descricao_busca.includes(f.organizacao)) return false;
            if (f.filial && !item.filial_codigo_busca.includes(f.filial) && !item.filial_descricao_busca.includes(f.filial)) return false;
            if (f.sistema && !(item.sistema || '').toLowerCase().includes(f.sistema)) return false;

            const db = item.dataVendaObj || item.dataObj;
            if (f.ano && (!db || db.getFullYear() !== parseInt(f.ano))) return false;
            if (f.dataInicio && (!db || db < new Date(f.dataInicio))) return false;
            if (f.dataFim && (!db || db > new Date(f.dataFim + 'T23:59:59'))) return false;

            return true;
        });

        state.currentPage = 1;
        if (typeof updateKPIs === 'function') updateKPIs();
        if (typeof renderTable === 'function') renderTable();
        if (typeof updatePagination === 'function') updatePagination();
        if (typeof criarGraficos === 'function') criarGraficos();

        if (typeof showFilterLoading === 'function') showFilterLoading(false);
    }, 300);
}

function clearFilters() {
    ['orgInput', 'filialInput', 'sistemaInput', 'dataInicio', 'dataFim', 'anoFiltro'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    applyFilters();
}

function initFilters() {
    const inputs = ['orgInput', 'filialInput', 'sistemaInput', 'anoFiltro'];
    inputs.forEach(id => {
        document.getElementById(id)?.addEventListener('input', applyFiltersDebounced);
    });

    ['dataInicio', 'dataFim'].forEach(id => {
        document.getElementById(id)?.addEventListener('change', applyFilters);
    });

    document.getElementById('clearFiltersBtn')?.addEventListener('click', clearFilters);
    document.getElementById('menuToggle')?.addEventListener('click', () => {
        const container = document.getElementById('filtersContainer');
        const overlay = document.getElementById('menuOverlay');
        if (container) container.classList.toggle('open');
        if (overlay) overlay.classList.toggle('show');
        document.body.style.overflow = container?.classList.contains('open') ? 'hidden' : '';
    });

    document.getElementById('menuOverlay')?.addEventListener('click', () => {
        document.getElementById('filtersContainer')?.classList.remove('open');
        document.getElementById('menuOverlay')?.classList.remove('show');
        document.body.style.overflow = '';
    });
}
