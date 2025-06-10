import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';
import { DashboardComponent } from './components/dashboard/dashboard.component';

@NgModule({

    imports: [
        CommonModule,
        AdminRoutingModule,
        DashboardComponent
    ]
})
export class AdminModule { }
