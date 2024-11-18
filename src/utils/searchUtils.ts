export function findCompaniesByDocument(searchDoc: string, insuranceData: Record<string, string[]>): string[] {
  const normalizedSearch = searchDoc.toLowerCase().trim();
  
  return Object.entries(insuranceData)
    .filter(([_, documents]) => 
      documents.some(doc => doc.toLowerCase().includes(normalizedSearch))
    )
    .map(([company]) => company);
}

export function findDocumentInCompanies(input: string, insuranceData: Record<string, string[]>) {
  const normalizedInput = input.toLowerCase().trim();
  let matchedDocument = '';
  let companies: string[] = [];

  // First, try to find an exact document match
  for (const [company, documents] of Object.entries(insuranceData)) {
    for (const doc of documents) {
      if (doc.toLowerCase().includes(normalizedInput)) {
        matchedDocument = doc;
        companies.push(company);
      }
    }
  }

  // If no exact match found, try partial matches
  if (companies.length === 0) {
    const words = normalizedInput.split(/\s+/);
    for (const [company, documents] of Object.entries(insuranceData)) {
      for (const doc of documents) {
        const docLower = doc.toLowerCase();
        if (words.some(word => word.length > 2 && docLower.includes(word))) {
          matchedDocument = doc;
          companies.push(company);
        }
      }
    }
  }

  return {
    document: matchedDocument || input,
    companies: [...new Set(companies)]
  };
}