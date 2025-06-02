import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UerRoutingModule } from './user-routing.module';
// import { Landing } from '../../pages/landing/landing';
import { ShopComponent } from './shop/shop.component';
import { HomeComponent } from './home/home.component';


@NgModule({

    imports: [
        CommonModule,
        UerRoutingModule,
        // Landing,
        HomeComponent,
        ShopComponent
    ]
})
export class UserModule { }
