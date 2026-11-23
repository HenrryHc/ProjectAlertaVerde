import { Component, inject, signal } from '@angular/core';
import {
  FormField,
  FormRoot,
  email,
  form,
  maxLength,
  minLength,
  pattern,
  required,
  validate,
} from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

const PATRON_PASSWORD = /^(?=.*[A-Za-z])(?=.*\d).+$/;

interface RegistroModel {
  email: string;
  password: string;
  confirmarPassword: string;
}

@Component({
  selector: 'app-registro',
  imports: [FormRoot, FormField, RouterLink],
  templateUrl: './registro.html',
})
export class Registro {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly errorRegistro = signal<string | null>(null);
  readonly modelo = signal<RegistroModel>({
    email: '',
    password: '',
    confirmarPassword: '',
  });

  readonly formulario = form(
    this.modelo,
    (p) => {
      required(p.email, { message: 'El email es obligatorio' });
      email(p.email, { message: 'Ingresa un email válido' });
      validate(p.email, ({ value }) => {
        const correo = value();
        return correo && this.authService.existeEmail(correo)
          ? { kind: 'emailEnUso', message: 'Ya existe una cuenta con este email' }
          : undefined;
      });

      required(p.password, { message: 'La contraseña es obligatoria' });
      minLength(p.password, 8, { message: 'La contraseña debe tener al menos 8 caracteres' });
      maxLength(p.password, 64, { message: 'La contraseña no puede superar los 64 caracteres' });
      pattern(p.password, PATRON_PASSWORD, {
        message: 'La contraseña debe incluir al menos una letra y un número',
      });

      required(p.confirmarPassword, { message: 'Confirma tu contraseña' });
      validate(p.confirmarPassword, ({ value, valueOf }) => {
        return value() !== valueOf(p.password)
          ? { kind: 'noCoincide', message: 'Las contraseñas no coinciden' }
          : undefined;
      });
    },
    {
      submission: {
        action: async () => {
          this.errorRegistro.set(null);

          const { email: correo, password } = this.modelo();
          if (!this.authService.registrar(correo, password)) {
            this.errorRegistro.set('Ya existe una cuenta con este email.');
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
