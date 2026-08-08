import { useState, useRef, useCallback, useEffect } from "react";
import { Stage, Layer, Rect, Circle, Ellipse, Text, Transformer, Group, Line } from "react-konva";
import Konva from "konva";
import {
  useGetHallLayout,
  useListTables,
  useListGuests,
  useSaveHallLayout,
  getGetHallLayoutQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import {
  Save, Trash2, RotateCw, RotateCcw, ZoomIn, ZoomOut,
  CircleDot, Square, Music, Utensils, DoorOpen,
  Users, Loader2, LayoutGrid, RefreshCw, Plus, Minus, Copy,
  Armchair
} from "lucide-react";
import { cn } from "@/lib/utils";
import { nanoid } from "nanoid";

// Prevent accidental micro-drags during click/tap gestures
Konva.dragDistance = 10;

/* ─── Types ────────────────────────────────────────────── */

type ElementType =
  | "table"
  | "stage"
  | "dance_floor"
  | "dj"
  | "band"
  | "buffet"
  | "emergency_exit"
  | "entrance";

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
  shape?: "round" | "square" | "rectangle" | "oval" | string | null;
  chairsCount?: number;
}

/* ─── Constants ─────────────────────────────────────────── */

const ELEMENT_DEFAULTS: Record<ElementType, Omit<HallElement, "id" | "x" | "y">> = {
  table:          { type: "table",          width: 90,  height: 90,  rotation: 0, shape: "round",     chairsCount: 8 },
  stage:          { type: "stage",          width: 200, height: 80,  rotation: 0, label: "SKENË"   },
  dance_floor:    { type: "dance_floor",    width: 160, height: 120, rotation: 0, label: "PISTA"   },
  dj:             { type: "dj",             width: 60,  height: 60,  rotation: 0, label: "DJ"      },
  band:           { type: "band",           width: 160, height: 80,  rotation: 0, label: "BANDA"   },
  buffet:         { type: "buffet",         width: 140, height: 60,  rotation: 0, label: "BUFÉ"    },
  emergency_exit: { type: "emergency_exit", width: 50,  height: 50,  rotation: 0, label: "EXIT"    },
  entrance:       { type: "entrance",       width: 80,  height: 50,  rotation: 0, label: "HYRJA"   },
};

const ELEMENT_COLORS: Record<ElementType, { fill: string; stroke: string; text: string }> = {
  table:          { fill: "#FDF6EC", stroke: "#C9A96E", text: "#1a1a1a" },
  stage:          { fill: "#E8E0FF", stroke: "#7C5CC4", text: "#3d1f8b" },
  dance_floor:    { fill: "#E0F5FF", stroke: "#38B2E0", text: "#0a5a8a" },
  dj:             { fill: "#FFE8F5", stroke: "#D45FAD", text: "#7d1a5e" },
  band:           { fill: "#FFE0E8", stroke: "#E05F80", text: "#7d1a2e" },
  buffet:         { fill: "#E8FFE8", stroke: "#4CAF50", text: "#1a5e1a" },
  emergency_exit: { fill: "#FFE0E0", stroke: "#E53E3E", text: "#7d1a1a" },
  entrance:       { fill: "#FFF8E0", stroke: "#D4A017", text: "#5e3d00" },
};

const TOOLBAR_ITEMS = [
  { type: "table"          as ElementType, icon: <Armchair    className="h-4 w-4 text-[#7B1F3A]" />, label: "Tavolinë" },
  { type: "stage"          as ElementType, icon: <LayoutGrid  className="h-4 w-4" />, label: "Skenë"    },
  { type: "dance_floor"    as ElementType, icon: <Music       className="h-4 w-4" />, label: "Pista"    },
  { type: "dj"             as ElementType, icon: <Music       className="h-4 w-4" />, label: "DJ"       },
  { type: "band"           as ElementType, icon: <Music       className="h-4 w-4" />, label: "Banda"    },
  { type: "buffet"         as ElementType, icon: <Utensils    className="h-4 w-4" />, label: "Bufé"     },
  { type: "emergency_exit" as ElementType, icon: <DoorOpen    className="h-4 w-4" />, label: "Exit"     },
  { type: "entrance"       as ElementType, icon: <DoorOpen    className="h-4 w-4" />, label: "Hyrja"    },
];

const TABLE_PRESETS = [
  { shape: "round",     width: 90,  height: 90,  chairsCount: 8,  label: "Tavolinë Rrethore (8)" },
  { shape: "square",    width: 80,  height: 80,  chairsCount: 4,  label: "Tavolinë Katror (4)" },
  { shape: "rectangle", width: 140, height: 80,  chairsCount: 10, label: "Drejtkëndore (10)" },
  { shape: "oval",      width: 130, height: 90,  chairsCount: 12, label: "Tavolinë Oval (12)" },
];

const TABLE_SHAPE_LABELS: Record<string, string> = {
  round: "Rrethore", square: "Katror", rectangle: "Drejtkëndore", oval: "Oval",
};

/* ─── Chair Shape Component ─────────────────────────────── */

