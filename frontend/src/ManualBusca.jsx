import { useState, useRef, useEffect } from "react";

// Dicionário de termos comuns de jogos de tabuleiro (PT <-> EN)
const DICIONARIO_BG = {
  setup: ["setup", "preparação", "preparacao", "início", "inicio"],
  preparação: ["setup", "preparation", "components"],
  preparacao: ["setup", "preparation", "components"],
  componentes: ["components", "contents", "pieces"],
  cartas: ["cards", "card", "deck", "hand"],
  carta: ["card", "cards"],
  mão: ["hand", "cards"],
  mao: ["hand", "cards"],
  turno: ["turn", "round", "phase", "action"],
  turnos: ["turns", "rounds"],
  rodada: ["round", "turn", "age", "era"],
  rodadas: ["rounds", "ages", "eras"],
  ações: ["actions", "action", "turn"],
  acoes: ["actions", "action", "turn"],
  ação: ["action", "actions"],
  acao: ["action", "actions"],
  pontos: ["points", "score", "scoring", "victory", "glory"],
  pontuação: ["scoring", "score", "points", "victory", "end of game"],
  pontuacao: ["scoring", "score", "points", "victory", "end of game"],
  vitória: ["victory", "win", "winner", "points"],
  vitoria: ["victory", "win", "winner", "points"],
  vencedor: ["winner", "win", "victory"],
  fim: ["end", "game end", "final", "scoring"],
  tabuleiro: ["board", "map", "area", "region"],
  região: ["region", "area", "territory", "kingdom"],
  regiao: ["region", "area", "territory", "kingdom"],
  regiões: ["regions", "areas", "territories", "kingdoms"],
  regioes: ["regions", "areas", "territories", "kingdoms"],
  marcador: ["marker", "token", "piece", "control"],
  marcadores: ["markers", "tokens", "pieces"],
  fichas: ["tokens", "markers", "chips"],
  jogadores: ["players", "player"],
};

const normalizar = (str) =>
  str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export default function ManualBusca({ manual }) {
  const [busca, setBusca] = useState("");
  const [resultados, setResultados] = useState([]);
  const [secaoAtiva, setSecaoAtiva] = useState(null);
  const containerRef = useRef(null);

  const fecharBusca = () => {
    setBusca("");
    setResultados([]);
  };

  useEffect(() => {
    if (resultados.length === 0) return;

    const handleClickFora = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        fecharBusca();
      }
    };

    document.addEventListener("mousedown", handleClickFora);
    return () => {
      document.removeEventListener("mousedown", handleClickFora);
    };
  }, [resultados.length]);

  const expandirTermos = (termoBruto) => {
    const limpo = normalizar(termoBruto.trim());
    const termos = new Set([limpo, termoBruto.trim().toLowerCase()]);

    if (DICIONARIO_BG[limpo]) {
      DICIONARIO_BG[limpo].forEach((t) => termos.add(normalizar(t)));
    }
    return Array.from(termos);
  };

  const extrairTextosDoJson = (obj, prefixo = "") => {
    let lista = [];
    if (typeof obj === "string") {
      lista.push({ secao: prefixo || "Regra", texto: obj });
    } else if (Array.isArray(obj)) {
      obj.forEach((item, i) => {
        lista = lista.concat(extrairTextosDoJson(item, `${prefixo} (${i + 1})`));
      });
    } else if (obj && typeof obj === "object") {
      Object.entries(obj).forEach(([chave, valor]) => {
        const novoPrefixo = prefixo ? `${prefixo} > ${chave}` : chave;
        lista = lista.concat(extrairTextosDoJson(valor, novoPrefixo));
      });
    }
    return lista;
  };

  const pesquisar = (termoDigitado) => {
    setBusca(termoDigitado);

    if (!termoDigitado.trim() || termoDigitado.trim().length < 2) {
      setResultados([]);
      return;
    }

    const termosBusca = expandirTermos(termoDigitado);
    const encontrados = [];
    const secoesExtraidas = extrairTextosDoJson(manual);

    secoesExtraidas.forEach(({ secao, texto }) => {
      const tituloSecao = secao
        .replace(/_/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());

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
        const blocoNorm = normalizar(bloco);
        const secaoNorm = normalizar(secao);

        const deuMatch = termosBusca.some(
          (t) => blocoNorm.includes(t) || (idx === 0 && secaoNorm.includes(t))
        );

        if (deuMatch) {
          const palavras = bloco.split(/\s+/);
          const resumoTitulo = palavras.slice(0, 6).join(" ") + "...";

          encontrados.push({
            chave: `${secao}-${idx}`,
            titulo: `${tituloSecao} — ${resumoTitulo}`,
            textoCompleto: bloco,
            trecho: bloco.substring(0, 180) + "...",
            termosBuscados: termosBusca,
          });
        }
      });
    });

    setResultados(encontrados);
  };

  const destacarTexto = (texto, termos) => {
    if (!termos || termos.length === 0) return texto;
    const escapar = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${termos.map(escapar).join("|")})`, "gi");
    const partes = texto.split(regex);

    return partes.map((parte, i) => {
      const ehMatch = termos.some((t) => normalizar(parte) === normalizar(t));
      return ehMatch ? (
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
      );
    });
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        maxWidth: "600px",
        margin: "0 auto 25px auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: "inherit",
        position: "relative",
      }}
    >
      <input
        type="text"
        placeholder="🔍 Pesquisar regras, setup, cards, pontos..."
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
          textAlign: "left",
          transition: "all 0.3s ease",
        }}
        onFocus={(e) => (e.target.style.borderColor = "#ffe894")}
        onBlur={(e) => (e.target.style.borderColor = "rgba(212, 175, 55, 0.7)")}
      />

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
            top: "100%",
            width: "100%",
            zIndex: 50,
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid rgba(212, 175, 55, 0.2)",
              paddingBottom: "6px",
              marginBottom: "10px",
            }}
          >
            <h4
              style={{
                color: "#ffe894",
                margin: 0,
                fontSize: "1rem",
              }}
            >
              📜 Trechos encontrados ({resultados.length})
            </h4>

            <button
              type="button"
              onClick={fecharBusca}
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                border: "1px solid rgba(212,175,55,0.5)",
                background: "rgba(212,175,55,0.2)",
                color: "#fff",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              ❌
            </button>
          </div>

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
                {destacarTexto(item.trecho, item.termosBuscados)}
              </p>
            </div>
          ))}
        </div>
      )}

      {secaoAtiva && (
        <div
          onClick={() => setSecaoAtiva(null)}
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
            onClick={(e) => e.stopPropagation()}
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
                type="button"
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
              {destacarTexto(secaoAtiva.textoCompleto, secaoAtiva.termosBuscados)}
            </div>

            <div style={{ marginTop: "20px", textAlign: "right" }}>
              <button
                type="button"
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