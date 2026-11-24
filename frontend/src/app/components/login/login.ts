import { Component, inject, signal } from '@angular/core';
import { FormField, FormRoot, email, form, required } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../services/auth.service';

interface LoginModel {
  email: string;
  password: string;
}

@Component({
  selector: 'app-login',
  imports: [FormRoot, FormField, RouterLink],
  templateUrl: './login.html',
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly errorCredenciales = signal(false);
  readonly modelo = signal<LoginModel>({ email: '', password: '' });

  readonly formulario = form(
    this.modelo,
    (p) => {
      required(p.email, { message: 'El email es obligatorio' });
      email(p.email, { message: 'Ingresa un email válido' });
      required(p.password, { message: 'La contraseña es obligatoria' });
    },
    {
      submission: {
        action: async () => {
          this.errorCredenciales.set(false);

          const { email: correo, password } = this.modelo();
          try {
            await firstValueFrom(this.authService.iniciarSesion(correo, password));
          } catch {
            this.errorCredenciales.set(true);
            return;
          }

          await this.router.navigate(['/inicio']);
        },
        onInvalid: (campo) => {
          campo().errorSummary()[0]?.fieldTree().focusBoundControl();
        },
      },
    },
  );
}
