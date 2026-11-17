const fs = require("fs");
const path = require("path");

const pastaTextos = path.join(__dirname, "manuais", "textos");

const titulos = [
  // Português
  "INTRODUÇÃO",
  "OBJETIVO DO JOGO",
  "COMPONENTES",
  "CONCEITOS BÁSICOS",
  "PREPARAÇÃO",
  "CONFIGURAÇÃO",
  "VENCENDO A PARTIDA",
  "COMO JOGAR",
  "TURNO DO JOGADOR",
  "RODADA",
  "AÇÕES",
  "EVENTOS",
  "CARTAS E PODERES",
  "PONTUAÇÃO",
  "FIM DE JOGO",
  "FINAL DA PARTIDA",
  "MODO SOLO",
  "RESUMO DAS REGRAS",

  // Inglês
  "GAME OVERVIEW",
  "OVERVIEW",
  "INTRODUCTION",
  "OBJECTIVE",
  "GOAL OF THE GAME",
  "GAME COMPONENTS",
  "COMPONENTS",
  "CONTENTS",
  "INITIAL SETUP",
  "SETUP",
  "PREPARATION",
  "PLAYING THE GAME",
  "HOW TO PLAY",
  "GAMEPLAY",
  "TURN STRUCTURE",
  "PLAYER TURN",
  "ACTIONS",
  "BEGINNING A NEW AGE",
  "PLAYING THROUGH AN AGE",
  "THE END OF AN AGE",
  "A NEW AGE DAWNS",
  "END OF THE GAME",
  "GAME END",
  "SCORING",
  "FINAL SCORING",
  "VICTORY",
  "WINNING THE GAME",
  "SOLO MODE",
  "THE CLANS OF ETHNOS",
  "RULES SUMMARY",
  "SUMMARY"
];

function gerarJsonManual(arquivoTxt) {
  const texto = fs.readFileSync(arquivoTxt, "utf8");
  // Logo após const texto = fs.readFileSync(arquivoTxt, "utf8");
  const textoLimpo = texto
  .replace(/\b([A-Za-z])\s+([a-z]{2,})\b/g, "$1$2") // Junta "S etup" -> "Setup", "R ecruiting" -> "Recruiting"
  .replace(/\s+/g, " "); // Remove espaços duplos/triplos
  const textoUpper = texto.toUpperCase();
  const resultado = {};

  // 1. Encontra a posição de todos os títulos que realmente existem neste manual
  const encontrados = [];

  for (const titulo of titulos) {
    // Procura a última ocorrência relevante (para evitar pegar só o índice/sumário da página 1)
    // ou todas as ocorrências no texto
    let pos = textoUpper.indexOf(titulo);
    while (pos !== -1) {
      // Ignora se parecer linha de sumário seguida logo de número de página (ex: "INITIAL SETUP 04")
      const trechoDepois = texto.slice(pos + titulo.length, pos + titulo.length + 12);
      const ehSumario = /^\s*\d{1,2}\s/.test(trechoDepois);

      if (!ehSumario) {
        encontrados.push({ titulo, inicio: pos });
        break;
      }
      pos = textoUpper.indexOf(titulo, pos + titulo.length);
    }
  }

  // 2. Ordena os títulos encontrados pela ordem em que aparecem no manual
  encontrados.sort((a, b) => a.inicio - b.inicio);

  // 3. Fatia o texto exatamente de um título encontrado até o próximo título encontrado
  for (let i = 0; i < encontrados.length; i++) {
    const atual = encontrados[i];
    const proximo = encontrados[i + 1];

    const fim = proximo ? proximo.inicio : texto.length;
    const conteudo = texto.substring(atual.inicio, fim).trim();

    if (conteudo.length > 20) {
      const chave = atual.titulo
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "_");

      resultado[chave] = conteudo;
    }
  }

  // 4. Segurança: se o manual não usou nenhum título padrão, salva o texto inteiro para nunca ficar vazio
  if (Object.keys(resultado).length === 0 && texto.trim().length > 0) {
    resultado["conteudo_completo"] = texto.trim();
  }

  return resultado;
}

function processarPasta(pastaAtual) {
  const arquivos = fs.readdirSync(pastaAtual, { withFileTypes: true });

  for (const arquivo of arquivos) {
    const caminhoCompleto = path.join(pastaAtual, arquivo.name);

    if (arquivo.isDirectory()) {
      processarPasta(caminhoCompleto);
      continue;
    }

    if (!arquivo.name.toLowerCase().endsWith(".txt")) {
      continue;
    }

    try {
      console.log(`📖 Processando ${arquivo.name}`);
      const json = gerarJsonManual(caminhoCompleto);
      const caminhoJson = caminhoCompleto.replace(/\.txt$/i, ".json");

      fs.writeFileSync(caminhoJson, JSON.stringify(json, null, 2), "utf8");
      console.log(`✅ JSON criado: ${path.basename(caminhoJson)} (${Object.keys(json).length} seções)`);
    } catch (erro) {
      console.log(`❌ Erro em ${arquivo.name}: ${erro.message}`);
    }
  }
}

processarPasta(pastaTextos);
console.log("\n🎉 Todos os manuais foram convertidos!");