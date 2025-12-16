/* --- script.js --- */

// 1. STATE & STORAGE
let biblioteca = JSON.parse(localStorage.getItem('meusMangas')) || [];
let idEdicao = null; 

const setHoje = () => {
    const hoje = new Date().toISOString().split('T')[0];
    const inputRegistro = document.getElementById('dataRegistro');
    if(inputRegistro) inputRegistro.value = hoje;
};

// 2. FUNÇÕES CORE
function salvarLocal() {
    localStorage.setItem('meusMangas', JSON.stringify(biblioteca));
}

function renderizar() {
    const grid = document.getElementById('listaMangas');
    grid.innerHTML = '';
    const listaOrdenada = biblioteca.sort((a, b) => (b.favorito === true) - (a.favorito === true));

    listaOrdenada.forEach(manga => {
        const estrelas = '★'.repeat(manga.nota) + '☆'.repeat(5 - manga.nota);
        const statusBadge = manga.fim 
            ? `<span class="status-badge status-concluido">Concluído</span>` 
            : `<span class="status-badge status-lendo">Lendo</span>`;

        const dtInicio = new Date(manga.inicio).toLocaleDateString('pt-BR', {timeZone: 'UTC'});
        const dtRegistro = new Date(manga.registro).toLocaleDateString('pt-BR', {timeZone: 'UTC'});
        const dtFim = manga.fim ? new Date(manga.fim).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : '---';

        const card = document.createElement('div');
        card.className = 'manga-card';
        
        card.innerHTML = `
            <div class="manga-header">
                <div>
                    <h3 class="manga-title">${manga.nome}</h3>
                    ${statusBadge}
                </div>
                <button class="favorite-btn ${manga.favorito ? 'active' : ''}" 
                        onclick="toggleFavorito(${manga.id})" title="Favoritar">
                    ♥
                </button>
            </div>
            
            <div class="manga-dates">
                <div class="date-item"><span>Início:</span> <b>${dtInicio}</b></div>
                <div class="date-item"><span>Fim:</span> <b>${dtFim}</b></div>
                <div class="date-item"><span>Add em:</span> <b>${dtRegistro}</b></div>
            </div>

            <p class="manga-review">"${manga.review}"</p>
            
            <div class="manga-footer">
                <span class="stars" title="Nota ${manga.nota}">${estrelas}</span>
                <div class="card-actions">
                    <button class="btn-card btn-edit" onclick="prepararEdicao(${manga.id})">Editar</button>
                    <button class="btn-card btn-delete" onclick="deletarManga(${manga.id})">Remover</button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// 3. LÓGICA DE EDIÇÃO
function prepararEdicao(id) {
    const manga = biblioteca.find(m => m.id === id);
    if (!manga) return;

    document.getElementById('nome').value = manga.nome;
    document.getElementById('nota').value = manga.nota;
    document.getElementById('dataInicio').value = manga.inicio;
    document.getElementById('dataFim').value = manga.fim || '';
    document.getElementById('dataRegistro').value = manga.registro;
    document.getElementById('review').value = manga.review;
    document.getElementById('favorito').checked = manga.favorito;

    idEdicao = id;
    
    document.getElementById('btnSubmit').innerText = "Salvar Alterações";
    document.getElementById('btnCancel').style.display = "inline-block";
    document.getElementById('formCard').classList.add('editing');
    document.body.classList.add('mode-edit');

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function cancelarEdicao() {
    document.getElementById('mangaForm').reset();
    setHoje();
    
    idEdicao = null;
    
    document.getElementById('btnSubmit').innerText = "Adicionar à Coleção";
    document.getElementById('btnCancel').style.display = "none";
    document.getElementById('formCard').classList.remove('editing');
    document.body.classList.remove('mode-edit');
}

// 4. AÇÕES E LISTENERS
document.addEventListener('DOMContentLoaded', () => {
    // Inicializa data e renderização ao carregar a página
    setHoje();
    renderizar();

    // Listener do Formulário
    document.getElementById('mangaForm').addEventListener('submit', (e) => {
        e.preventDefault();

        const dadosForm = {
            nome: document.getElementById('nome').value,
            nota: parseInt(document.getElementById('nota').value),
            inicio: document.getElementById('dataInicio').value,
            fim: document.getElementById('dataFim').value || null,
            registro: document.getElementById('dataRegistro').value,
            review: document.getElementById('review').value,
            favorito: document.getElementById('favorito').checked
        };

        if (idEdicao) {
            const index = biblioteca.findIndex(m => m.id === idEdicao);
            if (index !== -1) {
                biblioteca[index] = { ...dadosForm, id: idEdicao };
            }
            cancelarEdicao();
        } else {
            const novoManga = { ...dadosForm, id: Date.now() };
            biblioteca.push(novoManga);
            e.target.reset();
            setHoje();
        }

        salvarLocal();
        renderizar();
    });
});

// Funções globais (precisam estar acessíveis no window para o onclick do HTML)
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

window.prepararEdicao = prepararEdicao;
window.cancelarEdicao = cancelarEdicao;