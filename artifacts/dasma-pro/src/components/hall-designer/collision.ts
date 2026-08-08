import { HallElement, AlignmentLine, CollisionInfo } from "./types";

export function detectCollisions(
  elements: HallElement[],
  hallWidth: number,
  hallHeight: number
): CollisionInfo[] {
  const collisions: CollisionInfo[] = [];

  for (let i = 0; i < elements.length; i++) {
    const el1 = elements[i];
    const label1 = el1.label || el1.type;

    // Check boundary collision
    if (
      el1.x < 0 ||
      el1.y < 0 ||
      el1.x + el1.width > hallWidth ||
      el1.y + el1.height > hallHeight
    ) {
      collisions.push({
        element1Id: el1.id,
        element2Id: "boundary",
        element1Label: label1,
        element2Label: "Kufijtë e Sallës",
      });
    }

    // Check overlap with other elements
    for (let j = i + 1; j < elements.length; j++) {
      const el2 = elements[j];
      const label2 = el2.label || el2.type;

      // Axis-Aligned Bounding Box (AABB) overlap check
      const margin = 5; // buffer margin
      const overlapX = el1.x < el2.x + el2.width - margin && el1.x + el1.width - margin > el2.x;
      const overlapY = el1.y < el2.y + el2.height - margin && el1.y + el1.height - margin > el2.y;

      if (overlapX && overlapY) {
        collisions.push({
          element1Id: el1.id,
          element2Id: el2.id,
          element1Label: label1,
          element2Label: label2,
        });
      }
    }
  }

  return collisions;
}

export function calculateAlignmentGuides(
  targetEl: HallElement,
  elements: HallElement[],
  snapThreshold: number = 8
): { snappedX: number; snappedY: number; guides: AlignmentLine[] } {
  let snappedX = targetEl.x;
  let snappedY = targetEl.y;
  const guides: AlignmentLine[] = [];

  const targetCenterX = targetEl.x + targetEl.width / 2;
  const targetCenterY = targetEl.y + targetEl.height / 2;
  const targetLeft = targetEl.x;
  const targetRight = targetEl.x + targetEl.width;
  const targetTop = targetEl.y;
  const targetBottom = targetEl.y + targetEl.height;

  for (const other of elements) {
    if (other.id === targetEl.id) continue;

    const otherCenterX = other.x + other.width / 2;
    const otherCenterY = other.y + other.height / 2;
    const otherLeft = other.x;
    const otherRight = other.x + other.width;
    const otherTop = other.y;
    const otherBottom = other.y + other.height;

    // Center X alignment
    if (Math.abs(targetCenterX - otherCenterX) < snapThreshold) {
      snappedX = otherCenterX - targetEl.width / 2;
      guides.push({ type: "vertical", value: otherCenterX, label: "Qendra X" });
    }
    // Center Y alignment
    if (Math.abs(targetCenterY - otherCenterY) < snapThreshold) {
      snappedY = otherCenterY - targetEl.height / 2;
      guides.push({ type: "horizontal", value: otherCenterY, label: "Qendra Y" });
    }

    // Left to Left
    if (Math.abs(targetLeft - otherLeft) < snapThreshold) {
      snappedX = otherLeft;
      guides.push({ type: "vertical", value: otherLeft });
    }

    // Right to Right
    if (Math.abs(targetRight - otherRight) < snapThreshold) {
      snappedX = otherRight - targetEl.width;
      guides.push({ type: "vertical", value: otherRight });
    }

    // Top to Top
    if (Math.abs(targetTop - otherTop) < snapThreshold) {
      snappedY = otherTop;
      guides.push({ type: "horizontal", value: otherTop });
    }

    // Bottom to Bottom
    if (Math.abs(targetBottom - otherBottom) < snapThreshold) {
      snappedY = otherBottom - targetEl.height;
      guides.push({ type: "horizontal", value: otherBottom });
    }
  }

  return { snappedX, snappedY, guides };
}
