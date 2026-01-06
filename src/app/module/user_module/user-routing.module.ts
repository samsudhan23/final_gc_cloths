import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { HomeComponent } from "./home/home.component";
import { LayoutComponent } from "./layout/layout.component";
import { ProductDetailsComponent } from "./product-details.component/product-details.component.component";
import { ContactusComponent } from "./contactus/contactus.component";
import { AboutComponent } from "./about/about.component";
import { UserProfileComponent } from "./user-profile/user-profile.component";
import { UserWishlistComponent } from "./user-wishlist/user-wishlist.component";
import { UserCartComponent } from "./user-cart/user-cart.component";
import { CategorywiseproductComponent } from "./categorywiseproduct/categorywiseproduct.component";
import { ViewOrderPageComponent } from "./view-order-page/view-order-page.component";
import { PrivacypolicyComponent } from "./policy/privacypolicy/privacypolicy.component";
import { TermsconditionComponent } from "./policy/termscondition/termscondition.component";
import { ReturnpolicyComponent } from "./policy/returnpolicy/returnpolicy.component";
import { RefundpolicyComponent } from "./policy/refundpolicy/refundpolicy.component";
import { AllproductsComponent } from "./allproducts/allproducts.component";
// import { UserLayoutComponent } from "./user-layout/user-layout.component";

export const routes: Routes = [
    {
        // path: '', component: UserLayoutComponent,
        path: '', component: LayoutComponent,
        children: [
            { path: '', redirectTo: 'home', pathMatch: 'full' },
            { path: 'home', component: HomeComponent },
            { path: 'product-details/:productId', component: ProductDetailsComponent },
            { path: 'contactus', component: ContactusComponent },
            { path: 'about', component: AboutComponent },
            { path: 'user-profile', component: UserProfileComponent },
            { path: 'view-order/:orderId', component: ViewOrderPageComponent },
            { path: 'wishlist', component: UserWishlistComponent },
            { path: 'cart', component: UserCartComponent },
            // { path: 'categorywiseproduct/:genderName', component: CategorywiseproductComponent },
            { path: 'categorywiseproduct', component: CategorywiseproductComponent },
            {
                path: 'shop',
                loadComponent: () => import('./shop/shop.component').then(m => m.ShopComponent)
            },

            //Newly Added
            { path: 'productlists/:categoryName', component: AllproductsComponent },
            { path: 'productlists', component: AllproductsComponent },
            { path: 'privacypolicy', component: PrivacypolicyComponent },
            { path: 'termsconditions', component: TermsconditionComponent },
            { path: 'returnpolicy', component: ReturnpolicyComponent },
            { path: 'refundpolicy', component: RefundpolicyComponent },

        ]
    },
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class UerRoutingModule { }