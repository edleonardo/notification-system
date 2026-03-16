import { IsEnum, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { Category } from '../../core/domain/enums/category.enum';

export class CreateMessageDto {
  @IsEnum(Category, {
    message: `category must be one of: ${Object.values(Category).join(', ')}`,
  })
  @IsNotEmpty({ message: 'Category is required' })
  category: Category;

  @IsString({ message: 'Message body must be a string' })
  @IsNotEmpty({ message: 'Message body cannot be empty' })
  @MinLength(1, { message: 'Message body must have at least 1 character' })
  @MaxLength(5000, { message: 'Message body cannot exceed 5000 characters' })
  body: string;
}
