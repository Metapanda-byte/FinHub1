#!/usr/bin/env node

/**
 * Script to populate the stock_peers table with competitor data for top companies
 * Usage: node scripts/populate-competitors.js [--limit=1000] [--batch-size=50]
 */

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

async function fetchCompanyList(limit = 1000, offset = 0) {
  const response = await fetch(`${BASE_URL}/api/competitors/batch?limit=${limit}&offset=${offset}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch companies: ${response.statusText}`);
  }
  return response.json();
}

async function processBatch(symbols, batchSize = 50) {
  const response = await fetch(`${BASE_URL}/api/competitors/batch`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ symbols, batchSize }),
  });
  
  if (!response.ok) {
    throw new Error(`Batch processing failed: ${response.statusText}`);
  }
  
  return response.json();
}

async function main() {
  const args = process.argv.slice(2);
  const limitArg = args.find(arg => arg.startsWith('--limit='));
  const batchSizeArg = args.find(arg => arg.startsWith('--batch-size='));
  
  const totalLimit = limitArg ? parseInt(limitArg.split('=')[1]) : 1000;
  const batchSize = batchSizeArg ? parseInt(batchSizeArg.split('=')[1]) : 50;
  const chunkSize = 500; // Process companies in chunks of 500
  
  console.log(`🚀 Starting competitor data population for top ${totalLimit} companies`);
  console.log(`📦 Batch size: ${batchSize} companies per API call`);
  console.log(`📊 Chunk size: ${chunkSize} companies per chunk`);
  
  try {
    let processedTotal = 0;
    let successfulTotal = 0;
    let failedTotal = 0;
    
    for (let offset = 0; offset < totalLimit; offset += chunkSize) {
      const currentLimit = Math.min(chunkSize, totalLimit - offset);
      
      console.log(`\n📥 Fetching companies ${offset + 1} to ${offset + currentLimit}...`);
      const { symbols } = await fetchCompanyList(currentLimit, offset);
      
      if (symbols.length === 0) {
        console.log('✅ No more companies to process');
        break;
      }
      
      console.log(`🔄 Processing ${symbols.length} companies...`);
      const result = await processBatch(symbols, batchSize);
      
      processedTotal += result.results.processed;
      successfulTotal += result.results.successful;
      failedTotal += result.results.failed;
      
      console.log(`✅ Chunk completed:`);
      console.log(`   📊 Processed: ${result.results.processed}`);
      console.log(`   ✅ Successful: ${result.results.successful}`);
      console.log(`   ❌ Failed: ${result.results.failed}`);
      
      if (result.results.errors.length > 0) {
        console.log(`   🔥 Errors (first 5):`);
        result.results.errors.slice(0, 5).forEach(error => {
          console.log(`      - ${error}`);
        });
      }
      
      // Progress update
      const progress = ((offset + symbols.length) / totalLimit * 100).toFixed(1);
      console.log(`📈 Overall progress: ${progress}% (${processedTotal}/${totalLimit})`);
      
      // Add delay between chunks to be nice to the API
      if (offset + chunkSize < totalLimit) {
        console.log('⏳ Waiting 2 seconds before next chunk...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log(`\n🎉 Population completed!`);
    console.log(`📊 Final results:`);
    console.log(`   📈 Total processed: ${processedTotal}`);
    console.log(`   ✅ Total successful: ${successfulTotal}`);
    console.log(`   ❌ Total failed: ${failedTotal}`);
    console.log(`   📈 Success rate: ${((successfulTotal / processedTotal) * 100).toFixed(1)}%`);
    
  } catch (error) {
    console.error('💥 Population failed:', error);
    process.exit(1);
  }
}

// Handle command line help
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
📚 Competitor Data Population Script

Usage: node scripts/populate-competitors.js [options]

Options:
  --limit=N          Number of companies to process (default: 1000)
  --batch-size=N     Companies per batch API call (default: 50)
  --help, -h         Show this help message

Examples:
  node scripts/populate-competitors.js --limit=10000
  node scripts/populate-competitors.js --limit=500 --batch-size=25
  
Environment:
  NEXT_PUBLIC_SITE_URL  Base URL for API calls (default: http://localhost:3000)
  `);
  process.exit(0);
}

main().catch(console.error); 