function ChairShape({
  x,
  y,
  rotation,
  status = "empty",
}: {
  x: number;
  y: number;
  rotation: number;
  status?: "confirmed" | "unconfirmed" | "empty";
}) {
  let fill = "#FFFFFF";
  let stroke = "#C9A96E";
  let backFill = "#C9A96E";
  let cushionFill = "#FDF6EC";
  let cushionStroke = "#E5C789";

  if (status === "confirmed") {
    fill = "#ECFDF5";
    stroke = "#10B981";
    backFill = "#059669";
    cushionFill = "#A7F3D0";
    cushionStroke = "#047857";
  } else if (status === "unconfirmed") {
    fill = "#FEF2F2";
    stroke = "#EF4444";
    backFill = "#DC2626";
    cushionFill = "#FECACA";
    cushionStroke = "#B91C1C";
  }

  return (
    <Group x={x} y={y} rotation={rotation}>
      {/* Chair Seat */}
      <Rect
        x={-7}
        y={-7}
        width={14}
        height={14}
        cornerRadius={3.5}
        fill={fill}
        stroke={stroke}
        strokeWidth={1.5}
        shadowColor={stroke}
        shadowBlur={2}
        shadowOpacity={0.25}
      />
      {/* Chair Cushion Circle */}
      <Circle x={0} y={-1} radius={3.5} fill={cushionFill} stroke={cushionStroke} strokeWidth={1} />
      {/* Chair Backrest facing outwards */}
      <Rect
        x={-8}
        y={5}
        width={16}
        height={4}
        cornerRadius={2}
        fill={backFill}
        stroke={stroke}
        strokeWidth={1}
      />
    </Group>
  );
}

/* ─── Table Chairs Renderer ─────────────────────────────── */

function TableChairs({
  width,
  height,
  shape = "round",
  chairsCount = 8,
  confirmedCount = 0,
  unconfirmedCount = 0,
}: {
  width: number;
  height: number;
  shape?: string | null;
  chairsCount?: number;
  confirmedCount?: number;
  unconfirmedCount?: number;
}) {
  const count = Math.max(1, Math.min(32, chairsCount));
  const chairs: React.ReactNode[] = [];
  const offset = 16;

  let chairIndex = 0;
  const getNextChairStatus = (): "confirmed" | "unconfirmed" | "empty" => {
    const idx = chairIndex++;
    if (idx < confirmedCount) return "confirmed";
    if (idx < confirmedCount + unconfirmedCount) return "unconfirmed";
    return "empty";
  };

  if (shape === "round") {
    const r = width / 2;
    const chairDist = r + offset;
    for (let i = 0; i < count; i++) {
      const angle = (i * 2 * Math.PI) / count - Math.PI / 2;
      const cx = Math.cos(angle) * chairDist;
      const cy = Math.sin(angle) * chairDist;
      const angleDeg = (angle * 180) / Math.PI;
      chairs.push(<ChairShape key={i} x={cx} y={cy} rotation={angleDeg + 90} status={getNextChairStatus()} />);
    }
  } else if (shape === "oval") {
    const rx = width / 2;
    const ry = height / 2;
    const chairDistX = rx + offset;
    const chairDistY = ry + offset;
    for (let i = 0; i < count; i++) {
      const angle = (i * 2 * Math.PI) / count - Math.PI / 2;
      const cx = Math.cos(angle) * chairDistX;
      const cy = Math.sin(angle) * chairDistY;
      const angleToCenter = Math.atan2(-cy, -cx) * (180 / Math.PI);
      chairs.push(<ChairShape key={i} x={cx} y={cy} rotation={angleToCenter - 90} status={getNextChairStatus()} />);
    }
  } else {
    // Square or Rectangle
    const hw = width / 2;
    const hh = height / 2;

    const ratioW = width / (width + height);
    let countTop = Math.max(1, Math.round((count / 2) * ratioW));
    let countSide = Math.max(1, Math.round((count - 2 * countTop) / 2));
    if (2 * countTop + 2 * countSide < count) countTop += 1;

    // Top edge (rot = 0, facing down towards table center)
    for (let i = 0; i < countTop; i++) {
      const step = width / (countTop + 1);
      const x = -hw + step * (i + 1);
      chairs.push(<ChairShape key={`t-${i}`} x={x} y={-hh - offset} rotation={0} status={getNextChairStatus()} />);
    }

    // Right edge (rot = 270, facing left towards table center)
    for (let i = 0; i < countSide; i++) {
      const step = height / (countSide + 1);
      const y = -hh + step * (i + 1);
      chairs.push(<ChairShape key={`r-${i}`} x={hw + offset} y={y} rotation={270} status={getNextChairStatus()} />);
    }

    // Bottom edge (rot = 180, facing up towards table center)
    for (let i = countTop - 1; i >= 0; i--) {
      const step = width / (countTop + 1);
      const x = -hw + step * (i + 1);
      chairs.push(<ChairShape key={`b-${i}`} x={x} y={hh + offset} rotation={180} status={getNextChairStatus()} />);
    }

    // Left edge (rot = 90, facing right towards table center)
    for (let i = countSide - 1; i >= 0; i--) {
      const step = height / (countSide + 1);
      const y = -hh + step * (i + 1);
      chairs.push(<ChairShape key={`l-${i}`} x={-hw - offset} y={y} rotation={90} status={getNextChairStatus()} />);
    }
  }

  return <Group>{chairs}</Group>;
}

/* ─── Element Graphics Renderer ───────────────────────────── */

