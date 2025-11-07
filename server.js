const express = require('express');
const client = require('prom-client');
const path = require('path');

const app = express();
app.use(express.json());

const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

const counter = new client.Counter({
    name: 'app_requests_total',
    help: 'Contador de requisições recebidas na rota principal'
});

app.get('/', (req, res) => {
    counter.inc();
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
// Puxa os arquivos da pasta public
app.use(express.static(path.join(__dirname, 'public')));

// Foi usado 'Gauge' para representar um valor que pode mudar, como a pontuação de uma partida
const pontuacaoAtualGauge = new client.Gauge({
    name: 'jogo_cobra_pontuacao_partida_atual',
    help: 'Pontuação da partida atual no Jogo da Cobrinha.'
});

// Recebe a pontuação completa do front-end e a define na métrica
app.post('/atualizar-pontuacao', (req, res) => {
    const { pontuacao } = req.body; // Pega o valor do jogo

    // Verifica se o valor recebido é um número válido antes de ser definido
    if (typeof pontuacao === 'number') {
        pontuacaoAtualGauge.set(pontuacao);
        res.status(200).json({ message: 'Pontuação atualizada!' });
    } else {
        res.status(400).json({ message: 'Dados inválidos.' });
    }
});

// Endpoint para o Prometheus coletar as métricas
app.get('/metrics', async (req, res) => {
    res.set('content-type', client.register.contentType);
    res.end(await client.register.metrics());
});

// Aviso para mostrar que o jogo esta sendo rodado na porta 3123
app.listen(3123, () => {
    console.log('Servidor rodando na porta 3123, rodando o Jogo da Cobrinha muito massa!');
});