// Mock financial data for visualization

export const companyInfo = {
  name: "Apple Inc.",
  ticker: "AAPL",
  logo: "https://images.pexels.com/photos/10403355/pexels-photo-10403355.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=1",
  sector: "Technology",
  industry: "Consumer Electronics",
  description: "Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide. The company offers iPhone, a line of smartphones; Mac, a line of personal computers; iPad, a line of multi-purpose tablets; and wearables, home, and accessories comprising AirPods, Apple TV, Apple Watch, Beats products, and HomePod.",
  foundedYear: 1976,
  employees: 154000,
  headquarters: "Cupertino, California",
  website: "https://www.apple.com",
  ceo: "Tim Cook"
};

export const revenueData = [
  { year: 2019, value: 260.2 },
  { year: 2020, value: 274.5 },
  { year: 2021, value: 365.8 },
  { year: 2022, value: 394.3 },
  { year: 2023, value: 383.3 }
];

export const ebitdaData = [
  { year: 2019, value: 76.4, margin: 29.4 },
  { year: 2020, value: 81.3, margin: 29.6 },
  { year: 2021, value: 121.0, margin: 33.1 },
  { year: 2022, value: 130.5, margin: 33.1 },
  { year: 2023, value: 126.3, margin: 33.0 }
];

export const segmentData = [
  { name: "iPhone", value: 205.3 },
  { name: "Services", value: 85.2 },
  { name: "Mac", value: 29.4 },
  { name: "iPad", value: 28.3 },
  { name: "Wearables & Home", value: 35.1 }
];

export const geographyData = [
  { name: "Americas", value: 169.8 },
  { name: "Europe", value: 95.6 },
  { name: "Greater China", value: 72.6 },
  { name: "Japan", value: 23.1 },
  { name: "Rest of Asia Pacific", value: 22.2 }
];

// Deterministic mock data generation to prevent hydration mismatches
const generateDeterministicData = (length: number, basePrice: number, priceRange: number, baseVolume: number, volumeRange: number, yearOffset: number = 0) => {
  return Array.from({ length }, (_, i) => {
    // Use deterministic "random" values based on index
    const seed = i + yearOffset * 1000;
    const priceVariation = (seed * 9301 + 49297) % 65536 / 65536; // Deterministic "random"
    const volumeVariation = (seed * 1103515245 + 12345) % 65536 / 65536; // Different seed
    
    return {
      date: new Date(2023 + yearOffset, 11, i + 1).toISOString().split('T')[0],
      price: basePrice + priceVariation * priceRange,
      volume: Math.floor(baseVolume + volumeVariation * volumeRange)
    };
  });
};

export const stockData = {
  daily: generateDeterministicData(30, 175, 15, 60000000, 40000000),
  weekly: generateDeterministicData(12, 170, 20, 250000000, 100000000),
  monthly: generateDeterministicData(12, 160, 30, 700000000, 200000000),
  yearly: generateDeterministicData(5, 100, 100, 1500000000, 1000000000, 0),
  fiveYear: generateDeterministicData(5, 100, 100, 1500000000, 1000000000, 0)
};

export const shareholderData = [
  { name: "Vanguard Group", shares: 1341.6, percentage: 8.42 },
  { name: "BlackRock", shares: 1081.5, percentage: 6.79 },
  { name: "Berkshire Hathaway", shares: 782.3, percentage: 4.91 },
  { name: "State Street", shares: 622.5, percentage: 3.91 },
  { name: "Fidelity Management", shares: 441.8, percentage: 2.77 },
  { name: "Geode Capital Management", shares: 285.9, percentage: 1.79 },
  { name: "Northern Trust", shares: 197.4, percentage: 1.24 },
  { name: "T. Rowe Price", shares: 195.3, percentage: 1.23 },
  { name: "Morgan Stanley", shares: 175.2, percentage: 1.10 },
  { name: "Bank of America", shares: 165.7, percentage: 1.04 }
];