function ElementGraphics({ el, colors, commonStyle }: { el: HallElement; colors: any; commonStyle: any }) {
  const w = el.width;
  const h = el.height;
  const hw = w / 2;
  const hh = h / 2;

  switch (el.type) {
    case "table": {
      if (el.shape === "round") {
        return (
          <>
            <Circle x={0} y={0} radius={hw} {...commonStyle} />
            <Circle x={0} y={0} radius={hw - 6} stroke="#E8D19F" strokeWidth={1} listening={false} />
          </>
        );
      }
      if (el.shape === "oval") {
        return (
          <>
            <Ellipse x={0} y={0} radiusX={hw} radiusY={hh} {...commonStyle} />
            <Ellipse x={0} y={0} radiusX={hw - 6} radiusY={hh - 6} stroke="#E8D19F" strokeWidth={1} listening={false} />
          </>
        );
      }
      return (
        <Rect
          x={-hw}
          y={-hh}
          width={w}
          height={h}
          cornerRadius={el.shape === "square" ? 6 : 8}
          {...commonStyle}
        />
      );
    }

    case "stage": {
      return (
        <>
          <Rect x={-hw} y={-hh} width={w} height={h} cornerRadius={8} {...commonStyle} />
          <Rect x={-hw + 12} y={hh - 6} width={w - 24} height={4} fill="#6D28D9" cornerRadius={2} listening={false} />
          <Circle x={-hw + 18} y={-hh + 18} radius={8} fill="#DDD6FE" stroke="#7C3AED" strokeWidth={1} opacity={0.7} listening={false} />
          <Circle x={hw - 18} y={-hh + 18} radius={8} fill="#DDD6FE" stroke="#7C3AED" strokeWidth={1} opacity={0.7} listening={false} />
          <Circle x={0} y={0} radius={Math.min(hw, hh) * 0.5} stroke="#8B5CF6" strokeWidth={1} dash={[3, 3]} listening={false} />
        </>
      );
    }

    case "dance_floor": {
      return (
        <>
          <Rect x={-hw} y={-hh} width={w} height={h} cornerRadius={10} {...commonStyle} />
          <Circle x={0} y={0} radius={Math.min(hw, hh) * 0.65} stroke="#06B6D4" strokeWidth={1.5} fill="#CFFAFE" opacity={0.4} listening={false} />
          <Circle x={0} y={0} radius={Math.min(hw, hh) * 0.35} stroke="#0891B2" strokeWidth={1} dash={[4, 4]} listening={false} />
          <Rect x={-hw + 6} y={-hh + 6} width={w - 12} height={h - 12} cornerRadius={8} stroke="#0891B2" strokeWidth={1} dash={[8, 6]} listening={false} />
        </>
      );
    }

    case "dj": {
      return (
        <>
          <Circle x={0} y={0} radius={hw} {...commonStyle} />
          <Circle x={-hw * 0.4} y={0} radius={hw * 0.28} fill="#1E1B4B" stroke="#EC4899" strokeWidth={1.5} listening={false} />
          <Circle x={-hw * 0.4} y={0} radius={3} fill="#EC4899" listening={false} />
          <Circle x={hw * 0.4} y={0} radius={hw * 0.28} fill="#1E1B4B" stroke="#EC4899" strokeWidth={1.5} listening={false} />
          <Circle x={hw * 0.4} y={0} radius={3} fill="#EC4899" listening={false} />
          <Rect x={-4} y={-hw * 0.3} width={8} height={hw * 0.6} fill="#F472B6" cornerRadius={2} listening={false} />
        </>
      );
    }

    case "band": {
      return (
        <>
          <Rect x={-hw} y={-hh} width={w} height={h} cornerRadius={10} {...commonStyle} />
          <Circle x={0} y={-hh * 0.3} radius={14} fill="#FCE7F3" stroke="#F43F5E" strokeWidth={1.5} listening={false} />
          <Circle x={-16} y={-hh * 0.4} radius={8} fill="#FDA4AF" stroke="#E11D48" strokeWidth={1} listening={false} />
          <Circle x={16} y={-hh * 0.4} radius={8} fill="#FDA4AF" stroke="#E11D48" strokeWidth={1} listening={false} />
          <Rect x={-hw + 8} y={-hh + 8} width={14} height={20} cornerRadius={3} fill="#881337" stroke="#E11D48" strokeWidth={1} listening={false} />
          <Rect x={hw - 22} y={-hh + 8} width={14} height={20} cornerRadius={3} fill="#881337" stroke="#E11D48" strokeWidth={1} listening={false} />
        </>
      );
    }

    case "buffet": {
      const trayW = Math.max(16, (w - 32) / 3);
      return (
        <>
          <Rect x={-hw} y={-hh} width={w} height={h} cornerRadius={12} {...commonStyle} />
          <Rect x={-hw + 10} y={-8} width={trayW} height={16} cornerRadius={4} fill="#DCFCE7" stroke="#16A34A" strokeWidth={1} listening={false} />
          <Rect x={-trayW / 2} y={-8} width={trayW} height={16} cornerRadius={4} fill="#DCFCE7" stroke="#16A34A" strokeWidth={1} listening={false} />
          <Rect x={hw - 10 - trayW} y={-8} width={trayW} height={16} cornerRadius={4} fill="#DCFCE7" stroke="#16A34A" strokeWidth={1} listening={false} />
        </>
      );
    }

    case "entrance": {
      const doorShift = Math.max(10, w * 0.22);
      return (
        <>
          {/* Outer Door Frame */}
          <Rect x={-hw} y={-hh} width={w} height={h} fill="#451A03" stroke="#1E293B" strokeWidth={2.5} cornerRadius={3} />
          {/* Dark Opened Doorway Interior */}
          <Rect x={-hw + 3} y={-hh + 3} width={w - 6} height={h - 6} fill="#271406" listening={false} />
          {/* Swung-Open Wood Door Panel */}
          <Line
            points={[
              -hw + 3, -hh + 3,
              -hw - doorShift, -hh - 4,
              -hw - doorShift, hh - 8,
              -hw + 3, hh - 3,
            ]}
            fill="#D97706"
            stroke="#78350F"
            strokeWidth={2}
            closed={true}
            listening={false}
          />
          {/* Blue/Cyan Lockplate */}
          <Rect
            x={-hw - doorShift + 3}
            y={-5}
            width={5}
            height={10}
            fill="#0284C7"
            stroke="#0C4A6E"
            strokeWidth={1}
            cornerRadius={1}
            listening={false}
          />
          {/* Handle Lever */}
          <Line
            points={[
              -hw - doorShift + 3, 0,
              -hw - doorShift - 4, 0
            ]}
            stroke="#0F172A"
            strokeWidth={2}
            listening={false}
          />
        </>
      );
    }

    case "emergency_exit": {
      const doorShift = Math.max(10, w * 0.22);
      return (
        <>
          {/* Outer Emergency Exit Door Frame */}
          <Rect x={-hw} y={-hh} width={w} height={h} fill="#7F1D1D" stroke="#991B1B" strokeWidth={2.5} cornerRadius={3} />
          {/* Dark Opened Doorway Interior */}
          <Rect x={-hw + 3} y={-hh + 3} width={w - 6} height={h - 6} fill="#450A0A" listening={false} />
          {/* Swung-Open Red Safety Door Panel */}
          <Line
            points={[
              -hw + 3, -hh + 3,
              -hw - doorShift, -hh - 4,
              -hw - doorShift, hh - 8,
              -hw + 3, hh - 3,
            ]}
            fill="#EF4444"
            stroke="#991B1B"
            strokeWidth={2}
            closed={true}
            listening={false}
          />
          {/* Silver/Blue Lockplate & Push Handle */}
          <Rect
            x={-hw - doorShift + 3}
            y={-5}
            width={5}
            height={10}
            fill="#38BDF8"
            stroke="#0284C7"
            strokeWidth={1}
            cornerRadius={1}
            listening={false}
          />
          <Line
            points={[
              -hw - doorShift + 3, 0,
              -hw - doorShift - 4, 0
            ]}
            stroke="#0F172A"
            strokeWidth={2}
            listening={false}
          />
        </>
      );
    }

    default:
      return <Rect x={-hw} y={-hh} width={w} height={h} cornerRadius={6} {...commonStyle} />;
  }
}

