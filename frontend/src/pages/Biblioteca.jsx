import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "../App.css";

function Biblioteca() {
  const { nomeJogo } = useParams();
  const [manuais, setManuais] = useState([]);
  const navigate = useNavigate();
  
  const audioObjRef = useRef(null);
  const [estaTocando, setEstaTocando] = useState(false);

  // Função mágica para deixar o nome do manual bonito e legível
  const formatarNomeManual = (nomeArquivo) => {
    // Remove o final ".pdf" ou ".PDF"
    let nomeLimpo = nomeArquivo.replace(/\.pdf$/i, "");
    
    // Substitui underscores e hífens por espaços
    nomeLimpo = nomeLimpo.replace(/[_]/g, " ");
    
    // Deixa a primeira letra de cada palavra em maiúscula (opcional, fica muito elegante)
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
    axios
      .get(`http://127.0.0.1:8000/jogos/${nomeJogo}`)
      .then((response) => {
        setManuais(response.data);
      });

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
        ⚔️ {nomeJogo.replaceAll("_", " ")} 🛡️</h1>

      <button 
        onClick={() => navigate("/home")}
        style={{ 
          position: "absolute",  
          top: "25px",           
          left: "30px",          
          fontWeight: "bold",
          zIndex: 100,
          /* Cores e transparência aqui: */
          backgroundColor: "rgba(74, 40, 16, 0.4)", /* Marrom da taverna com 40% de opacidade */
          backdropFilter: "blur(4px)",             /* Efeito de vidro fosco por trás */
          color: "#fff",
          border: "2px solid rgba(212, 175, 55, 0.7)", /* Borda dourada translúcida */
          borderRadius: "10px",
          padding: "10px 18px",
          cursor: "pointer",
          transition: "transform 0.2s, background-color 0.2s"
        }}
        onMouseOver={(e) => {
          e.target.style.transform = "scale(1.05)";
          e.target.style.backgroundColor = "rgba(74, 40, 16, 0.7)"; /* Fica um pouco mais forte ao passar o mouse */
        }}
        onMouseOut={(e) => {
          e.target.style.transform = "scale(1)";
          e.target.style.backgroundColor = "rgba(74, 40, 16, 0.4)";
        }}
      >
        ⬅️ Voltar
      </button>

      <br />
      <br />

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