export const incomeStatementData = [
  {
    item: "Revenue",
    2019: 260174,
    2020: 274515,
    2021: 365817,
    2022: 394328,
    2023: 383291
  },
  {
    item: "Cost of Revenue",
    2019: 161782,
    2020: 169559,
    2021: 212981,
    2022: 223546,
    2023: 218606
  },
  {
    item: "Gross Profit",
    2019: 98392,
    2020: 104956,
    2021: 152836,
    2022: 170782,
    2023: 164685
  },
  {
    item: "Operating Expenses",
    2019: 34462,
    2020: 38668,
    2021: 43887,
    2022: 51345,
    2023: 54276
  },
  {
    item: "Operating Income",
    2019: 63930,
    2020: 66288,
    2021: 108949,
    2022: 119437,
    2023: 110409
  },
  {
    item: "Other Income",
    2019: 1807,
    2020: 803,
    2021: 258,
    2022: -334,
    2023: 1272
  },
  {
    item: "Income Before Tax",
    2019: 65737,
    2020: 67091,
    2021: 109207,
    2022: 119103,
    2023: 111681
  },
  {
    item: "Income Tax Expense",
    2019: 10481,
    2020: 9680,
    2021: 14527,
    2022: 19300,
    2023: 17686
  },
  {
    item: "Net Income",
    2019: 55256,
    2020: 57411,
    2021: 94680,
    2022: 99803,
    2023: 96995
  }
];

export const cashFlowData = [
  {
    item: "Net Income",
    2019: 55256,
    2020: 57411,
    2021: 94680,
    2022: 99803,
    2023: 96995
  },
  {
    item: "Depreciation & Amortization",
    2019: 12547,
    2020: 11056,
    2021: 11284,
    2022: 11104,
    2023: 11071
  },
  {
    item: "Change in Working Capital",
    2019: -1622,
    2020: 5690,
    2021: 12910,
    2022: -7157,
    2023: -3450
  },
  {
    item: "Cash from Operations",
    2019: 69391,
    2020: 80674,
    2021: 104038,
    2022: 122151,
    2023: 113754
  },
  {
    item: "Capital Expenditures",
    2019: -10495,
    2020: -7309,
    2021: -11085,
    2022: -10708,
    2023: -11284
  },
  {
    item: "Acquisitions",
    2019: -624,
    2020: -1473,
    2021: -33,
    2022: -306,
    2023: -721
  },
  {
    item: "Cash from Investing",
    2019: 45896,
    2020: -4289,
    2021: -14545,
    2022: -22354,
    2023: -8242
  },
  {
    item: "Dividends Paid",
    2019: -14129,
    2020: -14081,
    2021: -14467,
    2022: -14841,
    2023: -15091
  },
  {
    item: "Share Repurchases",
    2019: -66897,
    2020: -72358,
    2021: -85971,
    2022: -89402,
    2023: -77550
  },
  {
    item: "Cash from Financing",
    2019: -90976,
    2020: -86820,
    2021: -93353,
    2022: -110749,
    2023: -96475
  },
  {
    item: "Net Change in Cash",
    2019: 24311,
    2020: -10435,
    2021: -3860,
    2022: -10952,
    2023: 9037
  }
];

export const balanceSheetData = [
  {
    item: "Cash & Equivalents",
    2019: 48844,
    2020: 38016,
    2021: 34940,
    2022: 23646,
    2023: 29965
  },
  {
    item: "Short-term Investments",
    2019: 51713,
    2020: 52927,
    2021: 27699,
    2022: 24658,
    2023: 33513
  },
  {
    item: "Accounts Receivable",
    2019: 22926,
    2020: 16120,
    2021: 26278,
    2022: 28184,
    2023: 30533
  },
  {
    item: "Inventory",
    2019: 4106,
    2020: 4061,
    2021: 6580,
    2022: 4946,
    2023: 7729
  },
  {
    item: "Total Current Assets",
    2019: 162819,
    2020: 143713,
    2021: 134836,
    2022: 118309,
    2023: 139338
  },
  {
    item: "Property, Plant & Equipment",
    2019: 37378,
    2020: 36766,
    2021: 39440,
    2022: 42117,
    2023: 43715
  },
  {
    item: "Long-term Investments",
    2019: 105341,
    2020: 100887,
    2021: 127877,
    2022: 120805,
    2023: 103267
  },
  {
    item: "Total Assets",
    2019: 338516,
    2020: 323888,
    2021: 351002,
    2022: 352755,
    2023: 352583
  },
  {
    item: "Accounts Payable",
    2019: 46236,
    2020: 42296,
    2021: 54763,
    2022: 64115,
    2023: 62611
  },
  {
    item: "Short-term Debt",
    2019: 16240,
    2020: 13769,
    2021: 9613,
    2022: 11128,
    2023: 13209
  },
  {
    item: "Total Current Liabilities",
    2019: 105718,
    2020: 105392,
    2021: 125481,
    2022: 153982,
    2023: 147554
  },
  {
    item: "Long-term Debt",
    2019: 91807,
    2020: 98667,
    2021: 109106,
    2022: 110109,
    2023: 95281
  },
  {
    item: "Total Liabilities",
    2019: 248028,
    2020: 258549,
    2021: 287912,
    2022: 302083,
    2023: 290267
  },
  {
    item: "Total Shareholders' Equity",
    2019: 90488,
    2020: 65339,
    2021: 63090,
    2022: 50672,
    2023: 62316
  }
];

