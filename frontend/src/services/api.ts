import { Property, ValuationRequestPayload, ValuationResult, MarketAnalytics } from '../types';

const BASE_URL = '';

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

  const res = await fetch(`${BASE_URL}/api/properties?${query.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch properties: ${res.statusText}`);
  }
  return res.json();
}

export async function getPropertyDetail(id: number): Promise<{ property: Property; comparables: Property[] }> {
  const res = await fetch(`${BASE_URL}/api/properties/${id}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch property #${id}: ${res.statusText}`);
  }
  return res.json();
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
