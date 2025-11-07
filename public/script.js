const telaDeJogo = document.getElementById('gameCanvas');
const contexto = telaDeJogo.getContext('2d');
const elementoPontuacao = document.getElementById('score');

const tamanhoGrade = 20;
let cobra = [{ x: 10, y: 10 }];
let maca = {};
let velocidadeX = 0;
let velocidadeY = 0;
let pontuacao = 0;
let mudandoDeDirecao = false;
let jogoEmAndamento = false;

// Função para iniciar ou reiniciar o jogo
function iniciarJogo() {
    cobra = [{ x: 10, y: 10 }];
    velocidadeX = 0;
    velocidadeY = 0;
    pontuacao = 0;
    elementoPontuacao.textContent = pontuacao;
    mudandoDeDirecao = false;
    jogoEmAndamento = true;
    
    enviarMetricaPontuacao(0); // Reseta a pontuação no dashboard
    gerarMaca();
    loopPrincipal();
}

// Loop principal do jogo
function loopPrincipal() {
    if (!jogoEmAndamento) {
        contexto.fillStyle = 'rgba(0, 0, 0, 0.7)';
        contexto.fillRect(0, 0, telaDeJogo.width, telaDeJogo.height);
        contexto.fillStyle = 'white';
        contexto.font = '30px "Courier New"';
        contexto.textAlign = 'center';
        contexto.fillText('FIM DE JOGO', telaDeJogo.width / 2, telaDeJogo.height / 2 - 20);
        contexto.font = '16px "Courier New"';
        contexto.fillText('Pressione Enter para reiniciar', telaDeJogo.width / 2, telaDeJogo.height / 2 + 20);
        return;
    }

    setTimeout(() => {
        mudandoDeDirecao = false;
        limparTela();
        desenharMaca();
        moverCobra();
        desenharCobra();
        loopPrincipal();
    }, 120); // Velocidade em que a cobra se movimenta no jogo
}

function limparTela() {
    contexto.fillStyle = 'black';
    contexto.fillRect(0, 0, telaDeJogo.width, telaDeJogo.height);
}

function desenharCobra() {
    contexto.fillStyle = '#00FF00';
    cobra.forEach(parte => {
        contexto.fillRect(parte.x * tamanhoGrade, parte.y * tamanhoGrade, tamanhoGrade, tamanhoGrade);
        contexto.strokeStyle = 'black';
        contexto.strokeRect(parte.x * tamanhoGrade, parte.y * tamanhoGrade, tamanhoGrade, tamanhoGrade);
    });
}

function desenharMaca() {
    contexto.fillStyle = '#FF0000';
    contexto.fillRect(maca.x * tamanhoGrade, maca.y * tamanhoGrade, tamanhoGrade, tamanhoGrade);
}

function moverCobra() {
    const cabeca = { x: cobra[0].x + velocidadeX, y: cobra[0].y + velocidadeY };
    cobra.unshift(cabeca);

    if (cabeca.x === maca.x && cabeca.y === maca.y) {
        pontuacao++;
        elementoPontuacao.textContent = pontuacao;
        enviarMetricaPontuacao(pontuacao);
        gerarMaca();
    } else {
        cobra.pop();
    }

    verificarColisao();
}

function gerarMaca() {
    maca.x = Math.floor(Math.random() * (telaDeJogo.width / tamanhoGrade));
    maca.y = Math.floor(Math.random() * (telaDeJogo.height / tamanhoGrade));
    cobra.forEach(parte => {
        if (parte.x === maca.x && parte.y === maca.y) {
            gerarMaca();
        }
    });
}

function verificarColisao() {
    const cabeca = cobra[0];
    if (cabeca.x < 0 || cabeca.x * tamanhoGrade >= telaDeJogo.width || cabeca.y < 0 || cabeca.y * tamanhoGrade >= telaDeJogo.height) {
        jogoEmAndamento = false;
    }
    for (let i = 1; i < cobra.length; i++) {
        if (cabeca.x === cobra[i].x && cabeca.y === cobra[i].y) {
            jogoEmAndamento = false;
        }
    }
}

function mudarDirecao(evento) {
    const teclaPressionada = evento.key;

    if (!jogoEmAndamento && teclaPressionada === 'Enter') {
        iniciarJogo();
        return;
    }

    if (mudandoDeDirecao) return;
    mudandoDeDirecao = true;
    
    const indoParaCima = velocidadeY === -1;
    const indoParaBaixo = velocidadeY === 1;
    const indoParaDireita = velocidadeX === 1;
    const indoParaEsquerda = velocidadeX === -1;

    if ((teclaPressionada === 'ArrowUp' || teclaPressionada === 'w') && !indoParaBaixo) { velocidadeX = 0; velocidadeY = -1; }
    if ((teclaPressionada === 'ArrowDown' || teclaPressionada === 's') && !indoParaCima) { velocidadeX = 0; velocidadeY = 1; }
    if ((teclaPressionada === 'ArrowLeft' || teclaPressionada === 'a') && !indoParaDireita) { velocidadeX = -1; velocidadeY = 0; }
    if ((teclaPressionada === 'ArrowRight' || teclaPressionada === 'd') && !indoParaEsquerda) { velocidadeX = 1; velocidadeY = 0; }
}

async function enviarMetricaPontuacao(pontos) {
    try {
        await fetch('/atualizar-pontuacao', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ pontuacao: pontos }),
        });
        console.log(`Métrica de pontuação enviada: ${pontos}`);
    } catch (error) {
        console.error('Falha ao enviar métrica para o servidor:', error);
    }
}

document.addEventListener('keydown', mudarDirecao);
iniciarJogo();