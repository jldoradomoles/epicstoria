export interface LevelInfo {
  name: string;
  minPoints: number;
  minStars: number;
  index: number;
}

export const LEVELS: LevelInfo[] = [
  { name: 'Aprendiz del Tiempo', minPoints: 0, minStars: 0, index: 0 },
  { name: 'Cronista de Bronce', minPoints: 100, minStars: 1, index: 1 },
  { name: 'Explorador de Plata', minPoints: 200, minStars: 2, index: 2 },
  { name: 'Guardián de Oro III', minPoints: 300, minStars: 3, index: 3 },
  { name: 'Guardián de Oro II', minPoints: 500, minStars: 5, index: 4 },
  { name: 'Guardián de Oro I', minPoints: 700, minStars: 7, index: 5 },
  { name: 'Maestro Zafiro', minPoints: 900, minStars: 9, index: 6 },
  { name: 'Sabio Rubí III', minPoints: 1100, minStars: 11, index: 7 },
  { name: 'Sabio Rubí II', minPoints: 1300, minStars: 13, index: 8 },
  { name: 'Sabio Rubí I', minPoints: 1600, minStars: 16, index: 9 },
  { name: 'Conquistador Esmeralda', minPoints: 1900, minStars: 19, index: 10 },
  { name: 'Señor Diamante III', minPoints: 2200, minStars: 22, index: 11 },
  { name: 'Señor Diamante II', minPoints: 2500, minStars: 25, index: 12 },
  { name: 'Señor Diamante I', minPoints: 2800, minStars: 28, index: 13 },
  { name: 'Leyenda Temporal III', minPoints: 3200, minStars: 32, index: 14 },
  { name: 'Leyenda Temporal II', minPoints: 3600, minStars: 36, index: 15 },
  { name: 'Leyenda Temporal I', minPoints: 4000, minStars: 40, index: 16 },
  { name: 'Arquitecto del Tiempo: Titán', minPoints: 4500, minStars: 45, index: 17 },
  { name: 'Arquitecto del Tiempo: Leyenda', minPoints: 5000, minStars: 50, index: 18 },
];

export function calculateLevel(points: number): string {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (points >= LEVELS[i].minPoints) {
      return LEVELS[i].name;
    }
  }
  return LEVELS[0].name;
}

export function getLevelInfo(points: number): LevelInfo {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (points >= LEVELS[i].minPoints) {
      return LEVELS[i];
    }
  }
  return LEVELS[0];
}
