import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAgente } from "../../context/agenteContext.js";
import "../home/home.css";
import "./acesso.css";

// Mesmas regras do middleware validarAgente do backend
const ELEMENTOS = ["Sangue", "Morte", "Conhecimento", "Energia"];
const CLASSES = ["Combatente", "Especialista", "Ocultista"];

const FORM_VAZIO = {
  nome: "",
  email: "",
  senha: "",
  elementoParanormal: ELEMENTOS[0],
  classe: CLASSES[0],
};

// modo = "entrar" (login) ou "cadastro" (registro de novo agente)
export default function Acesso({ modo }) {
  const { agente, entrar, cadastrar } = useAgente();
  const navigate = useNavigate();
  const [form, setForm] = useState(FORM_VAZIO);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const cadastro = modo === "cadastro";

  if (agente) return <Navigate to="/home" replace />;

  function alterarCampo(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function enviar(e) {
    e.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      if (cadastro) await cadastrar(form);
      else await entrar(form.email, form.senha);
      navigate("/home", { replace: true });
    } catch (e) {
      setErro(e.message);
      setEnviando(false);
    }
  }

  return (
    <div className="ah-root">
      <div className="ah-classification-bar" aria-hidden="true">
        <span className="ah-classification-bar__seg ah-classification-bar__seg--black" />
        <span className="ah-classification-bar__seg ah-classification-bar__seg--yellow" />
        <span className="ah-classification-bar__seg ah-classification-bar__seg--red" />
        <span className="ah-classification-bar__seg ah-classification-bar__seg--purple" />
        <span className="ah-classification-bar__seg ah-classification-bar__seg--blue" />
      </div>

      <header className="ag-header">
        <h1 className="ag-title">{cadastro ? "Registro de Agente" : "Acesso Restrito"}</h1>
        <span className="ah-title__sub">
          ordo realitas &mdash; {cadastro ? "alistamento" : "identifique-se, agente"}
        </span>
      </header>

      <div className="ah-container ag-acesso">
        {erro && <p className="ag-alert ag-alert--erro">{erro}</p>}

        <section className="ah-section">
          <p className="ah-casefiles-heading">
            {cadastro ? "novo agente" : "credenciais"}
          </p>
          <form className={`ag-form${cadastro ? "" : " ag-form--simples"}`} onSubmit={enviar}>
            {cadastro && (
              <label>
                Nome
                <input name="nome" value={form.nome} onChange={alterarCampo} minLength={3} maxLength={50} required />
              </label>
            )}
            <label>
              Email
              <input name="email" type="email" autoComplete="email" value={form.email} onChange={alterarCampo} required />
            </label>
            <label>
              Senha
              <input
                name="senha"
                type="password"
                autoComplete={cadastro ? "new-password" : "current-password"}
                value={form.senha}
                onChange={alterarCampo}
                minLength={cadastro ? 8 : undefined}
                required
              />
            </label>
            {cadastro && (
              <>
                <label>
                  Elemento paranormal
                  <select name="elementoParanormal" value={form.elementoParanormal} onChange={alterarCampo}>
                    {ELEMENTOS.map((el) => (
                      <option key={el}>{el}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Classe
                  <select name="classe" value={form.classe} onChange={alterarCampo}>
                    {CLASSES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Sanidade inicial
                  <input value={20} readOnly />
                </label>
              </>
            )}

            <div className="ag-form__actions">
              <button type="submit" className="ag-btn" disabled={enviando}>
                {enviando ? "consultando arquivos..." : cadastro ? "Registrar agente" : "Entrar"}
              </button>
            </div>
          </form>

          <p className="ag-troca">
            {cadastro ? (
              <>Já é agente? <Link to="/entrar" className="ag-link">entrar</Link></>
            ) : (
              <>Ainda não faz parte da Ordem? <Link to="/cadastro" className="ag-link">registre-se</Link></>
            )}
          </p>
        </section>
      </div>
    </div>
  );
}
