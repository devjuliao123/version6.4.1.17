// ==================== KPI ====================

function updateKPIs() {
    const data = state.filteredData || [];
    const isImplRole = (typeof isAnonymized === 'function') ? isAnonymized() : false;

    // Add anonymization class to KPI cards for global styling control
    document.querySelectorAll('.kpi-card').forEach(card => {
        if (isImplRole) card.classList.add('anonymized');
        else card.classList.remove('anonymized');
    });

    const uniqueOrgs = new Set(data.map(d => d.organizacao_codigo).filter(Boolean)).size;
    const uniqueFiliais = new Set(data.map(d => d.filial_codigo).filter(Boolean)).size;

    const totalGeral = data.reduce((sum, d) => sum + (d.total_geral || 0), 0);
    const totalERP = data.reduce((sum, d) => sum + (d.total_erp || 0), 0);
    const totalAgregado = data.reduce((sum, d) => sum + (d.total_agregado || 0), 0);

    // A comissão agora deve considerar todos os itens filtrados para respeitar os filtros da tela
    const baseComissao = data.reduce((sum, d) => sum + (d.valor_comissao || 0), 0);
    const comissaoTotal = baseComissao * 0.03;

    const pendentes = data.filter(d => d.pendente);
    const totalPendentes = pendentes.length;
    const valorPendente = pendentes.reduce((sum, d) => sum + (d.total_geral || 0), 0);

    const emProcesso = pendentes.filter(item => (item.observacoes || '').toUpperCase().includes('EM PROCESSO'));
    const totalEmProcesso = emProcesso.length;
    const valorEmProcesso = emProcesso.reduce((sum, d) => sum + (d.total_geral || 0), 0);

    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    const globalData = state.globalData || data;
    const emRisco = globalData.filter(item => item.pendente && item.dataVendaObj && !item.dataImplantacaoObj && (hoje - item.dataVendaObj) > 90 * 24 * 60 * 60 * 1000);
    const totalRisco = emRisco.length;
    const valorRisco = emRisco.reduce((sum, d) => sum + (d.total_geral || 0), 0);

    const futuro = globalData.filter(item => !item.dataImplantacaoObj && item.dataPrevisao && item.dataPrevisao.trim() !== '');
    const totalFuturo = futuro.length;
    const valorFuturo = futuro.reduce((sum, d) => sum + (d.total_geral || 0), 0);

    // Values (will be blurred if 'implantação')
    const updateEl = (id, val, force = false) => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = formatCurrency(val, force);
    };

    updateEl('valorTotal', totalGeral);
    updateEl('valorERP', totalERP);
    updateEl('valorAgregado', totalAgregado);
    updateEl('valorComissao', comissaoTotal);
    updateEl('valorPendente', valorPendente);
    updateEl('valorEmProcesso', valorEmProcesso);
    updateEl('valorRisco', valorRisco);
    updateEl('valorFuturo', valorFuturo);

    // Commission Specifics
    const comissaoTotalEl = document.getElementById('comissaoTotal');
    if (comissaoTotalEl) {
        const porAnalista = comissaoTotal / 3;
        if (isImplRole) {
            comissaoTotalEl.innerHTML = `Cada analista: ${formatCurrency(porAnalista, true)}`;
        } else {
            comissaoTotalEl.innerHTML = `Base: ${formatCurrency(baseComissao)}<br>Cada analista: ${formatCurrency(porAnalista)}`;
        }
    }

    // Quantities (Always visible)
    const updateQty = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = formatNumber(val);
    };

    updateQty('totalPendentes', totalPendentes);
    updateQty('totalEmProcesso', totalEmProcesso);
    updateQty('totalRisco', totalRisco);
    updateQty('totalFuturo', totalFuturo);
    updateQty('uniqueOrgs', uniqueOrgs);
    updateQty('uniqueFiliais', uniqueFiliais);

    const counterEl = document.getElementById('tableCounter');
    if (counterEl) counterEl.textContent = `${data.length} registros`;
}
