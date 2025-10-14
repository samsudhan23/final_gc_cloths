import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UerRoutingModule } from './user-routing.module';
// import { Landing } from '../../pages/landing/landing';
import { ShopComponent } from './shop/shop.component';
import { HomeComponent } from './home/home.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { UserWishlistComponent } from './user-wishlist/user-wishlist.component';
import { UserCartComponent } from './user-cart/user-cart.component';


@NgModule({

    imports: [
        CommonModule,
        UerRoutingModule,
        // Landing,
        HomeComponent,
        UserProfileComponent,
        ShopComponent,
        UserWishlistComponent,
        UserCartComponent
    ]
})
export class UserModule { }
