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

@Component({
  selector: 'app-account-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './account-form.html',
})
export class AccountForm implements OnInit {
  private fb = inject(FormBuilder);

  /**
   * Text displayed on the submit button.
   * Default: 'Register' — receptionist side can pass 'Create Patient Account', etc.
   */
  @Input() submitLabel = 'Register';

  /**
   * Show spinner on the button while the parent is awaiting the API call.
   */
  @Input() isLoading = false;

  /**
   * Error message to display below the form (set by parent after API error).
   */
  @Input() errorMessage = '';

  /**
   * When true, a role <select> is rendered so the receptionist can pick any role.
   * On the public /register page this stays false — role is hardcoded to 'patient'.
   */
  @Input() showRoleField = false;

  /**
   * Emits the validated form payload upward so the parent page can call the API.
   */
  @Output() formSubmit = new EventEmitter<RegisterRequest>();

  form!: FormGroup;
  showPassword = false;

  ngOnInit(): void {
    this.form = this.fb.group({
      fullName:    ['', [Validators.required]],
      email:       ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required]],
      gender:      ['Male'],  // optional — pre-select Male to match design
      password:    ['', [Validators.required, Validators.minLength(8)]],
      // Role is always 'patient' on public register; receptionist view overrides via showRoleField
      role:        [{ value: 'patient', disabled: !this.showRoleField },
                    this.showRoleField ? Validators.required : []],
    });
  }

  /** Convenience accessor used in the template. */
  get f() { return this.form.controls; }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // getRawValue() includes disabled controls (role when !showRoleField)
    const payload: RegisterRequest = this.form.getRawValue();
    this.formSubmit.emit(payload);
  }

  /**
   * Called by the parent to reset the form (e.g., after successful submission).
   */
  reset(): void {
    this.form.reset({ gender: 'Male', role: 'patient' });
  }
}
