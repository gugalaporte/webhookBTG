import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class WebhookController {
  async handleWebhook(req: Request, res: Response) {
    try {
      const webhookData = req.body;
      
      // Salva os dados recebidos no banco
      const savedData = await prisma.webhookData.create({
        data: {
          payload: webhookData,
          receivedAt: new Date()
        }
      });

      console.log('Dados da webhook recebidos:', webhookData);
      
      return res.status(200).json({
        message: 'Webhook recebida com sucesso',
        id: savedData.id
      });
    } catch (error) {
      console.error('Erro ao processar webhook:', error);
      return res.status(500).json({
        message: 'Erro ao processar webhook'
      });
    }
  }
} 