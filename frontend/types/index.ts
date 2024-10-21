export interface Fountain = {
  floor: number;
  description: string;
};

export interface Building = {
  id: number;
  longitude: number;
  latitude: number;
  name: string;
  fountainCount: number;
  floorCount: number;
};
