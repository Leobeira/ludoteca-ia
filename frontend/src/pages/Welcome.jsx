import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

function Welcome() {
  const navigate = useNavigate();
  const audioRef = useRef(null);

  const entrarNoSite = () => {
    if (audioRef.current) {
      audioRef.current.volume = 0.1;
      audioRef.current.play().catch((err) => {
        console.log("Erro ao iniciar áudio:", err);
      });
    }

    setTimeout(() => {
      navigate("/home");
    }, 200);
  };

  return (
    <div 
      style={{
        backgroundImage: "url('/imagens/povo.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        paddingTop: "80px",
        margin: 0,
        position: "fixed",
        top: 0,
        left: 0,
        overflow: "hidden"
      }}
    >
      <style>
        {`
          /* Container que prende os efeitos proporcionalmente ao centro da tela */
          .taverna-cena {
            position: relative;
            width: 100%;
            max-width: 1400px;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            pointer-events: none;
          }

          /* Voo suave e expansivo por toda a taverna */
          @keyframes vooFadaCompleto {
            0% { transform: translate(0px, 0px) scale(0.8); opacity: 0.3; }
            15% { transform: translate(-250px, -30px) scale(1.3); opacity: 1; }  
            30% { transform: translate(180px, -40px) scale(0.9); opacity: 0.6; }   
            45% { transform: translate(120px, 90px) scale(1.4); opacity: 1; }   
            60% { transform: translate(-150px, 130px) scale(1.1); opacity: 0.8; }  
            75% { transform: translate(-30px, 40px) scale(1.2); opacity: 0.9; }    
            90% { transform: translate(70px, -15px) scale(1.0); opacity: 0.5; }   
            100% { transform: translate(0px, 0px) scale(0.8); opacity: 0.3; }
          }

          /* Efeito de brilho pulsante da fada */
          @keyframes brilhoFada {
            0%, 100% { box-shadow: 0 0 8px 3px #d4af37, 0 0 15px 5px #ffffff; }
            50% { box-shadow: 0 0 22px 9px #ffdf73, 0 0 35px 15px #ffffff; }
          }

          /* Efeito da lareira acesa com oscilação de luz ao fundo */
          @keyframes lareiraChama {
            0%, 100% { 
              opacity: 0.55; 
              transform: scale(1); 
              box-shadow: 0 0 25px 12px rgba(255, 100, 0, 0.6); 
            }
            33% { 
              opacity: 0.85; 
              transform: scale(1.08); 
              box-shadow: 0 0 40px 20px rgba(255, 140, 0, 0.8); 
            }
            66% { 
              opacity: 0.7; 
              transform: scale(0.95); 
              box-shadow: 0 0 35px 15px rgba(255, 80, 0, 0.7); 
            }
          }

          /* Brilho intermitente das velas nas mesas */
          @keyframes brilhoVela {
            0%, 100% { opacity: 0.6; transform: scale(1); filter: drop-shadow(0 0 4px #ffaa00); }
            50% { opacity: 1; transform: scale(1.15); filter: drop-shadow(0 0 10px #ffcc00); }
          }

          .fada-magica {
            position: absolute;
            width: 12px;
            height: 12px;
            background-color: #ffffff;
            border-radius: 50%;
            animation: vooFadaCompleto 18s infinite ease-in-out, brilhoFada 2.5s infinite ease-in-out;
            top: 50%;
            left: 50%;
            z-index: 2;
          }

          .lareira-fundo {
            position: absolute;
            width: 18px;
            height: 8px;
            background: radial-gradient(circle, rgba(255, 159, 50, 0.74) 0%, rgba(255, 60, 0, 0.32) 60%, transparent 100%);
            border-radius: 60%;
            top: 34.5%;
            left: 48.5%;
            transform: translate(-50%, -50%);
            animation: lareiraChama 1.8s infinite ease-in-out;
            z-index: 1;
          }

          .fogo-vela-1, .fogo-vela-2 {
            position: absolute;
            width: 7px;
            height: 12px;
            background: radial-gradient(circle, #fff700d3 0%, #ff5500c3 100%);
            border-radius: 50% 50% 20% 20%;
            animation: brilhoVela 1.5s infinite alternate ease-in-out;
            z-index: 2;
          }

          /* Posições relativas ajustadas ao centro do container */
          .fogo-vela-1 {
            top: 55.3%;
            left: 43.4%;
          }

          .fogo-vela-2 {
            top: 34.8%;
            left: 0.3%;
            animation-delay: 0.7s;
          }
    
        `}
      </style>

      {/* Caixa centralizadora que acompanha o redimensionamento */}
      <div className="taverna-cena">
        {/* Luz da lareira oscilando ao fundo */}
        <div className="lareira-fundo"></div>

        {/* Fada voadora mágica */}
        <div className="fada-magica"></div>

        {/* Velas nas mesas */}
        <div className="fogo-vela-1"></div>
        <div className="fogo-vela-2"></div>
      </div>

      <audio ref={audioRef} loop>
        <source src="/musicas/tavern.mp3" type="audio/mpeg" />
      </audio>

      <button 
        onClick={entrarNoSite}
        style={{
          position: "absolute",
          top: "80px",
          padding: "18px 38px",
          fontSize: "24px",
          fontWeight: "bold",
          fontFamily: "inherit",
          backgroundColor: "rgba(74, 40, 16, 0.4)", 
          backdropFilter: "blur(4px)",
          color: "#fff",
          border: "2px solid rgba(212, 175, 55, 0.7)",
          borderRadius: "14px",
          cursor: "pointer",
          boxShadow: "0px 4px 15px rgba(0,0,0,0.5)",
          transition: "transform 0.2s, background-color 0.2s",
          zIndex: 10
        }}
        onMouseOver={(e) => {
          e.target.style.transform = "scale(1.05)";
          e.target.style.backgroundColor = "rgba(74, 40, 16, 0.6)";
        }}
        onMouseOut={(e) => {
          e.target.style.transform = "scale(1)";
          e.target.style.backgroundColor = "rgba(74, 40, 16, 0.4)";
        }}
      >
        🎲 Ludoteca IA
      </button>
    </div>
  );
}

export default Welcome;