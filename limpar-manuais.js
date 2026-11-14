const fs = require("fs");
const path = require("path");

const pastaOrigem = path.join(__dirname, "manuais", "textos");
const pastaDestino = path.join(__dirname, "manuais", "textos-limpos");

function limparTexto(texto) {
  return texto

    // remove caracteres estranhos
    .replace(/[^\x20-\x7EÀ-ÿ\n\r]/g, " ")

    // remove linhas de índice cheias de pontos
    .replace(/\.{5,}\s*\d+/g, "")

    // remove espaços repetidos
    .replace(/\s+/g, " ")

    // remove espaços nas extremidades
    .trim();
}

function processarDiretorio(origem, destino) {

  if (!fs.existsSync(destino)) {
    fs.mkdirSync(destino, { recursive: true });
  }

  const itens = fs.readdirSync(origem, { withFileTypes: true });

  for (const item of itens) {

    const origemAtual = path.join(origem, item.name);
    const destinoAtual = path.join(destino, item.name);

    if (item.isDirectory()) {
      processarDiretorio(origemAtual, destinoAtual);
      continue;
    }

    if (!item.name.endsWith(".txt")) continue;

    const texto = fs.readFileSync(origemAtual, "utf8");

    const textoLimpo = limparTexto(texto);

    fs.writeFileSync(destinoAtual, textoLimpo, "utf8");

    console.log(`✅ Limpo: ${item.name}`);
  }
}

processarDiretorio(pastaOrigem, pastaDestino);

console.log("🎉 Limpeza concluída!");