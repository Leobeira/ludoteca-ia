import { useEffect, useState, useRef } from "react";
import api, { API_URL } from "../api";
import { useParams, useNavigate } from "react-router-dom";
import ManualBusca from "../ManualBusca";
import "../App.css";

function Biblioteca() {
  const { nomeJogo } = useParams();
  const [manuais, setManuais] = useState([]);
  const [dadosManualJson, setDadosManualJson] = useState(null);
  const navigate = useNavigate();
  
  const audioObjRef = useRef(null);
  const [estaTocando, setEstaTocando] = useState(false);

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
    setDadosManualJson(null);

    // 1. Busca os manuais do jogo usando a API centralizada
    api.get(`/jogos/${nomeJogo}`)
      .then((response) => {
        const listaManuais = response.data;
        setManuais(listaManuais);

        if (listaManuais.length > 0) {
          const nomeJsonPrincipal = `${nomeJogo}.json`;

          api.get(`/manual/${nomeJogo}/${nomeJsonPrincipal}`)
            .then((resJson) => {
              setDadosManualJson(resJson.data);
            })
            .catch(() => {
              const primeiroPdf = listaManuais[0];
              const nomeJsonAlternativo = primeiroPdf.replace(/\.pdf$/i, ".json");

              api.get(`/manual/${nomeJogo}/${nomeJsonAlternativo}`)
                .then((resAlt) => setDadosManualJson(resAlt.data))
                .catch(() => {
                  console.log("Nenhum JSON encontrado para este jogo.");
                  setDadosManualJson(null);
                });
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

      {dadosManualJson && !dadosManualJson.erro && (
        <ManualBusca manual={dadosManualJson} />
      )}
      
      <br />

      <h3 style={{ color: "#ffe894", marginBottom: "15px" }}>Manuais em PDF:</h3>
      <div className="lista-jogos">
        {manuais.map((manual) => (
          <div className="card-manual" key={manual}>
            {/* Usa a variável API_URL para abrir o PDF corretamente tanto no PC quanto no Render */}
            <a
              href={`${API_URL}/pdf/${nomeJogo}/${manual}`}
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