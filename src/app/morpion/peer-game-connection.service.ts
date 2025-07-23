import { inject, Injectable, Injector, resource, ResourceRef, ResourceStreamItem, runInInjectionContext, Signal, signal } from '@angular/core';
import { FirestoreService, PieceMove } from './firestore.service';

@Injectable({
  providedIn: 'root'
})

export class PeerGameConnectionService {

  private rtcConn!: RTCPeerConnection;
  private dataChannel?: RTCDataChannel;
  private playId!: string;
  private injector = inject(Injector);

  public opponentMove!: ResourceRef<PieceMove | undefined>;
  public isDataChannelOn = signal<boolean>(false)

  constructor(private firestore: FirestoreService) {}

  async createConnection(playId: string): Promise<void> {
    this.playId = playId;
    this.rtcConn = new RTCPeerConnection(configuration);
    this.setupICE();

    this.dataChannel = this.rtcConn.createDataChannel('moves');
    this.setupDataChannel();

    const offer = await this.rtcConn.createOffer();
    await this.rtcConn.setLocalDescription(offer);
    await this.firestore.writeData(`games/${playId}`, {offer})
  }

  // Méthode permettant au joueur 2 de rejoindre la connexion
  async joinConnection(playId: string): Promise<void> {
    this.playId = playId;
    this.rtcConn = new RTCPeerConnection(configuration);
    this.setupICE();

    this.rtcConn.ondatachannel = (event) => {
      this.dataChannel = event.channel;
      this.setupDataChannel();
    }

    const {offer} = await this.firestore.readData(`games/${playId}`)
    await this.rtcConn.setRemoteDescription(offer);

    const answer = await this.rtcConn.createAnswer();
    await this.rtcConn.setLocalDescription(answer);
    await this.firestore.writeData(`games/${playId}`, {offer, answer});
  }

  async completeConnection(): Promise<void> {
    this.firestore.onData(`games/${this.playId}`, async (data) => {
      if (data['answer'] && !this.rtcConn.currentRemoteDescription) {
        await this.rtcConn.setRemoteDescription(data['answer']);
      }
    });
  }

  private setupICE() {
    this.rtcConn.addEventListener('icecandidate', async (event) => {
      if (event.candidate) {
        const iceCandidateData = {
          candidate: event.candidate.candidate,
          sdpMid: event.candidate.sdpMid,
          sdpMLineIndex: event.candidate.sdpMLineIndex
        };
        await this.firestore.writeData(`games/${this.playId}_ice`, {ice: iceCandidateData});
      }
    });

    this.firestore.onData(`games/${this.playId}_ice`, async (data) => {
      if (this.rtcConn.currentRemoteDescription) await this.rtcConn.addIceCandidate(data['ice']);
    });
  }

  /* On écoute l'ouverture du DataChannel et dés qu'il est ouvert, la valeur du signal change */

  private setupDataChannel(): void {
    this.dataChannel?.addEventListener('open', () => {
      this.isDataChannelOn.set(true);
    })

    runInInjectionContext(this.injector, () => {
      this.opponentMove = resource({
        stream: () => {
          return new Promise<Signal<ResourceStreamItem<PieceMove>>>((resolve, reject ) => {
            const lastMove = signal<ResourceStreamItem<PieceMove>>({value:
              {id: '-1', to: {x: -1, y: -1}, type: null}});
            this.dataChannel?.addEventListener('message', (event) => {
              const parsed = JSON.parse(event.data);
              lastMove.set({value: parsed});
            });
            resolve(lastMove);
          })
        }
      })
    })
    /* Si le channel est fermé on fait ceci */
    this.dataChannel?.addEventListener('close', () => {
      this.isDataChannelOn.set(false);
      //this.opponentMove.set(undefined);
    });
  }
  sendMove(move: PieceMove): void{
    this.dataChannel?.send(JSON.stringify(move));
  }
}

export const configuration = {
  iceServers: [
    {
      urls: [
        'stun:stun1.l.google.com:19302',
        'stun:stun2.l.google.com:19302'
      ]
    }
  ],
  iceCandidatePoolSize: 10
}