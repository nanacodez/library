/* --- script.js (CORRIGIDO E UNIFICADO) --- */

// 1. STATE & STORAGE
let biblioteca = JSON.parse(localStorage.getItem('meusMangas')) || [];
let idEdicao = null; 
// Lê do localStorage se é premium (true/false)
let isPremium = localStorage.getItem('usuarioPremium') === 'true';

// 2. DADOS (MOCK DB)
const bancoDeMangas = [
    { 
        nome: "One Piece", 
        capa: "https://m.media-amazon.com/images/I/5186mF+xXVL._SY344_BO1,204,203,200_.jpg", 
        sinopse: "Luffy busca o maior tesouro do mundo para virar o Rei dos Piratas." 
    },
    { 
        nome: "Naruto", 
        capa: "https://m.media-amazon.com/images/I/511TN544E8L._SY344_BO1,204,203,200_.jpg", 
        sinopse: "Um ninja busca reconhecimento e sonha em se tornar Hokage." 
    },
    { 
        nome: "Berserk", 
        capa: "https://m.media-amazon.com/images/I/51F59T0+sWL._SY344_BO1,204,203,200_.jpg", 
        sinopse: "A luta brutal de Guts contra demônios e o destino." 
    },
    { 
        nome: "Demon Slayer", 
        capa: "https://m.media-amazon.com/images/I/515f1-sL-tL._SY344_BO1,204,203,200_.jpg", 
        sinopse: "Tanjiro luta para curar sua irmã transformada em oni." 
    }
];

const CAPA_PADRAO = "https://via.placeholder.com/300x400?text=Sem+Capa";

// 3. UI & UTILITÁRIOS
function atualizarStatusUI() {
    const badge = document.getElementById('statusUsuario');
    if (isPremium) {
        badge.innerText = "👑 Membro Premium";
        badge.classList.add('is-premium');
    } else {
        badge.innerText = "Plano Grátis";
        badge.classList.remove('is-premium');
    }
}

const setHoje = () => {
    const el = document.getElementById('dataRegistro');
    if(el) el.value = new Date().toISOString().split('T')[0];
};

window.atualizarPreview = function() {
    const url = document.getElementById('capaUrl').value;
    const img = document.getElementById('previewCapa');
    if(img) img.src = url || CAPA_PADRAO;
}

function salvarLocal() {
    localStorage.setItem('meusMangas', JSON.stringify(biblioteca));
}

// 4. RENDERIZAÇÃO
function renderizar() {
    const grid = document.getElementById('listaMangas');
    if(!grid) return;
    
    grid.innerHTML = '';
    const listaOrdenada = biblioteca.sort((a, b) => (b.favorito === true) - (a.favorito === true));

    listaOrdenada.forEach(manga => {
        const estrelas = '★'.repeat(manga.nota) + '☆'.repeat(5 - manga.nota);
        const statusBadge = manga.fim 
            ? `<span class="status-badge status-concluido">Concluído</span>` 
            : `<span class="status-badge status-lendo">Lendo</span>`;

        const imagemCapa = manga.capa || CAPA_PADRAO;

        const card = document.createElement('div');
        card.className = 'manga-card';
        
        card.innerHTML = `
            <img src="${imagemCapa}" class="card-cover" alt="${manga.nome}" onerror="this.src='${CAPA_PADRAO}'">
            <div class="card-content">
                <div class="manga-header">
                    <div>
                        <h3 class="manga-title" title="${manga.nome}">${manga.nome}</h3>
                        ${statusBadge}
                    </div>
                    <button class="favorite-btn ${manga.favorito ? 'active' : ''}" 
                            onclick="toggleFavorito(${manga.id})" title="Favoritar">♥</button>
                </div>
                <p class="manga-review" style="font-size: 0.85em; height: 40px; overflow: hidden; color: #ccc;">
                    ${manga.review ? manga.review.substring(0, 60) + '...' : 'Sem análise.'}
                </p>
                <div class="manga-footer" style="margin-top: auto;">
                    <span class="stars">${estrelas}</span>
                    <div class="card-actions">
                        <button class="btn-card btn-edit" onclick="prepararEdicao(${manga.id})">Editar</button>
                        <button class="btn-card btn-delete" onclick="deletarManga(${manga.id})">X</button>
                    </div>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// 5. AUTOCOMPLETE E LÓGICA DE CAPA
const inputBusca = document.getElementById('buscaManga');
const boxSugestoes = document.getElementById('listaSugestoes');
const wrapperCapa = document.getElementById('wrapperCapaUrl');
const wrapperPaywall = document.getElementById('wrapperPaywall');

if(inputBusca && boxSugestoes) {
    inputBusca.addEventListener('input', function() {
        const termo = this.value.toLowerCase();
        boxSugestoes.innerHTML = '';

        if (termo.length < 1) { 
            boxSugestoes.style.display = 'none'; 
            return; 
        }

        boxSugestoes.style.display = 'block';

        // Filtra e mostra sugestões do banco
        const resultados = bancoDeMangas.filter(m => m.nome.toLowerCase().includes(termo));
        resultados.forEach(manga => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';
            div.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="${manga.capa}" style="width: 30px; height: 40px; object-fit: cover;">
                    <span>${manga.nome}</span>
                </div>
            `;
            div.onclick = () => selecionarMangaExistente(manga);
            boxSugestoes.appendChild(div);
        });

        // Opção de Adicionar Manualmente
        const divAdd = document.createElement('div');
        divAdd.className = 'suggestion-add';
        divAdd.innerHTML = `➕ Não encontrou "${this.value}"? Adicionar Manualmente`;
        divAdd.onclick = () => habilitarCadastroManual(this.value);
        boxSugestoes.appendChild(divAdd);
    });

    document.addEventListener('click', (e) => {
        if (!inputBusca.contains(e.target) && !boxSugestoes.contains(e.target)) {
            boxSugestoes.style.display = 'none';
        }
    });
}

