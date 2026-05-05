import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Recording } from './recording';

describe('Recording', () => {
  let component: Recording;
  let fixture: ComponentFixture<Recording>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Recording]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Recording);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
