interface CompanyProfile {
  symbol: string;
  companyName: string;
  industry: string;
  sector: string;
  description: string;
  ceo: string;
  website: string;
  fullTimeEmployees: string;
  marketCap: number;
  price: number;
  beta: number;
  volAvg: number;
  lastDiv: number;
}

function isValidCompanyProfile(data: any): data is CompanyProfile {
  if (!data || typeof data !== 'object') {
    console.error("[CompanyProfile] Invalid data type:", typeof data);
    return false;
  }

  const requiredFields = [
    ['symbol', 'string'],
    ['companyName', 'string'],
    ['industry', 'string'],
    ['sector', 'string'],
    ['description', 'string'],
    ['ceo', 'string'],
    ['website', 'string'],
    ['fullTimeEmployees', 'string'],
    ['marketCap', 'number'],
    ['price', 'number'],
    ['beta', 'number'],
    ['volAvg', 'number'],
    ['lastDiv', 'number'],
  ] as const;

  for (const [field, type] of requiredFields) {
    if (!(field in data)) {
      console.error(`[CompanyProfile] Missing required field: ${field}`);
      return false;
    }

    if (type === 'number') {
      const value = data[field];
      if (typeof value !== 'number' || isNaN(value)) {
        console.error(`[CompanyProfile] Invalid numeric field: ${field}`, value);
        return false;
      }
    } else if (type === 'string') {
      if (typeof data[field] !== 'string') {
        console.error(`[CompanyProfile] Invalid string field: ${field}`, data[field]);
        return false;
      }
    }
  }

  return true;
} 