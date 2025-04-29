import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { webhookRoutes } from './routes/webhook.routes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Rotas
app.use('/webhook', webhookRoutes);

// Middleware de erro
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
}); 