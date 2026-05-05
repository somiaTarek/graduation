import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisitSession } from './visit-session';

describe('VisitSession', () => {
  let component: VisitSession;
  let fixture: ComponentFixture<VisitSession>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisitSession]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisitSession);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
