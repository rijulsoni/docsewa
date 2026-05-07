export type Tool =
  | 'select'
  | 'text'
  | 'pen'
  | 'highlighter'
  | 'rectangle'
  | 'ellipse'
  | 'arrow'
  | 'image'
  | 'whiteout'
  | 'signature';

/** A single 2D path point in PDF coordinates (origin top-left). */
export type Point = [number, number];

/** All coordinates and sizes are in PDF points (1/72 inch). Origin top-left. */
interface BaseAnnotation {
  id: string;
  pageIndex: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface TextAnnotation extends BaseAnnotation {
  type: 'text';
  text: string;
  fontSize: number;
  color: string;
  bold?: boolean;
  italic?: boolean;
}

export interface ImageAnnotation extends BaseAnnotation {
  type: 'image';
  src: string;
  mime: 'image/png' | 'image/jpeg';
}

export interface ShapeAnnotation extends BaseAnnotation {
  type: 'shape';
  shape: 'rectangle' | 'ellipse' | 'arrow';
  stroke: string;
  strokeWidth: number;
  fill?: string | null;
}

export interface DrawAnnotation extends BaseAnnotation {
  type: 'draw';
  mode: 'pen' | 'highlighter';
  /** Path points stored relative to (x, y) so resize is meaningful. */
  path: Point[];
  stroke: string;
  strokeWidth: number;
  opacity: number;
}

export interface WhiteoutAnnotation extends BaseAnnotation {
  type: 'whiteout';
}

export type Annotation =
  | TextAnnotation
  | ImageAnnotation
  | ShapeAnnotation
  | DrawAnnotation
  | WhiteoutAnnotation;

export interface PageInfo {
  /** Width in PDF points. */
  width: number;
  /** Height in PDF points. */
  height: number;
}
