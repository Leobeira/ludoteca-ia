const fs = require("fs");
const path = require("path");

const arquivoTexto = path.join(
    __dirname,
    "manuais",
    "textos",
    "Ankh",
    "Ankh.txt"
);

const arquivoJson = path.join(
    __dirname,
    "manuais",
    "textos",
    "Ankh",
    "Ankh.json"
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

const texto = fs.readFileSync(
    arquivoTexto,
    "utf8"
);

const resultado = {};

for (let i = 0; i < titulos.length; i++) {

    const tituloAtual = titulos[i];

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

fs.writeFileSync(
    arquivoJson,
    JSON.stringify(
        resultado,
        null,
        2
    ),
    "utf8"
);

console.log(
    "✅ JSON criado com sucesso!"
);