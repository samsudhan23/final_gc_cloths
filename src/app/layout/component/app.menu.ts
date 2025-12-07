import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        <ng-container *ngFor="let item of model; let i = index">
            <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
            <li *ngIf="item.separator" class="menu-separator"></li>
        </ng-container>
    </ul> `
})
export class AppMenu {
    model: MenuItem[] = [];

    ngOnInit() {
        this.model = [
            {
                label: 'Admin Panel',
                items: [
                    { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/admin/dashboard'] }
                ]
            },
            {
                label: 'Management',
                items: [
                    { label: 'User Management', icon: 'pi pi-fw pi-user', routerLink: ['/admin/users'] },
                    { label: 'Category', icon: 'pi pi-fw pi-bars', routerLink: ['/admin/category'] },
                    { label: 'Gender', icon: 'pi pi-fw pi-users', routerLink: ['/admin/gender'] },
                    { label: 'Product Variants', icon: 'pi pi-fw pi-box', routerLink: ['/admin/productVariant'] },
                    { label: 'Product Management', icon: 'pi pi-fw pi-shopping-cart', routerLink: ['/admin/products'] },
                    { label: 'Warehouse', icon: 'pi pi-fw pi-warehouse', routerLink: ['/admin/warehouse'] },
                    { label: 'Supplier Management', icon: 'pi pi-fw pi-briefcase', routerLink: ['/admin/supplier'] },
                    { label: 'Purchase Order', icon: 'pi pi-fw pi-receipt', routerLink: ['/admin/purchase-order'] },

                ]
            },
            {
                label: 'Customer Activity',
                items: [
                    { label: 'Wishlists', icon: 'pi pi-fw pi-heart', routerLink: ['/admin/wishlist'] },
                    { label: 'Cart', icon: 'pi pi-fw pi-shopping-cart', routerLink: ['/admin/Cart'] },
                    { label: 'Order Management', icon: 'pi pi-fw pi-truck', routerLink: ['/admin/orders'] },
                    { label: 'Delivery Address', icon: 'pi pi-fw pi-map-marker', routerLink: ['/admin/delivery'] }
                ]
            }
            // {
            //     label: 'UI Components',
            //     items: [
            //         { label: 'Form Layout', icon: 'pi pi-fw pi-id-card', routerLink: ['/uikit/formlayout'] },
            //         { label: 'Input', icon: 'pi pi-fw pi-check-square', routerLink: ['/uikit/input'] },
            //         { label: 'Button', icon: 'pi pi-fw pi-mobile', class: 'rotated-icon', routerLink: ['/uikit/button'] },
            //         { label: 'Table', icon: 'pi pi-fw pi-table', routerLink: ['/uikit/table'] },
            //         { label: 'List', icon: 'pi pi-fw pi-list', routerLink: ['/uikit/list'] },
            //         { label: 'Tree', icon: 'pi pi-fw pi-share-alt', routerLink: ['/uikit/tree'] },
            //         { label: 'Panel', icon: 'pi pi-fw pi-tablet', routerLink: ['/uikit/panel'] },
            //         { label: 'Overlay', icon: 'pi pi-fw pi-clone', routerLink: ['/uikit/overlay'] },
            //         { label: 'Media', icon: 'pi pi-fw pi-image', routerLink: ['/uikit/media'] },
            //         { label: 'Menu', icon: 'pi pi-fw pi-bars', routerLink: ['/uikit/menu'] },
            //         { label: 'Message', icon: 'pi pi-fw pi-comment', routerLink: ['/uikit/message'] },
            //         { label: 'File', icon: 'pi pi-fw pi-file', routerLink: ['/uikit/file'] },
            //         { label: 'Chart', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/uikit/charts'] },
            //         { label: 'Timeline', icon: 'pi pi-fw pi-calendar', routerLink: ['/uikit/timeline'] },
            //         { label: 'Misc', icon: 'pi pi-fw pi-circle', routerLink: ['/uikit/misc'] }
            //     ]
            // },

        ];
    }
}
