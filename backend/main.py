from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException # <--- Adicione HTTPException aqui
import os
import json

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PASTA_MANUAIS = "../manuais"


@app.get("/")
def raiz():
    return {
        "mensagem": "Ludoteca IA Online"
    }

@app.get("/jogos")
def listar_jogos():
    jogos = []
    if os.path.exists(PASTA_MANUAIS):
        for item in os.listdir(PASTA_MANUAIS):
            caminho = os.path.join(PASTA_MANUAIS, item)
            if os.path.isdir(caminho) and item != "textos":
                jogos.append(item)
    jogos.sort()
    return jogos

@app.get("/jogos/{nome_jogo}")
def listar_manuais(nome_jogo):
    pasta_jogo = os.path.join(PASTA_MANUAIS, nome_jogo)
    manuais = []
    if os.path.exists(pasta_jogo):
        for arquivo in os.listdir(pasta_jogo):
            if arquivo.lower().endswith(".pdf"):
                manuais.append(arquivo)
    manuais.sort()
    return manuais

@app.get("/pdf/{nome_jogo}/{nome_pdf}")
def abrir_pdf(nome_jogo: str, nome_pdf: str):
    caminho_pdf = os.path.join(
        PASTA_MANUAIS,
        nome_jogo,
        nome_pdf
    )
    return FileResponse(caminho_pdf)

@app.get("/manual/{nome_jogo}/{nome_json}")
def obter_manual_json(nome_jogo: str, nome_json: str):
    pasta_jogo_texto = os.path.join(PASTA_MANUAIS, "textos", nome_jogo)
    dados_combinados = {}

    if os.path.exists(pasta_jogo_texto) and os.path.isdir(pasta_jogo_texto):
        arquivos = os.listdir(pasta_jogo_texto)

        # 1. Tenta ler todos os arquivos .json que não estejam vazios
        for arquivo in arquivos:
            if arquivo.lower().endswith(".json"):
                caminho_completo = os.path.join(pasta_jogo_texto, arquivo)
                try:
                    with open(caminho_completo, "r", encoding="utf-8") as f:
                        conteudo = json.load(f)
                        if isinstance(conteudo, dict) and len(conteudo) > 0:
                            dados_combinados.update(conteudo)
                except Exception as e:
                    print(f"Erro ao ler JSON {arquivo}: {e}")

        # 2. PLANO B: Se os JSONs estavam vazios (ex: manuais em inglês), lê os arquivos .txt direto!
        if not dados_combinados:
            for arquivo in arquivos:
                if arquivo.lower().endswith(".txt"):
                    caminho_txt = os.path.join(pasta_jogo_texto, arquivo)
                    try:
                        with open(caminho_txt, "r", encoding="utf-8") as f:
                            texto_bruto = f.read().strip()
                            if texto_bruto:
                                nome_secao = arquivo.replace(".txt", "").replace("_", " ").title()
                                dados_combinados[nome_secao] = texto_bruto
                    except Exception as e:
                        print(f"Erro ao ler TXT {arquivo}: {e}")

    if dados_combinados:
        return dados_combinados

    raise HTTPException(status_code=404, detail="Nenhum manual encontrado para este jogo.")