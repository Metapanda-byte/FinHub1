#!/usr/bin/env node

const { spawn } = require('child_process');

// Test Figma MCP connection
async function testFigmaMCP() {
  console.log('Testing Figma MCP connection...');
  
  const mcpProcess = spawn('npx', ['@sethdouglasford/mcp-figma'], {
    env: {
      ...process.env,
      FIGMA_ACCESS_TOKEN: process.env.FIGMA_ACCESS_TOKEN || 'YOUR_TOKEN_HERE'
    }
  });

  mcpProcess.stdout.on('data', (data) => {
    console.log('MCP Output:', data.toString());
  });

  mcpProcess.stderr.on('data', (data) => {
    console.error('MCP Error:', data.toString());
  });

  mcpProcess.on('close', (code) => {
    console.log(`MCP process exited with code ${code}`);
  });

  // Send a simple test message
  setTimeout(() => {
    mcpProcess.stdin.write(JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: {
          name: "test-client",
          version: "1.0.0"
        }
      }
    }) + '\n');
  }, 1000);
}

testFigmaMCP().catch(console.error); 