// server.js
import 'dotenv/config'
import express from 'express';
import { conectarBanco } from './config/database.js';
import agentesRoutes from './routes/agentes.routes.js';
import { logger } from './middleware/logger.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';

// Importando o módulo http e socket.io
import { createServer } from 'http';
import { Server } from 'socket.io';
import { registrarChat } from './sockets/chat.js';

await conectarBanco()

const app = express();
const PORT = 3000;

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Canais, mensagens e dados do chat (ver sockets/chat.js)
await registrarChat(io);


app.use(logger);
app.use(express.json());


// tudo que começar com /agentes vai para agentesRoutes
app.use('/agentes', agentesRoutes);

// notFound e errorHandler precisam vir DEPOIS das rotas
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Servidor em http://localhost:${PORT}`);
});

server.listen(8080, () => {
  console.log(`Servidor em http://localhost:8080`);
});