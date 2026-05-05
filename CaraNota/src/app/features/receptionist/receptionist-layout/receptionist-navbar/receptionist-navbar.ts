// src/app/features/receptionist/layout/receptionist-navbar/receptionist-navbar.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-receptionist-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './receptionist-navbar.html',
})
export class ReceptionistNavbar {
  private authService = inject(AuthService);

  get userName(): string {
    return (this.authService as any)['currentUserSubject']?.value?.name ?? 'Mia';
  }

  logout(): void {
    this.authService.logout();
  }
}
