export type ElementType =
  | "table"
  | "chair"
  | "stage"
  | "dance_floor"
  | "dj"
  | "band"
  | "buffet"
  | "bar"
  | "entrance"
  | "exit"
  | "restrooms"
  | "column"
  | "wall"
  | "door"
  | "window"
  | "decoration"
  | "custom";

export type TableShape = "round" | "square" | "rectangle" | "oval" | "long_banquet";

export type ChairStyle = "standard" | "gold_vip" | "modern" | "wooden" | "cushioned";

export interface SeatInfo {
  seatNumber: number;
  x: number;
  y: number;
  rotation: number;
  guestId?: number | null;
  guestName?: string | null;
  guestCategory?: string | null;
  status: "assigned" | "empty";
}

export interface SeatsPerSide {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

export interface HallElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  label?: string | null;
  tableId?: number | null;
  shape?: TableShape | string | null;
  chairsCount?: number;
  seatsPerSide?: SeatsPerSide;
  color?: string;
  chairStyle?: ChairStyle;
  locked?: boolean;
  seats?: SeatInfo[];
  customIcon?: string;
}

export type ToolMode =
  | "select"
  | "pan"
  | "table"
  | "chair"
  | "stage"
  | "dance_floor"
  | "wall"
  | "text";

export interface HallTemplate {
  id: string;
  name: string;
  description: string;
  width: number;
  height: number;
  elements: HallElement[];
}

export interface AlignmentLine {
  type: "vertical" | "horizontal";
  value: number;
  label?: string;
}

export interface CollisionInfo {
  element1Id: string;
  element2Id: string;
  element1Label: string;
  element2Label: string;
}
