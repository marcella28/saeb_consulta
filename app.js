const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const app = express();
const port = 3000;

// Configuração do banco de dados
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

// Configuração do Express
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Rota para processar o formulário
app.post('/consultar', (req, res) => {
  const { idEscola, ensino, anosEscolares, ano } = req.body;

  // Consulta para buscar o nome da escola correspondente ao id inserido
  const sqlNomeEscola = 'SELECT nome FROM ref_escolas WHERE id_escola = ?';
  db.query(sqlNomeEscola, [idEscola], (err, resultNomeEscola) => {
    if (err) {
      console.error('Erro na consulta ao banco de dados (ref_escolas):', err);
      res.status(500).json({ error: 'Erro interno do servidor' });
    } else {
      if (resultNomeEscola.length === 0) {
        res.status(404).json({ error: 'ID da escola não encontrado' });
        return;
      }

      const nomeEscola = resultNomeEscola[0].nome;

      // Consulta adicional para buscar outras informações na tabela dados_escolares
      const sqlDadosEscolares = 'SELECT * FROM dados_escolares WHERE idEscola = ? AND ensino = ? AND anosEscolares = ? AND ano = ?';
      db.query(sqlDadosEscolares, [idEscola, ensino, anosEscolares, ano], (err, resultDadosEscolares) => {
        if (err) {
          console.error('Erro na consulta ao banco de dados (dados_escolares):', err);
          res.status(500).json({ error: 'Erro interno do servidor' });
        } else {
          if (resultDadosEscolares.length === 0) {
            res.status(404).json({ error: 'Dados escolares não encontrados' });
            return;
          }

          // Aqui você pode processar os resultados adicionais
          const dadosEscolares = resultDadosEscolares[0]; // Assumindo que você está interessado apenas no primeiro resultado

          // Combine os resultados
          const resultadoFinal = {
            nome: nomeEscola,
            taxa_aprovacao: dadosEscolares.taxa_aprovacao,
            indicador_rendimento: dadosEscolares.indicador_rendimento,
            nota_saeb_matematica: dadosEscolares.nota_saeb_matematica,
            nota_saeb_lingua_portuguesa: dadosEscolares.nota_saeb_lingua_portuguesa,
            nota_saeb_media_padronizada: dadosEscolares.nota_saeb_media_padronizada,
          };

          // Envie o resultado para o cliente
          res.json(resultadoFinal);
        }
      });
    }
  });
});

// Inicie o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
