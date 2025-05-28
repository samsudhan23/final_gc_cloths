import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UerRoutingModule } from './user-routing.module';
import { Landing } from '../../pages/landing/landing';


@NgModule({

    imports: [
        CommonModule,
        UerRoutingModule,
        Landing
    ]
})
export class UserModule { }
