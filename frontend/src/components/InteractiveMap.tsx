import React from 'react';
import { GoogleMapsSection } from './GoogleMapsSection';
import { Property } from '../types';

interface InteractiveMapProps {
  properties: Property[];
  selectedProperty: Property | null;
  onSelectProperty: (property: Property) => void;
  onValuateProperty?: (property: Property) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = (props) => {
  return <GoogleMapsSection {...props} />;
};
