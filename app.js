const express = require("express");
const db = require("./conexao");
const app = express();
const path = require("path");
const router = express.Router();
 
router.get("/", function (req, res) {
  res.sendFile(path.join(__dirname + "/index.html"));
});
 
// Adicione um middleware para processar dados de formulário
app.use(express.urlencoded({ extended: true }));
 
app.use("/", router);
 
const ipAddress = "172.16.31.38"; //Endereço IP da máquina
const port = 3003;
 
app.listen(port, ipAddress, () => {
  console.log(`Servidor rodando em http://${ipAddress}:${port}`);
});
 
// Rota para lidar com a pesquisa
app.post("/pesquisar", async (req, res) => {
  const idEscola = req.body.idEscola;
  const ano = req.body.ano;
  const ensino = req.body.ensino;
  const anosEscolares = req.body.anosEscolares;
 
  // Crie uma condição para construir a consulta SQL com base nos campos preenchidos
  let sql = "SELECT * FROM dados_escolares WHERE id_escola = ?";
  let params = [idEscola];
 
  if (ano !== "Selecione") {
    sql += " AND ano = ?";
    params.push(ano);
  }
 
  if (ensino !== "Selecione") {
    sql += " AND ensino = ?";
    params.push(ensino);
  }
 
  if (anosEscolares !== "Selecione") {
    sql += " AND anos_escolares = ?";
    params.push(anosEscolares);
  }
 
  try {
    // Consulta ao banco de dados com base nos campos fornecidos
    const [rows, fields] = await db.execute(sql, params);
 
    // Verifica se há resultados
    if (rows.length > 0) {
      res.json(rows);
    } else {
      res.json({
        mensagem: "Nenhum dado encontrado para os critérios fornecidos.",
      });
    }
  } catch (err) {
    console.error("Erro ao acessar o banco de dados:", err);
    res.status(500).send("Erro interno do servidor");
  }
});