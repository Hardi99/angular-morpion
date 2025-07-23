import { TestBed } from '@angular/core/testing';

import { MorpionBoardService } from './morpion-board.service';

describe('MorpionBoardService', () => {
  let service: MorpionBoardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MorpionBoardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
