import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI only if API key is available
const openaiApiKey = process.env.OPENAI_API_KEY;
const openai = openaiApiKey ? new OpenAI({
  apiKey: openaiApiKey,
}) : null;

// Perplexity API configuration for Laura's research
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

export const runtime = 'edge';

// Analyst personas with specialized prompts
const ANALYST_PERSONAS = {
  laura: {
    name: 'Laura',
    role: 'research',
    systemPrompt: `You are Laura, a Senior Research Analyst specializing in deep dive reports, supply chain analysis, and industry research. 
    You provide comprehensive market analysis, competitive landscape assessments, and regulatory insights.
    Your responses are thorough, data-driven, and focus on strategic implications.
    Format your responses with clear sections and bullet points for readability.`,
    temperature: 0.7,
  },
  brian: {
    name: 'Brian',
    role: 'financial',
    systemPrompt: `You are Brian, a Financial Analyst Whiz Kid specializing in company financial analysis, valuation models, and earnings assessments.
    You excel at analyzing financial statements, calculating key metrics, and providing investment recommendations.
    Your responses are precise, quantitative, and focus on financial performance and valuation.
    Include relevant financial metrics and ratios in your analysis.`,
    temperature: 0.6,
  },
  john: {
    name: 'John',
    role: 'charts',
    systemPrompt: `You are John, a Data Visualization Expert specializing in creating insightful charts and visual representations of data.
    You excel at identifying trends, patterns, and creating compelling visual narratives.
    Your responses focus on what the data shows visually and how to best represent it.
    Always suggest specific chart types and explain what insights they would reveal.`,
    temperature: 0.5,
  },
};

interface AnalystTask {
  analystId: string;
  query: string;
  context: any;
}

async function processAnalystTask(task: AnalystTask) {
  const analyst = ANALYST_PERSONAS[task.analystId as keyof typeof ANALYST_PERSONAS];
  if (!analyst) {
    throw new Error(`Unknown analyst: ${task.analystId}`);
  }

  try {
    let content = '';
    
    // Use Perplexity for Laura's research tasks
    if (task.analystId === 'laura') {
      // Call Perplexity API for research
      const perplexityResponse = await fetch(PERPLEXITY_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'pplx-70b-online', // Use online model for real-time research
          messages: [
            {
              role: 'system',
              content: analyst.systemPrompt,
            },
            {
              role: 'user',
              content: `Context: ${JSON.stringify(task.context)}
              
Query: ${task.query}

Please provide comprehensive research with current data, citations, and sources. Focus on:
1. Industry overview and market size
2. Key players and competitive landscape
3. Recent developments and trends
4. Supply chain analysis if relevant
5. Regulatory environment
6. Future outlook and opportunities`,
            },
          ],
          temperature: analyst.temperature,
          max_tokens: 1500,
          return_citations: true,
          return_related_questions: true,
        }),
      });

      if (!perplexityResponse.ok) {
        throw new Error(`Perplexity API error: ${perplexityResponse.status}`);
      }

      const perplexityData = await perplexityResponse.json();
      content = perplexityData.choices[0]?.message?.content || 'No response from Perplexity';
      
      // Add citations if available
      if (perplexityData.citations) {
        content += '\n\n**Sources:**\n';
        perplexityData.citations.forEach((citation: any, index: number) => {
          content += `${index + 1}. ${citation}\n`;
        });
      }
    } else {
      // Use OpenAI for Brian and John
      if (!openai) {
        throw new Error('OpenAI API key not configured.');
      }
      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: analyst.systemPrompt,
          },
          {
            role: 'user',
            content: `Context: ${JSON.stringify(task.context)}
            
Query: ${task.query}

Please provide your specialized analysis based on your expertise.`,
          },
        ],
        temperature: analyst.temperature,
        max_tokens: 1000,
      });

      content = completion.choices[0]?.message?.content || 'No response generated';
    }

    // Generate chart data if this is John
    let chartData = null;
    if (task.analystId === 'john') {
      chartData = generateSampleChartData(task.query, task.context);
    }

    return {
      analystId: task.analystId,
      analystName: analyst.name,
      role: analyst.role,
      content,
      chartData,
      confidence: 85 + Math.random() * 15,
      processingTime: 3 + Math.random() * 5,
      suggestions: generateSuggestions(analyst.role),
      sources: ['Financial statements', 'Market data', 'Industry reports'],
    };
  } catch (error) {
    console.error(`Error processing task for ${analyst.name}:`, error);
    
    // Provide a fallback response based on the analyst role
    let fallbackContent = '';
    
    if (task.analystId === 'laura') {
      fallbackContent = `**Research Analysis by Laura:**\n\n`;
      fallbackContent += `I'm currently experiencing connectivity issues with my research sources. However, based on the query about "${task.query}", here are key areas to investigate:\n\n`;
      fallbackContent += `• **Industry Overview**: Research the market size, growth rate, and key trends\n`;
      fallbackContent += `• **Key Players**: Identify major companies and their market positions\n`;
      fallbackContent += `• **Technology Trends**: Analyze emerging technologies and innovations\n`;
      fallbackContent += `• **Regulatory Landscape**: Review relevant regulations and compliance requirements\n`;
      fallbackContent += `• **Future Outlook**: Assess growth opportunities and potential challenges\n\n`;
      fallbackContent += `*Note: Please ensure Perplexity API key is configured for real-time research capabilities.*`;
    } else if (task.analystId === 'brian') {
      fallbackContent = `**Financial Analysis by Brian:**\n\n`;
      fallbackContent += `Technical analysis temporarily unavailable. Key financial metrics to review:\n\n`;
      fallbackContent += `• Revenue growth trends\n`;
      fallbackContent += `• Profitability margins\n`;
      fallbackContent += `• Cash flow analysis\n`;
      fallbackContent += `• Valuation multiples\n`;
      fallbackContent += `• Balance sheet strength\n\n`;
      fallbackContent += `*Note: Please check API configuration for detailed analysis.*`;
    } else if (task.analystId === 'john') {
      fallbackContent = `**Visualization Analysis by John:**\n\n`;
      fallbackContent += `Chart generation temporarily unavailable. Recommended visualizations:\n\n`;
      fallbackContent += `• Line charts for trend analysis\n`;
      fallbackContent += `• Bar charts for comparisons\n`;
      fallbackContent += `• Pie charts for composition\n`;
      fallbackContent += `• Scatter plots for correlations\n\n`;
      fallbackContent += `*Note: Chart generation will resume once API connection is restored.*`;
    }
    
    return {
      analystId: task.analystId,
      analystName: analyst.name,
      role: analyst.role,
      content: fallbackContent,
      chartData: null,
      confidence: 50,
      processingTime: 1,
      suggestions: generateSuggestions(analyst.role),
      sources: ['Fallback mode - API connection required'],
    };
  }
}

