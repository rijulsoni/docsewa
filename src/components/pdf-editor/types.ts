export type Tool =
  | 'select'
  | 'text'
  | 'pen'
  | 'highlighter'
  | 'rectangle'
  | 'ellipse'
  | 'line'
  | 'arrow'
  | 'check'
  | 'cross'
  | 'image'
  | 'whiteout'
  | 'redact'
  | 'signature'
  | 'note'
  | 'stamp';

export type TextFontFamily = 'helvetica' | 'times' | 'courier';

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
  zIndex?: number;
  opacity?: number;
  locked?: boolean;
}

export interface TextAnnotation extends BaseAnnotation {
  type: 'text';
  text: string;
  fontSize: number;
  color: string;
  fontFamily?: TextFontFamily;
  background?: string | null;
  backgroundOpacity?: number;
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
  shape: 'rectangle' | 'ellipse' | 'line' | 'arrow';
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

export interface RedactionAnnotation extends BaseAnnotation {
  type: 'redaction';
}

export interface MarkAnnotation extends BaseAnnotation {
  type: 'mark';
  mark: 'check' | 'cross';
  color: string;
  strokeWidth: number;
}

export interface StickyNoteAnnotation extends BaseAnnotation {
  type: 'note';
  text: string;
  /** Background tint (the "paper"). Default yellow. */
  background: string;
  /** Text colour. */
  color: string;
  fontSize: number;
}

export interface StampAnnotation extends BaseAnnotation {
  type: 'stamp';
  text: string;
  /** Border + text colour. */
  color: string;
  fontSize: number;
  /** Rotation in degrees, e.g. -8 for that classic "stamped at an angle" feel. */
  rotation?: number;
}

export type Annotation =
  | TextAnnotation
  | ImageAnnotation
  | ShapeAnnotation
  | DrawAnnotation
  | WhiteoutAnnotation
  | RedactionAnnotation
  | MarkAnnotation
  | StickyNoteAnnotation
  | StampAnnotation;

export interface PageInfo {
  /** Width in PDF points. */
  width: number;
  /** Height in PDF points. */
  height: number;
}
