/**
 * Collision helpers (generic, no Frogger knowledge)
 * ---------------------------------------------------------------------------
 * AABB = Axis-Aligned Bounding Box: a rectangle that is never rotated.
 * Two such rectangles overlap if they overlap on BOTH the x axis and y axis.
 * It is cheap, simple, and plenty for a game like Frogger.
 */

/**
 * @param {{x:number,y:number,width:number,height:number}} a
 * @param {{x:number,y:number,width:number,height:number}} b
 * @returns {boolean}
 */
export function rectsOverlap(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

/**
 * Returns the first object in `others` that touches `subject`, or null.
 * Both sides just need `active` and `getBounds()` (every GameObject has them).
 * @param {import('./GameObject.js').GameObject} subject
 * @param {import('./GameObject.js').GameObject[]} others
 */
export function findCollision(subject, others) {
  const subjectBounds = subject.getBounds();
  for (const other of others) {
    if (other.active && rectsOverlap(subjectBounds, other.getBounds())) return other;
  }
  return null;
}
