import { useEffect, useRef, useState } from "react";
import "./ChatComponent.css";

// Cada autor ganha uma cor de borda (sempre a mesma pro mesmo nome)
const CORES = ["amarelo", "vermelho", "roxo", "azul"];
const corDoAutor = (nome = "") => {
  let soma = 0;
  for (let i = 0; i < nome.length; i++) soma += nome.charCodeAt(i);
  return CORES[soma % CORES.length];
};

// Dados que aparecem como botão (cada clique rola 1 dado desse tipo)
const DADOS_RAPIDOS = [4, 6, 8, 10, 12, 20, 100];

// ---------------------------------------------------------------------------
// Uma mensagem de rolagem de dados. Mostra cada dado que saiu e o total.
// Em dados de 20 lados, o 20 fica dourado (crítico) e o 1 fica vermelho (falha).
// ---------------------------------------------------------------------------
function Rolagem({ rolagem }) {
  const { expressao, lados, dados, modificador, manterMaior, total } = rolagem;

  // Com "kh" só o maior dado vale; os outros aparecem apagados
  const maior = Math.max(...dados);

  function classeDoDado(valor) {
    const classes = ["ch-dado"];
    if (lados === 20 && valor === 20) classes.push("ch-dado--critico");
    if (lados === 20 && valor === 1) classes.push("ch-dado--falha");
    if (manterMaior && valor !== maior) classes.push("ch-dado--descartado");
    return classes.join(" ");
  }

  return (
    <div className="ch-rolagem">
      <span className="ch-rolagem__expressao">rolou {expressao}</span>

      <div className="ch-rolagem__dados">
        {dados.map((valor, i) => (
          <span className={classeDoDado(valor)} key={i}>
            {valor}
          </span>
        ))}
        {modificador !== 0 && (
          <span className="ch-rolagem__mod">
            {modificador > 0 ? `+${modificador}` : modificador}
          </span>
        )}
        <span className="ch-rolagem__total">= {total}</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// O chat de UM canal.
//
// Props:
//   socket  conexão criada pela ChatPage
//   canal   canal aberto ({ _id, nome, ... })
//   agente  agente logado (para saber quais mensagens são minhas)
//
// A ChatPage usa key={canal._id}, então este componente é recriado do zero a
// cada troca de canal: as mensagens começam vazias e o histórico é buscado.
// ---------------------------------------------------------------------------
export default function ChatComponent({ socket, canal, agente }) {
  const bottomRef = useRef(null);
  const [mensagens, setMensagens] = useState([]);
  const [texto, setTexto] = useState("");
  const [erro, setErro] = useState("");

  // 1) Entra no canal e carrega o histórico
  useEffect(() => {
    // Evita atualizar a tela se o componente já saiu (troca rápida de canal)
    let ativo = true;

    function entrar() {
      socket.emit("entrar_canal", canal._id, (resposta) => {
        if (!ativo) return;
        if (!resposta.ok) return setErro(resposta.erro);
        setMensagens(resposta.mensagens);
      });
    }

    // Se já está conectado entra agora; senão espera o evento "connect".
    // Também roda numa reconexão, porque o servidor "esquece" as salas.
    if (socket.connected) entrar();
    socket.on("connect", entrar);

    return () => {
      ativo = false;
      socket.off("connect", entrar);
    };
  }, [socket, canal._id]);

  // 2) Recebe as mensagens novas em tempo real
  useEffect(() => {
    function aoReceber(mensagem) {
      // Garantia extra: só aceita mensagens deste canal
      if (mensagem.canalId !== canal._id) return;
      setMensagens((anteriores) => [...anteriores, mensagem]);
    }

    socket.on("receive_message", aoReceber);
    return () => {
      socket.off("receive_message", aoReceber);
    };
  }, [socket, canal._id]);

  // 3) Rola a lista para a última mensagem sempre que chega algo novo
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  // Envia o texto digitado. Se começar com "/r", o servidor trata como dado.
  function enviar() {
    const conteudo = texto.trim();
    if (!conteudo) return;

    setErro("");
    socket.emit("message", conteudo, (resposta) => {
      if (!resposta.ok) setErro(resposta.erro);
    });
    setTexto("");
  }

  // Clique em um botão de dado: pede ao servidor para rolar 1dX
  function rolarDado(lados) {
    setErro("");
    socket.emit("rolar_dado", `1d${lados}`, (resposta) => {
      if (!resposta.ok) setErro(resposta.erro);
    });
  }

  function aoTeclar(e) {
    if (e.key === "Enter") enviar();
  }

  return (
    <div className="ch-root">
      {/* Tarja de cores no topo */}
      <div className="ch-bar" aria-hidden="true">
        <span /><span /><span /><span /><span />
      </div>

      {/* Cabeçalho */}
      <header className="ch-header">
        <h2 className="ch-header__title"># {canal.nome}</h2>
        <span className="ch-header__sub">
          dados: /r 2d20+3 &middot; /r 3d20kh (vale o maior)
        </span>
      </header>

      {/* Mensagens */}
      <div className="ch-messages" role="log" aria-live="polite">
        {mensagens.length === 0 && (
          <p className="ch-empty">nenhum registro ainda... escreva algo.</p>
        )}

        {mensagens.map((m) => {
          const minha = m.autorId === agente._id;
          return (
            <div
              className={`ch-msg ch-msg--${corDoAutor(m.autorNome)} ${minha ? "ch-msg--minha" : "ch-msg--outro"}`}
              key={m._id}
            >
              <span className="ch-msg__author">
                {minha ? `${m.autorNome} (você)` : m.autorNome}
              </span>

              {m.tipo === "rolagem" ? (
                <Rolagem rolagem={m.rolagem} />
              ) : (
                <p className="ch-msg__text">{m.texto}</p>
              )}
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {erro && <p className="ch-erro">{erro}</p>}

      {/* Botões de dado */}
      <div className="ch-dados" aria-label="Rolar dado">
        {DADOS_RAPIDOS.map((lados) => (
          <button
            type="button"
            className="ch-dados__botao"
            key={lados}
            onClick={() => rolarDado(lados)}
          >
            d{lados}
          </button>
        ))}
      </div>

      {/* Campo de escrever */}
      <div className="ch-input">
        <input
          className="ch-input__field"
          type="text"
          placeholder="escreva no arquivo... ou /r 1d20"
          aria-label="Mensagem"
          maxLength={1000}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={aoTeclar}
          autoFocus
        />
        <button
          className="ch-input__button"
          onClick={enviar}
          disabled={!texto.trim()}
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
