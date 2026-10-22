export interface Property {
  id: number;
  title: string;
  location: string;
  summary?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  price: number;
  formatted_price: string;
  formatted_price_millions: string;
  price_per_sqft: number;
  price_per_area?: number;
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
  record_type?: string;
  model_split?: string;
  geolocation?: {
    lat: number;
    lng: number;
    is_reference_node?: boolean;
  };
  image: string;
  image_meta?: {
    illustrative: boolean;
    credit: string;
  };
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
    nominal_coverage?: string;
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
  model_version?: string;
  verification_hash?: string;
  verification_details?: {
    algorithm: string;
    canonical_payload_json: string;
    verification_hash: string;
    model_version: string;
    prediction_raw: number;
  };
  intervals?: Array<{
    nominal_level: number;
    half_width: number;
    lower: number;
    upper: number;
    empirical_test_coverage: number;
  }>;
  interval_method?: string;
  interval_caveat?: string;
  ood?: {
    in_distribution: boolean;
    severity: string;
    flags: Array<{ feature: string; value: any; message: string }>;
    novelty_distance: number;
    novelty_threshold: number;
    scope_note: string;
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
