const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const mysql = require('mysql');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
    secret: 'sua_chave_secreta',
    resave: true,
    saveUninitialized: true
}));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'acesso123',
    database: 'saeb',
});

db.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
    } else {
        console.log('Conectado ao banco de dados MySQL');
    }
});

app.post('/gerarTabela', (req, res) => {
    const { ensino, anosEscolares, ano } = req.body;
    if (!ensino || !anosEscolares || !ano) {
        return res.status(400).send('Parâmetros inválidos');
    }
    let query = `
        SELECT ref.nome AS nome_instituicao, dados.ideb
        FROM dados_escolares AS dados
        INNER JOIN ref_escolas AS ref ON dados.id_escola = ref.id_escola
        WHERE dados.ensino = ? AND dados.anos_escolares = ? AND dados.ano = ?
        ORDER BY dados.ideb DESC;
    `;
    db.query(query, [ensino, anosEscolares, ano], (err, results) => {
        if (err) {
            console.error('Erro ao consultar o banco de dados:', err);
            return res.status(500).send('Erro ao processar a solicitação');
        }
        req.session.resultadoData = JSON.stringify(results);
        res.redirect('/resultado');
    });
});

app.get('/resultado', (req, res) => {
    res.sendFile(__dirname + '/public/resultado.html');
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
