import { Injectable, signal } from '@angular/core';
import { PieceMove } from './firestore.service';

@Injectable({
  providedIn: 'root'
})

export class MorpionBoardService {

  board = signal<('circle' | 'square' | null )[][]>(
    Array.from({length: 3}, () => Array(3).fill(null))
  );

  leftPieces = signal([
    { id: 'c1', type: 'circle', placed: false },
    { id: 'c2', type: 'circle', placed: false },
    { id: 'c3', type: 'circle', placed: false },
  ])

  rightPieces = signal([
    { id: 's1', type: 'square', placed: false },
    { id: 's2', type: 'square', placed: false },
    { id: 's3', type: 'square', placed: false },
  ]);

  constructor() { }

  applyMove(move: PieceMove): void {
    const board = this.board();
    if (move.from) {
      board[move.from.y][move.from.x] = null;
    } else {
      const list = move.type === 'circle' ? this.leftPieces() : this.rightPieces();
      const piece = list.find(p => p.id === move.id);
      if (piece) piece.placed = true;
    }
    board[move.to.y][move.to.x] = move.type;
    this.board.set([...board.map(row => [...row])]);
  }

  /* checkVictory nous avertit de qui gagne entre les cercles et les carrés */
  checkVictory(): 'circle' | 'square' | null {
    const b = this.board();

    const lines = [
      [[0, 0], [0, 1], [0, 2]], // Ligne 1
      [[1, 0], [1, 1], [1, 2]], // Ligne 2
      [[2, 0], [2, 1], [2, 2]], // Ligne 3
      [[0, 0], [1, 0], [2, 0]], // Colonne 1
      [[0, 1], [1, 1], [2, 1]], // Colonne 2
      [[0, 2], [1, 2], [2, 2]], // Colonne 3
      [[0, 0], [1, 1], [2, 2]], // Diagonale principale
      [[0, 2], [1, 1], [2, 0]] // Diagonale secondaire
    ]

    for (const [[a1, a2], [b1, b2], [c1, c2]] of lines ) {
      const va = b[a1][a2], vb = b[b1][b2], vc = b[c1][c2];
      if (va && va === vb && va === vc) return va;
    }
    return null; // Implement victory check logic here
  }
}
