import { Router } from 'express';
import { WebhookController } from '../controllers/webhook.controller';

const webhookRoutes = Router();
const webhookController = new WebhookController();

// Rota para receber os dados da webhook do BTG
webhookRoutes.post('/btg', webhookController.handleWebhook);

// Rota para listar todos os webhooks recebidos
webhookRoutes.get('/list', webhookController.listWebhookFiles);

export { webhookRoutes }; 