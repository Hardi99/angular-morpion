import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, effect, Inject, inject, Renderer2, untracked } from '@angular/core';
import { MorpionBoardService } from '../morpion-board.service';
import { PeerGameConnectionService } from '../peer-game-connection.service';
import { PieceMove } from '../firestore.service';

@Component({
  selector: 'app-morpion',
  imports: [CommonModule],
  templateUrl: './morpion.component.html',
  standalone: true,
  styleUrl: './morpion.component.scss'
})
export class MorpionComponent {

  private boardService = inject(MorpionBoardService);
  private peerService = inject(PeerGameConnectionService);

  board = this.boardService.board;
  leftPieces = this.boardService.leftPieces;
  rightPieces = this.boardService.rightPieces;
  @Inject(DOCUMENT) private document: Document = inject(DOCUMENT);
  private renderer = inject(Renderer2)

  constructor() {
    effect(() => {
      if(!this.peerService.isDataChannelOn()) return;
      const move = this.peerService.opponentMove?.value();
      if(!move || move.id === '-1') return;
      untracked(() => {
        this.boardService.applyMove(move);
        const winner = this.boardService.checkVictory();
        if (winner) this.showVictoryAnimation(winner);
      })
    })
  }

  /* Grâce à allowDrop, on annule le comportement par défaut et ainsi on superposer le type su le plateau de jeu */
  allowDrop(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent, x: number, y: number) {
    event.preventDefault();
    const type = event.dataTransfer?.getData('type') as 'circle' | 'square';
    const id = event.dataTransfer?.getData('id');
    const fromX = parseInt(event.dataTransfer?.getData('fromX') || '-1');
    const fromY = parseInt(event.dataTransfer?.getData('fromY') || '-1');

    if (this.board()[y][x] === null) {
      const move : PieceMove = {
        id: id || '',
        from: fromX >= 0 && fromY >= 0 ? { x: fromX, y: fromY } : undefined,
        to: { x, y },
        type
      }

      this.boardService.applyMove(move);
      this.peerService.sendMove(move);
      const winner = this.boardService.checkVictory();
      if (winner) this.showVictoryAnimation(winner);
    }
  }

  onDragStart(event: DragEvent, id: string, type: 'circle' | 'square', x?: number, y?: number) {
    event.dataTransfer?.setData('type', type);
    event.dataTransfer?.setData('id', id);
    if (x !== undefined && y !== undefined) {
      event.dataTransfer?.setData('fromX', x.toString());
      event.dataTransfer?.setData('fromY', y.toString());
    }
  }
  
  showVictoryAnimation(winner: 'circle' | 'square'): void {
    const rainContainer = this.renderer.createElement('div');
    this.renderer.addClass(rainContainer, 'victory-rain');

    for (let i = 0; i < 100; i++) {
      const joy = this.renderer.createElement('div');
      this.renderer.addClass(joy, 'joy');
      this.renderer.addClass(joy, winner);

      this.renderer.setStyle(joy, 'left', `${Math.random() * 100}%`);
      this.renderer.setStyle(joy, 'animation-delay', `${Math.random() * 2}s`);

      this.renderer.appendChild(rainContainer, joy);
    }

    this.renderer.appendChild(this.document.body, rainContainer);
  }
}