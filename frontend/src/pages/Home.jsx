import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../App.css";

function Home() {
  const [busca, setBusca] = useState("");
  const [jogos, setJogos] = useState(["Alchemist"]);

  const navigate = useNavigate();
  const audioRef = useRef(null);
  const [estaTocando, setEstaTocando] = useState(false);

  const alternarMusica = () => {
    if (!audioRef.current) return;

    if (audioRef.current.paused) {
      audioRef.current.play()
        .then(() => {
          setEstaTocando(true);
          localStorage.setItem("ludoteca_musica_ligada", "true");
        })
        .catch((err) => {
          console.log("Erro ao reproduzir áudio:", err);
        });
    } else {
      audioRef.current.pause();
      setEstaTocando(false);
      localStorage.setItem("ludoteca_musica_ligada", "false");
    }
  };

  useEffect(() => {
    const isVercel = window.location.hostname.includes("vercel.app");

    if (!isVercel) {
      axios
        .get("http://127.0.0.1:8000/jogos")
        .then((response) => {
          if (response.data && response.data.length > 0) {
            setJogos(response.data);
          }
        })
        .catch((error) => {
          console.log("Erro ao buscar jogos locais:", error);
        });
    }

    document.body.style.backgroundImage = "url('/imagens/povo.jpg')";

    if (audioRef.current) {
      audioRef.current.volume = 0.2;

      const musicaLigada = localStorage.getItem("ludoteca_musica_ligada");

      if (musicaLigada === "false") {
        audioRef.current.pause();
        setEstaTocando(false);
      } else {
        audioRef.current.play()
          .then(() => {
            setEstaTocando(true);
            localStorage.setItem("ludoteca_musica_ligada", "true");
          })
          .catch((error) => {
            console.log("Autoplay bloqueado.", error);
            setEstaTocando(false);
          });
      }
    }
  }, []);

  const jogosFiltrados = jogos.filter((jogo) =>
    jogo
      .replaceAll("_", " ")
      .toLowerCase()
      .includes(busca.toLowerCase())
  );

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

        <audio ref={audioRef} loop>
          <source src="/musicas/tavern.mp3" type="audio/mpeg" />
          Seu navegador não suporta elemento de áudio.
        </audio>
      </div>

      <h1 style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
        <span 
          onClick={() => navigate("/")} 
          style={{ transition: "transform 0.2s", cursor: "pointer" }} 
          title="Voltar para a página inicial"
          onMouseOver={(e) => e.target.style.transform = "scale(1.2)"}
          onMouseOut={(e) => e.target.style.transform = "scale(1)"}
        >
          🎲
        </span> 
        <span 
          onClick={() => navigate("/")} 
          style={{ cursor: "pointer" }}
          title="Voltar para a página inicial"
        >
          Ludoteca IA
        </span>
      </h1>

      <p>Sua biblioteca digital de jogos de tabuleiro com {jogos.length} jogos</p>

      <input
        type="text"
        placeholder="Buscar jogo..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
      />

      <div className="lista-jogos">
        {jogosFiltrados.map((jogo) => (
          <div className="card" key={jogo}>
            <h3>{jogo.replaceAll("_", " ")}</h3>
            <button onClick={() => navigate(`/jogo/${jogo}`)}>
              Bora Explorar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
