// account-form.component.ts
import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';

import { RegisterRequest } from '../../../core/models/user';
import {
  strongPassword,
  egyptianPhone,
  noWhitespace,
  bloodType,
  gender,
} from '../../../core/validators/app.validators';

@Component({
  selector: 'app-account-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './account-form.html',
})
export class AccountForm implements OnInit {
  private fb = inject(FormBuilder);

  @Input() submitLabel = 'Register';
  @Input() isLoading = false;
  @Input() errorMessage = '';
  @Input() showRoleField = false;   // reserved for future role selection UI; currently unused

  @Output() formSubmit = new EventEmitter<RegisterRequest>();

  form!: FormGroup;
  showPassword = false;

  ngOnInit(): void {
    this.form = this.fb.group({
      fullName:         ['', [Validators.required, noWhitespace]],
      email:            ['', [Validators.required, Validators.email]],
      phoneNumber:      ['', [Validators.required, egyptianPhone]],
      dateOfBirth:      [null],                    // optional
      gender:           ['Male', [gender]],
      bloodType:        ['', [bloodType]],         // optional but validated when filled
      allergies:        ['', [noWhitespace]],
      chronicConditions:['', [noWhitespace]],
      insuranceInfo:    ['', [noWhitespace]],
      password:         ['', [Validators.required, strongPassword]],
    });
  }

  get f() { return this.form.controls; }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: RegisterRequest = this.form.getRawValue();
    this.formSubmit.emit(payload);
  }

  reset(): void {
    this.form.reset({
      gender: 'Male',
      dateOfBirth: null,
      bloodType: '',
      allergies: '',
      chronicConditions: '',
      insuranceInfo: ''
    });
  }
}
