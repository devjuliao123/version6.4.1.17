// ==================== NORMALIZAÇÃO DE SISTEMAS ====================

function normalizarSistemas(sistemasStr) {
    if (!sistemasStr) return ['OUTROS'];
    
    // Mapeamento de sistemas principais
    const sistemaMap = {
        'CLOUD': 'CLOUD',
        'WEBSITE': 'WEBSITE',
        'WEB SITE': 'WEBSITE',
        'ZAPCRM': 'ZAPCRM',
        'FISCO': 'FISCO',
        'CONTÁBIL': 'CONTÁBIL',
        'FISCAL': 'FISCAL',
        'WEBPAV': 'WEBPAV',
        'FOLHA': 'FOLHA',
        'ADICION': 'ADICION'
    };
    
    // Dividir por '/' e limpar
    const sistemas = sistemasStr.split('/').map(s => s.trim().toUpperCase());
    
    // Extrair sistemas únicos que existem no mapa
    const sistemasUnicos = [...new Set(
        sistemas
            .map(s => {
                // Verificar correspondência exata primeiro
                if (sistemaMap[s]) return sistemaMap[s];
                
                // Verificar correspondência parcial
                for (let [key, value] of Object.entries(sistemaMap)) {
                    if (s.includes(key)) return value;
                }
                return null;
            })
            .filter(s => s !== null)
    )];
    
    return sistemasUnicos.length > 0 ? sistemasUnicos : ['OUTROS'];
}

function agruparSistemasNormalizados(dados) {
    const sistemasAgrupados = {};
    
    dados.forEach(item => {
        if (!item.sistema) return;
        
        const sistemasNorm = normalizarSistemas(item.sistema);
        const valor = item.total_geral || 0;
        
        sistemasNorm.forEach(sistema => {
            if (!sistemasAgrupados[sistema]) {
                sistemasAgrupados[sistema] = {
                    quantidade: 0,
                    valor: 0,
                    original: sistema,
                    itens: []
                };
            }
            sistemasAgrupados[sistema].quantidade++;
            sistemasAgrupados[sistema].valor += valor;
            sistemasAgrupados[sistema].itens.push(item);
        });
    });
    
    return sistemasAgrupados;
}