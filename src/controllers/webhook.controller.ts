import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

// Cria pasta para armazenar os arquivos JSON se não existir
const dataDir = path.join(__dirname, '..', '..', 'webhook-data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const API_KEY = 'finacap2025';
const BTG_OPERATIONS_ENDPOINT = 'https://api.btgpactual.com/api-operations-search/api/v1/operations-search';

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

      // Dados formatados com metadata
      const dataWithMetadata = {
        timestamp: new Date(),
        endpoint: BTG_OPERATIONS_ENDPOINT,
        data: webhookData,
        metadata: {
          accountNumber: webhookData.response.accountNumber || 'N/A',
          fileSize: webhookData.response.fileSize,
          period: webhookData.response.startDate && webhookData.response.endDate 
            ? `${webhookData.response.startDate} até ${webhookData.response.endDate}`
            : 'N/A',
          downloadUrl: webhookData.response.url,
          lastModified: webhookData.response.lastModified || 'N/A'
        }
      };

      // Cria subdiretório para operações
      const operationsDir = path.join(dataDir, 'operations');
      if (!fs.existsSync(operationsDir)) {
        fs.mkdirSync(operationsDir, { recursive: true });
      }

      // Salva em arquivo JSON com nome mais descritivo
      const fileName = `operations-${
        webhookData.response.accountNumber || 'unknown'
      }-${Date.now()}.json`;
      const filePath = path.join(operationsDir, fileName);
      
      fs.writeFileSync(
        filePath,
        JSON.stringify(dataWithMetadata, null, 2)
      );

      console.log('Dados salvos em:', filePath);
      console.log('Endpoint:', BTG_OPERATIONS_ENDPOINT);
      console.log('URL do arquivo:', webhookData.response.url);

      return res.status(200).json({
        message: 'Operações recebidas com sucesso',
        fileName,
        metadata: dataWithMetadata.metadata
      });
    } catch (error) {
      console.error('Erro ao processar operações:', error);
      return res.status(500).json({
        message: 'Erro ao processar operações'
      });
    }
  }

  // Método auxiliar para listar todas as operações recebidas
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

      const operationsDir = path.join(dataDir, 'operations');
      if (!fs.existsSync(operationsDir)) {
        return res.status(200).json({
          operations: []
        });
      }

      const files = fs.readdirSync(operationsDir);
      const operations = files.map(file => {
        const content = fs.readFileSync(path.join(operationsDir, file), 'utf-8');
        return {
          fileName: file,
          data: JSON.parse(content)
        };
      });

      return res.status(200).json({
        endpoint: BTG_OPERATIONS_ENDPOINT,
        operations
      });
    } catch (error) {
      console.error('Erro ao listar operações:', error);
      return res.status(500).json({
        message: 'Erro ao listar operações'
      });
    }
  }
} 