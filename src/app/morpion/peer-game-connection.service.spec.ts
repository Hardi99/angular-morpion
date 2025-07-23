import { TestBed } from '@angular/core/testing';

import { PeerGameConnectionService } from './peer-game-connection.service';

describe('PeerGameConnectionService', () => {
  let service: PeerGameConnectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PeerGameConnectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