/* ─── Single Canvas Element ─────────────────────────────── */

function HallElementShape({
  el,
  isSelected,
  onSelect,
  onChange,
  tableName,
  confirmedCount = 0,
  unconfirmedCount = 0,
}: {
  el: HallElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (updated: Partial<HallElement>) => void;
  tableName?: string;
  confirmedCount?: number;
  unconfirmedCount?: number;
}) {
  const shapeRef = useRef<any>(null);
  const trRef = useRef<any>(null);
  const colors = ELEMENT_COLORS[el.type];

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const centerX = el.x + el.width / 2;
  const centerY = el.y + el.height / 2;

  // Selection click handler that halts DOM & Konva event bubbling
  const handleSelect = (e: any) => {
    if (e && e.evt) {
      if (typeof e.evt.stopPropagation === "function") {
        e.evt.stopPropagation();
      }
      e.evt.cancelBubble = true;
    }
    if (e && e.cancelBubble !== undefined) {
      e.cancelBubble = true;
    }
    onSelect();
  };

  const handleDragMove = (e: any) => {
    const node = shapeRef.current;
    if (!node) return;
    onChange({
      x: node.x() - el.width / 2,
      y: node.y() - el.height / 2,
    });
  };

  const handleDragEnd = (e: any) => {
    const node = shapeRef.current;
    if (!node) return;
    onChange({
      x: node.x() - el.width / 2,
      y: node.y() - el.height / 2,
    });
  };

  const handleTransformEnd = () => {
    const node = shapeRef.current;
    if (!node) return;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);
    const newW = Math.max(30, el.width * scaleX);
    const newH = Math.max(30, el.height * scaleY);
    onChange({
      x: node.x() - newW / 2,
      y: node.y() - newH / 2,
      width: Math.round(newW),
      height: Math.round(newH),
      rotation: Math.round(node.rotation() % 360),
    });
  };

  const label = el.type === "table" ? (tableName || el.label || `Tavolina`) : (el.label || "");
  const fontSize = el.width < 60 ? 10 : el.width < 100 ? 12 : 14;

  const commonStyle = {
    fill: colors.fill,
    stroke: isSelected ? "#C9A96E" : colors.stroke,
    strokeWidth: isSelected ? 2.5 : 1.5,
    shadowEnabled: isSelected,
    shadowColor: "#C9A96E",
    shadowBlur: 10,
    shadowOpacity: 0.5,
  };

  return (
    <>
      <Group
        ref={shapeRef}
        x={centerX}
        y={centerY}
        width={el.width}
        height={el.height}
        rotation={el.rotation}
        draggable={isSelected}
        onClick={handleSelect}
        onTap={handleSelect}
        onDragStart={handleSelect}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
      >
        {/* Render Chairs if element is a Table */}
        {el.type === "table" && (
          <TableChairs
            width={el.width}
            height={el.height}
            shape={el.shape || "round"}
            chairsCount={el.chairsCount ?? 8}
            confirmedCount={confirmedCount}
            unconfirmedCount={unconfirmedCount}
          />
        )}

        {/* Custom Architectural Graphic Body */}
        <ElementGraphics el={el} colors={colors} commonStyle={commonStyle} />

        {/* Inner Gold Ring Accent for Round/Oval Tables */}
        {el.type === "table" && el.shape === "round" && (
          <Circle x={0} y={0} radius={el.width / 2 - 6} stroke="#E8D19F" strokeWidth={1} listening={false} />
        )}
        {el.type === "table" && el.shape === "oval" && (
          <Ellipse x={0} y={0} radiusX={el.width / 2 - 6} radiusY={el.height / 2 - 6} stroke="#E8D19F" strokeWidth={1} listening={false} />
        )}

        {/* Label text */}
        <Text
          x={-el.width / 2}
          y={-el.height / 2}
          width={el.width}
          height={el.height}
          text={label}
          fontSize={fontSize}
          fontFamily="'Cormorant Garamond', Georgia, serif"
          fontStyle="bold"
          fill={colors.text}
          align="center"
          verticalAlign="middle"
          listening={false}
        />

        {/* Capacity / Chair count small badge on table */}
        {el.type === "table" && (
          <Text
            x={-el.width / 2}
            y={el.height / 2 - 16}
            width={el.width}
            height={14}
            text={`🪑 ${el.chairsCount ?? 8}`}
            fontSize={9}
            fill="#7C602B"
            align="center"
            listening={false}
          />
        )}
      </Group>

      {isSelected && (
        <Transformer
          ref={trRef}
          rotateEnabled={true}
          anchorFill="#FFFFFF"
          anchorStroke="#C9A96E"
          anchorCornerRadius={4}
          anchorSize={10}
          borderStroke="#C9A96E"
          borderDash={[4, 4]}
          keepRatio={el.shape === "round" || el.shape === "square"}
          enabledAnchors={
            el.shape === "round" || el.shape === "square"
              ? ["top-left", "top-right", "bottom-left", "bottom-right"]
              : ["top-left", "top-right", "bottom-left", "bottom-right",
                 "middle-left", "middle-right", "top-center", "bottom-center"]
          }
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 30 || newBox.height < 30) return oldBox;
            return newBox;
          }}
        />
      )}
    </>
  );
}

