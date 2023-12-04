const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

const app = express();
const port = 5500;

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/telas'));

// Rota /gerarTabela
app.route('/gerarTabela')
  .get((req, res) => {
    // Se for uma solicitação GET, renderiza a página do formulário
    res.sendFile(__dirname + '/telas/index.html');
  })
  .post((req, res) => {
    // Se for uma solicitação POST, processa o formulário
    const { ensino, anosEscolares, ano } = req.body;

    if (!ensino || !anosEscolares || !ano) {
      console.error('Parâmetros inválidos');
      return res.status(400).send('Parâmetros inválidos');
    }

    // Alteração para ler dados do arquivo dadosIdeb.json
    const filePathIdeb = path.join(__dirname, 'dadosIdeb.json');
    const dataIdeb = JSON.parse(fs.readFileSync(filePathIdeb, 'utf8'));

    // Filtre os dados com base nos parâmetros recebidos
    const filteredDataIdeb = dataIdeb.filter(item => (
      item.ensino === ensino &&
      item.anos_escolares === anosEscolares &&
      item.ano === ano
    ));

    // Alteração para ler dados do arquivo dadosEscolas.json
    const filePathEscolas = path.join(__dirname, 'dadosEscolas.json');
    const dataEscolas = JSON.parse(fs.readFileSync(filePathEscolas, 'utf8'));

    // Mapeia o ID da escola para o nome da escola
    const idToNome = dataEscolas.reduce((acc, item) => {
      acc[item.id_escola] = item.nome;
      return acc;
    }, {});

    // Adiciona o nome da escola aos dados do IDEB
    const dataFinal = filteredDataIdeb.map(item => ({
      ...item,
      nome_instituicao: idToNome[item.id_escola]
    }));

    // Armazena os dados na session storage
    req.session.resultadoData = JSON.stringify(dataFinal);

    // Redireciona para a página de resultado
    res.redirect('/resultado');
  });

// Rota /resultado
app.get('/resultado', (req, res) => {
  // Recupera os dados armazenados na session storage
  const data = JSON.parse(req.session.resultadoData || '[]');

  // Renderiza a página EJS
  res.render('telaResultado', { rows: data });
});

// Inicie o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
