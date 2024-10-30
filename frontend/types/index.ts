export interface Fountain {
  id: string;
  longitude: number;
  latitude: number;
  floor: number;
  hasBottleFiller: boolean;
  description: string;
  buildingId: string;
};

export interface Building {
  id: number;
  longitude: number;
  latitude: number;
  name: string;
  fountainCount: number;
  floorCount: number;
};
