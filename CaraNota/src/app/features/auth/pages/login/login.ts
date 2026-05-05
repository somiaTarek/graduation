// login.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {
  private fb          = inject(FormBuilder);
  private authService = inject(AuthService);

  isLoading    = false;
  errorMessage = '';
  showPassword = false;

  loginForm: FormGroup = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  get email()    { return this.loginForm.get('email')!; }
  get password() { return this.loginForm.get('password')!; }

  onSubmit(): void {
    if (this.loginForm.invalid) { this.loginForm.markAllAsTouched(); return; }
    this.isLoading    = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        this.isLoading = false;
        const role = res?.user?.role;
        if (role) {
          this.authService.redirectByRole(role);
        } else {
          this.errorMessage = 'Unable to determine user role.';
        }
      },
      error: (err) => {
        this.isLoading    = false;
        this.errorMessage = err?.error?.message ?? err?.error ?? 'Invalid email or password.';
      },
    });
  }
}
