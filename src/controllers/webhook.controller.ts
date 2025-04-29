import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

// Cria pasta para armazenar os arquivos JSON se não existir
const dataDir = path.join(__dirname, '..', '..', 'webhook-data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const API_KEY = 'finacap2025';

export class WebhookController {
  async handleWebhook(req: Request, res: Response) {
    try {
      // Validação da API Key
      const apiKey = req.headers['x-api-key'];
      if (!apiKey || apiKey !== API_KEY) {
        console.error('API Key inválida ou não fornecida');
        return res.status(401).json({
          message: 'API Key inválida ou não fornecida'
        });
      }

      const webhookData = req.body;

      // Validação básica dos dados
      if (!webhookData || Object.keys(webhookData).length === 0) {
        console.error('Dados da webhook vazios ou inválidos');
        return res.status(400).json({
          message: 'Dados inválidos'
        });
      }

      // Dados formatados com timestamp
      const dataWithMetadata = {
        timestamp: new Date(),
        data: webhookData
      };

      // Salva em arquivo JSON
      const fileName = `webhook-${Date.now()}.json`;
      const filePath = path.join(dataDir, fileName);
      
      fs.writeFileSync(
        filePath,
        JSON.stringify(dataWithMetadata, null, 2)
      );

      console.log('Dados salvos em:', filePath);

      return res.status(200).json({
        message: 'Webhook recebida com sucesso',
        fileName
      });
    } catch (error) {
      console.error('Erro ao processar webhook:', error);
      return res.status(500).json({
        message: 'Erro ao processar webhook'
      });
    }
  }

  // Método auxiliar para listar todos os arquivos de webhook
  async listWebhookFiles(req: Request, res: Response) {
    try {
      // Validação da API Key também para listagem
      const apiKey = req.headers['x-api-key'];
      if (!apiKey || apiKey !== API_KEY) {
        console.error('API Key inválida ou não fornecida');
        return res.status(401).json({
          message: 'API Key inválida ou não fornecida'
        });
      }

      const files = fs.readdirSync(dataDir);
      const webhooks = files.map(file => {
        const content = fs.readFileSync(path.join(dataDir, file), 'utf-8');
        return {
          fileName: file,
          data: JSON.parse(content)
        };
      });

      return res.status(200).json(webhooks);
    } catch (error) {
      console.error('Erro ao listar webhooks:', error);
      return res.status(500).json({
        message: 'Erro ao listar webhooks'
      });
    }
  }
} 