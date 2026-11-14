// src/components/BuscadorManual.jsx
import { useState } from "react";


export default function BuscadorManual({ manualJson }) {
  const [busca, setBusca] = useState("");
  const [resultados, setResultados] = useState([]);

  const pesquisar = (termoDigitado) => {
    setBusca(termoDigitado);
    
    if (!termoDigitado.trim()) {
      setResultados([]);
      return;
    }

    const termo = termoDigitado.toLowerCase();
    const encontrados = [];

    // Percorre cada seção do JSON (ex: "introducao", "preparacao", "como_jogar")
    Object.entries(manualJson).forEach(([secao, texto]) => {
      if (texto.toLowerCase().includes(termo)) {
        // Formata o título da seção (ex: "como_jogar" vira "Como Jogar")
        const tituloFormatado = secao
          .replace(/_/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase());

        encontrados.push({
          titulo: tituloFormatado,
          // Pega um trecho ao redor ou os primeiros 300 caracteres para exibir
          trecho: texto.substring(0, 300) + "..."
        });
      }
    });

    setResultados(encontrados);
  };

  return (
    <div style={{ margin: "20px 0", textAlign: "left" }}>
      <input
        type="text"
        placeholder="🔍 Pesquisar no manual (ex: Setup, Combate...)"
        value={busca}
        onChange={(e) => pesquisar(e.target.value)}
        style={{ width: "100%", maxWidth: "400px", padding: "10px", borderRadius: "8px" }}
      />

      {resultados.length > 0 && (
        <div style={{ marginTop: "15px", background: "rgba(0,0,0,0.4)", padding: "15px", borderRadius: "10px" }}>
          <h4>Resultados encontrados ({resultados.length}):</h4>
          {resultados.map((item, index) => (
            <div key={index} style={{ marginBottom: "12px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "8px" }}>
              <strong style={{ color: "#ffe894" }}>{item.titulo}</strong>
              <p style={{ fontSize: "0.9rem", color: "#ccc", margin: "5px 0 0 0" }}>
                {item.trecho}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}