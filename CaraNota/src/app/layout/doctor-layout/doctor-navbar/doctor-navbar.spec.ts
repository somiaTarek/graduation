import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorNavbar } from './doctor-navbar';

describe('DoctorNavbar', () => {
  let component: DoctorNavbar;
  let fixture: ComponentFixture<DoctorNavbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorNavbar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorNavbar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
