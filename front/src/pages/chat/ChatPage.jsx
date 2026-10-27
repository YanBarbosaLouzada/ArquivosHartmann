import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAgente } from "../../context/agenteContext.js";
import CanaisLista from "../../componets/Canais/CanaisLista.jsx";
import ChatComponent from "../../componets/Chat/ChatComponent.jsx";
import "./ChatPage.css";

// Endereço do servidor de socket (o mesmo da porta 8080 no Backend-RPG)
const URL_SOCKET = "http://localhost:8080/";

// ---------------------------------------------------------------------------
// Página do chat. Ela é a "dona" da conexão com o servidor e da lista de
// canais; o canal aberto é mostrado pelo ChatComponent.
//
//   [ lista de canais ] [ chat do canal escolhido ]
// ---------------------------------------------------------------------------
export default function ChatPage() {
  const { agente } = useAgente();

  // O socket é criado desligado (autoConnect: false); quem liga e desliga é o
  // useEffect abaixo. O servidor identifica quem somos pelo agenteId de "auth".
  const [socket] = useState(() =>
    io(URL_SOCKET, {
      autoConnect: false,
      auth: { agenteId: agente._id },
    })
  );
  const [canais, setCanais] = useState([]);
  const [canalAtual, setCanalAtual] = useState(null);
  const [erro, setErro] = useState("");

  // Liga a conexão quando a página aparece e desliga quando ela sai da tela.
  useEffect(() => {
    // Pede a lista de canais ao servidor.
    // Roda ao conectar e também ao RE-conectar (se a internet cair e voltar).
    function carregarCanais() {
      setErro("");
      socket.emit("listar_canais", (resposta) => {
        if (!resposta.ok) return setErro(resposta.erro);

        setCanais(resposta.canais);
        // Se ainda não escolhemos um canal, abre o primeiro da lista
        setCanalAtual((atual) => atual ?? resposta.canais[0] ?? null);
      });
    }

    // Alguém criou um canal novo: o servidor manda a lista atualizada
    function aoAtualizarCanais(lista) {
      setCanais(lista);
    }

    function aoFalharConexao(e) {
      setErro(`Não foi possível conectar ao chat: ${e.message}`);
    }

    socket.on("connect", carregarCanais);
    socket.on("canais_atualizados", aoAtualizarCanais);
    socket.on("connect_error", aoFalharConexao);
    socket.connect();

    // Limpeza: ao sair da página, encerra a conexão
    return () => {
      socket.off("connect", carregarCanais);
      socket.off("canais_atualizados", aoAtualizarCanais);
      socket.off("connect_error", aoFalharConexao);
      socket.disconnect();
    };
  }, [socket]);

  // Pede ao servidor para criar um canal. Devolve uma Promise com a resposta
  // para o formulário saber se deu certo e mostrar o erro, se houver.
  function criarCanal(nome) {
    return new Promise((resolve) => {
      socket.emit("criar_canal", nome, (resposta) => {
        // Se deu certo, já entra no canal que acabou de criar
        if (resposta.ok) setCanalAtual(resposta.canal);
        resolve(resposta);
      });
    });
  }

  return (
    <div className="cp-root">
      <CanaisLista
        canais={canais}
        canalAtualId={canalAtual?._id}
        onEscolher={setCanalAtual}
        onCriar={criarCanal}
      />

      <main className="cp-principal">
        {erro && <p className="cp-erro">{erro}</p>}

        {canalAtual ? (
          // "key" faz o React recriar o chat do zero ao trocar de canal,
          // então as mensagens do canal antigo não ficam misturadas
          <ChatComponent
            key={canalAtual._id}
            socket={socket}
            canal={canalAtual}
            agente={agente}
          />
        ) : (
          <p className="cp-vazio">escolha um canal para começar...</p>
        )}
      </main>
    </div>
  );
}
