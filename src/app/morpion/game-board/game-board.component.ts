import { Component, inject, input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PeerGameConnectionService } from '../peer-game-connection.service';
import { MorpionComponent } from "../morpion/morpion.component";

@Component({
  selector: 'app-game-board',
  imports: [MorpionComponent],
  templateUrl: './game-board.component.html',
  standalone: true,
  styleUrl: './game-board.component.scss'
})
export class GameBoardComponent {

  private route = inject(ActivatedRoute);
  private rtc = inject(PeerGameConnectionService)

  async ngOnInit() {
    const playId = this.route.snapshot.queryParamMap.get('playId');
    if (playId) await this.rtc.joinConnection(playId);
    else {
      const newPlayId = crypto.randomUUID();
      console.log('Play ID:', newPlayId);
      await this.rtc.createConnection(newPlayId);
    }
    await this.rtc.completeConnection();
  }
}
