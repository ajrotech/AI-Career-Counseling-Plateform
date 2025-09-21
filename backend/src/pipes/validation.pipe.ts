import { Injectable, PipeTransform, ArgumentMetadata, BadRequestException, Logger } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  private readonly logger = new Logger(ValidationPipe.name);

  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    // Transform plain object to class instance
    const object = plainToClass(metatype, value);
    
    // Validate the object
    const errors = await validate(object, {
      whitelist: true, // Strip non-whitelisted properties
      forbidNonWhitelisted: true, // Throw error for non-whitelisted properties
      transform: true, // Transform the object
      validateCustomDecorators: true,
    });

    if (errors.length > 0) {
      const errorMessages = this.formatErrors(errors);
      this.logger.warn(`Validation failed: ${JSON.stringify(errorMessages)}`);
      
      throw new BadRequestException({
        statusCode: 400,
        message: 'Validation failed',
        errors: errorMessages,
      });
    }

    return object;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private formatErrors(errors: any[]): any[] {
    return errors.map(error => ({
      property: error.property,
      value: error.value,
      constraints: error.constraints,
      children: error.children?.length > 0 ? this.formatErrors(error.children) : undefined,
    }));
  }
}