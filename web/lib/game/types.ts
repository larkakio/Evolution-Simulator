export type Vec2 = { x: number; y: number };

export type LevelDef = {
  id: number;
  name: string;
  world: { w: number; h: number };
  spawn: Vec2;
  playerRadius: number;
  nutrientRadius: number;
  portalRadius: number;
  nodes: Vec2[];
  toxins: { c: Vec2; r: number }[];
  evolutionPerNode: number;
  evolutionTarget: number;
  timeSeconds: number | null;
};
