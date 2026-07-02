
export interface Vector {
  x: number;
  y: number;
}

export interface FigureData {
    vertices: Vector[];
    rotation: number;
    fillColor: string;
}

export interface ChangedCanvasCharacter {
  characterId: number;
  canvas: FigureData[];
}
