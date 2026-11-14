const fs = require("fs");
const path = require("path");

const pastaTextos = path.join(
  __dirname,
  "manuais",
  "textos"
);

const titulos = [
  "INTRODUÇÃO",
  "COMPONENTES",
  "CONCEITOS BÁSICOS",
  "PREPARAÇÃO",
  "VENCENDO A PARTIDA",
  "COMO JOGAR",
  "AÇÕES",
  "EVENTOS",
  "CARTAS E PODERES",
  "RESUMO DAS REGRAS"
];

function gerarJsonManual(arquivoTxt) {

  const texto = fs.readFileSync(
    arquivoTxt,
    "utf8"
  );

  const resultado = {};

  for (let i = 0; i < titulos.length; i++) {

    const tituloAtual =
      titulos[i];

    const proximoTitulo =
      titulos[i + 1];

    const inicio =
      texto.indexOf(tituloAtual);

    if (inicio === -1) continue;

    let fim;

    if (proximoTitulo) {

      fim = texto.indexOf(
        proximoTitulo,
        inicio + tituloAtual.length
      );

      if (fim === -1) {
        fim = texto.length;
      }

    } else {

      fim = texto.length;

    }

    const conteudo = texto
      .substring(inicio, fim)
      .trim();

    resultado[
      tituloAtual
        .toLowerCase()
        .replace(/\s+/g, "_")
    ] = conteudo;
  }

  return resultado;
}

function processarPasta(pastaAtual) {

  const arquivos = fs.readdirSync(
    pastaAtual,
    { withFileTypes: true }
  );

  for (const arquivo of arquivos) {

    const caminhoCompleto =
      path.join(
        pastaAtual,
        arquivo.name
      );

    if (arquivo.isDirectory()) {

      processarPasta(
        caminhoCompleto
      );

      continue;

    }

    if (
      !arquivo.name
        .toLowerCase()
        .endsWith(".txt")
    ) {
      continue;
    }

    try {

      console.log(
        `📖 Processando ${arquivo.name}`
      );

      const json =
        gerarJsonManual(
          caminhoCompleto
        );

      const caminhoJson =
        caminhoCompleto.replace(
          /\.txt$/i,
          ".json"
        );

      fs.writeFileSync(
        caminhoJson,
        JSON.stringify(
          json,
          null,
          2
        ),
        "utf8"
      );

      console.log(
        `✅ JSON criado: ${path.basename(caminhoJson)}`
      );

    } catch (erro) {

      console.log(
        `❌ Erro em ${arquivo.name}`
      );

      console.log(
        erro.message
      );

    }
  }
}

processarPasta(
  pastaTextos
);

console.log(
  "\n🎉 Todos os manuais foram convertidos!"
);

//no final sempre cola isso no terminal:  node gerar-json-todos.js