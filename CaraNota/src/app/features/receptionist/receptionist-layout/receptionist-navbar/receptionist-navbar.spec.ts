import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceptionistNavbar } from './receptionist-navbar';

describe('ReceptionistNavbar', () => {
  let component: ReceptionistNavbar;
  let fixture: ComponentFixture<ReceptionistNavbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceptionistNavbar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReceptionistNavbar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
