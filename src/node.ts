export class Node{
    neighbors: { port: number, isAlive: boolean }[] = [];

    addNeighbor(port: number): void {
        this.neighbors.push({ port, isAlive: true });
    }

    removeNeighbor(port: number): void {
        this.neighbors = this.neighbors.filter(neighbor => neighbor.port !== port);
    }

    getNeighbors(): { port: number, isAlive: boolean }[] {
        return this.neighbors;
    }
}