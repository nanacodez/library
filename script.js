/* --- script.js COMPLETO E ATUALIZADO --- */

// 1. DADOS INICIAIS
// Carrega o que está salvo ou cria lista vazia
let biblioteca = JSON.parse(localStorage.getItem('meusMangas')) || [];
let idEdicao = null; 

// BANCO DE DADOS MOCK (Para o Autocomplete)
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
    },
    { 
        nome: "Jujutsu Kaisen", 
        capa: "https://m.media-amazon.com/images/I/51sK4jX6MOL._SY344_BO1,204,203,200_.jpg", 
        sinopse: "Yuji Itadori entra no mundo dos feiticeiros Jujutsu." 
    },
    {
        nome: "Chainsaw Man",
        capa: "https://m.media-amazon.com/images/I/516+2g82LmL._SY344_BO1,204,203,200_.jpg",
        sinopse: "Denji é um caçador de demônios que se funde com seu cão-demônio."
    }
];

const CAPA_PADRAO = "https://via.placeholder.com/300x400?text=Sem+Capa";

// 2. FUNÇÕES UTILITÁRIAS
const setHoje = () => {
    const el = document.getElementById('dataRegistro');
    if(el) el.value = new Date().toISOString().split('T')[0];
};

// Atualiza a imagem de preview quando o usuário cola o link
window.atualizarPreview = function() {
    const url = document.getElementById('capaUrl').value;
    const img = document.getElementById('previewCapa');
    if(img) img.src = url || CAPA_PADRAO;
}

function salvarLocal() {
    localStorage.setItem('meusMangas', JSON.stringify(biblioteca));
}

// 3. RENDERIZAÇÃO (Desenhar na tela)
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

// 4. AUTOCOMPLETE (Busca inteligente)
const inputBusca = document.getElementById('buscaManga');
const boxSugestoes = document.getElementById('listaSugestoes');

if(inputBusca && boxSugestoes) {
    inputBusca.addEventListener('input', function() {
        const termo = this.value.toLowerCase();
        boxSugestoes.innerHTML = '';

        if (termo.length < 2) { 
            boxSugestoes.style.display = 'none'; 
            return; 
        }

        const resultados = bancoDeMangas.filter(m => m.nome.toLowerCase().includes(termo));

        if (resultados.length > 0) {
            boxSugestoes.style.display = 'block';
            resultados.forEach(manga => {
                const div = document.createElement('div');
                div.className = 'suggestion-item';
                div.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <img src="${manga.capa}" style="width: 30px; height: 40px; object-fit: cover;">
                        <span>${manga.nome}</span>
                    </div>
                `;
                div.onclick = () => selecionarManga(manga);
                boxSugestoes.appendChild(div);
            });
        } else {
            boxSugestoes.style.display = 'none';
        }
    });

    // Fecha a lista se clicar fora
    document.addEventListener('click', (e) => {
        if (!inputBusca.contains(e.target) && !boxSugestoes.contains(e.target)) {
            boxSugestoes.style.display = 'none';
        }
    });
}

function selecionarManga(mangaObj) {
    document.getElementById('nome').value = mangaObj.nome;
    document.getElementById('capaUrl').value = mangaObj.capa;
    document.getElementById('review').value = mangaObj.sinopse;
    
    atualizarPreview(); 

    inputBusca.value = '';
    boxSugestoes.style.display = 'none';
    document.getElementById('mangaForm').scrollIntoView({ behavior: 'smooth' });
}

// 5. INICIALIZAÇÃO E EVENT LISTENERS
document.addEventListener('DOMContentLoaded', () => {
    setHoje();
    renderizar();

    // Listener do Formulário (Submit)
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
                atualizarPreview();
            }
            salvarLocal();
            renderizar();
        });
    }
});

// 6. FUNÇÕES GLOBAIS (Edição e Exclusão)
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

    idEdicao = id;
    document.getElementById('btnSubmit').innerText = "Salvar Alterações";
    const btnCancel = document.getElementById('btnCancel');
    if(btnCancel) btnCancel.style.display = "inline-block";
    
    document.getElementById('formCard').classList.add('editing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.cancelarEdicao = function() {
    document.getElementById('mangaForm').reset();
    setHoje();
    atualizarPreview();
    idEdicao = null;
    document.getElementById('btnSubmit').innerText = "Adicionar à Coleção";
    const btnCancel = document.getElementById('btnCancel');
    if(btnCancel) btnCancel.style.display = "none";
    
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
    if(confirm('Tem certeza que deseja apagar este mangá da história?')) {
        biblioteca = biblioteca.filter(m => m.id !== id);
        if (idEdicao === id) cancelarEdicao();
        salvarLocal();
        renderizar();
    }
}