// 6. FUNÇÕES DE FLUXO (Manual vs Existente)

// Clicou num mangá existente: Esconde URL e Paywall (já tem capa)
function selecionarMangaExistente(mangaObj) {
    document.getElementById('nome').value = mangaObj.nome;
    document.getElementById('capaUrl').value = mangaObj.capa;
    document.getElementById('review').value = mangaObj.sinopse;
    
    wrapperCapa.classList.add('hidden');
    wrapperPaywall.classList.add('hidden');
    
    atualizarPreview(); 
    inputBusca.value = '';
    boxSugestoes.style.display = 'none';
    document.getElementById('mangaForm').scrollIntoView({ behavior: 'smooth' });
}

// Clicou em adicionar manual: Verifica se é Premium
function habilitarCadastroManual(nomeDigitado) {
    document.getElementById('nome').value = nomeDigitado;
    document.getElementById('capaUrl').value = '';
    document.getElementById('review').value = '';
    
    atualizarPreview(); 
    
    if (isPremium) {
        wrapperCapa.classList.remove('hidden');
        wrapperPaywall.classList.add('hidden');
        document.getElementById('capaUrl').focus();
    } else {
        wrapperCapa.classList.add('hidden');
        wrapperPaywall.classList.remove('hidden');
    }

    inputBusca.value = '';
    boxSugestoes.style.display = 'none';
    document.getElementById('mangaForm').scrollIntoView({ behavior: 'smooth' });
}

// 7. FUNÇÕES DO MODAL E COMPRA
window.abrirModalPremium = function() {
    document.getElementById('modalPremium').style.display = 'flex';
}

window.fecharModalPremium = function() {
    document.getElementById('modalPremium').style.display = 'none';
}

window.comprarPremium = function() {
    if(confirm("Simular pagamento de R$ 9,90 aprovado?")) {
        isPremium = true;
        localStorage.setItem('usuarioPremium', 'true');
        
        atualizarStatusUI();
        fecharModalPremium();
        
        // Libera a tela na hora
        wrapperPaywall.classList.add('hidden');
        wrapperCapa.classList.remove('hidden');
        
        alert("Parabéns! Você agora é Premium. Capas liberadas! 🥳");
    }
}

// 8. CRUD E GLOBAIS
window.prepararEdicao = function(id) {
    const manga = biblioteca.find(m => m.id === id);
    if (!manga) return;

    document.getElementById('nome').value = manga.nome;
    document.getElementById('capaUrl').value = manga.capa || '';
    document.getElementById('nota').value = manga.nota;
    document.getElementById('dataInicio').value = manga.inicio;
    document.getElementById('dataFim').value = manga.fim || '';
    document.getElementById('dataRegistro').value = manga.registro;
    document.getElementById('review').value = manga.review;
    document.getElementById('favorito').checked = manga.favorito;

    atualizarPreview();

    // Lógica Premium na Edição
    if (isPremium) {
        wrapperCapa.classList.remove('hidden');
        wrapperPaywall.classList.add('hidden');
    } else {
        wrapperCapa.classList.add('hidden');
        wrapperPaywall.classList.remove('hidden');
    }

    idEdicao = id;
    document.getElementById('btnSubmit').innerText = "Salvar Alterações";
    document.getElementById('btnCancel').style.display = "inline-block";
    document.getElementById('formCard').classList.add('editing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.cancelarEdicao = function() {
    document.getElementById('mangaForm').reset();
    setHoje();
    atualizarPreview();
    
    // Reseta visibilidade
    wrapperCapa.classList.add('hidden'); 
    wrapperPaywall.classList.add('hidden');
    
    idEdicao = null;
    document.getElementById('btnSubmit').innerText = "Adicionar à Coleção";
    document.getElementById('btnCancel').style.display = "none";
    document.getElementById('formCard').classList.remove('editing');
}

window.toggleFavorito = function(id) {
    const index = biblioteca.findIndex(m => m.id === id);
    if(index !== -1) {
        biblioteca[index].favorito = !biblioteca[index].favorito;
        salvarLocal();
        renderizar();
    }
}

window.deletarManga = function(id) {
    if(confirm('Tem certeza que deseja apagar?')) {
        biblioteca = biblioteca.filter(m => m.id !== id);
        if (idEdicao === id) cancelarEdicao();
        salvarLocal();
        renderizar();
    }
}

// 9. INICIALIZAÇÃO
document.addEventListener('DOMContentLoaded', () => {
    setHoje();
    atualizarStatusUI();
    renderizar();

    const form = document.getElementById('mangaForm');
    if(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const dadosForm = {
                nome: document.getElementById('nome').value,
                capa: document.getElementById('capaUrl').value,
                nota: parseInt(document.getElementById('nota').value),
                inicio: document.getElementById('dataInicio').value,
                fim: document.getElementById('dataFim').value || null,
                registro: document.getElementById('dataRegistro').value,
                review: document.getElementById('review').value,
                favorito: document.getElementById('favorito').checked
            };

            if (idEdicao) {
                const index = biblioteca.findIndex(m => m.id === idEdicao);
                if (index !== -1) biblioteca[index] = { ...dadosForm, id: idEdicao };
                cancelarEdicao();
            } else {
                const novoManga = { ...dadosForm, id: Date.now() };
                biblioteca.push(novoManga);
                e.target.reset();
                setHoje();
                // Após cadastrar novo, esconde input/paywall
                wrapperCapa.classList.add('hidden');
                wrapperPaywall.classList.add('hidden');
                atualizarPreview();
            }
            salvarLocal();
            renderizar();
        });
    }
});