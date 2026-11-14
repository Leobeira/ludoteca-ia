import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import ManualBusca from "../ManualBusca"; // Importa o seu componente de busca
import "../App.css";

function Biblioteca() {
  const { nomeJogo } = useParams();
  const [manuais, setManuais] = useState([]);
  const [dadosManualJson, setDadosManualJson] = useState(null); // Guarda o JSON para a busca
  const navigate = useNavigate();
  
  const audioObjRef = useRef(null);
  const [estaTocando, setEstaTocando] = useState(false);

  // Função mágica para deixar o nome do manual bonito e legível
  const formatarNomeManual = (nomeArquivo) => {
    let nomeLimpo = nomeArquivo.replace(/\.pdf$/i, "");
    nomeLimpo = nomeLimpo.replace(/[_]/g, " ");
    nomeLimpo = nomeLimpo.replace(/\b\w/g, (l) => l.toUpperCase());
    return nomeLimpo;
  };

  const alternarMusica = () => {
    if (!audioObjRef.current) return;
    
    if (audioObjRef.current.paused) {
      audioObjRef.current.play()
        .then(() => {
          setEstaTocando(true);
          localStorage.setItem("ludoteca_musica_ligada", "true");
        })
        .catch((err) => console.log("Erro ao tocar áudio:", err));
    } else {
      audioObjRef.current.pause();
      setEstaTocando(false);
      localStorage.setItem("ludoteca_musica_ligada", "false");
    }
  };

  useEffect(() => {
    // 1. Busca os manuais do jogo na API
    axios
      .get(`http://127.0.0.1:8000/jogos/${nomeJogo}`)
      .then((response) => {
        const listaManuais = response.data;
        setManuais(listaManuais);

        // Se houver pelo menos um manual, tenta carregar o seu JSON correspondente para a busca
        if (listaManuais.length > 0) {
          const primeiroManualPdf = listaManuais[0];
          const nomeJson = primeiroManualPdf.replace(/\.pdf$/i, ".json");

          axios
            .get(`http://127.0.0.1:8000/manual/${nomeJogo}/${nomeJson}`)
            .then((resJson) => {
              setDadosManualJson(resJson.data);
            })
            .catch(() => {
              console.log("JSON do manual ainda não gerado para este jogo.");
            });
        }
      })
      .catch((err) => console.log("Erro ao buscar manuais do jogo:", err));

    const nomeMinusculo = nomeJogo.toLowerCase();
    document.body.style.backgroundImage = `url('/imagens/jogos/${nomeMinusculo}.jpg')`;

    const caminhoAudio = `/musicas/jogos/${nomeMinusculo}.mp3`;
    const audio = new Audio(caminhoAudio);
    audio.loop = true;
    audio.volume = 0.15;
    audioObjRef.current = audio;

    const musicaLigada = localStorage.getItem("ludoteca_musica_ligada");

    if (musicaLigada === "false") {
      audio.pause();
      setEstaTocando(false);
    } else {
      audio.play()
        .then(() => {
          setEstaTocando(true);
          localStorage.setItem("ludoteca_musica_ligada", "true");
        })
        .catch((error) => {
          console.log("Autoplay bloqueado pelo navegador.", error);
          setEstaTocando(false);
        });
    }

    return () => {
      audio.pause();
      audioObjRef.current = null;
    };
  }, [nomeJogo]);

  return (
    <div className="container">
      <div className="controle-musica">
        <button 
          className="botao-musica-discreto" 
          onClick={alternarMusica}
          title={estaTocando ? "Pausar Música" : "Tocar Música"}
        >
          {estaTocando ? "🎵" : "🔇"}
        </button>
      </div>

      <h1 className="titulo-jogo"> 
        ⚔️ {nomeJogo.replaceAll("_", " ")} 🛡️
      </h1>

      <button 
        onClick={() => navigate("/home")}
        style={{ 
          position: "absolute",  
          top: "25px",          
          left: "30px",          
          fontWeight: "bold",
          zIndex: 100,
          backgroundColor: "rgba(74, 40, 16, 0.4)", 
          backdropFilter: "blur(4px)",            
          color: "#fff",
          border: "2px solid rgba(212, 175, 55, 0.7)", 
          borderRadius: "10px",
          padding: "10px 18px",
          cursor: "pointer",
          transition: "transform 0.2s, background-color 0.2s"
        }}
        onMouseOver={(e) => {
          e.target.style.transform = "scale(1.05)";
          e.target.style.backgroundColor = "rgba(74, 40, 16, 0.7)"; 
        }}
        onMouseOut={(e) => {
          e.target.style.transform = "scale(1)";
          e.target.style.backgroundColor = "rgba(74, 40, 16, 0.4)";
        }}
      >
        ⬅️ Voltar
      </button>

      <br />

      {/* Renderiza o componente de busca caso o JSON tenha sido carregado com sucesso */}
      {dadosManualJson && (
        <div style={{ margin: "20px auto", maxWidth: "600px" }}>
          <ManualBusca manual={dadosManualJson} />
        </div>
      )}

      <br />

      <h3 style={{ color: "#ffe894", marginBottom: "15px" }}>Manuais em PDF:</h3>
      <div className="lista-jogos">
        {manuais.map((manual) => (
          <div className="card-manual" key={manual}>
            <a
              href={`http://127.0.0.1:8000/pdf/${nomeJogo}/${manual}`}
              target="_blank"
              rel="noreferrer"
            >
              📖 {formatarNomeManual(manual)}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Biblioteca;