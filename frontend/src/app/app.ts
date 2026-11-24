import { Component, afterNextRender, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  selector: 'app-root', styleUrl: './app.css', templateUrl: './app.html'
})
export class App {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly auth = this.authService;
  protected readonly mostrarSesion = signal(false);
  protected readonly menuAbierto = signal(false);
  constructor() { afterNextRender(() => this.mostrarSesion.set(true)); }
  protected alternarMenu(): void { this.menuAbierto.update((abierto) => !abierto); }
  protected cerrarMenu(): void { this.menuAbierto.set(false); }
  protected cerrarSesion(): void {
    this.cerrarMenu();
    this.authService.cerrarSesion();
    void this.router.navigate(['/login']);
  }
}