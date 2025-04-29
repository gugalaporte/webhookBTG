import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

// Cria pasta para armazenar os arquivos JSON se não existir
const dataDir = path.join(__dirname, '..', '..', 'webhook-data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const API_KEY = 'finacap2025';

// Interface para os dados do BTG
interface BTGWebhookResponse {
  errors: Array<{
    code: string | null;
    message: string | null;
  }>;
  response: {
    accountNumber?: string | null;
    fileSize: number;
    startDate?: string | null;
    endDate?: string | null;
    url: string;
    lastModified?: string;
  };
}

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

      const webhookData = req.body as BTGWebhookResponse;

      // Validação básica dos dados
      if (!webhookData || !webhookData.response || !webhookData.response.url) {
        console.error('Dados da webhook inválidos ou incompletos');
        return res.status(400).json({
          message: 'Dados inválidos ou incompletos'
        });
      }

      // Determina o tipo de webhook baseado nos dados
      const isOperationsByAccount = !!webhookData.response.accountNumber;
      const webhookType = isOperationsByAccount ? 'operations-by-account' : 'positions-by-partner';

      // Dados formatados com metadata
      const dataWithMetadata = {
        timestamp: new Date(),
        webhookType,
        data: webhookData,
        metadata: {
          accountNumber: webhookData.response.accountNumber || 'N/A',
          fileSize: webhookData.response.fileSize,
          period: webhookData.response.startDate && webhookData.response.endDate 
            ? `${webhookData.response.startDate} até ${webhookData.response.endDate}`
            : 'N/A',
          downloadUrl: webhookData.response.url
        }
      };

      // Cria subdiretório para o tipo de webhook
      const typeDir = path.join(dataDir, webhookType);
      if (!fs.existsSync(typeDir)) {
        fs.mkdirSync(typeDir, { recursive: true });
      }

      // Salva em arquivo JSON com nome mais descritivo
      const fileName = `${webhookType}-${
        webhookData.response.accountNumber || 'partner'
      }-${Date.now()}.json`;
      const filePath = path.join(typeDir, fileName);
      
      fs.writeFileSync(
        filePath,
        JSON.stringify(dataWithMetadata, null, 2)
      );

      console.log('Dados salvos em:', filePath);
      console.log('Tipo de webhook:', webhookType);
      console.log('URL do arquivo:', webhookData.response.url);

      return res.status(200).json({
        message: 'Webhook processada com sucesso',
        fileName,
        webhookType,
        metadata: dataWithMetadata.metadata
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
      // Validação da API Key
      const apiKey = req.headers['x-api-key'];
      if (!apiKey || apiKey !== API_KEY) {
        console.error('API Key inválida ou não fornecida');
        return res.status(401).json({
          message: 'API Key inválida ou não fornecida'
        });
      }

      // Lista webhooks por tipo
      const webhookTypes = ['operations-by-account', 'positions-by-partner'];
      const allWebhooks: any = {};

      for (const type of webhookTypes) {
        const typeDir = path.join(dataDir, type);
        if (fs.existsSync(typeDir)) {
          const files = fs.readdirSync(typeDir);
          allWebhooks[type] = files.map(file => {
            const content = fs.readFileSync(path.join(typeDir, file), 'utf-8');
            return {
              fileName: file,
              data: JSON.parse(content)
            };
          });
        } else {
          allWebhooks[type] = [];
        }
      }

      return res.status(200).json(allWebhooks);
    } catch (error) {
      console.error('Erro ao listar webhooks:', error);
      return res.status(500).json({
        message: 'Erro ao listar webhooks'
      });
    }
  }
} 