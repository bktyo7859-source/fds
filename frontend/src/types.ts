export interface Property {
  id: number;
  title: string;
  location: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  price: number;
  formatted_price: string;
  formatted_price_millions: string;
  price_per_sqft: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  stories: number;
  parking: number;
  mainroad: string;
  guestroom: string;
  basement: string;
  hotwaterheating: string;
  airconditioning: string;
  prefarea: string;
  furnishingstatus: string;
  image: string;
  features: string[];
  description: string;
}

export interface ValuationRequestPayload {
  area: number;
  bedrooms: number;
  bathrooms: number;
  stories: number;
  parking: number;
  mainroad: string;
  guestroom: string;
  basement: string;
  hotwaterheating: string;
  airconditioning: string;
  prefarea: string;
  furnishingstatus: string;
}

export interface FeatureAttribution {
  factor: string;
  value: string;
  impact: number;
  positive: boolean;
}

export interface ValuationResult {
  predicted_price: number;
  formatted_price: string;
  formatted_price_millions: string;
  confidence_interval_95: {
    lower: number;
    upper: number;
    formatted_range: string;
  };
  price_per_sqft: number;
  attributions: FeatureAttribution[];
  is_extrapolation: boolean;
  warning?: string | null;
  property_summary: {
    area_sqft: number;
    configuration: string;
    parking_spaces: number;
    furnishing: string;
    premium_amenities: string[];
  };
}

export interface PriceBin {
  range: string;
  min: number;
  max: number;
  count: number;
}

export interface ScatterPoint {
  area: number;
  price: number;
  price_m: number;
  bedrooms: number;
  bathrooms: number;
}

export interface ModelMetrics {
  total_samples: number;
  train_r2: number;
  test_r2: number;
  cv_5fold_r2_mean: number;
  cv_5fold_r2_std: number;
  mae: number;
  rmse: number;
  residual_std_error: number;
  feature_importances: Array<{ feature: string; importance: number }>;
  training_algorithm: string;
}

export interface MarketAnalytics {
  summary: {
    total_properties: number;
    average_price: number;
    median_price: number;
    min_price: number;
    max_price: number;
    average_area: number;
    average_price_per_sqft: number;
  };
  price_distribution: PriceBin[];
  scatter_area_vs_price: ScatterPoint[];
  bedroom_distribution: Array<{ bedrooms: string; count: number }>;
  furnishing_distribution: Array<{ status: string; count: number }>;
  model_metrics: ModelMetrics;
}