export const peerCompanies = [
  { id: "AAPL", name: "Apple Inc." },
  { id: "MSFT", name: "Microsoft Corporation" },
  { id: "GOOGL", name: "Alphabet Inc." },
  { id: "AMZN", name: "Amazon.com, Inc." },
  { id: "META", name: "Meta Platforms, Inc." },
  { id: "NVDA", name: "NVIDIA Corporation" },
  { id: "TSLA", name: "Tesla, Inc." },
  { id: "TSM", name: "Taiwan Semiconductor Manufacturing" },
  { id: "AVGO", name: "Broadcom Inc." },
  { id: "ORCL", name: "Oracle Corporation" }
];

export const peerValuationData = [
  {
    ticker: "AAPL",
    company: "Apple Inc.",
    marketCap: 2960.5,
    evToEbitda: 21.8,
    peRatio: 30.5,
    priceToSales: 7.7,
    priceToBook: 47.5,
    dividendYield: 0.5
  },
  {
    ticker: "MSFT",
    company: "Microsoft Corporation",
    marketCap: 3012.4,
    evToEbitda: 24.2,
    peRatio: 36.2,
    priceToSales: 12.5,
    priceToBook: 13.2,
    dividendYield: 0.7
  },
  {
    ticker: "GOOGL",
    company: "Alphabet Inc.",
    marketCap: 1840.2,
    evToEbitda: 15.3,
    peRatio: 25.4,
    priceToSales: 6.1,
    priceToBook: 6.3,
    dividendYield: 0.5
  },
  {
    ticker: "AMZN",
    company: "Amazon.com, Inc.",
    marketCap: 1750.8,
    evToEbitda: 21.5,
    peRatio: 59.8,
    priceToSales: 3.1,
    priceToBook: 9.2,
    dividendYield: 0.0
  },
  {
    ticker: "META",
    company: "Meta Platforms, Inc.",
    marketCap: 1091.4,
    evToEbitda: 13.8,
    peRatio: 24.7,
    priceToSales: 7.3,
    priceToBook: 6.4,
    dividendYield: 0.4
  },
  {
    ticker: "NVDA",
    company: "NVIDIA Corporation",
    marketCap: 2207.6,
    evToEbitda: 64.3,
    peRatio: 65.1,
    priceToSales: 31.5,
    priceToBook: 45.8,
    dividendYield: 0.03
  }
];

