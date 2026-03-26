// ==================== PAINEL INFORMATIVO ====================

function initOverview() {
    const overviewBtn = document.getElementById('overviewBtn');
    if (overviewBtn) {
        overviewBtn.addEventListener('click', toggleOverview);
    }

    const backBtn = document.getElementById('backToMainBtn');
    if (backBtn) {
        backBtn.addEventListener('click', toggleOverview);
    }
}

function toggleOverview() {
    const mainContent = document.getElementById('main-content');
    const overviewSection = document.getElementById('overview-section');
    const overviewBtn = document.getElementById('overviewBtn');

    if (!mainContent || !overviewSection || !overviewBtn) return;

    const isShowingOverview = overviewSection.style.display === 'block';

    if (isShowingOverview) {
        overviewSection.style.display = 'none';
        mainContent.classList.remove('main-dashboard-hidden');
        document.body.classList.remove('overview-active');
        overviewBtn.classList.remove('active');
        overviewBtn.querySelector('.material-icons').textContent = 'dashboard';
        overviewBtn.title = "Painel Informativo";
    } else {
        renderOverview();
        overviewSection.style.display = 'block';
        mainContent.classList.add('main-dashboard-hidden');
        document.body.classList.add('overview-active');
        overviewBtn.classList.add('active');
        overviewBtn.querySelector('.material-icons').textContent = 'grid_view';
        overviewBtn.title = "Voltar para o Dashboard";

        const filtersContainer = document.getElementById('filtersContainer');
        if (filtersContainer && filtersContainer.classList.contains('open')) {
            document.getElementById('menuToggle')?.click();
        }
    }
}

function extractPercentage(observacoes) {
    if (!observacoes) return 0;

    const obs = observacoes.toUpperCase();

    // 1. Lógica de Pipeline: Comparação entre EXTRAÇÃO e IMPORTADO
    // Ex: EXTRAÇÃO: [pessoas, mercadorias, estoque] | IMPORTADO: [pessoas, mercadorias]
    const extracaoMatch = observacoes.match(/EXTRAÇÃO:?\s*\[(.*?)\]/i);
    const importadoMatch = observacoes.match(/IMPORTADO:?\s*\[(.*?)\]/i);

    if (extracaoMatch) {
        const itensPlanejados = extracaoMatch[1].split(',').map(s => s.trim()).filter(s => s);
        if (itensPlanejados.length > 0) {
            let concluidos = 0;

            if (importadoMatch) {
                const itensConcluidos = importadoMatch[1].split(',').map(s => s.trim()).filter(s => s);
                concluidos = itensConcluidos.length;
            } else {
                // Tenta contar itens marcados com (100%) ou (OK) dentro da própria EXTRAÇÃO
                concluidos = itensPlanejados.filter(item =>
                    item.includes('100%') ||
                    item.toUpperCase().includes('(OK)') ||
                    item.toUpperCase().includes('(FEITO)') ||
                    item.toUpperCase().includes('(CONCLUÍDO)')
                ).length;
            }

            if (concluidos > 0) {
                return Math.min(Math.round((concluidos / itensPlanejados.length) * 100), 100);
            }
        }
    }

    // 2. Fallback: Procura por percentual explícito associado a EM PROCESSO
    // Ex: EM PROCESSO (45%) ou EM PROCESSO: [45%]
    const procMatch = observacoes.match(/EM PROCESSO:?\s*\[?(\d+)\s*%?\]?/i);
    if (procMatch) {
        return parseInt(procMatch[1]);
    }

    // 3. Fallback: Procura qualquer porcentagem nas observações se estiver em processo
    if (obs.includes('EM PROCESSO')) {
        const generalPercentMatch = observacoes.match(/(\d+)\s*%/);
        if (generalPercentMatch) {
            return parseInt(generalPercentMatch[1]);
        }
    }

    return 0;
}

function getDifficulty(percentage) {
    if (percentage < 30) return { label: 'Dificuldade Alta', class: 'difficulty-high' };
    if (percentage < 70) return { label: 'Dificuldade Média', class: 'difficulty-medium' };
    return { label: 'Dificuldade Baixa', class: 'difficulty-low' };
}

