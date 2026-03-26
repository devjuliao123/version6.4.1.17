// ==================== GRÁFICOS ====================

function getChartColors() {
    const isDark = document.body.classList.contains('dark');
    return {
        primary: isDark ? '#38bdf8' : '#0ea5e9',
        text: getComputedStyle(document.body).getPropertyValue('--text').trim(),
        muted: getComputedStyle(document.body).getPropertyValue('--text-secondary').trim(),
        grid: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
        etl: '#8b5cf6',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        website: '#F07A2B',
        cloud: '#0ea5e9',
        fisco: '#0038a8',
        zapcrm: '#10b981'
    };
}

function getSistemaColor(sistema) {
    const sistemaUpper = sistema.toUpperCase();
    if (sistemaUpper.includes('WEBSITE')) return '#F07A2B';
    if (sistemaUpper.includes('CLOUD')) return '#0ea5e9';
    if (sistemaUpper.includes('FISCO')) return '#0038a8';
    if (sistemaUpper.includes('ZAPCRM')) return '#10b981';
    if (sistemaUpper.includes('CONTÁBIL')) return '#0038a8';
    if (sistemaUpper.includes('FISCAL')) return '#0038a8';
    if (sistemaUpper.includes('WEBPAV')) return '#ec4899';
    if (sistemaUpper.includes('FOLHA')) return '#14b8a6';
    if (sistemaUpper.includes('ADICION')) return '#f97316';
    return '#64748b';
}

function destroyCharts() {
    Object.values(state.charts).forEach(chart => {
        if (chart && typeof chart.destroy === 'function') {
            chart.destroy();
        }
    });
    state.charts = {};
}

// ==================== PROCESSAMENTO DE DADOS PARA GRÁFICOS ====================

function processarSistemas(base) {
    const sistemas = {};
    base.forEach(item => {
        if (item.sistema) {
            item.sistema.split('/').forEach(s => {
                const sistema = s.trim();
                if (sistema) sistemas[sistema] = (sistemas[sistema] || 0) + 1;
            });
        }
    });
    return sistemas;
}

function processarBancosESistemas(base) {
    const bancos = {};
    const sistemasAnteriores = {};

    base.forEach(item => {
        if (item.bancoAnterior) {
            const banco = item.bancoAnterior.trim();
            if (banco) bancos[banco] = (bancos[banco] || 0) + 1;
        }
        if (item.sistemaAnterior) {
            const sistema = item.sistemaAnterior.trim();
            if (sistema) sistemasAnteriores[sistema] = (sistemasAnteriores[sistema] || 0) + 1;
        }
    });

    return { bancos, sistemasAnteriores };
}

function processarModalidades(base) {
    const modalidades = {};
    base.forEach(item => {
        if (item.modalidade) {
            const mod = item.modalidade.trim();
            if (mod) modalidades[mod] = (modalidades[mod] || 0) + 1;
        }
    });
    return modalidades;
}

function processarMarcas(base) {
    const marcas = {};
    base.forEach(item => {
        if (item.marca) {
            const marca = item.marca.trim();
            if (marca) marcas[marca] = (marcas[marca] || 0) + 1;
        }
    });
    return marcas;
}

function processarValorPorAno(base) {
    const valores = {};
    base.forEach(item => {
        if (item.dataObj && item.valor) {
            const ano = item.dataObj.getFullYear();
            valores[ano] = (valores[ano] || 0) + item.valor;
        }
    });
    return valores;
}

function processarCrescimento(base) {
    const crescimento = {};
    base.forEach(item => {
        if (item.dataObj) {
            const ano = item.dataObj.getFullYear();
            crescimento[ano] = (crescimento[ano] || 0) + 1;
        }
    });
    return crescimento;
}

// ==================== CRIAÇÃO DOS GRÁFICOS ====================

