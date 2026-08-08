import { SeatInfo, TableShape, SeatsPerSide } from "./types";

export function calculateSeatPositions(
  width: number,
  height: number,
  shape: TableShape | string = "round",
  chairsCount: number = 8,
  seatsPerSide?: SeatsPerSide,
  currentSeats: SeatInfo[] = []
): SeatInfo[] {
  const count = Math.max(1, Math.min(60, chairsCount));
  const offset = 18; // Distance from table edge to chair center
  const seats: SeatInfo[] = [];

  // Existing assigned guests lookup by seat number
  const assignedMap = new Map<number, { guestId?: number | null; guestName?: string | null; guestCategory?: string | null }>();
  currentSeats.forEach((s) => {
    if (s.guestId || s.guestName) {
      assignedMap.set(s.seatNumber, {
        guestId: s.guestId,
        guestName: s.guestName,
        guestCategory: s.guestCategory,
      });
    }
  });

  if (shape === "round") {
    const r = width / 2;
    const chairDist = r + offset;
    for (let i = 0; i < count; i++) {
      const seatNum = i + 1;
      const angle = (i * 2 * Math.PI) / count - Math.PI / 2;
      const cx = Math.cos(angle) * chairDist;
      const cy = Math.sin(angle) * chairDist;
      const angleDeg = (angle * 180) / Math.PI;

      const existing = assignedMap.get(seatNum);
      seats.push({
        seatNumber: seatNum,
        x: Math.round(cx * 10) / 10,
        y: Math.round(cy * 10) / 10,
        rotation: Math.round(((angleDeg + 90) % 360) * 10) / 10,
        status: existing?.guestId || existing?.guestName ? "assigned" : "empty",
        guestId: existing?.guestId ?? null,
        guestName: existing?.guestName ?? null,
        guestCategory: existing?.guestCategory ?? null,
      });
    }
  } else if (shape === "oval") {
    const rx = width / 2;
    const ry = height / 2;
    const chairDistX = rx + offset;
    const chairDistY = ry + offset;
    for (let i = 0; i < count; i++) {
      const seatNum = i + 1;
      const angle = (i * 2 * Math.PI) / count - Math.PI / 2;
      const cx = Math.cos(angle) * chairDistX;
      const cy = Math.sin(angle) * chairDistY;
      const angleToCenter = Math.atan2(-cy, -cx) * (180 / Math.PI);

      const existing = assignedMap.get(seatNum);
      seats.push({
        seatNumber: seatNum,
        x: Math.round(cx * 10) / 10,
        y: Math.round(cy * 10) / 10,
        rotation: Math.round(((angleToCenter - 90 + 360) % 360) * 10) / 10,
        status: existing?.guestId || existing?.guestName ? "assigned" : "empty",
        guestId: existing?.guestId ?? null,
        guestName: existing?.guestName ?? null,
        guestCategory: existing?.guestCategory ?? null,
      });
    }
  } else if (shape === "long_banquet") {
    // Long banquet table: seats primarily along top and bottom long sides, plus 1 on each narrow end
    const hw = width / 2;
    const hh = height / 2;

    const hasEndSeats = count >= 4;
    const sideCountTotal = hasEndSeats ? count - 2 : count;
    const countTop = Math.ceil(sideCountTotal / 2);
    const countBottom = Math.floor(sideCountTotal / 2);

    let seatNum = 1;

    // Top edge (rot = 0)
    for (let i = 0; i < countTop; i++) {
      const step = width / (countTop + 1);
      const x = -hw + step * (i + 1);
      const existing = assignedMap.get(seatNum);
      seats.push({
        seatNumber: seatNum,
        x: Math.round(x * 10) / 10,
        y: -hh - offset,
        rotation: 0,
        status: existing?.guestId || existing?.guestName ? "assigned" : "empty",
        guestId: existing?.guestId ?? null,
        guestName: existing?.guestName ?? null,
        guestCategory: existing?.guestCategory ?? null,
      });
      seatNum++;
    }

    // Right end seat (rot = 270)
    if (hasEndSeats) {
      const existing = assignedMap.get(seatNum);
      seats.push({
        seatNumber: seatNum,
        x: hw + offset,
        y: 0,
        rotation: 270,
        status: existing?.guestId || existing?.guestName ? "assigned" : "empty",
        guestId: existing?.guestId ?? null,
        guestName: existing?.guestName ?? null,
        guestCategory: existing?.guestCategory ?? null,
      });
      seatNum++;
    }

    // Bottom edge (rot = 180)
    for (let i = countBottom - 1; i >= 0; i--) {
      const step = width / (countBottom + 1);
      const x = -hw + step * (i + 1);
      const existing = assignedMap.get(seatNum);
      seats.push({
        seatNumber: seatNum,
        x: Math.round(x * 10) / 10,
        y: hh + offset,
        rotation: 180,
        status: existing?.guestId || existing?.guestName ? "assigned" : "empty",
        guestId: existing?.guestId ?? null,
        guestName: existing?.guestName ?? null,
        guestCategory: existing?.guestCategory ?? null,
      });
      seatNum++;
    }

    // Left end seat (rot = 90)
    if (hasEndSeats) {
      const existing = assignedMap.get(seatNum);
      seats.push({
        seatNumber: seatNum,
        x: -hw - offset,
        y: 0,
        rotation: 90,
        status: existing?.guestId || existing?.guestName ? "assigned" : "empty",
        guestId: existing?.guestId ?? null,
        guestName: existing?.guestName ?? null,
        guestCategory: existing?.guestCategory ?? null,
      });
      seatNum++;
    }
  } else {
    // Square or Rectangle
    const hw = width / 2;
    const hh = height / 2;

    let countTop = seatsPerSide?.top;
    let countRight = seatsPerSide?.right;
    let countBottom = seatsPerSide?.bottom;
    let countLeft = seatsPerSide?.left;

    if (countTop === undefined || countRight === undefined || countBottom === undefined || countLeft === undefined) {
      const ratioW = width / (width + height);
      countTop = Math.max(1, Math.round((count / 2) * ratioW));
      countBottom = countTop;
      const remaining = Math.max(0, count - countTop - countBottom);
      countRight = Math.max(0, Math.round(remaining / 2));
      countLeft = Math.max(0, remaining - countRight);
    }

    let seatNum = 1;

    // Top edge (facing down -> rot = 0)
    for (let i = 0; i < countTop; i++) {
      const step = width / (countTop + 1);
      const x = -hw + step * (i + 1);
      const existing = assignedMap.get(seatNum);
      seats.push({
        seatNumber: seatNum,
        x: Math.round(x * 10) / 10,
        y: -hh - offset,
        rotation: 0,
        status: existing?.guestId || existing?.guestName ? "assigned" : "empty",
        guestId: existing?.guestId ?? null,
        guestName: existing?.guestName ?? null,
        guestCategory: existing?.guestCategory ?? null,
      });
      seatNum++;
    }

    // Right edge (facing left -> rot = 270)
    for (let i = 0; i < countRight; i++) {
      const step = height / (countRight + 1);
      const y = -hh + step * (i + 1);
      const existing = assignedMap.get(seatNum);
      seats.push({
        seatNumber: seatNum,
        x: hw + offset,
        y: Math.round(y * 10) / 10,
        rotation: 270,
        status: existing?.guestId || existing?.guestName ? "assigned" : "empty",
        guestId: existing?.guestId ?? null,
        guestName: existing?.guestName ?? null,
        guestCategory: existing?.guestCategory ?? null,
      });
      seatNum++;
    }

    // Bottom edge (facing up -> rot = 180)
    for (let i = countBottom - 1; i >= 0; i--) {
      const step = width / (countBottom + 1);
      const x = -hw + step * (i + 1);
      const existing = assignedMap.get(seatNum);
      seats.push({
        seatNumber: seatNum,
        x: Math.round(x * 10) / 10,
        y: hh + offset,
        rotation: 180,
        status: existing?.guestId || existing?.guestName ? "assigned" : "empty",
        guestId: existing?.guestId ?? null,
        guestName: existing?.guestName ?? null,
        guestCategory: existing?.guestCategory ?? null,
      });
      seatNum++;
    }

    // Left edge (facing right -> rot = 90)
    for (let i = countLeft - 1; i >= 0; i--) {
      const step = height / (countLeft + 1);
      const y = -hh + step * (i + 1);
      const existing = assignedMap.get(seatNum);
      seats.push({
        seatNumber: seatNum,
        x: -hw - offset,
        y: Math.round(y * 10) / 10,
        rotation: 90,
        status: existing?.guestId || existing?.guestName ? "assigned" : "empty",
        guestId: existing?.guestId ?? null,
        guestName: existing?.guestName ?? null,
        guestCategory: existing?.guestCategory ?? null,
      });
      seatNum++;
    }
  }

  return seats;
}
