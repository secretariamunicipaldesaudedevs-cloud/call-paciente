// script.js

// Banco de cores gradientes modernas para alternar a cada clique
const paletaCores = [
    'linear-gradient(135deg, #ec4899, #8b5cf6)', // Rosa para Roxo
    'linear-gradient(135deg, #3b82f6, #1d4ed8)', // Azul Tecnológico
    'linear-gradient(135deg, #10b981, #059669)', // Verde Esmeralda
    'linear-gradient(135deg, #f59e0b, #d97706)', // Laranja Âmbar
    'linear-gradient(135deg, #84cc16, #10b981)', // Lima para Verde
    'linear-gradient(135deg, #06b6d4, #0891b2)'  // Ciano Médico
];

let indiceCor = 0;
let contadorSenha = 100;

const btnChamar = document.getElementById('btn-chamar');
const filaPrincipal = document.getElementById('fila-principal');
const carrossel = document.getElementById('carrossel');

// Armazena a chamada atual para movê-la para trás quando uma nova chegar
let chamadaAtualAtiva = null;

btnChamar.addEventListener('click', () => {
    // 1. Limpa a mensagem inicial caso seja a primeira chamada
    const msgInicial = filaPrincipal.querySelector('.sem-chamada');
    if (msgInicial) msgInicial.remove();

    // 2. Se já existe uma chamada na tela, move ela para as "Últimas Chamadas" (Carrossel)
    if (chamadaAtualAtiva) {
        adicionarAoCarrossel(chamadaAtualAtiva);
    }

    // 3. Gera dados fictícios para a nova chamada
    contadorSenha += Math.floor(Math.random() * 3) + 1; // Incrementa a senha aleatoriamente
    const letras = ['A', 'B', 'P', 'G'];
    const letraAleatoria = letras[Math.floor(Math.random() * letras.length)];
    
    const novaSenha = `${letraAleatoria}-${contadorSenha}`;
    const novoConsultorio = `Consultório 0${Math.floor(Math.random() * 8) + 1}`;
    const corGradiente = paletaCores[indiceCor];

    // Atualiza o índice da cor para a próxima chamada mudar de cor
    indiceCor = (indiceCor + 1) % paletaCores.length;

    // 4. Cria o elemento retangular moderno do painel principal
    const bloco = document.createElement('div');
    bloco.className = 'bloco-chamada';
    bloco.style.background = corGradiente;
    bloco.innerHTML = `
        <div class="info-senha">
            <span class="tag">Senha</span>
            <span class="numero">${novaSenha}</span>
        </div>
        <div class="info-local">
            <span class="sala">${novoConsultorio}</span>
        </div>
    `;

    // 5. Adiciona na tela e salva a referência
    filaPrincipal.innerHTML = ''; // Mantém apenas o mais recente na tela principal
    filaPrincipal.appendChild(bloco);

    // Salva o estado atual para o próximo clique mandar para o histórico
    chamadaAtualAtiva = {
        senha: novaSenha,
        sala: novoConsultorio,
        cor: corGradiente
    };
});

// FUNÇÃO GLOBAL: Cria a miniatura e gerencia o carrossel infinito se transbordar a tela
function adicionarAoCarrossel(dadosChamada) {
    // 1. Cria e insere o novo bloco miniatura na pista
    const miniBloco = document.createElement('div');
    miniBloco.className = 'bloco-mini';
    miniBloco.style.background = dadosChamada.cor;
    miniBloco.innerHTML = `
        <span class="mini-senha">${dadosChamada.senha}</span>
        <span class="mini-sala">${dadosChamada.sala}</span>
    `;
    
    // Remove clones antigos para recalcular o tamanho real com precisão
    const clonesAntigos = carrossel.querySelectorAll('.clone');
    clonesAntigos.forEach(c => c.remove());
    
    // Insere o novo elemento no início do carrossel real
    carrossel.insertBefore(miniBloco, carrossel.firstChild);
    
    // 2. Verifica se a largura total dos itens é maior que a largura da tela visível
    const larguraSurgimento = carrossel.scrollWidth;
    const larguraDisponivel = carrossel.parentElement.clientWidth;
    
    if (larguraSurgimento > larguraDisponivel) {
        // Seleciona todos os blocos originais atuais
        const itensOriginais = Array.from(carrossel.children);
        
        // Clona cada um deles e joga no final da pista para criar o efeito infinito
        itensOriginais.forEach(item => {
            const clone = item.cloneNode(true);
            clone.classList.add('clone');
            carrossel.appendChild(clone);
        });
        
        // Liga a animação CSS de movimento contínuo
        carrossel.classList.add('carrossel-animado');
    } else {
        // Se ainda não encheu a tela, deixa o carrossel parado
        carrossel.classList.remove('carrossel-animado');
    }
}