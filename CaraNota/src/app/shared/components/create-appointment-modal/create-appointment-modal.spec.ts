import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAppointmentModal } from './create-appointment-modal';

describe('CreateAppointmentModal', () => {
  let component: CreateAppointmentModal;
  let fixture: ComponentFixture<CreateAppointmentModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateAppointmentModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateAppointmentModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
