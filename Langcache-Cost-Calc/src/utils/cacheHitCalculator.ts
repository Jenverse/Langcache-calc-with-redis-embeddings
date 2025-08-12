import cosineSimilarity from 'compute-cosine-similarity';

// Environment variables for langcache embeddings API
const LANGCACHE_API_URL = import.meta.env.VITE_LANGCACHE_API_URL || 'http://localhost:11434';
const LANGCACHE_API_KEY = import.meta.env.VITE_LANGCACHE_API_KEY;

console.log('Environment variables loaded:', {
  langcacheApiUrl: LANGCACHE_API_URL,
  hasLangcacheApiKey: !!LANGCACHE_API_KEY
});

export interface EmbeddingModel {
  name: string;
  dimensions: number;
  similarityThreshold: number;
  apiKey?: string;
}

export interface QueryMatch {
  originalQuery: string;
  matchedQuery: string;
  similarity: number;
}

export interface CacheHitCalculatorResult {
  hitRate: number;
  queryCount: number;
  potentialHits: number;
  matchedPairs: QueryMatch[];
}

export const EMBEDDING_MODELS: EmbeddingModel[] = [
  {
    name: "Redis: langcache-embed-v1",
    dimensions: 384,
    similarityThreshold: 0.82
  }
];

// Function to get embeddings from langcache embeddings API
async function getLangcacheEmbedding(text: string) {
  const apiUrl = `${LANGCACHE_API_URL}/v1/embeddings`;

  console.log('🔍 Langcache API Call Details:', {
    apiUrl,
    textLength: text.length,
    hasApiKey: !!LANGCACHE_API_KEY
  });

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    // Add API key if available
    if (LANGCACHE_API_KEY) {
      headers['Authorization'] = `Bearer ${LANGCACHE_API_KEY}`;
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        input: text
      })
    });

    const responseText = await response.text();
    console.log('📡 Langcache API Response:', {
      status: response.status,
      statusText: response.statusText,
      body: responseText.substring(0, 200) + '...' // Log first 200 chars
    });

    if (!response.ok) {
      throw new Error(`Langcache API request failed: ${response.status} ${response.statusText} - ${responseText}`);
    }

    const data = JSON.parse(responseText);
    const embedding = data.data?.[0]?.embedding;

    console.log('✅ Langcache Embedding received:', {
      length: embedding?.length,
      sample: embedding?.slice(0, 3)
    });

    return embedding;
  } catch (error) {
    console.error('❌ Langcache API Error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      fullError: error
    });
    throw error;
  }
}

// Simplified getEmbedding function for langcache only
async function getEmbedding(text: string, model: EmbeddingModel) {
  return getLangcacheEmbedding(text);
}

export async function calculateCacheHitRate(
  queries: string[],
  model: EmbeddingModel,
  similarityThreshold: number
): Promise<CacheHitCalculatorResult> {
  console.log('📊 Starting calculation with:', {
    queryCount: queries.length,
    model: model.name,
    threshold: similarityThreshold
  });

  // Get embeddings from langcache API - no fallback, fail if API fails
  const embeddings = await Promise.all(
    queries.map(query => getEmbedding(query, model))
  );

  console.log('✅ Successfully got embeddings for all queries:', {
    count: embeddings.length,
    sampleDimensions: embeddings[0]?.length
  });

  // Count how many queries would hit the cache
  let totalHits = 0;
  const matchedPairs: QueryMatch[] = [];

  // For each query, check if it's similar to any previous query
  for (let i = 0; i < embeddings.length; i++) {
    let isHit = false;
    for (let j = 0; j < i; j++) {
      const similarity = cosineSimilarity(embeddings[i], embeddings[j]);
      if (similarity !== null && similarity >= similarityThreshold) {
        isHit = true;
        matchedPairs.push({
          originalQuery: queries[j],
          matchedQuery: queries[i],
          similarity: similarity
        });
        break;
      }
    }
    if (isHit) {
      totalHits++;
    }
  }

  // Sort matched pairs by similarity score and take top 25
  const topMatchedPairs = matchedPairs
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 25);

  const hitRate = (totalHits / queries.length) * 100;

  console.log('📈 Final results:', {
    hitRate: hitRate.toFixed(2) + '%',
    totalHits,
    queryCount: queries.length,
    matchedPairsCount: matchedPairs.length
  });

  return {
    hitRate,
    queryCount: queries.length,
    potentialHits: totalHits,
    matchedPairs: topMatchedPairs
  };
}
