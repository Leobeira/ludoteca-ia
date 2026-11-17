import { useState } from "react";

export default function ManualBusca({ manual }) {
  const [busca, setBusca] = useState("");
  const [resultados, setResultados] = useState([]);
  const [secaoAtiva, setSecaoAtiva] = useState(null);

  const pesquisar = (termoDigitado) => {
    setBusca(termoDigitado);

    if (!termoDigitado.trim() || termoDigitado.trim().length < 2) {
      setResultados([]);
      return;
    }

    const termo = termoDigitado.toLowerCase().trim();
    const encontrados = [];

    Object.entries(manual).forEach(([secao, texto]) => {
      if (typeof texto !== "string") return;

      const tituloSecao = secao
        .replace(/_/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());

      // Divide textos muito longos em blocos menores (a cada ~600 caracteres respeitando fim de frase)
      // para que cada regra específica apareça como um resultado separado
      const blocos = texto.match(/[^.!?]+[.!?]+(?:\s|$)|.{1,600}/g) || [texto];
      
      let blocoAtual = "";
      const paragrafosAgrupados = [];

      blocos.forEach((frase) => {
        if ((blocoAtual + frase).length > 700) {
          if (blocoAtual.trim()) paragrafosAgrupados.push(blocoAtual.trim());
          blocoAtual = frase;
        } else {
          blocoAtual += " " + frase;
        }
      });
      if (blocoAtual.trim()) paragrafosAgrupados.push(blocoAtual.trim());

      paragrafosAgrupados.forEach((bloco, idx) => {
        if (
          bloco.toLowerCase().includes(termo) ||
          (idx === 0 && secao.toLowerCase().includes(termo))
        ) {
          // Pega as primeiras palavras do bloco para servir de subtítulo contextual
          const palavras = bloco.split(/\s+/);
          const resumoTitulo = palavras.slice(0, 6).join(" ") + "...";

          encontrados.push({
            chave: `${secao}-${idx}`,
            titulo: `${tituloSecao} — ${resumoTitulo}`,
            textoCompleto: bloco,
            trecho: bloco.substring(0, 180) + "...",
            termoBuscado: termoDigitado.trim(),
          });
        }
      });
    });

    setResultados(encontrados);
  };

  // Função para destacar o termo pesquisado em amarelo dentro do texto
  const destacarTexto = (texto, termo) => {
    if (!termo) return texto;
    const partes = texto.split(new RegExp(`(${termo.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
    return partes.map((parte, i) =>
      parte.toLowerCase() === termo.toLowerCase() ? (
        <mark
          key={i}
          style={{
            backgroundColor: "#d4af37",
            color: "#1a120b",
            padding: "0 4px",
            borderRadius: "4px",
            fontWeight: "bold",
          }}
        >
          {parte}
        </mark>
      ) : (
        parte
      )
    );
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "600px",
        margin: "0 auto 25px auto",
        textAlign: "left",
        fontFamily: "inherit",
        position: "relative",
      }}
    >
      {/* Campo de Pesquisa */}
      <input
        type="text"
        placeholder="🔍 Pesquisar regras, setup, componentes..."
        value={busca}
        onChange={(e) => pesquisar(e.target.value)}
        style={{
          width: "100%",
          padding: "14px 20px",
          backgroundColor: "rgba(30, 20, 10, 0.85)",
          backdropFilter: "blur(6px)",
          border: "2px solid rgba(212, 175, 55, 0.7)",
          borderRadius: "12px",
          color: "#f3f4f6",
          fontSize: "1rem",
          outline: "none",
          boxShadow: "0 8px 16px rgba(0,0,0,0.4)",
          boxSizing: "border-box",
          transition: "all 0.3s ease",
        }}
        onFocus={(e) => (e.target.style.borderColor = "#ffe894")}
        onBlur={(e) => (e.target.style.borderColor = "rgba(212, 175, 55, 0.7)")}
      />

      {/* Lista de Resultados da Busca */}
      {resultados.length > 0 && (
        <div
          style={{
            marginTop: "10px",
            background: "rgba(20, 15, 10, 0.95)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(212, 175, 55, 0.4)",
            padding: "15px",
            borderRadius: "12px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.6)",
            maxHeight: "320px",
            overflowY: "auto",
            position: "absolute",
            width: "100%",
            zIndex: 50,
            boxSizing: "border-box",
          }}
        >
          <h4
            style={{
              color: "#ffe894",
              margin: "0 0 10px 0",
              fontSize: "1rem",
              borderBottom: "1px solid rgba(212, 175, 55, 0.2)",
              paddingBottom: "6px",
            }}
          >
            📜 Trechos encontrados ({resultados.length}):
          </h4>

          {resultados.map((item) => (
            <div
              key={item.chave}
              onClick={() => setSecaoAtiva(item)}
              style={{
                marginBottom: "10px",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                paddingBottom: "8px",
                paddingLeft: "6px",
                paddingRight: "6px",
                borderRadius: "6px",
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = "rgba(212, 175, 55, 0.15)")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              <strong style={{ color: "#ffd700", fontSize: "0.95rem" }}>
                {item.titulo} 🔍
              </strong>
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "#d1d5db",
                  margin: "4px 0 0 0",
                  lineHeight: "1.4",
                }}
              >
                {destacarTexto(item.trecho, item.termoBuscado)}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* POP-UP / MODAL */}
      {secaoAtiva && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(5px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            padding: "20px",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              backgroundColor: "#1a120b",
              border: "2px solid #d4af37",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "700px",
              maxHeight: "80vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 15px 35px rgba(0,0,0,0.8)",
              padding: "25px",
              boxSizing: "border-box",
            }}
          >
            {/* Cabeçalho da Modal */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid rgba(212, 175, 55, 0.3)",
                paddingBottom: "12px",
                marginBottom: "15px",
              }}
            >
              <h3 style={{ color: "#ffe894", margin: 0, fontSize: "1.2rem" }}>
                📖 {secaoAtiva.titulo}
              </h3>
              <button
                onClick={() => setSecaoAtiva(null)}
                style={{
                  background: "rgba(170, 59, 255, 0.2)",
                  border: "1px solid #c084fc",
                  color: "#fff",
                  borderRadius: "50%",
                  width: "32px",
                  height: "32px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "1rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>

            {/* Conteúdo com destaque */}
            <div
              style={{
                overflowY: "auto",
                color: "#e5e7eb",
                fontSize: "1.05rem",
                lineHeight: "1.7",
                textAlign: "left",
                paddingRight: "10px",
                whiteSpace: "pre-line",
              }}
            >
              {destacarTexto(secaoAtiva.textoCompleto, secaoAtiva.termoBuscado)}
            </div>

            {/* Rodapé da Modal */}
            <div style={{ marginTop: "20px", textAlign: "right" }}>
              <button
                onClick={() => setSecaoAtiva(null)}
                style={{
                  backgroundColor: "#d4af37",
                  color: "#1a120b",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  fontSize: "0.95rem",
                }}
              >
                Fechar Regra
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}