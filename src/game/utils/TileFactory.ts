import { TileData, TileType } from '../types/GameState';

export class TileFactory {
    private static tileIdCounter = 0;

    public static createAllTileTypes(): TileData[] {
        const tiles: TileData[] = [];

        // Add 26 letters (A-Z)
        for (let i = 0; i < 26; i++) {
            const letter = String.fromCharCode(65 + i); // A = 65
            tiles.push(this.createTile('letter', letter));
        }

        // Add 10 numbers (0-9)
        for (let i = 0; i < 10; i++) {
            tiles.push(this.createTile('number', i.toString()));
        }

        // Add 6 symbols (@!#$%^)
        const symbols = ['@', '!', '#', '$', '%', '^'];
        symbols.forEach(symbol => {
            tiles.push(this.createTile('symbol', symbol));
        });

        return tiles;
    }

    public static createTile(type: TileType, value: string): TileData {
        return {
            id: `tile_${++this.tileIdCounter}`,
            type,
            value,
            isPlaced: false
        };
    }

    public static shuffleArray<T>(array: T[]): T[] {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    public static drawRandomTiles(pool: TileData[], count: number): TileData[] {
        if (count > pool.length) {
            return [...pool]; // Return all if requesting more than available
        }

        const shuffled = this.shuffleArray(pool);
        return shuffled.slice(0, count);
    }
}