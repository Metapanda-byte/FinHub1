import { spawn } from 'child_process';

export interface FigmaDesignData {
  fileKey: string;
  nodeId?: string;
  designTokens?: any;
  components?: any[];
  styles?: any[];
}

export class FigmaMCPClient {
  private process: any;
  private messageId = 1;

  constructor(private accessToken: string) {}

  async initialize() {
    this.process = spawn('npx', ['@sethdouglasford/mcp-figma'], {
      env: {
        ...process.env,
        FIGMA_ACCESS_TOKEN: this.accessToken
      }
    });

    return new Promise((resolve, reject) => {
      this.process.stdout.on('data', (data: Buffer) => {
        const response = JSON.parse(data.toString());
        if (response.id === 1) {
          resolve(response);
        }
      });

      this.process.stderr.on('data', (data: Buffer) => {
        console.error('Figma MCP Error:', data.toString());
        reject(new Error(data.toString()));
      });

      // Send initialization message
      this.sendMessage({
        jsonrpc: "2.0",
        id: this.messageId++,
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          capabilities: {},
          clientInfo: {
            name: "finhub-design-client",
            version: "1.0.0"
          }
        }
      });
    });
  }

  private sendMessage(message: any) {
    if (this.process) {
      this.process.stdin.write(JSON.stringify(message) + '\n');
    }
  }

  async getDesignData(fileKey: string, nodeId?: string): Promise<FigmaDesignData> {
    return new Promise((resolve, reject) => {
      const messageId = this.messageId++;
      
      const handler = (data: Buffer) => {
        const response = JSON.parse(data.toString());
        if (response.id === messageId) {
          this.process.stdout.removeListener('data', handler);
          resolve(response.result);
        }
      };

      this.process.stdout.on('data', handler);

      this.sendMessage({
        jsonrpc: "2.0",
        id: messageId,
        method: "tools/call",
        params: {
          name: "get_figma_file",
          arguments: {
            fileKey,
            nodeId
          }
        }
      });
    });
  }

  async getDesignTokens(fileKey: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const messageId = this.messageId++;
      
      const handler = (data: Buffer) => {
        const response = JSON.parse(data.toString());
        if (response.id === messageId) {
          this.process.stdout.removeListener('data', handler);
          resolve(response.result);
        }
      };

      this.process.stdout.on('data', handler);

      this.sendMessage({
        jsonrpc: "2.0",
        id: messageId,
        method: "tools/call",
        params: {
          name: "get_design_tokens",
          arguments: {
            fileKey
          }
        }
      });
    });
  }

  async exportAssets(fileKey: string, nodeIds: string[]): Promise<any> {
    return new Promise((resolve, reject) => {
      const messageId = this.messageId++;
      
      const handler = (data: Buffer) => {
        const response = JSON.parse(data.toString());
        if (response.id === messageId) {
          this.process.stdout.removeListener('data', handler);
          resolve(response.result);
        }
      };

      this.process.stdout.on('data', handler);

      this.sendMessage({
        jsonrpc: "2.0",
        id: messageId,
        method: "tools/call",
        params: {
          name: "export_assets",
          arguments: {
            fileKey,
            nodeIds
          }
        }
      });
    });
  }

  disconnect() {
    if (this.process) {
      this.process.kill();
    }
  }
}

// Utility function to get Figma design data for FinHub components
export async function getFigmaDesignForComponent(componentName: string): Promise<any> {
  const accessToken = process.env.FIGMA_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error('FIGMA_ACCESS_TOKEN not configured');
  }

  const client = new FigmaMCPClient(accessToken);
  await client.initialize();

  try {
    // You would replace this with your actual Figma file key
    const fileKey = 'YOUR_FIGMA_FILE_KEY';
    const designData = await client.getDesignData(fileKey);
    
    // Filter for specific component
    const component = designData.components?.find((comp: any) => 
      comp.name.toLowerCase().includes(componentName.toLowerCase())
    );

    return component || designData;
  } finally {
    client.disconnect();
  }
} 