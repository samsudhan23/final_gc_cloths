import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ThemeService } from './app/shared/service/theme.service';
import { AuthenticationService } from './app/pages/service/authentication.service';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterModule],
    template: `<router-outlet></router-outlet>`
})
export class AppComponent implements OnInit {
    constructor(
        private auth: AuthenticationService,
        private theme: ThemeService
    ) { }

    ngOnInit(): void {
        const user = this.auth.getCurrentUser(); // for theme

        if (user?.role) {
            this.theme.setRole(user.role); // admin | user
        }
    }
}
