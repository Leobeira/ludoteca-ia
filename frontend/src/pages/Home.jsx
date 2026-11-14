import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../App.css";

function Home() {
  const [busca, setBusca] = useState("");
  const [jogos, setJogos] = useState([]);

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
    axios
      .get("http://127.0.0.1:8000/jogos")
      .then((response) => {
        setJogos(response.data);
      });

    document.body.style.backgroundImage = "url('/imagens/povo.jpg')";

    if (audioRef.current) {
      audioRef.current.volume = 0.2; // Mantém o seu volume ajustado

      // Verifica se o usuário já havia desligado a música antes
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
            console.log("Autoplay bloqueado pelo navegador. O usuário precisa interagir com a página primeiro.", error);
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
      {/* Botão de música discreto no canto superior direito contendo ícone dinâmico */}
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
          /* Removido o cursor: pointer inline para assumir a tocha do CSS global */
          style={{ transition: "transform 0.2s" }} 
          title="Voltar para a página inicial"
          onMouseOver={(e) => e.target.style.transform = "scale(1.2)"}
          onMouseOut={(e) => e.target.style.transform = "scale(1)"}
        >
          🎲
        </span> 
        <span 
          onClick={() => navigate("/")} 
          /* Removido o cursor: pointer inline aqui também */
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