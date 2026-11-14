const fs = require('fs');
const path = require('path');
const PDFParser = require('pdf2json');

// Silencia os warnings incômodos do pdf2json no console
const originalWarn = console.warn;
console.warn = (...args) => {
    if (args[0] && typeof args[0] === 'string' && args[0].includes('TODO: graphic state')) return;
    originalWarn(...args);
};

const pastaManuais = path.join(__dirname, 'manuais');
const pastaTextos = path.join(pastaManuais, 'textos');

function extrairTextoPDF(caminhoPdf) {
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser();

        pdfParser.on("pdfParser_dataError", err => {
            reject(err);
        });

        pdfParser.on("pdfParser_dataReady", pdfData => {
            let textoCompleto = "";

            if (pdfData && pdfData.Pages) {
                pdfData.Pages.forEach(page => {
                    if (page.Texts) {
                        page.Texts.forEach(text => {
                            if (text.R) {
                                text.R.forEach(run => {
                                    if (run.T) {
                                        try {
                                            // Tenta decodificar de forma segura, se falhar, usa o texto original sem decodificar
                                            const textoDecodificado = decodeURIComponent(run.T);
                                            textoCompleto += textoDecodificado + " ";
                                        } catch (e) {
                                            textoCompleto += run.T + " ";
                                        }
                                    }
                                });
                            }
                        });
                    }
                    textoCompleto += "\n\n";
                });
            }

            resolve(textoCompleto);
        });

        pdfParser.loadPDF(caminhoPdf);
    });
}

async function processarManuais() {
    if (!fs.existsSync(pastaTextos)) {
        fs.mkdirSync(pastaTextos, { recursive: true });
    }

    const jogos = fs.readdirSync(
        pastaManuais,
        { withFileTypes: true }
    )
    .filter(d =>
        d.isDirectory() &&
        d.name !== "textos"
    );

    console.log(`🎮 ${jogos.length} pastas de jogos encontradas. Iniciando conversão blindada...\n`);

    for (const jogo of jogos) {
        const pastaJogo = path.join(pastaManuais, jogo.name);
        const pastaDestino = path.join(pastaTextos, jogo.name);

        fs.mkdirSync(pastaDestino, { recursive: true });

        const arquivos = fs.readdirSync(pastaJogo);
        const pdfs = arquivos.filter(
            a => a.toLowerCase().endsWith(".pdf")
        );

        if (pdfs.length === 0) continue;

        for (const pdf of pdfs) {
            const caminhoPdf = path.join(pastaJogo, pdf);
            const arquivoTxt = pdf.replace(/\.pdf$/i, ".txt");
            const caminhoTxt = path.join(pastaDestino, arquivoTxt);

            try {
                const texto = await extrairTextoPDF(caminhoPdf);

                fs.writeFileSync(caminhoTxt, texto, "utf8");
                console.log(`✅ [${jogo.name}] -> ${arquivoTxt}`);

            } catch (erro) {
                console.log(`❌ Erro em ${jogo.name} (${pdf}): ${erro.message || erro}`);
            }
        }
    }

    console.log("\n🎉 Conversão em massa concluída com sucesso e sem travamentos!");
}

processarManuais();