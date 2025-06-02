import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import * as AOS from 'aos';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../../pages/service/authentication.service';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { Carousel } from 'primeng/carousel';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, BadgeModule, AvatarModule, InputTextModule, Carousel, ButtonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  isCartOpen: boolean = false
  cartCount = 0;
  products: any | undefined;

  responsiveOptions: any[] | undefined;

  images: string[] = [
    'assets/images/basic/home1.webp',
    'assets/images/basic/home2.webp',
    'assets/images/basic/home3.webp'
  ];

  constructor(@Inject(PLATFORM_ID) private platformId: Object,
    private auth: AuthenticationService,
    private router: Router
  ) { }

  ngOnInit() {
    // const user = this.auth.getCurrentUser();
    // if (user?.role === 'admin') {
    //   this.router.navigate(['/admin']);
    // } else if (user?.role === 'user') {
    //   this.router.navigate(['/user']);
    // }
    if (isPlatformBrowser(this.platformId)) {
      AOS.init({ disable: 'mobile', duration: 1200, });
      AOS.refresh();
      // this.changeSlide();
    }

    this.responsiveOptions = [
      {
        breakpoint: '1024px',
        numVisible: 1,
        numScroll: 1
      },
      {
        breakpoint: '768px',
        numVisible: 1,
        numScroll: 1
      },
      {
        breakpoint: '560px',
        numVisible: 1,
        numScroll: 1
      }
    ]
  }

  index = 0; // Add this as a property of your component
  maxSlides = 2;
  changeSlide() {
    const slides = document.querySelectorAll(".hero-slide") as NodeListOf<HTMLElement>;

    for (let i = 0; i < slides.length; i++) {
      slides[i].style.display = "none";
    }

    if (this.index < 0) {
      this.index = slides.length - 1;
    }

    if (this.index > slides.length - 1) {
      this.index = 0;
    }

    slides[this.index].style.display = "block";

    this.index++;
    if (this.index >= this.maxSlides) {
      return; // Stop recursion here
    }
    setTimeout(() => this.changeSlide(), 2000);
  }

  toggleCart() {
    this.isCartOpen = !this.isCartOpen;
  }

  // products = [
  //   {
  //     name: 'Kids T-shirts',
  //     price: 450,
  //     image: '../../../../assets/images/Products/t-shirt.avif',
  //     currency: 'INR'
  //   },

  //   {
  //     name: 'Baby Shirt',
  //     price: 599,
  //     image: '../../../../assets/images/Products/1 (2).avif',
  //     currency: 'INR'
  //   },
  //   {
  //     name: 'Shirt',
  //     price: 999,
  //     image: '../../../../assets/images/Products/1 (1).avif',
  //     currency: 'INR'
  //   },
  //   {
  //     name: 'T-Shirt',
  //     price: 399,
  //     image: '../../../../assets/images/Products/2 (1).avif',
  //     currency: 'INR'
  //   },
  //   {
  //     name: 'Baby T-Shirt',
  //     price: 599,
  //     image: '../../../../assets/images/Products/2 (2).avif',
  //     currency: 'INR'
  //   }
  // ];
}
