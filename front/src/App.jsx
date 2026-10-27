import { Navigate, Route, Routes } from 'react-router-dom'
import ArquivosHartmann from './pages/home/home.jsx'
import Acesso from './pages/acesso/acesso.jsx'
import LayoutLogado from './componets/Navbar/LayoutLogado.jsx'
import './App.css'
import ChatPage from './pages/chat/ChatPage.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/entrar" element={<Acesso modo="entrar" />} />
      <Route path="/cadastro" element={<Acesso modo="cadastro" />} />

      {/* Páginas só para agentes logados (com a barra de navegação) */}
      <Route element={<LayoutLogado />}>
        <Route path="/home" element={<ArquivosHartmann />} />
        <Route path="/chat" element={<ChatPage />} />
      </Route>
    </Routes>
  )
}

export default App
