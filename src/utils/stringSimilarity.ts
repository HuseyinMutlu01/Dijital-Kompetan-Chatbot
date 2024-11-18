// Normalize company name by removing code and converting to lowercase
function normalizeCompanyName(name: string): string {
  return name.toLowerCase()
    .replace(/\s*\(\d+\)\s*$/, '') // Remove (XX) code from end
    .trim();
}

// Levenshtein Distance Algorithm for string similarity
export function getLevenshteinDistance(str1: string, str2: string): number {
  const track = Array(str2.length + 1).fill(null).map(() =>
    Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i += 1) {
    track[0][i] = i;
  }
  for (let j = 0; j <= str2.length; j += 1) {
    track[j][0] = j;
  }

  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1,
        track[j - 1][i] + 1,
        track[j - 1][i - 1] + indicator
      );
    }
  }

  return track[str2.length][str1.length];
}

export function findClosestMatch(input: string, companies: string[]): string | null {
  const threshold = 0.7; // Similarity threshold
  let closestMatch: string | null = null;
  let smallestDistance = Infinity;
  
  const normalizedInput = normalizeCompanyName(input);
  
  companies.forEach(company => {
    const normalizedCompany = normalizeCompanyName(company);
    const distance = getLevenshteinDistance(normalizedInput, normalizedCompany);
    const similarity = 1 - distance / Math.max(normalizedInput.length, normalizedCompany.length);
    
    if (similarity > threshold && distance < smallestDistance) {
      smallestDistance = distance;
      closestMatch = company;
    }
  });
  
  return closestMatch;
}