export const peerPerformanceData = [
  {
    ticker: "AAPL",
    company: "Apple Inc.",
    revenueGrowth: -2.8,
    grossMargin: 43.0,
    operatingMargin: 28.8,
    netMargin: 25.3,
    roic: 56.3,
    roe: 160.6
  },
  {
    ticker: "MSFT",
    company: "Microsoft Corporation",
    revenueGrowth: 16.6,
    grossMargin: 69.5,
    operatingMargin: 43.8,
    netMargin: 35.7,
    roic: 26.4,
    roe: 38.8
  },
  {
    ticker: "GOOGL",
    company: "Alphabet Inc.",
    revenueGrowth: 13.6,
    grossMargin: 55.4,
    operatingMargin: 29.5,
    netMargin: 24.0,
    roic: 25.1,
    roe: 24.7
  },
  {
    ticker: "AMZN",
    company: "Amazon.com, Inc.",
    revenueGrowth: 13.7,
    grossMargin: 45.4,
    operatingMargin: 5.2,
    netMargin: 4.0,
    roic: 6.0,
    roe: 14.8
  },
  {
    ticker: "META",
    company: "Meta Platforms, Inc.",
    revenueGrowth: 16.1,
    grossMargin: 80.9,
    operatingMargin: 35.0,
    netMargin: 29.2,
    roic: 23.9,
    roe: 27.4
  },
  {
    ticker: "NVDA",
    company: "NVIDIA Corporation",
    revenueGrowth: 125.5,
    grossMargin: 72.7,
    operatingMargin: 57.4,
    netMargin: 48.9,
    roic: 66.3,
    roe: 87.2
  }
];

export const screeningFilters = {
  marketCap: [
    "Mega Cap (>$200B)",
    "Large Cap ($10B-$200B)",
    "Mid Cap ($2B-$10B)",
    "Small Cap ($300M-$2B)",
    "Micro Cap (<$300M)"
  ],
  sector: [
    "Technology",
    "Healthcare",
    "Financials",
    "Consumer Discretionary",
    "Communication Services",
    "Industrials",
    "Consumer Staples",
    "Energy",
    "Utilities",
    "Real Estate",
    "Materials"
  ],
  exchange: [
    "NASDAQ",
    "NYSE",
    "AMEX",
    "TSX",
    "LSE",
    "EURONEXT"
  ],
  country: [
    "United States",
    "Canada",
    "United Kingdom",
    "Germany",
    "France",
    "Japan",
    "South Korea",
    "Taiwan",
    "Netherlands",
    "Switzerland"
  ]
};

