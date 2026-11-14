const fs = require('fs');
const path = require('path');
const PDFParser = require('pdf2json');

// ==========================================
// CONFIGURE AQUI O CAMINHO DO SEU NOVO PDF
// Exemplo: "manuais/NomeDoJogo/manual_novo.pdf"
// ==========================================
const caminhoPdfAlvo = "manuais/war/war_vikings_regras_avançadas.pdf"; 

// Silencia os warnings incômodos do pdf2json no console
const originalWarn = console.warn;
console.warn = (...args) => {
    if (args[0] && typeof args[0] === 'string' && args[0].includes('TODO: graphic state')) return;
    originalWarn(...args);
};

function extrairTextoPDF(caminhoPdf) {
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser();

        pdfParser.on("pdfParser_dataError", err => {
            reject(err);
        });

        pdfParser.on("pdfParser_dataReady", pdfData => {
            let textoCompleto = "";

            const pages = pdfData.Pages || (pdfData.form && pdfData.form.Pages);

            if (pages) {
                pages.forEach(page => {
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

async function converterUnicoPDF() {
    const caminhoCompleto = path.join(__dirname, caminhoPdfAlvo);

    if (!fs.existsSync(caminhoCompleto)) {
        console.log(`❌ O arquivo não foi encontrado: ${caminhoCompleto}`);
        console.log(`Dica: Verifique se o caminho e o nome da pasta/arquivo estão corretos.`);
        return;
    }

    // Descobre automaticamente a pasta do jogo e o nome do arquivo txt de destino
    const pastaJogo = path.dirname(caminhoCompleto);
    const nomeArquivoPdf = path.basename(caminhoCompleto);
    const nomeArquivoTxt = nomeArquivoPdf.replace(/\.pdf$/i, ".txt");
    
    // Define a pasta de saída em manuais/textos/NomeDoJogo/
    const nomePastaJogo = path.basename(pastaJogo);
    const pastaDestinoTexto = path.join(__dirname, "manuais", "textos", nomePastaJogo);

    if (!fs.existsSync(pastaDestinoTexto)) {
        fs.mkdirSync(pastaDestinoTexto, { recursive: true });
    }

    const caminhoTxtFinal = path.join(pastaDestinoTexto, nomeArquivoTxt);

    console.log(`🔄 Convertendo de forma blindada: ${nomeArquivoPdf} (${nomePastaJogo})...`);

    try {
        const texto = await extrairTextoPDF(caminhoCompleto);
        fs.writeFileSync(caminhoTxtFinal, texto, "utf8");
        console.log(`✅ Sucesso! Arquivo gerado em: manuais/textos/${nomePastaJogo}/${nomeArquivoTxt}`);
    } catch (erro) {
        console.log(`❌ Erro ao converter o PDF: ${erro.message || erro}`);
    }
}

converterUnicoPDF();