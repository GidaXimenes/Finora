import { Transform } from 'class-transformer';
import { IsBoolean, IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

const normalizeEmail = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

export class RegisterDto {
  @IsString()
  @MinLength(2, { message: 'Informe seu nome' })
  @MaxLength(80)
  name: string;

  @Transform(normalizeEmail)
  @IsEmail({}, { message: 'E-mail inválido' })
  @MaxLength(160)
  email: string;

  @IsString()
  @MinLength(8, { message: 'A senha deve ter ao menos 8 caracteres' })
  @MaxLength(72)
  password: string;
}

export class LoginDto {
  @Transform(normalizeEmail)
  @IsEmail({}, { message: 'E-mail inválido' })
  email: string;

  @IsString()
  @MinLength(1)
  @MaxLength(72)
  password: string;
}

export class OnboardingDto {
  @IsBoolean()
  completed: boolean;
}

export class DeleteAccountDto {
  @IsString()
  @MinLength(1)
  @MaxLength(72)
  password: string;
}
