import { Routes } from '@angular/router';
import { GameBoardComponent } from './morpion/game-board/game-board.component';

export const routes: Routes = [
    {
        path: 'morpion',
        component: GameBoardComponent
    },
    {
        path: '',
        redirectTo: 'morpion', 
        pathMatch: 'full'
    }
];