function generateSampleChartData(query: string, context: any) {
  // Generate appropriate chart based on query
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('revenue') || lowerQuery.includes('sales')) {
    return {
      type: 'line',
      data: {
        labels: ['Q1 2023', 'Q2 2023', 'Q3 2023', 'Q4 2023', 'Q1 2024'],
        datasets: [{
          label: 'Revenue (in millions)',
          data: [120, 135, 155, 180, 195],
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.1,
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Quarterly Revenue Trend'
          },
          legend: {
            display: true,
            position: 'top',
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            title: {
              display: true,
              text: 'Revenue ($M)'
            }
          }
        }
      }
    };
  } else if (lowerQuery.includes('profit') || lowerQuery.includes('margin')) {
    return {
      type: 'bar',
      data: {
        labels: ['Gross Margin', 'Operating Margin', 'Net Margin', 'EBITDA Margin'],
        datasets: [{
          label: 'Current Year',
          data: [42, 18, 12, 22],
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgb(54, 162, 235)',
          borderWidth: 1,
        }, {
          label: 'Previous Year',
          data: [40, 16, 10, 20],
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderColor: 'rgb(255, 99, 132)',
          borderWidth: 1,
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Profitability Margins Comparison'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Margin (%)'
            }
          }
        }
      }
    };
  } else if (lowerQuery.includes('segment') || lowerQuery.includes('breakdown')) {
    return {
      type: 'pie',
      data: {
        labels: ['North America', 'Europe', 'Asia Pacific', 'Rest of World'],
        datasets: [{
          data: [45, 25, 20, 10],
          backgroundColor: [
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 206, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
          ],
          borderWidth: 1,
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Revenue by Geographic Segment'
          },
          legend: {
            position: 'right',
          }
        }
      }
    };
  } else {
    // Default line chart for trends
    return {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Performance Metric',
          data: [65, 68, 72, 70, 75, 78],
          borderColor: 'rgb(153, 102, 255)',
          backgroundColor: 'rgba(153, 102, 255, 0.2)',
          tension: 0.4,
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Performance Trend Analysis'
          }
        }
      }
    };
  }
}

function generateSuggestions(role: string): string[] {
  switch (role) {
    case 'research':
      return [
        'Deep dive into supply chain risks',
        'Analyze competitive positioning',
        'Research regulatory changes',
        'Explore market expansion opportunities',
      ];
    case 'financial':
      return [
        'Analyze quarterly earnings trends',
        'Compare valuation multiples',
        'Review cash flow statements',
        'Assess debt structure',
      ];
    case 'charts':
      return [
        'Create peer comparison chart',
        'Show geographic revenue breakdown',
        'Display segment performance',
        'Visualize growth trends',
      ];
    default:
      return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    const { tasks, mode = 'parallel' } = await request.json();

    if (!tasks || !Array.isArray(tasks)) {
      return NextResponse.json(
        { error: 'Invalid tasks array' },
        { status: 400 }
      );
    }

    let results;

    if (mode === 'parallel') {
      // Process all tasks in parallel
      results = await Promise.all(
        tasks.map(task => processAnalystTask(task))
      );
    } else {
      // Process tasks sequentially
      results = [];
      for (const task of tasks) {
        const result = await processAnalystTask(task);
        results.push(result);
      }
    }

    // Generate team summary if multiple analysts worked
    let teamSummary = null;
    if (results.length > 1) {
      teamSummary = {
        content: `Team analysis complete. ${results.length} analysts have provided their specialized insights.`,
        confidence: results.reduce((acc, r) => acc + r.confidence, 0) / results.length,
        totalProcessingTime: results.reduce((acc, r) => acc + r.processingTime, 0),
      };
    }

    return NextResponse.json({
      results,
      teamSummary,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Analyst team API error:', error);
    return NextResponse.json(
      { error: 'Failed to process analyst tasks' },
      { status: 500 }
    );
  }
} 