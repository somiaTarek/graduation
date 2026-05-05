import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DoctorNavbar} from '../../../../layout/doctor-layout/doctor-navbar/doctor-navbar';


@Component({
  selector: 'app-doctor-dashboard',
  imports: [
    RouterModule ,
    DoctorNavbar

  ],
  templateUrl: './doctor-dashboard.html',
  styleUrl: './doctor-dashboard.css',
})
export class DoctorDashboard {

}
