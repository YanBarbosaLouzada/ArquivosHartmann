import { Navigate, Outlet } from "react-router-dom";
import { useAgente } from "../../context/agenteContext.js";
import Navbar from "./Navbar.jsx";

// Moldura das páginas que exigem login: barra de navegação + a página em si
export default function LayoutLogado() {
  const { agente } = useAgente();
  if (!agente) return <Navigate to="/entrar" replace />;

  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}
