// ==================== MODAIS ====================

function criarModal() {
    if (!document.getElementById('observacoesModal')) {
        const modalHTML = `
            <div id="observacoesModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3><span class="material-icons">info</span> Detalhes do Registro</h3>
                        <span class="close-modal material-icons" aria-label="Fechar modal" title="Fechar (ESC)">close</span>
                    </div>
                    <div class="modal-body"></div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    const modal = document.getElementById('observacoesModal');
    const closeBtn = modal?.querySelector('.close-modal');

    if (closeBtn) {
        closeBtn.onclick = () => {
            modal.style.display = 'none';
        };
    }

    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
}


function abrirModal(observacoes, dadosRegistro) {
    const modal = document.getElementById('observacoesModal');
    const modalBody = modal.querySelector('.modal-body');
    const isImplRole = (typeof isAnonymized === 'function') ? isAnonymized() : false;

    const infoETL = typeof parseObservacoes === 'function' ? parseObservacoes(observacoes) : { valido: false };
    const temETLReal = typeof temDadosETL === 'function' ? temDadosETL(infoETL) : false;

    let textoAdicional = observacoes || '';

    // Gerar visualização de tags ETL se existirem
    let etlTagsHTML = '';
    if (temETLReal) {
        etlTagsHTML = `
            <div style="margin-bottom: 20px;">
                <div style="font-size: 0.8rem; font-weight: 700; color: #8b5cf6; text-transform: uppercase; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
                    <span class="material-icons" style="font-size: 18px;">auto_awesome</span> Detalhes do Processo ETL
                </div>

                <div style="display: flex; flex-direction: column; gap: 12px;">
                    ${infoETL.extracao.length > 0 ? `
                        <div style="background: rgba(139, 92, 246, 0.05); border: 1px solid rgba(139, 92, 246, 0.2); border-radius: 8px; padding: 12px;">
                            <div style="font-size: 0.7rem; font-weight: 700; color: #8b5cf6; margin-bottom: 8px;">EXTRAÇÃO</div>
                            <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                                ${infoETL.extracao.map(tag => `<span class="badge" style="background: rgba(139, 92, 246, 0.1); color: #8b5cf6; border: none; font-size: 0.65rem;">${formatarTextoETL(tag)}</span>`).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        textoAdicional = textoAdicional.replace(/EXTRAÇÃO:?\s*\[.*?\]/i, '')
                                     .replace(/HISTÓRICO:?\s*\[.*?\]/i, '')
                                     .trim();
    }

    const infoHTML = `
        <div>
            <div style="display: flex; justify-content: flex-end; align-items: center; margin-bottom: 20px;">
                <div style="display: flex; gap: 8px;">
                    <span style="background: var(--primary); color: white; padding: 4px 12px; border-radius: 40px; font-size: 0.7rem; font-weight: 600;">Filial ${dadosRegistro.filial_codigo || 'N/I'}</span>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; background: var(--bg); padding: 16px; border-radius: 12px; margin-bottom: 20px;">
                <div><div style="color: var(--text-secondary); font-size: 0.7rem; text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">Filial</div><div style="font-weight: 600;">${dadosRegistro.filial || 'N/I'}</div></div>
                <div><div style="color: var(--text-secondary); font-size: 0.7rem; text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">Descrição</div><div style="font-weight: 600;">${dadosRegistro.filial_descricao || 'N/I'}</div></div>
                <div><div style="color: var(--text-secondary); font-size: 0.7rem; text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">Valor Total</div><div style="font-weight: 600; color: var(--success);">${formatCurrency(dadosRegistro.valor)}</div></div>
                <div><div style="color: var(--text-secondary); font-size: 0.7rem; text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">Valor Comissão</div><div style="font-weight: 600; color: var(--warning);">${formatCurrency(dadosRegistro.valor_comissao)}</div></div>
                <div><div style="color: var(--text-secondary); font-size: 0.7rem; text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">Sistema</div><div style="font-weight: 600;">${dadosRegistro.sistema || 'N/I'}</div></div>
                <div><div style="color: var(--text-secondary); font-size: 0.7rem; text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">Sistema Anterior</div><div style="font-weight: 600;">${dadosRegistro.sistemaAnterior || 'N/I'}</div></div>
                <div><div style="color: var(--text-secondary); font-size: 0.7rem; text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">Sistema Extração</div><div style="font-weight: 600;">${dadosRegistro.sistemaExtracao || 'N/I'}</div></div>
                <div><div style="color: var(--text-secondary); font-size: 0.7rem; text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">Data Venda</div><div style="font-weight: 600;">${dadosRegistro.data_venda || 'N/I'}</div></div>
                <div><div style="color: var(--text-secondary); font-size: 0.7rem; text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">Data Implantação</div><div style="font-weight: 600;">${dadosRegistro.dataImplantacao || 'N/I'}</div></div>
            </div>

            ${etlTagsHTML}
            ${textoAdicional ? `<div style="margin-top: 20px; padding: 16px; background: var(--bg); border-left: 4px solid var(--primary); border-radius: 8px;"><div style="font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; margin-bottom: 8px;">Observações Complementares</div><div>${textoAdicional}</div></div>` : ''}
        </div>
    `;

    modalBody.innerHTML = infoHTML;
    modal.style.display = 'block';
}

function criarModalMelhorado(titulo, icone, cor, dados, config) {
    const modal = document.getElementById('observacoesModal');
    const modalBody = modal.querySelector('.modal-body');

    let sistemasAgrupados = (typeof agruparSistemasNormalizados === 'function') ? agruparSistemasNormalizados(dados) : {};
    let totalGeral = dados.reduce((sum, item) => sum + (item.total_geral || 0), 0);

    // Obter sistemas únicos para as tags de filtro
    const sistemasUnicos = Object.keys(sistemasAgrupados).sort();

    const html = `
        <div class="modal-melhorado">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; padding-bottom: 0.75rem; border-bottom: 2px solid ${cor};">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <span class="material-icons" style="color: ${cor}; font-size: 24px;">${icone}</span>
                    <h3 style="color: ${cor}; margin: 0; font-size: 1.2rem;">${titulo}</h3>
                </div>
                <div id="modalSummaryStats" style="background: var(--bg); padding: 0.4rem 0.8rem; border-radius: 40px; font-size: 0.8rem; font-weight: 600; border: 1px solid var(--border);">
                    <span id="modalFilialCount">${dados.length}</span> Filiais | <span id="modalTotalValue" style="color: ${cor};">${formatCurrency(totalGeral)}</span>
                </div>
            </div>

            <!-- Tags de Filtro -->
            <div class="modal-filter-tags" style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 1.5rem; padding: 10px; background: var(--bg); border-radius: 12px; border: 1px solid var(--border);">
                <button class="modal-tag active" data-filter="TODOS" style="padding: 6px 14px; border-radius: 20px; border: 1.5px solid ${cor}; background: ${cor}; color: white; font-size: 0.75rem; font-weight: 700; cursor: pointer; transition: all 0.2s;">
                    TODOS (${dados.length})
                </button>
                ${sistemasUnicos.map(sistema => `
                    <button class="modal-tag" data-filter="${sistema}" style="padding: 6px 14px; border-radius: 20px; border: 1.5px solid var(--border); background: var(--surface); color: var(--text-secondary); font-size: 0.75rem; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                        ${sistema} (${sistemasAgrupados[sistema].quantidade})
                    </button>
                `).join('')}
            </div>

            <div id="listaFiliaisContainer" style="max-height: 400px; overflow-y: auto; padding-right: 0.5rem; display: flex; flex-direction: column; gap: 0.75rem;">
                ${renderizarListaFiliaisModal(dados, cor)}
            </div>

            <div style="margin-top: 1.5rem; display: flex; justify-content: flex-end;">
                <button onclick="document.getElementById('observacoesModal').style.display='none'" class="action-btn">Fechar</button>
            </div>
        </div>
    `;

    modalBody.innerHTML = html;
    modal.style.display = 'block';

    // Adicionar eventos para as tags
    const tags = modalBody.querySelectorAll('.modal-tag');
    tags.forEach(tag => {
        tag.addEventListener('click', () => {
            const filter = tag.getAttribute('data-filter');

            // Atualizar UI das tags
            tags.forEach(t => {
                t.classList.remove('active');
                t.style.background = 'var(--surface)';
                t.style.color = 'var(--text-secondary)';
                t.style.borderColor = 'var(--border)';
            });
            tag.classList.add('active');
            tag.style.background = cor;
            tag.style.color = 'white';
            tag.style.borderColor = cor;

            // Filtrar dados
            let dadosFiltrados = dados;
            if (filter !== 'TODOS') {
                dadosFiltrados = sistemasAgrupados[filter].itens;
            }

            // Atualizar lista e contadores
            const container = document.getElementById('listaFiliaisContainer');
            container.innerHTML = renderizarListaFiliaisModal(dadosFiltrados, cor);

            const filialCountEl = document.getElementById('modalFilialCount');
            const totalValueEl = document.getElementById('modalTotalValue');
            const totalFiltrado = dadosFiltrados.reduce((sum, item) => sum + (item.total_geral || 0), 0);

            if (filialCountEl) filialCountEl.textContent = dadosFiltrados.length;
            if (totalValueEl) totalValueEl.textContent = formatCurrency(totalFiltrado);
        });
    });
}

function renderizarListaFiliaisModal(dados, cor) {
    if (dados.length === 0) {
        return `<div style="text-align: center; padding: 2rem; color: var(--text-secondary);">Nenhuma filial encontrada para este filtro.</div>`;
    }

    return dados.map(item => `
        <div class="detalhe-item" style="background: var(--surface); border: 1.5px solid var(--border); border-radius: 12px; padding: 1.2rem; transition: all 0.2s; cursor: pointer; box-shadow: var(--shadow-sm);"
             onmouseover="this.style.borderColor='${cor}'; this.style.transform='translateX(5px)'; this.style.boxShadow='var(--shadow)';"
             onmouseout="this.style.borderColor='var(--border)'; this.style.transform='translateX(0)'; this.style.boxShadow='var(--shadow-sm)';"
             onclick="abrirModal('${(item.observacoes || '').replace(/'/g, "\\'")}', ${JSON.stringify(item).replace(/'/g, "\\'")})">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                <div style="font-weight: 700; font-size: 1rem; color: var(--text);">${item.filial || 'N/I'}</div>
                <div style="font-weight: 800; color: ${cor}; font-size: 1.1rem;">${formatCurrency(item.total_geral)}</div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="font-size: 0.85rem; color: var(--text-secondary); font-weight: 500;">${item.organizacao_descricao || 'N/I'}</div>
                <div style="display: flex; gap: 4px;">
                    ${(item.sistema || '').split('/').map(s => s.trim()).filter(s => s).map(s => `<span style="font-size: 0.65rem; background: var(--bg); padding: 2px 8px; border-radius: 4px; border: 1px solid var(--border); color: var(--text-secondary); font-weight: 600;">${s}</span>`).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

function mostrarDetalhesValorTotal() { criarModalMelhorado('Detalhamento de Valores', 'payments', 'var(--primary)', state.filteredData, { tipo: 'valor' }); }
function mostrarDetalhesComissao() {
    if (isAnonymized()) {
        const baseComissao = state.filteredData.reduce((sum, item) => sum + (item.valor_comissao || 0), 0);
        const porAnalista = (baseComissao * 0.03) / 3;

        const modal = document.getElementById('observacoesModal');
        const modalBody = modal.querySelector('.modal-body');
        modalBody.innerHTML = `
            <div class="modal-melhorado">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 2px solid var(--warning);">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <span class="material-icons" style="color: var(--warning); font-size: 24px;">monetization_on</span>
                        <h3 style="color: var(--warning); margin: 0; font-size: 1.2rem;">Comissão Individual</h3>
                    </div>
                </div>
                <div style="background: var(--bg); padding: 2rem; border-radius: 12px; text-align: center;">
                    <div style="font-size: 0.9rem; color: var(--text-secondary); text-transform: uppercase; margin-bottom: 8px;">Valor por Analista</div>
                    <div style="font-size: 2rem; font-weight: 700; color: var(--warning);">${formatCurrency(porAnalista, true)}</div>
                </div>
                <div style="margin-top: 1.5rem; display: flex; justify-content: flex-end;">
                    <button onclick="document.getElementById('observacoesModal').style.display='none'" class="action-btn">Fechar</button>
                </div>
            </div>
        `;
        modal.style.display = 'block';
        return;
    }
    const dados = state.filteredData;
    criarModalMelhorado('Comissão (3%)', 'monetization_on', 'var(--warning)', dados, { tipo: 'comissao' });
}
function mostrarEmRisco() {
    const hoje = new Date(); hoje.setHours(0,0,0,0);
    const emRisco = (state.globalData || state.filteredData).filter(item => item.pendente && item.dataVendaObj && !item.dataImplantacaoObj && (hoje - item.dataVendaObj) > 90 * 24 * 60 * 60 * 1000);
    criarModalMelhorado('Filiais em Risco (>90 dias)', 'warning', 'var(--danger)', emRisco, { tipo: 'risco' });
}
function mostrarPrevisaoFutura() {
    const futuro = (state.globalData || state.filteredData).filter(item => !item.dataImplantacaoObj && item.dataPrevisao);
    criarModalMelhorado('Previsões de Implantação', 'date_range', 'var(--success)', futuro, { tipo: 'previsao' });
}
function mostrarEmProcesso() {
    const emProcesso = state.filteredData.filter(item => item.pendente && (item.observacoes || '').match(/EM PROCESSO:/i));
    criarModalMelhorado('Filiais em Processo', 'sync', 'var(--info)', emProcesso, { tipo: 'processo' });
}
function mostrarPendencias() { criarModalMelhorado('Filiais Pendentes', 'pending_actions', 'var(--warning)', state.filteredData.filter(d => d.pendente), { tipo: 'pendente' }); }
function mostrarFiliaisPorMarca(marca) { criarModalMelhorado(`Filiais da Marca: ${marca}`, 'branding_watermark', 'var(--primary)', state.filteredData.filter(item => item.marca === marca), { tipo: 'marca' }); }
function mostrarFiliaisPorSistema(sistema) { criarModalMelhorado(`Filiais com ${sistema}`, 'computer', 'var(--primary)', state.filteredData.filter(item => item.sistema && item.sistema.includes(sistema)), { tipo: 'sistema' }); }
function mostrarFiliaisPorModalidade(modalidade) { criarModalMelhorado(`Modalidade: ${modalidade}`, 'category', 'var(--primary)', state.filteredData.filter(item => item.modalidade === modalidade), { tipo: 'modalidade' }); }
function mostrarFiliaisPorAno(ano) { criarModalMelhorado(`Ano ${ano}`, 'calendar_today', 'var(--primary)', state.filteredData.filter(item => item.dataObj && item.dataObj.getFullYear() === parseInt(ano)), { tipo: 'ano' }); }
function mostrarFiliaisPorCategoria(categoria) { criarModalMelhorado(`Categoria: ${categoria}`, 'storage', 'var(--primary)', state.filteredData.filter(item => item.bancoAnterior === categoria || item.sistemaAnterior === categoria), { tipo: 'categoria' }); }

function mostrarFiliaisPorTipoValor(tipo) {
    const dados = state.filteredData.filter(item => {
        if (tipo === 'erp') return item.modalidade === 'ERP';
        if (tipo === 'agregado') return item.modalidade === 'AGREGADO';
        return true;
    });
    criarModalMelhorado(`Filiais - Modalidade ${tipo.toUpperCase()}`, 'payments', 'var(--primary)', dados, { tipo: 'valor_tipo' });
}
