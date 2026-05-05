import { AccountForm } from '../../../../shared/components/account-form/account-form';
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { RegisterRequest } from '../../../../core/models/user';
@Component({
  selector: 'app-register',
  imports: [AccountForm],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {

  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = false;
  errorMessage = '';

  onRegister(payload: RegisterRequest): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.register(payload).subscribe({
      next: () => {
        this.isLoading = false;
        // After successful registration, send the new patient to login
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage =
          err?.error?.message ??
          err?.error ??
          'Registration failed. Please check your details and try again.';
      },
    });
  }
}

