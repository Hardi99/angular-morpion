import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MorpionComponent } from './morpion.component';

describe('MorpionComponent', () => {
  let component: MorpionComponent;
  let fixture: ComponentFixture<MorpionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MorpionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MorpionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