/**
 * Verifica se o sistema pertence aos sistemas alvo do Painel Informativo.
 * Sistemas: CLOUD, WEBSITE, WEB SITE, ZAPCRM.
 */
function isTargetSystem(sistema) {
    const s = (sistema || '').toUpperCase();
    return s.includes('CLOUD') ||
           s.includes('WEBSITE') ||
           s.includes('WEB SITE') ||
           s.includes('ZAPCRM');
}

function renderOverview() {
    const currentContainer = document.getElementById('current-implementations');
    const summaryContainer = document.getElementById('overview-summary');

    if (!currentContainer) return;

    const baseData = state.globalData || [];

    // Filtrar apenas filiais que NÃO possuem data de implantação e pertencem aos sistemas alvo (Cloud, Web Site, ZapCRM).
    // A filtragem agora é feita por FILIAL, e não mais por organização inteira.
    const data = baseData.filter(item => {
        const dataImplantacao = (item.data_implantacao || item.dataImplantacao || '').trim();
        const semDataImplantacao = dataImplantacao === '';
        return isTargetSystem(item.sistema) && semDataImplantacao;
    });

    const inProgress = data.filter(item => {
        const obs = (item.observacoes || '').toUpperCase();
        return obs.includes('EM PROCESSO');
    }).map(item => {
        const percentage = extractPercentage(item.observacoes);
        return { ...item, percentage };
    }).sort((a, b) => b.percentage - a.percentage);

    const future = data.filter(item => {
        const obs = (item.observacoes || '').toUpperCase();
        return !obs.includes('EM PROCESSO');
    }).sort((a, b) => {
        const dateA = parseDate(a.data_previsao || a.dataPrevisao) || new Date(2099, 11, 31);
        const dateB = parseDate(b.data_previsao || b.dataPrevisao) || new Date(2099, 11, 31);
        return dateA - dateB;
    });

    const orgGroups = {};
    inProgress.forEach(item => {
        const orgId = item.organizacao_codigo || 'SEM_ORG';
        if (!orgGroups[orgId]) {
            orgGroups[orgId] = {
                org_codigo: item.organizacao_codigo,
                org_descricao: item.organizacao_descricao || 'Sem Descrição',
                active_branches: [],
                future_branches: [],
                sistema: item.sistema
            };
        }
        orgGroups[orgId].active_branches.push(item);
    });

    future.forEach(item => {
        const orgId = item.organizacao_codigo || 'SEM_ORG';
        if (!orgGroups[orgId]) {
            orgGroups[orgId] = {
                org_codigo: item.organizacao_codigo,
                org_descricao: item.organizacao_descricao || 'Sem Descrição',
                active_branches: [],
                future_branches: [],
                sistema: item.sistema
            };
        }
        orgGroups[orgId].future_branches.push(item);
    });

    const allGroups = Object.values(orgGroups);
    const groupsWithActive = allGroups.filter(g => g.active_branches.length > 0).map(group => {
        // Cálculo do percentual da ORG: média do andamento de cada filial em processo
        const totalPercent = group.active_branches.reduce((sum, f) => sum + (f.percentage || 0), 0);
        group.avgPercentage = Math.round(totalPercent / group.active_branches.length);
        return group;
    }).sort((a, b) => b.avgPercentage - a.avgPercentage);

    const groupsOnlyFuture = allGroups.filter(g => g.active_branches.length === 0).sort((a, b) => {
        const dateA = parseDate(a.future_branches[0]?.dataPrevisao) || new Date(2099, 11, 31);
        const dateB = parseDate(b.future_branches[0]?.dataPrevisao) || new Date(2099, 11, 31);
        return dateA - dateB;
    });

    const allToRender = [
        ...groupsWithActive,
        ...groupsOnlyFuture.map(g => ({ ...g, avgPercentage: 0 }))
    ];

    if (summaryContainer) {
        const totalOrgs = allToRender.length;
        const totalActive = groupsWithActive.reduce((sum, g) => sum + g.active_branches.length, 0);
        const totalPending = groupsOnlyFuture.reduce((sum, g) => sum + g.future_branches.length, 0);

        summaryContainer.innerHTML = `
            <div class="summary-card glass active-orgs-kpi">
                <span class="material-icons">business</span>
                <div class="summary-info">
                    <span class="summary-label">Organizações</span>
                    <span class="summary-value">${totalOrgs}</span>
                </div>
            </div>
            <div class="summary-card glass">
                <span class="material-icons">play_circle</span>
                <div class="summary-info">
                    <span class="summary-label">Filiais Ativas</span>
                    <span class="summary-value">${totalActive}</span>
                </div>
            </div>
            <div class="summary-card glass">
                <span class="material-icons">schedule</span>
                <div class="summary-info">
                    <span class="summary-label">Próximas / Pendentes</span>
                    <span class="summary-value">${totalPending}</span>
                </div>
            </div>
        `;
    }

    if (allToRender.length > 0) {
        currentContainer.innerHTML = allToRender.map(group => {
            const chartId = `chart-org-${group.org_codigo}`.replace(/\s+/g, '-');
            const totalUnits = group.active_branches.length + group.future_branches.length;

            return `
                <div class="impl-card glass" data-percentage="${group.avgPercentage}" data-chart-id="${chartId}" onclick="showOrgDetails('${group.org_codigo}')">
                    <div class="impl-card-header">
                        <div class="impl-card-main">
                            <div class="impl-card-chart">
                                <canvas id="${chartId}"></canvas>
                                <div class="impl-percent-badge">${group.avgPercentage}%</div>
                            </div>
                            <div class="impl-card-info">
                                <h4 class="org-title">${escapeHTML(group.org_descricao)}</h4>
                                <span class="org-tag">ID: ${escapeHTML(group.org_codigo)} • ${totalUnits} Unidade(s)</span>
                            </div>
                        </div>
                    </div>

                    <div class="impl-card-footer">
                        <div class="impl-systems">
                            ${(group.sistema || 'N/A').split('/').map(s => {
                                const sys = s.trim().toUpperCase();
                                if (!sys) return '';
                                let className = 'sys-tag';
                                if (sys.includes('CLOUD')) className += ' sys-cloud';
                                else if (sys.includes('CONTÁBIL') || sys.includes('FISCAL') || sys.includes('FISCO')) className += ' sys-fiscal';
                                else if (sys.includes('ZAPCRM')) className += ' sys-zapcrm';
                                else if (sys.includes('WEBPAV')) className += ' sys-webpav';
                                return `<span class="${className}">${escapeHTML(sys)}</span>`;
                            }).join('')}
                        </div>
                        <div class="view-details-hint">
                            <span class="material-icons" style="font-size: 16px;">add_circle_outline</span>
                            Detalhes
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        setTimeout(() => {
            initMiniCharts();
            renderSystemsChart(groupsWithActive);
        }, 100);
    } else {
        currentContainer.innerHTML = '<div class="no-data-msg">Nenhum cliente em implantação ativa no momento.</div>';
    }
}

function showOrgDetails(orgId) {
    const data = state.globalData || [];

    // Filtra filiais da organização que ainda estão pendentes e pertencem aos sistemas alvo.
    const orgBranches = data.filter(item => {
        const dataImplantacao = (item.data_implantacao || item.dataImplantacao || '').trim();
        const semDataImplantacao = dataImplantacao === '';
        return (item.organizacao_codigo || '') === orgId &&
               isTargetSystem(item.sistema) &&
               semDataImplantacao;
    });

    if (orgBranches.length === 0) return;

    const orgDesc = orgBranches[0].organizacao_descricao || 'Sem Descrição';
    const activeBranches = orgBranches.filter(item => (item.observacoes || '').toUpperCase().includes('EM PROCESSO'));
    const futureBranches = orgBranches.filter(item => !(item.observacoes || '').toUpperCase().includes('EM PROCESSO'));

    const activeHtml = activeBranches.length > 0 ? `
        <div class="modal-section">
            <h4 class="modal-section-title active-color">
                <span class="material-icons">play_circle</span>
                Implantação Ativa
            </h4>
            <div class="modal-filiais-list">
                ${activeBranches.map(f => {
                    const percentage = extractPercentage(f.observacoes);
                    const dias = f.dataVendaObj ? calcularDiasEntreDatas(f.dataVendaObj) : 0;
                    return `
                    <div class="modal-filial-item">
                        <div class="modal-filial-info">
                            <span class="modal-filial-name">${escapeHTML(f.filial_descricao)}</span>
                            <div class="modal-filial-meta">
                                <span class="material-icons" style="font-size: 14px;">calendar_today</span> ${dias} dias
                                <span class="material-icons" style="font-size: 14px; margin-left: 8px;">computer</span> ${f.sistema}
                            </div>
                        </div>
                        <div class="modal-filial-progress">
                            <span class="modal-percentage">${percentage}%</span>
                            <div class="modal-progress-container">
                                <div class="modal-progress-bar">
                                    <div class="modal-progress-fill" style="width: ${percentage}%"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                `}).join('')}
            </div>
        </div>
    ` : '';

    const futureHtml = futureBranches.length > 0 ? `
        <div class="modal-section">
            <h4 class="modal-section-title pending-color">
                <span class="material-icons">schedule</span>
                Próximas Unidades
            </h4>
            <div class="modal-filiais-list">
                ${futureBranches.map(f => `
                    <div class="modal-filial-item">
                        <div class="modal-filial-info">
                            <span class="modal-filial-name">${escapeHTML(f.filial_descricao)}</span>
                            <div class="modal-filial-meta">
                                <span class="material-icons" style="font-size: 14px;">event</span> ${f.data_previsao || f.dataPrevisao || 'Sem Previsão'}
                                <span class="material-icons" style="font-size: 14px; margin-left: 8px;">computer</span> ${f.sistema}
                            </div>
                        </div>
                        <span class="modal-status-tag">Pendente</span>
                    </div>
                `).join('')}
            </div>
        </div>
    ` : '';

    const modalBody = `
        <div class="org-details-modal">
            <div class="modal-org-header">
                <span class="org-code">ORGANIZAÇÃO ${orgId}</span>
                <h2 class="org-name">${escapeHTML(orgDesc)}</h2>
            </div>
            ${activeHtml}
            ${futureHtml}
        </div>
    `;

    const modal = document.getElementById('observacoesModal');
    if (modal) {
        const bodyEl = modal.querySelector('.modal-body');
        if (bodyEl) bodyEl.innerHTML = modalBody;
        modal.style.display = 'block';
    }
}

function renderSystemsChart(groups) {
    const ctx = document.getElementById('overviewSystemsChart');
    if (!ctx) return;

    const systemCounts = {};
    groups.forEach(g => {
        const systems = (g.sistema || 'OUTROS').split('/');
        systems.forEach(s => {
            const name = s.trim().toUpperCase();
            if (name) systemCounts[name] = (systemCounts[name] || 0) + 1;
        });
    });

    const labels = Object.keys(systemCounts);
    const data = Object.values(systemCounts);
    const isDark = document.body.classList.contains('dark');
    const textColor = isDark ? '#ffffff' : '#475569';

    const existingChart = Chart.getChart(ctx);
    if (existingChart) existingChart.destroy();

    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: labels.map(label => getSistemaColor(label)),
                borderColor: isDark ? '#1e293b' : '#ffffff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: { padding: 10 },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { boxWidth: 12, font: { size: 11, weight: '600' }, padding: 15, color: textColor }
                }
            }
        }
    });
}

function initMiniCharts() {
    const cards = document.querySelectorAll('.impl-card[data-chart-id]');
    cards.forEach(card => {
        const chartId = card.getAttribute('data-chart-id');
        const percentage = parseInt(card.getAttribute('data-percentage') || 0);
        const ctx = document.getElementById(chartId);
        if (!ctx) return;

        const existingChart = Chart.getChart(ctx);
        if (existingChart) existingChart.destroy();

        const isDark = document.body.classList.contains('dark');
        let progressColor = '#0ea5e9';
        if (percentage >= 100) progressColor = '#10b981';
        else if (percentage >= 70) progressColor = '#3b82f6';
        else if (percentage >= 40) progressColor = '#f59e0b';
        else if (percentage > 0) progressColor = '#ef4444';

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [percentage, 100 - percentage],
                    backgroundColor: [progressColor, isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'],
                    borderWidth: 0,
                    weight: 0.5
                }]
            },
            options: {
                cutout: '80%',
                responsive: true,
                maintainAspectRatio: true,
                plugins: { legend: { display: false }, tooltip: { enabled: false } },
                animation: { duration: 1200, easing: 'easeOutQuart' }
            }
        });
    });
}