function criarGraficos() {
    destroyCharts();

    const base = state.filteredData;
    const colors = getChartColors();
    const isImplRole = state.userRole === 'implantação';

    const sistemas = processarSistemas(base);
    const { bancos, sistemasAnteriores } = processarBancosESistemas(base);
    const modalidades = processarModalidades(base);
    const marcas = processarMarcas(base);
    const valorPorAno = processarValorPorAno(base);
    const crescimento = processarCrescimento(base);

    // ==================== GRÁFICO DE SISTEMAS ====================
    const sistemaCanvas = document.getElementById('sistemaChart');
    if (sistemaCanvas) {
        if (Object.keys(sistemas).length > 0) {
            const sorted = Object.entries(sistemas).sort((a, b) => b[1] - a[1]).slice(0, 10);
            const backgroundColors = sorted.map(([sistema]) => getSistemaColor(sistema));

            state.charts.sistema = new Chart(sistemaCanvas, {
                type: 'bar',
                data: {
                    labels: sorted.map(([s]) => s),
                    datasets: [{
                        data: sorted.map(([_, v]) => v),
                        backgroundColor: backgroundColors,
                        borderRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'y',
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: (ctx) => ` ${ctx.raw} implantação(ões)`
                            }
                        }
                    },
                    scales: {
                        x: { grid: { color: colors.grid }, ticks: { color: colors.muted } },
                        y: { grid: { display: false }, ticks: { color: colors.muted, font: { size: 11 } } }
                    }
                }
            });
        } else {
            showNoDataMessage(sistemaCanvas, 'Sem dados de sistemas');
        }
    }

    // ==================== GRÁFICO DE BANCOS E SISTEMAS ANTERIORES ====================
    const bancoCanvas = document.getElementById('bancoChart');
    if (bancoCanvas) {
        const combinedLabels = [...Object.keys(bancos), ...Object.keys(sistemasAnteriores)];
        const combinedData = [...Object.values(bancos), ...Object.values(sistemasAnteriores)];
        const combinedColors = ['#0ea5e9', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#84cc16'];

        if (combinedLabels.length > 0) {
            state.charts.banco = new Chart(bancoCanvas, {
                type: 'doughnut',
                data: {
                    labels: combinedLabels,
                    datasets: [{
                        data: combinedData,
                        backgroundColor: combinedColors.slice(0, combinedLabels.length),
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'right', labels: { color: colors.text, font: { size: 10 } } },
                        tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.raw} ocorrência(s)` } }
                    },
                    cutout: '60%'
                }
            });
        } else {
            showNoDataMessage(bancoCanvas, 'Sem dados');
        }
    }

    // ==================== GRÁFICO DE VALOR POR ANO (RESTRICTED) ====================
    const valorCanvas = document.getElementById('valorAnoChart');
    if (valorCanvas) {
        if (isImplRole) {
            showNoDataMessage(valorCanvas, 'Dados de valores restritos para este perfil');
        } else if (Object.keys(valorPorAno).length > 0) {
            const anos = Object.keys(valorPorAno).sort();
            state.charts.valorAno = new Chart(valorCanvas, {
                type: 'bar',
                data: {
                    labels: anos,
                    datasets: [{
                        label: 'Valor Implantado',
                        data: anos.map(a => valorPorAno[a]),
                        backgroundColor: colors.primary,
                        borderRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: { callbacks: { label: (ctx) => ' ' + formatCurrency(ctx.raw) } }
                    },
                    scales: {
                        y: { ticks: { callback: (v) => 'R$ ' + (v / 1000).toFixed(0) + 'k' } }
                    }
                }
            });
        } else {
            showNoDataMessage(valorCanvas, 'Sem dados');
        }
    }

    // ==================== GRÁFICO DE CRESCIMENTO ====================
    const crescimentoCanvas = document.getElementById('crescimentoChart');
    const crescimentoContainer = crescimentoCanvas?.closest('.chart-box');
    const anoFiltro = document.getElementById('anoFiltro')?.value;

    if (crescimentoCanvas) {
        if (anoFiltro) {
            if (crescimentoContainer) crescimentoContainer.style.display = 'none';
        } else {
            if (crescimentoContainer) crescimentoContainer.style.display = 'flex';
            if (Object.keys(crescimento).length > 0) {
                const anos = Object.keys(crescimento).sort();
                state.charts.crescimento = new Chart(crescimentoCanvas, {
                    type: 'line',
                    data: {
                        labels: anos,
                        datasets: [{
                            data: anos.map(a => crescimento[a]),
                            borderColor: colors.primary,
                            backgroundColor: colors.primary + '20',
                            fill: true,
                            tension: 0.4,
                            pointRadius: 4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false },
                            tooltip: { callbacks: { label: (ctx) => ` ${ctx.raw} implantação(ões)` } }
                        },
                        scales: {
                            x: { grid: { display: false }, ticks: { color: colors.muted } },
                            y: { grid: { color: colors.grid }, ticks: { color: colors.muted } }
                        }
                    }
                });
            } else {
                showNoDataMessage(crescimentoCanvas, 'Sem dados');
            }
        }
    }

    // ==================== GRÁFICO DE MODALIDADES ====================
    const modalidadeCanvas = document.getElementById('modalidadeChart');
    if (modalidadeCanvas) {
        const modalidadesFiltradas = { ...modalidades };
        delete modalidadesFiltradas[''];
        if (Object.keys(modalidadesFiltradas).length > 0) {
            state.charts.modalidade = new Chart(modalidadeCanvas, {
                type: 'bar',
                data: {
                    labels: Object.keys(modalidadesFiltradas).sort(),
                    datasets: [{
                        data: Object.values(modalidadesFiltradas),
                        backgroundColor: colors.primary,
                        borderRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: { callbacks: { label: (ctx) => ` ${ctx.raw} filial(is)` } }
                    },
                    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
                }
            });
        } else {
            showNoDataMessage(modalidadeCanvas, 'Sem dados');
        }
    }

    // ==================== GRÁFICO DE MARCAS ====================
    const marcaCanvas = document.getElementById('marcaChart');
    if (marcaCanvas) {
        if (Object.keys(marcas).length > 0) {
            const sorted = Object.entries(marcas).sort((a, b) => b[1] - a[1]);
            const labels = sorted.slice(0, 10).map(([m]) => m);
            const data = sorted.slice(0, 10).map(([_, v]) => v);

            state.charts.marca = new Chart(marcaCanvas, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        data: data,
                        backgroundColor: colors.primary,
                        borderRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'y',
                    plugins: {
                        legend: { display: false },
                        tooltip: { callbacks: { label: (ctx) => ` ${ctx.raw} filial(is)` } }
                    }
                }
            });
        } else {
            showNoDataMessage(marcaCanvas, 'Sem dados de marcas');
        }
    }

    ajustarLarguraBarras();
}

function showNoDataMessage(canvas, message) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '14px Poppins';
    ctx.fillStyle = getChartColors().muted;
    ctx.textAlign = 'center';
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);
}

function ajustarLarguraBarras() {
    const barCharts = ['sistema', 'valorAno', 'modalidade', 'marca'];
    barCharts.forEach(key => {
        const chart = state.charts[key];
        if (chart && chart.config.type === 'bar') {
            const numBars = chart.data.labels.length;
            if (numBars <= 3) {
                chart.options.barPercentage = 0.3;
                chart.options.categoryPercentage = 0.5;
            } else {
                chart.options.barPercentage = 0.7;
                chart.options.categoryPercentage = 0.9;
            }
            chart.update();
        }
    });
}
