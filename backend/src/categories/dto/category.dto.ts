import { OmitType, PartialType } from '@nestjs/swagger';
import { CategoryType } from '@prisma/client';
import { IsBoolean, IsEnum, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { HEX_COLOR_RE } from '../../common/constants';

export class CreateCategoryDto {
  @IsString()
  @MinLength(1, { message: 'Informe o nome da categoria' })
  @MaxLength(40)
  name: string;

  @IsEnum(CategoryType)
  type: CategoryType;

  @IsOptional()
  @Matches(HEX_COLOR_RE, { message: 'Cor inválida' })
  color?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  icon?: string;
}

export class UpdateCategoryDto extends PartialType(OmitType(CreateCategoryDto, ['type'] as const)) {
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class ListCategoriesDto {
  @IsOptional()
  @IsEnum(CategoryType)
  type?: CategoryType;

  @IsOptional()
  @IsString()
  includeInactive?: string;
}
