import { FurnitureName, SimilarityCheckResponse, SimilarityMatch, SimilarityRisk, MatchType } from '../types';

/**
 * Normalizes text for comparison: lowercases, strips accents, removes non-alphanumeric chars
 */
export function normalizeName(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics / accents
    .replace(/[^a-z0-9]/g, '') // keep only letters and numbers
    .trim();
}

/**
 * Phonetic phonetic transformation simplified for furniture brand names
 */
export function getPhoneticKey(str: string): string {
  let s = normalizeName(str);
  if (!s) return '';
  
  // Replace sound-alikes
  s = s.replace(/ph/g, 'f')
       .replace(/ch/g, 'x')
       .replace(/ll/g, 'y')
       .replace(/ck/g, 'k')
       .replace(/q/g, 'k')
       .replace(/c(?=[eiy])/g, 's')
       .replace(/c/g, 'k')
       .replace(/z/g, 's')
       .replace(/b/g, 'v')
       .replace(/w/g, 'v')
       .replace(/(.)\1+/g, '$1'); // collapse duplicate letters
       
  return s;
}

/**
 * Levenshtein distance calculation
 */
export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * String similarity ratio between 0 and 100
 */
export function calculateSimilarityPercentage(str1: string, str2: string): number {
  const norm1 = normalizeName(str1);
  const norm2 = normalizeName(str2);

  if (norm1 === norm2) return 100;
  if (!norm1 || !norm2) return 0;

  const maxLen = Math.max(norm1.length, norm2.length);
  if (maxLen === 0) return 100;

  const dist = levenshteinDistance(norm1, norm2);
  const stringSim = Math.max(0, (1 - dist / maxLen) * 100);

  // Check phonetic similarity
  const phone1 = getPhoneticKey(str1);
  const phone2 = getPhoneticKey(str2);
  
  let phoneticSim = 0;
  if (phone1 === phone2 && phone1.length > 2) {
    phoneticSim = 90;
  } else if (phone1 && phone2) {
    const pMaxLen = Math.max(phone1.length, phone2.length);
    const pDist = levenshteinDistance(phone1, phone2);
    phoneticSim = Math.max(0, (1 - pDist / pMaxLen) * 85);
  }

  return Math.round(Math.max(stringSim, phoneticSim));
}

/**
 * Real-time comprehensive duplicate & similarity check against Master DB
 */
export function checkNameSimilarity(
  candidateName: string,
  existingNames: FurnitureName[],
  categoryFilter?: string
): SimilarityCheckResponse {
  const queryNorm = normalizeName(candidateName);
  
  if (!queryNorm || queryNorm.length < 2) {
    return {
      query: candidateName,
      risk: 'SAFE',
      riskScore: 0,
      matches: [],
      isAvailable: true,
      recommendation: 'Escribe un nombre de al menos 2 caracteres para verificar.'
    };
  }

  const matches: SimilarityMatch[] = [];

  for (const existing of existingNames) {
    const targetNorm = normalizeName(existing.name);
    if (!targetNorm) continue;

    let simPct = calculateSimilarityPercentage(candidateName, existing.name);
    let matchType: MatchType = 'FUZZY';
    let reason = '';

    // Check exact match
    if (queryNorm === targetNorm) {
      simPct = 100;
      matchType = 'EXACT';
      reason = `Coincidencia exacta con un nombre registrado en el catálogo (${existing.category}).`;
    }
    // Substring match (e.g., "Velvet" inside "Velveto" or "Lumina" inside "Lumina Table")
    else if (targetNorm.includes(queryNorm) || queryNorm.includes(targetNorm)) {
      if (Math.abs(queryNorm.length - targetNorm.length) <= 3) {
        simPct = Math.max(simPct, 85);
        matchType = 'SUBSTRING';
        reason = `Subcadena directa con alta similitud con "${existing.name}".`;
      }
    }
    // Phonetic match check
    else if (getPhoneticKey(candidateName) === getPhoneticKey(existing.name) && queryNorm.length >= 3) {
      simPct = Math.max(simPct, 80);
      matchType = 'PHONETIC';
      reason = `Similitud fonética muy elevada al pronunciarse ("${candidateName}" vs "${existing.name}").`;
    }

    // Category boost
    if (categoryFilter && existing.category === categoryFilter && simPct >= 50) {
      simPct = Math.min(100, simPct + 10);
      if (matchType !== 'EXACT') {
        reason += ` Además, pertenecen a la misma categoría (${categoryFilter}).`;
      }
    }

    if (simPct >= 35) {
      matches.push({
        targetName: existing,
        similarityPercentage: Math.round(simPct),
        matchType,
        reason: reason || `Similitud tipográfica/fonética del ${Math.round(simPct)}%.`
      });
    }
  }

  // Sort matches by highest similarity percentage
  matches.sort((a, b) => b.similarityPercentage - a.similarityPercentage);

  const highestScore = matches.length > 0 ? matches[0].similarityPercentage : 0;

  let risk: SimilarityRisk = 'SAFE';
  let isAvailable = true;
  let recommendation = 'Nombre único y disponible. Sin colisiones registradas en la base maestra.';

  if (highestScore >= 95) {
    risk = 'CRITICAL';
    isAvailable = false;
    recommendation = `CRÍTICO: El nombre "${candidateName}" ya existe o es indistinguible de un registro activo. Debe elegirse otra opción.`;
  } else if (highestScore >= 75) {
    risk = 'HIGH';
    isAvailable = false;
    recommendation = `ALTO RIESGO: Coincidencia muy elevada con "${matches[0]?.targetName.name}". Se recomienda modificar ortografía o prefijos.`;
  } else if (highestScore >= 50) {
    risk = 'MEDIUM';
    isAvailable = true;
    recommendation = `RIESGO MODERADO: Hay similitud notable con "${matches[0]?.targetName.name}". Se sugiere revisar antes de registrar.`;
  } else if (highestScore >= 35) {
    risk = 'LOW';
    isAvailable = true;
    recommendation = `BAJO RIESGO: Ligeras semejanzas halladas, pero es suficientemente diferenciable.`;
  }

  return {
    query: candidateName,
    risk,
    riskScore: highestScore,
    matches: matches.slice(0, 5), // Top 5 closest matches
    isAvailable,
    recommendation
  };
}
