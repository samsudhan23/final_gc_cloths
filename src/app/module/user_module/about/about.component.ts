import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import AOS from 'aos';
import 'aos/dist/aos.css';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit, OnDestroy {
  @ViewChild('statsSection', { static: true }) statsSection!: ElementRef<HTMLElement>;

  // Counters
  stats = [
    { label: 'Products', value: 2450, current: 0 },
    { label: 'Happy Customers', value: 18500, current: 0 },
    { label: 'Orders Delivered', value: 13240, current: 0 },
    { label: 'Years', value: 7, current: 0 }
  ];

  // Timeline items
  timeline = [
    { year: '2018', title: 'Founded', desc: 'We started with a small catalogue and big dreams.' },
    { year: '2019', title: 'First 10k Orders', desc: 'Reached 10k orders within the first year.' },
    { year: '2021', title: 'Nationwide Shipping', desc: 'Expanded our logistic footprint.' },
    { year: '2023', title: 'New Collections', desc: 'Launched curated private label collections.' }
  ];

  // Team
  team = [
    { name: 'Asha Kumar', role: 'Founder / CEO', bio: 'Product & operations lead. Loves design and coffee.', img: 'assets/images/Avatar/default.jpg' },
    { name: 'Rahul Verma', role: 'CTO', bio: 'Builds scalable systems and APIs.', img: 'assets/images/Avatar/default.jpg' },
    { name: 'Maya Iyer', role: 'Head of Design', bio: 'UX / UI and brand wizard.', img: 'assets/images/Avatar/default.jpg' }
  ];
  selectedMember: any = null;

  // FAQ state
  openFaq = -1;

  // Intersection observer
  private observer?: IntersectionObserver;

  constructor() { }

  ngOnInit(): void {
    // animate stats when visible
    this.setupObserver();
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true,
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  setupObserver() {
    if (!('IntersectionObserver' in window)) {
      // fallback: animate immediately
      this.animateStats();
      return;
    }
    this.observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateStats();
          this.observer?.disconnect();
        }
      });
    }, { threshold: 0.3 });
    if (this.statsSection && this.statsSection.nativeElement) {
      this.observer.observe(this.statsSection.nativeElement);
    } else {
      // fallback
      setTimeout(() => this.animateStats(), 300);
    }
  }

  animateStats() {
    this.stats.forEach(stat => {
      const duration = 1400; // ms
      const start = performance.now();
      const from = 0;
      const to = stat.value;
      const step = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        stat.current = Math.floor(from + (to - from) * this.easeOutCubic(progress));
        if (progress < 1) requestAnimationFrame(step);
        else stat.current = to;
      };
      requestAnimationFrame(step);
    });
  }

  easeOutCubic(t: number) {
    return 1 - Math.pow(1 - t, 3);
  }

  toggleFaq(i: number) {
    this.openFaq = this.openFaq === i ? -1 : i;
  }

  openMember(member: any) {
    this.selectedMember = member;
    // lock body scroll (optional)
    document.body.style.overflow = 'hidden';
  }

  closeMember() {
    this.selectedMember = null;
    document.body.style.overflow = '';
  }

  // newsletter submission (demo)
  onSubscribe(form: NgForm) {
    if (!form.valid) return;
    // demo: show a small confirmation (replace with real API)
    alert('Subscribed! Thanks 🙌');
    form.resetForm();
  }
}
