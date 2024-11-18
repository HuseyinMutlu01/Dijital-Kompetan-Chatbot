import { findClosestMatch } from './stringSimilarity';
import { findCompaniesByDocument, findDocumentInCompanies } from './searchUtils';
import { ConfirmationState } from '../types';

export function handleUserInput(
  input: string,
  awaitingConfirmation: ConfirmationState,
  insuranceData: Record<string, string[]>
) {
  const lowercaseInput = input.toLowerCase().trim();
  
  // Handle basic greetings
  if (isGreeting(lowercaseInput)) {
    return {
      response: 'Merhaba! Size nasıl yardımcı olabilirim? İstediğiniz kurumu veya evrakı sorabilirsiniz. Örneğin:\n• Garanti Bankası için gerekli evraklar\n• İbraname isteyen kurumlar\n• Hasta payı faturası gereken yerler',
      newConfirmationState: null
    };
  }

  if (isFarewell(lowercaseInput)) {
    return {
      response: 'Görüşmek üzere! Başka bir sorunuz olursa yardımcı olmaktan memnuniyet duyarım.',
      newConfirmationState: null
    };
  }

  // Handle confirmation responses
  if (awaitingConfirmation) {
    return handleConfirmation(lowercaseInput, awaitingConfirmation, insuranceData);
  }

  // Check for document search patterns
  const documentSearchResult = handleDocumentSearch(lowercaseInput, insuranceData);
  if (documentSearchResult) {
    return documentSearchResult;
  }

  // Search for company
  const { exactMatch, suggestedMatch } = findCompanyMatch(lowercaseInput, insuranceData);

  if (exactMatch) {
    const documents = insuranceData[exactMatch];
    return {
      response: `${exactMatch} için gereken evraklar:\n\n${documents.map(doc => `• ${doc}`).join('\n')}`,
      newConfirmationState: null
    };
  }

  if (suggestedMatch) {
    return {
      response: `"${suggestedMatch}" kurumunu mu aramak istediniz? Lütfen "evet" veya "hayır" yazarak cevaplayınız.`,
      newConfirmationState: {
        suggestedCompany: suggestedMatch,
        originalInput: input
      }
    };
  }

  // If no specific match found, provide helpful response
  return {
    response: 'Tam olarak ne aradığınızı anlayamadım. Şunları deneyebilirsiniz:\n\n• Kurum adı yazarak (örn: "Garanti Bankası")\n• Belge adı yazarak (örn: "İbraname isteyen kurumlar")\n• Soru sorarak (örn: "Hangi kurumlar hasta payı faturası istiyor?")',
    newConfirmationState: null
  };
}

function isGreeting(input: string): boolean {
  const greetings = ['merhaba', 'selam', 'günaydın', 'iyi günler', 'iyi akşamlar', 'hey', 'hi', 'hello'];
  return greetings.some(greeting => input.includes(greeting));
}

function isFarewell(input: string): boolean {
  const farewells = ['görüşürüz', 'hoşçakal', 'bye', 'güle güle', 'iyi günler', 'iyi akşamlar'];
  return farewells.some(farewell => input.includes(farewell));
}

function handleConfirmation(
  input: string,
  awaitingConfirmation: ConfirmationState,
  insuranceData: Record<string, string[]>
) {
  if (input === 'evet' || input === 'e') {
    if (awaitingConfirmation?.suggestedCompany && insuranceData[awaitingConfirmation.suggestedCompany]) {
      const documents = insuranceData[awaitingConfirmation.suggestedCompany];
      return {
        response: `${awaitingConfirmation.suggestedCompany} için gereken evraklar:\n\n${documents.map(doc => `• ${doc}`).join('\n')}`,
        newConfirmationState: null
      };
    }
  }

  return {
    response: 'Anlıyorum. Başka nasıl yardımcı olabilirim? İsterseniz:\n• Başka bir kurum adı yazabilirsiniz\n• Belirli bir evrakı sorgulayabilirsiniz\n• "yardım" yazarak kullanım bilgisi alabilirsiniz',
    newConfirmationState: null
  };
}

function handleDocumentSearch(input: string, insuranceData: Record<string, string[]>) {
  const commonDocuments = [
    { name: 'ibraname', variations: ['ibraname', 'ibra'] },
    { name: 'kurum faturası', variations: ['kurum faturası', 'fatura'] },
    { name: 'hasta payı faturası', variations: ['hasta payı', 'hasta faturası'] },
    { name: 'muayene formu', variations: ['muayene formu', 'muayene'] },
    { name: 'kimlik', variations: ['kimlik', 'nüfus'] },
    { name: 'tetkik sonuçları', variations: ['tetkik', 'sonuç'] }
  ];

  // Check for document search patterns
  const searchPatterns = [
    { regex: /(hangi|kim|ne|kaç).*(isti?yor|gerek(li|iyor)|lazım)/, type: 'question' },
    { regex: /(.*)(isteyen|gereken|arayan)(.*)/, type: 'statement' },
    { regex: /^([a-zA-ZğüşıöçĞÜŞİÖÇ\s]+)$/, type: 'direct' }
  ];

  for (const pattern of searchPatterns) {
    if (pattern.regex.test(input)) {
      // Find the relevant document from common documents
      const matchedDoc = commonDocuments.find(doc => 
        doc.variations.some(variation => input.includes(variation))
      );

      if (matchedDoc) {
        const companies = findCompaniesByDocument(matchedDoc.name, insuranceData);
        if (companies.length > 0) {
          return {
            response: `${matchedDoc.name.charAt(0).toUpperCase() + matchedDoc.name.slice(1)} isteyen kurumlar:`,
            newConfirmationState: null,
            clickableCompanies: companies
          };
        }
      }
    }
  }

  // Direct document search
  const documentResult = findDocumentInCompanies(input, insuranceData);
  if (documentResult.companies.length > 0) {
    return {
      response: `"${documentResult.document}" isteyen kurumlar:`,
      newConfirmationState: null,
      clickableCompanies: documentResult.companies
    };
  }

  return null;
}

function findCompanyMatch(input: string, insuranceData: Record<string, string[]>) {
  const exactMatch = Object.keys(insuranceData).find(company => {
    const normalizedCompany = company.toLowerCase().replace(/\s*\(\d+\)\s*$/, '').trim();
    const normalizedInput = input.trim();
    return company.toLowerCase() === input || normalizedCompany === normalizedInput;
  });

  const suggestedMatch = !exactMatch ? findClosestMatch(input, Object.keys(insuranceData)) : null;

  return { exactMatch, suggestedMatch };
}