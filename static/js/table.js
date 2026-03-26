// ==================== TABELA ====================

function renderTable() {
    const tbody = document.querySelector('#tabela tbody');
    if (!tbody) {
        console.warn('❌ Elemento tbody da tabela não encontrado');
        return;
    }

    if (!state.filteredData || state.filteredData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" style="text-align: center; padding: 2rem;">Nenhum dado encontrado</td></tr>';
        updateTableAnalytics();
        return;
    }

    const start = (state.currentPage - 1) * CONFIG.ITEMS_PER_PAGE;
    const end = state.currentPage * CONFIG.ITEMS_PER_PAGE;
    const pageData = state.filteredData.slice(start, end);

    if (state.currentPage === 1) {
        tbody.innerHTML = '';
    }

    const fragment = document.createDocumentFragment();

    pageData.forEach(item => {
        const row = document.createElement('tr');
        const statusInfo = extrairStatus(item);

        // Organização
        const orgCell = document.createElement('td');
        orgCell.textContent = item.organizacao_codigo || '-';
        orgCell.style.fontWeight = '600';
        orgCell.style.padding = '0.75rem';
        row.appendChild(orgCell);

        // Descrição Filial
        const filialCell = document.createElement('td');
        const filialTexto = item.filial_codigo ? `${item.filial_codigo} - ${item.filial_descricao || ''}` : (item.filial_descricao || '-');
        filialCell.textContent = filialTexto;
        filialCell.style.fontWeight = '600';
        filialCell.style.padding = '0.75rem';
        row.appendChild(filialCell);

        // Modalidade
        const modalidadeCell = document.createElement('td');
        modalidadeCell.style.padding = '0.75rem';
        if (item.modalidade) {
            const badge = document.createElement('span');
            badge.className = 'badge';
            badge.textContent = item.modalidade;
            modalidadeCell.appendChild(badge);
        } else {
            modalidadeCell.textContent = '-';
        }
        row.appendChild(modalidadeCell);

        // Marca
        const marcaCell = document.createElement('td');
        marcaCell.textContent = item.marca || '-';
        marcaCell.style.padding = '0.75rem';
        row.appendChild(marcaCell);

        // Sistema
        const sistemaCell = document.createElement('td');
        sistemaCell.style.padding = '0.75rem';
        if (item.sistema) {
            // Normalizamos para remover nomes de sistemas anteriores que não pertencem aqui (ex: Dealernet)
            const sistemasNorm = normalizarSistemas(item.sistema);
            sistemasNorm.forEach(sis => {
                if (sis === 'OUTROS') return; // Pula se for apenas outros
                const badge = document.createElement('span');
                badge.className = 'badge';
                badge.textContent = sis;
                badge.style.marginRight = '4px';
                sistemaCell.appendChild(badge);
            });
            // Se após normalizar não tiver nenhum sistema conhecido, mostrar o original (sem ser o sistema anterior se possível)
            if (sistemaCell.childNodes.length === 0) {
                const badge = document.createElement('span');
                badge.className = 'badge';
                badge.textContent = item.sistema.split('/')[0].trim();
                sistemaCell.appendChild(badge);
            }
        } else {
            sistemaCell.textContent = '-';
        }
        row.appendChild(sistemaCell);

        // Valor
        const valorCell = document.createElement('td');
        valorCell.innerHTML = formatCurrency(item.valor);
        valorCell.style.padding = '0.75rem';
        row.appendChild(valorCell);

        // Status
        const statusCell = document.createElement('td');
        statusCell.style.padding = '0.75rem';
        statusCell.style.verticalAlign = 'middle';
        statusCell.style.textAlign = 'center';

        const statusIcon = document.createElement('span');
        statusIcon.className = 'material-icons';
        statusIcon.style.cssText = `
            font-size: 20px;
            color: ${statusInfo.cor};
            cursor: help;
        `;
        statusIcon.textContent = statusInfo.icone;
        statusIcon.title = statusInfo.mensagem || statusInfo.status;

        statusCell.appendChild(statusIcon);
        row.appendChild(statusCell);

        // Detalhes
        const detailsCell = document.createElement('td');
        detailsCell.style.padding = '0.75rem';
        detailsCell.style.verticalAlign = 'middle';

        const detailsWrapper = document.createElement('div');
        detailsWrapper.style.display = 'flex';
        detailsWrapper.style.alignItems = 'center';
        detailsWrapper.style.gap = '8px';

        if (item.temETL) {
            const etlBadge = document.createElement('span');
            etlBadge.className = 'badge badge-etl';
            etlBadge.textContent = 'ETL';
            detailsWrapper.appendChild(etlBadge);
        }

        const infoIcon = document.createElement('span');
        infoIcon.className = 'material-icons info-icon';
        infoIcon.textContent = 'info';
        infoIcon.title = 'Clique para ver detalhes';
        infoIcon.style.cursor = 'pointer';
        infoIcon.style.fontSize = '20px';
        infoIcon.style.color = 'var(--primary)';
        infoIcon.onclick = () => abrirModal(item.observacoes, item);
        detailsWrapper.appendChild(infoIcon);

        detailsCell.appendChild(detailsWrapper);
        row.appendChild(detailsCell);

        fragment.appendChild(row);
    });

    tbody.appendChild(fragment);
    updateTableAnalytics();
}

