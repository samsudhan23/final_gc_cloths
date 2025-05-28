import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { Landing } from "../../pages/landing/landing";

export const routes: Routes = [
    { path: '', component: Landing }
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class UerRoutingModule { }