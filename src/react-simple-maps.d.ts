declare module 'react-simple-maps' {
  import { ComponentType, ReactNode, SVGProps } from 'react';

  interface ProjectionConfig {
    rotate?: [number, number, number];
    center?: [number, number];
    scale?: number;
  }

  interface ComposableMapProps {
    projection?: string;
    projectionConfig?: ProjectionConfig;
    width?: number;
    height?: number;
    style?: React.CSSProperties;
    children?: ReactNode;
  }

  interface GeoFeature {
    rsmKey: string;
    [key: string]: unknown;
  }

  interface GeographiesProps {
    geography: string | object;
    children: (args: { geographies: GeoFeature[] }) => ReactNode;
  }

  interface GeographyProps extends SVGProps<SVGPathElement> {
    geography: object;
    style?: {
      default?: React.CSSProperties;
      hover?: React.CSSProperties;
      pressed?: React.CSSProperties;
    };
  }

  interface MarkerProps {
    coordinates: [number, number];
    children?: ReactNode;
  }

  interface LineProps extends SVGProps<SVGPathElement> {
    from: [number, number];
    to: [number, number];
    stroke?: string;
    strokeWidth?: number;
    strokeLinecap?: string;
    strokeDasharray?: string;
    strokeOpacity?: number;
  }

  export const ComposableMap: ComponentType<ComposableMapProps>;
  export const Geographies: ComponentType<GeographiesProps>;
  export const Geography: ComponentType<GeographyProps>;
  export const Marker: ComponentType<MarkerProps>;
  export const Line: ComponentType<LineProps>;
  export const Sphere: ComponentType<SVGProps<SVGPathElement>>;
  export const Graticule: ComponentType<SVGProps<SVGPathElement>>;
}