/* ─── Main HallDesigner ─────────────────────────────────── */

export function HallDesigner({ eventId }: { eventId: number }) {
  const qc = useQueryClient();
  const stageRef = useRef<any>(null);

  const { data: layout, isLoading: layoutLoading } = useGetHallLayout(eventId);
  const { data: tables = [] } = useListTables(eventId);
  const { data: guests = [] } = useListGuests(eventId);
  const saveLayout = useSaveHallLayout();

  const getGuestStatsForElement = useCallback((el: HallElement) => {
    if (el.type !== "table") return { confirmedCount: 0, unconfirmedCount: 0 };
    const targetTableId = el.tableId;
    if (!targetTableId) return { confirmedCount: 0, unconfirmedCount: 0 };

    const assignedGuests = guests.filter(g =>
      g.tableId && (g.tableId === targetTableId || String(g.tableId) === String(targetTableId))
    );

    const confirmedCount = assignedGuests.filter(g =>
      (g.status as string) === "confirmed" || (g.status as string) === "attending" || (g.status as string) === "checked_in"
    ).length;
    const unconfirmedCount = assignedGuests.length - confirmedCount;

    return { confirmedCount, unconfirmedCount };
  }, [guests]);

  const containerRef = useRef<HTMLDivElement>(null);
  const [elements, setElements] = useState<HallElement[]>([]);
  const [hallWidth, setHallWidth] = useState(800);
  const [hallHeight, setHallHeight] = useState(600);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [initialized, setInitialized] = useState(false);

  const fitScale = useCallback(() => {
    if (containerRef.current) {
      const containerW = containerRef.current.clientWidth;
      if (containerW && containerW < hallWidth) {
        const calcScale = Math.max(0.35, Math.min(1, (containerW - 24) / hallWidth));
        setScale(calcScale);
        return;
      }
    }
    setScale(1);
  }, [hallWidth]);

  useEffect(() => {
    fitScale();
    window.addEventListener("resize", fitScale);
    return () => window.removeEventListener("resize", fitScale);
  }, [fitScale]);

  // Initialise from fetched layout
  useEffect(() => {
    if (layout && !initialized) {
      setHallWidth(layout.width || 800);
      setHallHeight(layout.height || 600);
      setElements((layout.elements as HallElement[]) || []);
      setInitialized(true);
    }
  }, [layout, initialized]);

  // Table lookup map for names
  const tableMap = Object.fromEntries(tables.map((t) => [t.id, t]));

  const containerWidth = 700;


  // Add Table with Preset or Custom
  const addTablePreset = useCallback((preset: typeof TABLE_PRESETS[0]) => {
    const cx = hallWidth / 2;
    const cy = hallHeight / 2;
    const placedTableIds = new Set(elements.filter(e => e.tableId).map(e => e.tableId));
    const nextTable = tables.find(t => !placedTableIds.has(t.id));

    let newEl: HallElement = {
      id: nanoid(),
      type: "table",
      x: cx - preset.width / 2 + Math.random() * 40 - 20,
      y: cy - preset.height / 2 + Math.random() * 40 - 20,
      width: preset.width,
      height: preset.height,
      rotation: 0,
      shape: preset.shape,
      chairsCount: preset.chairsCount,
      label: `Tavolina ${elements.filter(e => e.type === "table").length + 1}`,
    };

    if (nextTable) {
      newEl.tableId = nextTable.id;
      newEl.label = nextTable.name;
      newEl.shape = nextTable.shape || preset.shape;
      newEl.chairsCount = nextTable.capacity || preset.chairsCount;
    }

    setElements(prev => [...prev, newEl]);
    setSelectedId(newEl.id);
  }, [hallWidth, hallHeight, elements, tables]);

  // Add other elements (stage, dj, dancefloor, exit...)
  const addElement = useCallback((type: ElementType) => {
    if (type === "table") {
      addTablePreset(TABLE_PRESETS[0]);
      return;
    }
    const cx = hallWidth / 2;
    const cy = hallHeight / 2;
    const defaults = ELEMENT_DEFAULTS[type];
    let newEl: HallElement = {
      id: nanoid(),
      ...defaults,
      x: cx - defaults.width / 2 + Math.random() * 40 - 20,
      y: cy - defaults.height / 2 + Math.random() * 40 - 20,
    };

    setElements(prev => [...prev, newEl]);
    setSelectedId(newEl.id);
  }, [hallWidth, hallHeight, addTablePreset]);

  const updateElement = useCallback((id: string, changes: Partial<HallElement>) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...changes } : el));
  }, []);

  const deleteSelected = useCallback(() => {
    if (!selectedId) return;
    setElements(prev => prev.filter(el => el.id !== selectedId));
    setSelectedId(null);
    toast({ title: "Elementi u fshi!" });
  }, [selectedId]);

  const rotateSelected = useCallback((deg: number) => {
    if (!selectedId) return;
    setElements(prev => prev.map(el =>
      el.id === selectedId
        ? { ...el, rotation: (el.rotation + deg + 360) % 360 }
        : el
    ));
  }, [selectedId]);

  const duplicateSelected = useCallback(() => {
    if (!selectedId) return;
    const target = elements.find(e => e.id === selectedId);
    if (!target) return;
    const dup: HallElement = {
      ...target,
      id: nanoid(),
      x: target.x + 30,
      y: target.y + 30,
      label: target.type === "table" ? `${target.label || "Tavolinë"} (Kopje)` : target.label,
      tableId: undefined, // detach linked database table
    };
    setElements(prev => [...prev, dup]);
    setSelectedId(dup.id);
    toast({ title: "Elementi u kopjua!" });
  }, [selectedId, elements]);

  const adjustChairs = useCallback((delta: number) => {
    if (!selectedId) return;
    setElements(prev => prev.map(el => {
      if (el.id !== selectedId) return el;
      const current = el.chairsCount ?? 8;
      const updated = Math.max(1, Math.min(32, current + delta));
      return { ...el, chairsCount: updated };
    }));
  }, [selectedId]);

  // Keyboard Shortcuts (Delete, Backspace, R to rotate, Ctrl+D to duplicate)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedId) return;
      // Do not trigger if typing in an input field
      const activeTag = document.activeElement?.tagName;
      if (activeTag === "INPUT" || activeTag === "TEXTAREA" || activeTag === "SELECT") return;

      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        deleteSelected();
      } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        rotateSelected(45);
      } else if ((e.ctrlKey || e.metaKey) && (e.key === "d" || e.key === "D")) {
        e.preventDefault();
        duplicateSelected();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        updateElement(selectedId, { y: elements.find(el => el.id === selectedId)!.y - (e.shiftKey ? 10 : 2) });
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        updateElement(selectedId, { y: elements.find(el => el.id === selectedId)!.y + (e.shiftKey ? 10 : 2) });
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        updateElement(selectedId, { x: elements.find(el => el.id === selectedId)!.x - (e.shiftKey ? 10 : 2) });
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        updateElement(selectedId, { x: elements.find(el => el.id === selectedId)!.x + (e.shiftKey ? 10 : 2) });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedId, deleteSelected, rotateSelected, duplicateSelected, updateElement, elements]);

  const handleSave = () => {
    saveLayout.mutate(
      { eventId, data: { width: hallWidth, height: hallHeight, elements: elements as any } },
      {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: getGetHallLayoutQueryKey(eventId) });
          toast({ title: "Plani i sallës u ruajt me sukses!" });
        },
        onError: () => toast({ title: "Gabim gjatë ruajtjes", variant: "destructive" }),
      }
    );
  };

  const selectedEl = elements.find(e => e.id === selectedId);

  if (layoutLoading) {
    return <Skeleton className="h-96 w-full rounded-xl" />;
  }

  return (
    <div className="space-y-4" ref={containerRef}>
      {/* Top Toolbars */}
      <div className="p-3 bg-slate-50/80 border border-slate-200/80 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-serif font-bold text-slate-700 shrink-0">Salla:</span>
          <div className="flex items-center gap-1.5 shrink-0">
            {TOOLBAR_ITEMS.map(item => (
              <Button
                key={item.type}
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5 bg-white hover:bg-slate-100 text-slate-700 font-serif rounded-xl shrink-0"
                onClick={() => addElement(item.type)}
              >
                {item.icon}
                {item.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Element Quick Controls */}
      {selectedEl ? (
        <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-3 shadow-sm flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Label className="text-xs font-serif font-bold text-amber-900">Emri:</Label>
              <Input
                className="h-8 w-36 text-xs bg-white border-amber-300 focus-visible:ring-amber-500 font-serif rounded-xl"
                value={selectedEl.label || ""}
                onChange={(e) => updateElement(selectedEl.id, { label: e.target.value })}
                placeholder="Emri i tavolinës..."
              />
            </div>

            {selectedEl.type === "table" && (
              <div className="flex items-center gap-1">
                <Label className="text-xs font-serif font-bold text-amber-900 mr-1">Forma:</Label>
                {Object.entries(TABLE_SHAPE_LABELS).map(([sh, lbl]) => (
                  <Button
                    key={sh}
                    variant={selectedEl.shape === sh ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "h-7 px-2 text-xs font-serif rounded-lg",
                      selectedEl.shape === sh
                        ? "bg-amber-800 hover:bg-amber-900 text-white font-bold"
                        : "bg-white text-slate-700 hover:bg-amber-100"
                    )}
                    onClick={() => updateElement(selectedEl.id, { shape: sh })}
                  >
                    {lbl}
                  </Button>
                ))}
              </div>
            )}

            {selectedEl.type === "table" && (
              <div className="flex items-center gap-1 bg-white border border-amber-300 rounded-xl p-0.5 px-2">
                <Armchair className="h-3.5 w-3.5 text-amber-700" />
                <span className="text-xs font-serif font-bold text-amber-900 mx-1">
                  {selectedEl.chairsCount ?? 8} Karrige
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-lg text-amber-800 hover:bg-amber-100"
                  onClick={() => adjustChairs(-1)}
                  title="Zvogëlo numrin e karrigeve"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-lg text-amber-800 hover:bg-amber-100"
                  onClick={() => adjustChairs(1)}
                  title="Rrite numrin e karrigeve"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1 text-xs bg-white hover:bg-amber-100 border-amber-300 text-amber-900 rounded-xl font-serif"
              onClick={() => rotateSelected(-45)}
            >
              <RotateCcw className="h-3.5 w-3.5" /> -45°
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1 text-xs bg-white hover:bg-amber-100 border-amber-300 text-amber-900 font-serif font-semibold rounded-xl"
              onClick={() => rotateSelected(45)}
            >
              <RotateCw className="h-3.5 w-3.5" /> +45°
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1 text-xs bg-white hover:bg-amber-100 border-amber-300 text-amber-900 rounded-xl font-serif"
              onClick={() => rotateSelected(90)}
            >
              <RotateCw className="h-3.5 w-3.5" /> 90°
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1 text-xs bg-white hover:bg-amber-100 border-amber-300 text-slate-800 rounded-xl font-serif"
              onClick={duplicateSelected}
            >
              <Copy className="h-3.5 w-3.5" /> Kopjo
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="h-8 gap-1 text-xs font-serif font-semibold px-3 rounded-xl"
              onClick={deleteSelected}
            >
              <Trash2 className="h-3.5 w-3.5" /> Fshi
            </Button>
          </div>
        </div>
      ) : null}

      {/* Hall Size & Zoom Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50/80 p-3 rounded-2xl border border-slate-200/80 font-serif">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-bold text-slate-700">Përmasat e Sallës:</span>
          <div className="flex items-center gap-1">
            <Label className="text-xs text-slate-500">Gjerësia</Label>
            <Input
              type="number"
              className="h-8 w-20 text-xs bg-white border-slate-200 rounded-xl"
              value={hallWidth}
              min={300}
              max={2500}
              onChange={e => setHallWidth(Number(e.target.value))}
            />
          </div>
          <div className="flex items-center gap-1">
            <Label className="text-xs text-slate-500">Gjatësia</Label>
            <Input
              type="number"
              className="h-8 w-20 text-xs bg-white border-slate-200 rounded-xl"
              value={hallHeight}
              min={300}
              max={2500}
              onChange={e => setHallHeight(Number(e.target.value))}
            />
          </div>
          <span className="text-slate-400">(px)</span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8 bg-white rounded-xl border-slate-200" onClick={() => setScale(s => Math.min(2, s + 0.1))} title="Zmadho">
              <ZoomIn className="h-4 w-4 text-slate-700" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 bg-white rounded-xl border-slate-200" onClick={() => setScale(s => Math.max(0.3, s - 0.1))} title="Zvogëlo">
              <ZoomOut className="h-4 w-4 text-slate-700" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 bg-white rounded-xl border-slate-200" onClick={fitScale} title="Përshtat me ekranin">
              <RefreshCw className="h-3.5 w-3.5 text-slate-700" />
            </Button>
          </div>

          <Button
            onClick={handleSave}
            disabled={saveLayout.isPending}
            className="bg-[#7B1F3A] hover:bg-[#5e1729] text-white rounded-xl font-serif text-xs font-semibold h-8 px-4 gap-1.5 shadow-sm"
          >
            {saveLayout.isPending
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <Save className="h-3.5 w-3.5" />}
            Ruaj Planin
          </Button>
        </div>
      </div>

      {/* Interactive Canvas Area */}
      <div
        className="relative border-2 border-dashed border-amber-900/20 rounded-xl overflow-auto bg-[#FEFAF5] shadow-inner"
        style={{ maxHeight: 620 }}
      >
        <div style={{ width: hallWidth * scale, height: hallHeight * scale, minHeight: 400, position: "relative" }}>
          {/* Floating Context Toolbar directly over the Selected Table */}
          {selectedEl && (
            <div
              className="absolute z-30 flex items-center gap-1 bg-slate-900/90 text-white backdrop-blur-md border border-amber-400/50 shadow-2xl rounded-full px-3 py-1.5 transition-all duration-150 pointer-events-auto"
              style={{
                left: Math.max(120, Math.min(hallWidth * scale - 120, (selectedEl.x + selectedEl.width / 2) * scale)),
                top: Math.max(45, selectedEl.y * scale - 15),
                transform: "translate(-50%, -100%)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Rotate -45 button */}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full text-amber-300 hover:text-white hover:bg-white/20"
                onClick={() => rotateSelected(-45)}
                title="Rrotullo majtas (-45°)"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>

              {/* Rotate +45 button */}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full text-amber-300 hover:text-white hover:bg-white/20"
                onClick={() => rotateSelected(45)}
                title="Rrotullo djathtas (+45°)"
              >
                <RotateCw className="h-3.5 w-3.5" />
              </Button>

              {/* Rotate 90 button */}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full text-amber-300 hover:text-white hover:bg-white/20 text-xs font-bold"
                onClick={() => rotateSelected(90)}
                title="Rrotullo 90°"
              >
                90°
              </Button>

              {selectedEl.type === "table" && (
                <>
                  <div className="w-px h-4 bg-white/20 my-auto mx-0.5" />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-full text-white hover:bg-white/20 text-xs font-bold"
                    onClick={() => adjustChairs(-1)}
                    title="Zvogëlo 1 karrige"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="text-xs font-bold text-amber-300 whitespace-nowrap px-1">
                    🪑 {selectedEl.chairsCount ?? 8}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-full text-white hover:bg-white/20 text-xs font-bold"
                    onClick={() => adjustChairs(1)}
                    title="Shto 1 karrige"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </>
              )}

              <div className="w-px h-4 bg-white/20 my-auto mx-0.5" />

              {/* Duplicate button */}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full text-white hover:bg-white/20"
                onClick={duplicateSelected}
                title="Kopjo (Ctrl+D)"
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>

              {/* DELETE BUTTON */}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full text-red-400 hover:text-white hover:bg-red-600 transition-colors"
                onClick={deleteSelected}
                title="Fshi (Delete)"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}

          <Stage
            ref={stageRef}
            width={hallWidth * scale}
            height={hallHeight * scale}
            scaleX={scale}
            scaleY={scale}
            onMouseDown={(e) => {
              const target = e.target;
              if (target === stageRef.current || target.attrs?.id === "hall-floor-bg") {
                setSelectedId(null);
              }
            }}
            onClick={(e) => {
              const target = e.target;
              if (target === stageRef.current || target.attrs?.id === "hall-floor-bg") {
                setSelectedId(null);
              }
            }}
            onTap={(e) => {
              const target = e.target;
              if (target === stageRef.current || target.attrs?.id === "hall-floor-bg") {
                setSelectedId(null);
              }
            }}
          >
            <Layer>
              {/* Hall floor background */}
              <Rect
                id="hall-floor-bg"
                x={0}
                y={0}
                width={hallWidth}
                height={hallHeight}
                fill="#FEFAF5"
                stroke="#D4C5A9"
                strokeWidth={3}
                cornerRadius={8}
              />

              {/* Grid dots background pattern */}
              {Array.from({ length: Math.floor(hallWidth / 40) }).map((_, xi) =>
                Array.from({ length: Math.floor(hallHeight / 40) }).map((_, yi) => (
                  <Circle
                    key={`${xi}-${yi}`}
                    x={(xi + 1) * 40}
                    y={(yi + 1) * 40}
                    radius={1.5}
                    fill="#D4C5A9"
                    opacity={0.4}
                    listening={false}
                  />
                ))
              )}

              {/* Elements on canvas */}
              {elements.map(el => {
                const stats = getGuestStatsForElement(el);
                return (
                  <HallElementShape
                    key={el.id}
                    el={el}
                    isSelected={selectedId === el.id}
                    onSelect={() => setSelectedId(el.id)}
                    onChange={(changes) => updateElement(el.id, changes)}
                    tableName={el.tableId ? tableMap[el.tableId]?.name : undefined}
                    confirmedCount={stats.confirmedCount}
                    unconfirmedCount={stats.unconfirmedCount}
                  />
                );
              })}
            </Layer>
          </Stage>
        </div>
      </div>

      {/* Legend & Color Codes */}
      <div className="flex flex-wrap gap-4 text-xs text-slate-600 bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
        <span className="font-semibold text-slate-700">Legjenda:</span>
        {Object.entries(ELEMENT_COLORS).map(([type, colors]) => (
          <div key={type} className="flex items-center gap-1.5">
            <span
              className="inline-block w-3.5 h-3.5 rounded-sm border shadow-sm"
              style={{ background: colors.fill, borderColor: colors.stroke }}
            />
            <span>{type === "table" ? "Tavolinë me Karrige" : TOOLBAR_ITEMS.find(t => t.type === type)?.label || type}</span>
          </div>
        ))}
      </div>

      {/* Unplaced Tables Warning / Hint */}
      {tables.length > 0 && (() => {
        const placedIds = new Set(elements.filter(e => e.tableId).map(e => e.tableId));
        const unplaced = tables.filter(t => !placedIds.has(t.id));
        if (unplaced.length === 0) return null;
        return (
          <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-amber-600 shrink-0" />
              <span>
                <b>{unplaced.length} tavolinë nga lista nuk janë vendosur në sallë:</b> {unplaced.map(t => `${t.name} (${t.capacity} vend)`).join(", ")}
              </span>
            </div>
            <span className="text-slate-500 text-[11px]">Shtoni një tavolinë nga shiriti i sipërm për t'i vendosur.</span>
          </div>
        );
      })()}
    </div>
  );
}
