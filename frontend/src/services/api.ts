import { Property, ValuationRequestPayload, ValuationResult, MarketAnalytics } from '../types';
import { FALLBACK_PROPERTIES } from '../data/fallbackProperties';

const BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || '';

export async function getProperties(params?: {
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  bathrooms?: number;
  furnishing?: string;
  prefarea?: string;
  limit?: number;
  offset?: number;
}): Promise<{ total: number; properties: Property[] }> {
  const query = new URLSearchParams();
  if (params?.min_price) query.set('min_price', params.min_price.toString());
  if (params?.max_price) query.set('max_price', params.max_price.toString());
  if (params?.bedrooms) query.set('bedrooms', params.bedrooms.toString());
  if (params?.bathrooms) query.set('bathrooms', params.bathrooms.toString());
  if (params?.furnishing && params.furnishing !== 'all') query.set('furnishing', params.furnishing);
  if (params?.prefarea && params.prefarea !== 'all') query.set('prefarea', params.prefarea);
  if (params?.limit) query.set('limit', params.limit.toString());
  if (params?.offset) query.set('offset', params.offset.toString());

  try {
    const res = await fetch(`${BASE_URL}/api/properties?${query.toString()}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('API fetch failed, falling back to verified dataset archive:', err);
  }

  // Resilient fallback filtering directly on dataset records
  let filtered = [...FALLBACK_PROPERTIES];
  if (params?.min_price) filtered = filtered.filter((p) => p.price >= (params.min_price || 0));
  if (params?.max_price) filtered = filtered.filter((p) => p.price <= (params.max_price || Infinity));
  if (params?.bedrooms) filtered = filtered.filter((p) => p.bedrooms >= (params.bedrooms || 0));
  if (params?.bathrooms) filtered = filtered.filter((p) => p.bathrooms >= (params.bathrooms || 0));
  if (params?.furnishing && params.furnishing !== 'all') {
    filtered = filtered.filter((p) => p.furnishingstatus === params.furnishing);
  }
  if (params?.prefarea && params.prefarea !== 'all') {
    filtered = filtered.filter((p) => p.prefarea === params.prefarea);
  }

  const offset = params?.offset || 0;
  const limit = params?.limit || 24;
  return {
    total: filtered.length,
    properties: filtered.slice(offset, offset + limit),
  };
}

export async function getPropertyDetail(id: number): Promise<{ property: Property; comparables: Property[] }> {
  try {
    const res = await fetch(`${BASE_URL}/api/properties/${id}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn(`API detail fetch for #${id} failed, using local dataset record:`, err);
  }

  const prop = FALLBACK_PROPERTIES.find((p) => p.id === id) || FALLBACK_PROPERTIES[0];
  const comparables = FALLBACK_PROPERTIES
    .filter((p) => p.id !== prop.id && Math.abs(p.price - prop.price) < 2000000)
    .slice(0, 3);

  return { property: prop, comparables };
}

export async function predictValuation(payload: ValuationRequestPayload): Promise<ValuationResult> {
  const res = await fetch(`${BASE_URL}/api/predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Valuation failed with code ${res.status}`);
  }

  return res.json();
}

export async function getMarketAnalytics(): Promise<MarketAnalytics> {
  const res = await fetch(`${BASE_URL}/api/analytics`);
  if (!res.ok) {
    throw new Error(`Failed to fetch market analytics: ${res.statusText}`);
  }
  return res.json();
}

export async function getHealthStatus() {
  const res = await fetch(`${BASE_URL}/api/health`);
  return res.json();
}