export const screeningResults = [
  {
    ticker: "AAPL",
    company: "Apple Inc.",
    sector: "Technology",
    marketCap: 2960.5,
    peRatio: 30.5,
    dividendYield: 0.5,
    revenueGrowth: -2.8,
    priceChange1Y: 38.9,
    beta: 1.25,
    eps: 6.13,
    priceToBook: 47.5,
    priceToSales: 7.7,
    roe: 160.6,
    roa: 28.4,
    grossMargin: 43.0,
    operatingMargin: 28.8,
    netMargin: 25.3,
    debtToEquity: 1.73,
    currentRatio: 0.94,
    quickRatio: 0.81
  },
  {
    ticker: "MSFT",
    company: "Microsoft Corporation",
    sector: "Technology",
    marketCap: 3012.4,
    peRatio: 36.2,
    dividendYield: 0.7,
    revenueGrowth: 16.6,
    priceChange1Y: 53.3,
    beta: 0.90,
    eps: 9.65,
    priceToBook: 13.2,
    priceToSales: 12.5,
    roe: 38.8,
    roa: 16.5,
    grossMargin: 69.5,
    operatingMargin: 43.8,
    netMargin: 35.7,
    debtToEquity: 0.47,
    currentRatio: 1.77,
    quickRatio: 1.75
  },
  {
    ticker: "GOOGL",
    company: "Alphabet Inc.",
    sector: "Communication Services",
    marketCap: 1840.2,
    peRatio: 25.4,
    dividendYield: 0.5,
    revenueGrowth: 13.6,
    priceChange1Y: 56.4,
    beta: 1.05,
    eps: 5.80,
    priceToBook: 6.3,
    priceToSales: 6.1,
    roe: 24.7,
    roa: 21.2,
    grossMargin: 55.4,
    operatingMargin: 29.5,
    netMargin: 24.0,
    debtToEquity: 0.11,
    currentRatio: 2.46,
    quickRatio: 2.42
  },
  {
    ticker: "AMZN",
    company: "Amazon.com, Inc.",
    sector: "Consumer Discretionary",
    marketCap: 1750.8,
    peRatio: 59.8,
    dividendYield: 0.0,
    revenueGrowth: 13.7,
    priceChange1Y: 77.9,
    beta: 1.15,
    eps: 2.90,
    priceToBook: 9.2,
    priceToSales: 3.1,
    roe: 14.8,
    roa: 6.0,
    grossMargin: 45.4,
    operatingMargin: 5.2,
    netMargin: 4.0,
    debtToEquity: 0.91,
    currentRatio: 1.05,
    quickRatio: 0.82
  },
  {
    ticker: "META",
    company: "Meta Platforms, Inc.",
    sector: "Communication Services",
    marketCap: 1091.4,
    peRatio: 24.7,
    dividendYield: 0.4,
    revenueGrowth: 16.1,
    priceChange1Y: 150.3,
    beta: 1.18,
    eps: 14.87,
    priceToBook: 6.4,
    priceToSales: 7.3,
    roe: 27.4,
    roa: 23.9,
    grossMargin: 80.9,
    operatingMargin: 35.0,
    netMargin: 29.2,
    debtToEquity: 0.13,
    currentRatio: 2.54,
    quickRatio: 2.51
  },
  {
    ticker: "NVDA",
    company: "NVIDIA Corporation",
    sector: "Technology",
    marketCap: 2207.6,
    peRatio: 65.1,
    dividendYield: 0.03,
    revenueGrowth: 125.5,
    priceChange1Y: 207.5,
    beta: 1.68,
    eps: 12.96,
    priceToBook: 45.8,
    priceToSales: 31.5,
    roe: 87.2,
    roa: 66.3,
    grossMargin: 72.7,
    operatingMargin: 57.4,
    netMargin: 48.9,
    debtToEquity: 0.17,
    currentRatio: 3.86,
    quickRatio: 3.40
  },
  {
    ticker: "TSLA",
    company: "Tesla, Inc.",
    sector: "Consumer Discretionary",
    marketCap: 739.3,
    peRatio: 47.5,
    dividendYield: 0.0,
    revenueGrowth: 1.8,
    priceChange1Y: 4.7,
    beta: 2.29,
    eps: 4.30,
    priceToBook: 12.8,
    priceToSales: 7.5,
    roe: 28.1,
    roa: 7.6,
    grossMargin: 19.3,
    operatingMargin: 9.6,
    netMargin: 15.0,
    debtToEquity: 0.17,
    currentRatio: 1.73,
    quickRatio: 1.31
  },
  {
    ticker: "TSM",
    company: "Taiwan Semiconductor Manufacturing",
    sector: "Technology",
    marketCap: 722.5,
    peRatio: 26.3,
    dividendYield: 1.4,
    revenueGrowth: 12.5,
    priceChange1Y: 94.2,
    beta: 1.02,
    eps: 4.85,
    priceToBook: 4.1,
    priceToSales: 9.8,
    roe: 16.8,
    roa: 12.3,
    grossMargin: 54.0,
    operatingMargin: 45.5,
    netMargin: 38.9,
    debtToEquity: 0.28,
    currentRatio: 2.35,
    quickRatio: 2.15
  },
  {
    ticker: "AVGO",
    company: "Broadcom Inc.",
    sector: "Technology",
    marketCap: 586.4,
    peRatio: 49.8,
    dividendYield: 1.5,
    revenueGrowth: 39.8,
    priceChange1Y: 134.5,
    beta: 1.88,
    eps: 26.25,
    priceToBook: 12.5,
    priceToSales: 19.2,
    roe: 28.3,
    roa: 8.7,
    grossMargin: 75.2,
    operatingMargin: 35.8,
    netMargin: 28.4,
    debtToEquity: 1.58,
    currentRatio: 1.64,
    quickRatio: 1.52
  },
  {
    ticker: "ORCL",
    company: "Oracle Corporation",
    sector: "Technology",
    marketCap: 347.5,
    peRatio: 32.4,
    dividendYield: 1.1,
    revenueGrowth: 5.4,
    priceChange1Y: 26.8,
    beta: 0.87,
    eps: 4.88,
    priceToBook: 44.2,
    priceToSales: 8.9,
    roe: 144.5,
    roa: 9.8,
    grossMargin: 70.9,
    operatingMargin: 30.1,
    netMargin: 20.1,
    debtToEquity: 13.2,
    currentRatio: 0.72,
    quickRatio: 0.72
  }
];