import { useState, useRef, useCallback, useEffect } from "react";
import { Stage, Layer, Rect, Circle, Ellipse, Text, Transformer, Group } from "react-konva";
import type Konva from "konva";
import {
  useGetHallLayout,
  useListTables,
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
  Save, Trash2, RotateCw, ZoomIn, ZoomOut,
  CircleDot, Square, Music, Utensils, DoorOpen,
  Users, Loader2, LayoutGrid, RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { nanoid } from "nanoid";

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

interface HallElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  label?: string | null;
  tableId?: number | null;
  shape?: string | null;
}

/* ─── Constants ─────────────────────────────────────────── */

const ELEMENT_DEFAULTS: Record<ElementType, Omit<HallElement, "id" | "x" | "y">> = {
  table:          { type: "table",          width: 80,  height: 80,  rotation: 0, shape: "round"   },
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
  { type: "table"          as ElementType, icon: <CircleDot className="h-4 w-4" />, label: "Tavolinë" },
  { type: "stage"          as ElementType, icon: <LayoutGrid  className="h-4 w-4" />, label: "Skenë"    },
  { type: "dance_floor"    as ElementType, icon: <Music       className="h-4 w-4" />, label: "Pista"    },
  { type: "dj"             as ElementType, icon: <Music       className="h-4 w-4" />, label: "DJ"       },
  { type: "band"           as ElementType, icon: <Music       className="h-4 w-4" />, label: "Banda"    },
  { type: "buffet"         as ElementType, icon: <Utensils    className="h-4 w-4" />, label: "Bufé"     },
  { type: "emergency_exit" as ElementType, icon: <DoorOpen    className="h-4 w-4" />, label: "Exit"     },
  { type: "entrance"       as ElementType, icon: <DoorOpen    className="h-4 w-4" />, label: "Hyrja"    },
];

const TABLE_SHAPE_LABELS: Record<string, string> = {
  round: "Rrethore", square: "Katror", rectangle: "Drejtkëndore", oval: "Oval",
};

/* ─── Single canvas element ─────────────────────────────── */

