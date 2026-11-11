from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
import os

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

            if os.path.isdir(caminho):
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