import { useEffect } from "react";
import { BrowserRouter, useLocation, Routes, Route } from "react-router-dom";
import Welcome from "./pages/Welcome";
import Home from "./pages/Home";
import Biblioteca from "./pages/Biblioteca";

// Componente auxiliar para jogar a tela para o topo na troca de rota
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  useEffect(() => {
    const atualizarLuz = (e) => {
      document.documentElement.style.setProperty("--mouse-x", `${e.clientX}px`);
      document.documentElement.style.setProperty("--mouse-y", `${e.clientY}px`);
    };

    window.addEventListener("mousemove", atualizarLuz);
    return () => window.removeEventListener("mousemove", atualizarLuz);
  }, []);

  return (
    <>
      {/* Camada flutuante de iluminação da tocha */}
      <div className="luz-tocha" />

      <BrowserRouter>
        <ScrollToTop/>
        
        <Routes>
          {/* Rota inicial com a tela de boas-vindas, background 'povo.jpg' e início da música */}
          <Route path="/" element={<Welcome />} />

          {/* Rota da página principal com os jogos */}
          <Route path="/home" element={<Home />} />

          {/* Rota da biblioteca/manuais do jogo */}
          <Route path="/jogo/:nomeJogo" element={<Biblioteca />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;