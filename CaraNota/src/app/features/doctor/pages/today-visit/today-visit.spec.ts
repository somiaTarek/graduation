import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodayVisit } from './today-visit';

describe('TodayVisit', () => {
  let component: TodayVisit;
  let fixture: ComponentFixture<TodayVisit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodayVisit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TodayVisit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
