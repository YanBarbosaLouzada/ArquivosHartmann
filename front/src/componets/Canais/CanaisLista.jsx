import { useState } from "react";
import "./CanaisLista.css";

// ---------------------------------------------------------------------------
// Lista de canais (parecida com a barra lateral do Discord).
//
// Props:
//   canais        lista de canais vinda do servidor
//   canalAtualId  _id do canal aberto (para destacar na lista)
//   onEscolher    função chamada com o canal clicado
//   onCriar       função que cria um canal; devolve uma Promise com { ok, erro }
// ---------------------------------------------------------------------------
export default function CanaisLista({
  canais,
  canalAtualId,
  onEscolher,
  onCriar,
}) {
  const [nomeNovo, setNomeNovo] = useState("");
  const [erro, setErro] = useState("");

  async function aoCriar(evento) {
    // Sem isso o formulário recarregaria a página inteira
    evento.preventDefault();

    const nome = nomeNovo.trim();
    if (!nome) return;

    setErro("");
    const resposta = await onCriar(nome);

    if (resposta.ok) {
      setNomeNovo("");
    } else {
      setErro(resposta.erro);
    }
  }

  return (
    <aside className="cl-root" aria-label="Canais">
      <h2 className="cl-titulo">canais</h2>

      <ul className="cl-lista">
        {canais.map((canal) => (
          <li key={canal._id}>
            <button
              type="button"
              className={`cl-canal${canal._id === canalAtualId ? " cl-canal--ativo" : ""}`}
              onClick={() => onEscolher(canal)}
              title={`criado por ${canal.criadoPor}`}
            >
              <span className="cl-canal__hash">#</span>
              {canal.nome}
            </button>
          </li>
        ))}
      </ul>

      {/* Criar uma nova sessão de RPG */}
      <form className="cl-novo" onSubmit={aoCriar}>
        <label className="cl-novo__label" htmlFor="cl-nome-novo">
          nova sessão
        </label>
        <input
          id="cl-nome-novo"
          className="cl-novo__campo"
          type="text"
          maxLength={30}
          placeholder="nome do canal"
          autoComplete="off"
          value={nomeNovo}
          onChange={(e) => setNomeNovo(e.target.value)}
        />
        <button
          type="submit"
          className="cl-novo__botao"
          disabled={!nomeNovo.trim()}
        >
          criar canal
        </button>
        {erro && <p className="cl-novo__erro">{erro}</p>}
      </form>
    </aside>
  );
}