function updateTableAnalytics() {
    const counter = document.getElementById('tableCounter');
    if (counter) counter.textContent = `${formatNumber(state.filteredData.length)} registro(s)`;

    const orgsCountEl = document.getElementById('uniqueOrgs');
    const filiaisCountEl = document.getElementById('uniqueFiliais');

    if (orgsCountEl && filiaisCountEl) {
        const uniqueOrgs = new Set(state.filteredData.map(item => item.organizacao_codigo)).size;
        const uniqueFiliais = new Set(state.filteredData.map(item => item.filial_codigo)).size;
        orgsCountEl.textContent = formatNumber(uniqueOrgs);
        filiaisCountEl.textContent = formatNumber(uniqueFiliais);
    }
}

function updatePagination() {
    const totalPages = Math.ceil(state.filteredData.length / CONFIG.ITEMS_PER_PAGE);
    const btnEl = document.getElementById('loadMoreBtn');
    const footerEl = document.querySelector('.table-footer');

    if (btnEl) {
        if (state.currentPage >= totalPages || state.filteredData.length === 0) {
            btnEl.style.display = 'none';

            // Adicionar mensagem de fim dos dados se não existir
            let endMsg = document.getElementById('endOfDataMsg');
            if (!endMsg && state.filteredData.length > 0) {
                endMsg = document.createElement('div');
                endMsg.id = 'endOfDataMsg';
                endMsg.style.cssText = `
                    color: var(--text-secondary);
                    font-size: 0.85rem;
                    font-weight: 500;
                    padding: 10px;
                    text-align: center;
                    width: 100%;
                `;
                endMsg.innerHTML = '<span class="material-icons" style="font-size: 16px; vertical-align: middle; margin-right: 4px;">check_circle</span> Fim dos dados';
                if (footerEl) footerEl.appendChild(endMsg);
            }
        } else {
            btnEl.style.display = 'inline-flex';
            const endMsg = document.getElementById('endOfDataMsg');
            if (endMsg) endMsg.remove();
        }
    }
}

function loadMore() {
    const totalPages = Math.ceil(state.filteredData.length / CONFIG.ITEMS_PER_PAGE);
    if (state.currentPage < totalPages) {
        const container = document.querySelector('.table-container');
        const scrollPos = container ? container.scrollTop : 0;
        const pageScrollPos = window.scrollY;

        state.currentPage++;
        renderTable();
        updatePagination();

        // Restaurar o scroll do container e da janela principal para garantir zero pulos
        if (container) {
            container.scrollTop = scrollPos;

            // Pequeno delay para garantir que o DOM renderizou
            setTimeout(() => {
                // Rolar até o fim do conteúdo carregado para mostrar os novos itens
                container.scrollTo({
                    top: container.scrollHeight,
                    behavior: 'smooth'
                });
            }, 100);
        }

        window.scrollTo({
            top: pageScrollPos,
            behavior: 'instant'
        });
    }
}
