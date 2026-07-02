export const RECTANGLE_COLOR = {
    red: "255, 0, 0",
    blue:"0, 0, 255",
    green:"0, 128, 0"
};
export const CANVAS_COLORS = { blue: "#0000ff", black: "#000000" };
export const ROTATE_SPEED = 0.04;

export enum CanvasState {
  idle = "idle",
  drawing = "drawing",
  moving = "moving",
  rotating = "rotating",
  drag = "drag",
}
