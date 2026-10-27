import { NavLink } from "react-router-dom";
import { SANIDADE_MAXIMA, useAgente } from "../../context/agenteContext.js";
import "./Navbar.css";

// Para criar uma página nova no menu, é só adicionar uma linha aqui
// (e a <Route> correspondente em App.jsx)
const PAGINAS = [
  { to: "/home", label: "Arquivos" },
  { to: "/chat", label: "Chat" },
];

export default function Navbar() {
  const { agente, sair, ganharSanidade } = useAgente();
  const sanidade = agente.sanidade ?? SANIDADE_MAXIMA;

  return (
    <header className="nv-root">
      <div className="nv-bar" aria-hidden="true">
        <span /><span /><span /><span /><span />
      </div>

      <div className="nv-corpo">
        <nav className="nv-links" aria-label="Páginas">
          {PAGINAS.map((p) => (
            <NavLink key={p.to} to={p.to} className="nv-link">
              {p.label}
            </NavLink>
          ))}
        </nav>

        <div className="nv-agente">
          <span className="nv-agente__nome">{agente.nome}</span>
          <span className="nv-agente__info">
            {agente.classe} &middot; {agente.elementoParanormal}
          </span>
        </div>

        <div className="nv-sanidade" title="Sanidade (restaura 1h depois da última perda)">
          <span>SAN {sanidade}/{SANIDADE_MAXIMA}</span>
          <span className="nv-sanidade__barra" aria-hidden="true">
            <span style={{ width: `${(sanidade / SANIDADE_MAXIMA) * 100}%` }} />
          </span>
        </div>

        {/* Atalho de teste: só aparece com `npm run dev` */}
        {import.meta.env.DEV && (
          <button type="button" className="nv-botao" onClick={() => ganharSanidade(10)}>
            +10 san
          </button>
        )}
        <button type="button" className="nv-botao" onClick={sair}>
          sair
        </button>
      </div>
    </header>
  );
}
