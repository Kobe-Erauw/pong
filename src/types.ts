export type Position = { x: number, y: number };
export type Size = { h: number, w: number };
export type PalletDirection = "up" | "down" | "none"
export type Speed = { dx: number, dy: number };
export type CanvasSide = "left" | "right" | "top" | "bottom" | null;
export type  Direction = { x: number, y: number };
export type HighScore = { name: string, score: number, date: string | null };
export type HighScoreData = { score: number, date: string };