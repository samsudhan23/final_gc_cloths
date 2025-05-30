import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { RippleModule } from 'primeng/ripple';
import { StyleClassModule } from 'primeng/styleclass';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { TopbarWidget } from './components/topbarwidget.component';
import { HeroWidget } from './components/herowidget';
import { FeaturesWidget } from './components/featureswidget';
import { HighlightsWidget } from './components/highlightswidget';
import { PricingWidget } from './components/pricingwidget';
import { FooterWidget } from './components/footerwidget';
import { isPlatformBrowser } from '@angular/common';
import { AuthenticationService } from '../service/authentication.service';
import AOS from 'aos';

@Component({
    selector: 'app-landing',
    standalone: true,
    imports: [RouterModule, TopbarWidget, HeroWidget, FeaturesWidget, HighlightsWidget, PricingWidget, FooterWidget, RippleModule, StyleClassModule, ButtonModule, DividerModule],
    template: `
        <div class="bg-surface-0 dark:bg-surface-900">
            <div id="home" class="landing-wrapper overflow-hidden">
                <topbar-widget class="py-6 px-6 mx-0 md:mx-12 lg:mx-20 lg:px-20 flex items-center justify-between relative lg:static" />
                <hero-widget />
                <features-widget />
                <highlights-widget />
                <pricing-widget />
                <footer-widget />
            </div>
        </div>
    `
})
export class Landing {

    constructor(@Inject(PLATFORM_ID) private platformId: Object,
        private auth: AuthenticationService,
        private router: Router
    ) { }

    ngOnInit() {
        const user = this.auth.getCurrentUser();
        if (user?.role === 'admin') {
            this.router.navigate(['/admin']);
        } else if (user?.role === 'user') {
            this.router.navigate(['/user']);
        }
        if (isPlatformBrowser(this.platformId)) {
            AOS.init({ disable: 'mobile', duration: 1200, });
            AOS.refresh();
            // this.changeSlide();
        }

    }
}