function HallElementShape({
  el,
  isSelected,
  onSelect,
  onChange,
  tableName,
}: {
  el: HallElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (updated: Partial<HallElement>) => void;
  tableName?: string;
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

  const handleDragEnd = (e: any) => {
    onChange({ x: e.target.x(), y: e.target.y() });
  };

  const handleTransformEnd = (e: any) => {
    const node = shapeRef.current;
    if (!node) return;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);
    onChange({
      x: node.x(),
      y: node.y(),
      width: Math.max(20, node.width() * scaleX),
      height: Math.max(20, node.height() * scaleY),
      rotation: node.rotation(),
    });
  };

  const commonProps = {
    ref: shapeRef,
    x: el.x,
    y: el.y,
    rotation: el.rotation,
    draggable: true,
    onClick: onSelect,
    onTap: onSelect,
    onDragEnd: handleDragEnd,
    onTransformEnd: handleTransformEnd,
    fill: colors.fill,
    stroke: isSelected ? "#C9A96E" : colors.stroke,
    strokeWidth: isSelected ? 2.5 : 1.5,
    shadowEnabled: isSelected,
    shadowColor: "#C9A96E",
    shadowBlur: 8,
    shadowOpacity: 0.4,
  };

  const label = el.type === "table" ? (tableName || el.label || `T`) : (el.label || "");
  const cx = el.width / 2;
  const cy = el.height / 2;
  const fontSize = el.width < 60 ? 9 : el.width < 100 ? 11 : 12;

  return (
    <>
      <Group x={0} y={0}>
        {el.type === "table" && el.shape === "round" ? (
          <Circle
            {...commonProps}
            x={el.x + cx}
            y={el.y + cy}
            radius={el.width / 2}
          />
        ) : el.type === "table" && el.shape === "oval" ? (
          <Ellipse
            {...commonProps}
            x={el.x + cx}
            y={el.y + cy}
            radiusX={el.width / 2}
            radiusY={el.height / 2}
          />
        ) : (
          <Rect
            {...commonProps}
            width={el.width}
            height={el.height}
            cornerRadius={el.type === "dance_floor" ? 8 : el.type === "dj" ? el.width / 2 : 4}
          />
        )}

        {/* Label text */}
        <Text
          x={el.type === "table" && el.shape === "round"
            ? el.x + cx - el.width / 2
            : el.x}
          y={el.type === "table" && el.shape === "round"
            ? el.y + cy - el.height / 2
            : el.y}
          width={el.width}
          height={el.height}
          text={label}
          fontSize={fontSize}
          fontFamily="'Cormorant Garamond', Georgia, serif"
          fill={colors.text}
          align="center"
          verticalAlign="middle"
          listening={false}
          rotation={el.rotation}
          offsetX={el.type === "table" && el.shape === "round" ? 0 : 0}
        />
      </Group>

      {isSelected && (
        <Transformer
          ref={trRef}
          rotateEnabled
          keepRatio={el.shape === "round"}
          enabledAnchors={
            el.shape === "round"
              ? ["top-left", "top-right", "bottom-left", "bottom-right"]
              : ["top-left", "top-right", "bottom-left", "bottom-right",
                 "middle-left", "middle-right", "top-center", "bottom-center"]
          }
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 20 || newBox.height < 20) return oldBox;
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
  const saveLayout = useSaveHallLayout();

  const [elements, setElements] = useState<HallElement[]>([]);
  const [hallWidth, setHallWidth] = useState(800);
  const [hallHeight, setHallHeight] = useState(600);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [initialized, setInitialized] = useState(false);
  const [nextTableIdx, setNextTableIdx] = useState(0);

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
  const fitScale = Math.min(1, containerWidth / hallWidth);

  const addElement = useCallback((type: ElementType) => {
    const cx = hallWidth / 2;
    const cy = hallHeight / 2;
    const defaults = ELEMENT_DEFAULTS[type];
    let newEl: HallElement = {
      id: nanoid(),
      ...defaults,
      x: cx - defaults.width / 2 + Math.random() * 40 - 20,
      y: cy - defaults.height / 2 + Math.random() * 40 - 20,
    };

    // Auto-assign next unplaced table
    if (type === "table") {
      const placedTableIds = new Set(elements.filter(e => e.tableId).map(e => e.tableId));
      const nextTable = tables.find(t => !placedTableIds.has(t.id));
      if (nextTable) {
        newEl.tableId = nextTable.id;
        newEl.label = nextTable.name;
        newEl.shape = nextTable.shape;
        // Size based on capacity
        const r = Math.max(30, Math.min(60, 20 + nextTable.capacity * 3));
        newEl.width = r * 2;
        newEl.height = nextTable.shape === "rectangle" ? r * 1.4 : r * 2;
      }
    }

    setElements(prev => [...prev, newEl]);
    setSelectedId(newEl.id);
  }, [hallWidth, hallHeight, elements, tables, nextTableIdx]);

  const updateElement = useCallback((id: string, changes: Partial<HallElement>) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...changes } : el));
  }, []);

  const deleteSelected = useCallback(() => {
    if (!selectedId) return;
    setElements(prev => prev.filter(el => el.id !== selectedId));
    setSelectedId(null);
  }, [selectedId]);

  const rotateSelected = useCallback((deg: number) => {
    if (!selectedId) return;
    setElements(prev => prev.map(el =>
      el.id === selectedId ? { ...el, rotation: (el.rotation + deg) % 360 } : el
    ));
  }, [selectedId]);

  const handleSave = () => {
    saveLayout.mutate(
      { eventId, data: { width: hallWidth, height: hallHeight, elements: elements as any } },
      {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: getGetHallLayoutQueryKey(eventId) });
          toast({ title: "Plani i sallës u ruajt!" });
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
    <div className="space-y-4">
      {/* Top toolbar */}
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <div className="flex flex-wrap gap-2">
          <span className="text-xs font-medium text-muted-foreground self-center pr-1">Shto:</span>
          {TOOLBAR_ITEMS.map(item => (
            <Button
              key={item.type}
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5 border-primary/30 hover:border-primary hover:bg-primary/5"
              onClick={() => addElement(item.type)}
            >
              {item.icon}
              {item.label}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {selectedEl && (
            <>
              <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={() => rotateSelected(15)}>
                <RotateCw className="h-3.5 w-3.5" /> 15°
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-red-500 hover:text-red-600 gap-1.5" onClick={deleteSelected}>
                <Trash2 className="h-3.5 w-3.5" /> Fshi
              </Button>
              <div className="w-px h-6 bg-border" />
            </>
          )}
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setScale(s => Math.min(2, s + 0.1))}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setScale(s => Math.max(0.3, s - 0.1))}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setScale(fitScale)}>
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
          <Button
            onClick={handleSave}
            disabled={saveLayout.isPending}
            className="h-8 bg-primary hover:bg-primary/90 text-white gap-1.5"
            size="sm"
          >
            {saveLayout.isPending
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <Save className="h-3.5 w-3.5" />}
            Ruaj
          </Button>
        </div>
      </div>

      {/* Hall size controls */}
      <div className="flex items-center gap-4 text-sm">
        <span className="text-muted-foreground">Madhësia e sallës:</span>
        <div className="flex items-center gap-1">
          <Label className="text-xs">Gjerësia</Label>
          <Input
            type="number"
            className="h-7 w-20 text-xs"
            value={hallWidth}
            min={200}
            max={2000}
            onChange={e => setHallWidth(Number(e.target.value))}
          />
        </div>
        <div className="flex items-center gap-1">
          <Label className="text-xs">Gjatësia</Label>
          <Input
            type="number"
            className="h-7 w-20 text-xs"
            value={hallHeight}
            min={200}
            max={2000}
            onChange={e => setHallHeight(Number(e.target.value))}
          />
        </div>
        <span className="text-xs text-muted-foreground">(px)</span>
      </div>

      {/* Selected element info */}
      {selectedEl && (
        <div className="flex items-center gap-3 text-xs bg-primary/5 border border-primary/20 rounded-lg px-3 py-2">
          <span className="font-medium text-primary capitalize">{selectedEl.label || selectedEl.type}</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">
            {Math.round(selectedEl.x)}, {Math.round(selectedEl.y)}
          </span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">
            {Math.round(selectedEl.width)} × {Math.round(selectedEl.height)}
          </span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">{Math.round(selectedEl.rotation)}°</span>
          {selectedEl.tableId && tableMap[selectedEl.tableId] && (
            <>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">
                {TABLE_SHAPE_LABELS[selectedEl.shape || "round"]} · {tableMap[selectedEl.tableId].capacity} vende
              </span>
            </>
          )}
        </div>
      )}

      {/* Canvas */}
      <div
        className="border-2 border-dashed border-primary/30 rounded-xl overflow-auto bg-[#FEFAF5] cursor-default"
        style={{ maxHeight: 600 }}
        onClick={() => setSelectedId(null)}
      >
        <div style={{ width: hallWidth * scale, height: hallHeight * scale }}>
          <Stage
            ref={stageRef}
            width={hallWidth * scale}
            height={hallHeight * scale}
            scaleX={scale}
            scaleY={scale}
            onClick={(e) => {
              if (e.target === e.target.getStage()) setSelectedId(null);
            }}
            onTap={(e) => {
              if (e.target === e.target.getStage()) setSelectedId(null);
            }}
          >
            <Layer>
              {/* Hall floor */}
              <Rect
                x={0}
                y={0}
                width={hallWidth}
                height={hallHeight}
                fill="#FEFAF5"
                stroke="#d4c5a9"
                strokeWidth={2}
              />

              {/* Grid dots */}
              {Array.from({ length: Math.floor(hallWidth / 40) }).map((_, xi) =>
                Array.from({ length: Math.floor(hallHeight / 40) }).map((_, yi) => (
                  <Circle
                    key={`${xi}-${yi}`}
                    x={(xi + 1) * 40}
                    y={(yi + 1) * 40}
                    radius={1.5}
                    fill="#d4c5a9"
                    opacity={0.4}
                    listening={false}
                  />
                ))
              )}

              {/* Elements */}
              {elements.map(el => (
                <HallElementShape
                  key={el.id}
                  el={el}
                  isSelected={selectedId === el.id}
                  onSelect={() => setSelectedId(el.id)}
                  onChange={(changes) => updateElement(el.id, changes)}
                  tableName={el.tableId ? tableMap[el.tableId]?.name : undefined}
                />
              ))}
            </Layer>
          </Stage>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        {Object.entries(ELEMENT_COLORS).map(([type, colors]) => (
          <div key={type} className="flex items-center gap-1.5">
            <span
              className="inline-block w-3 h-3 rounded-sm border"
              style={{ background: colors.fill, borderColor: colors.stroke }}
            />
            <span>{TOOLBAR_ITEMS.find(t => t.type === type)?.label || type}</span>
          </div>
        ))}
      </div>

      {/* Unplaced tables hint */}
      {tables.length > 0 && (() => {
        const placedIds = new Set(elements.filter(e => e.tableId).map(e => e.tableId));
        const unplaced = tables.filter(t => !placedIds.has(t.id));
        if (unplaced.length === 0) return null;
        return (
          <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex items-center gap-2">
            <Users className="h-3.5 w-3.5 shrink-0" />
            {unplaced.length} tavolinë pa vendosur: {unplaced.map(t => t.name).join(", ")}
            <span className="text-muted-foreground">· Shtoni "Tavolinë" nga shiriti i sipërm.</span>
          </div>
        );
      })()}
    </div>
  );
}
