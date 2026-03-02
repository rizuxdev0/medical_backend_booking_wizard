import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map } from 'rxjs/operators';

function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

function convertKeys(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map((item) => convertKeys(item));
  }

  if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
    if (obj instanceof Object) {
      const newObj = {};
      Object.keys(obj).forEach((key) => {
        const snakeKey = toSnakeCase(key);
        newObj[snakeKey] = convertKeys(obj[key]);
      });
      return newObj;
    }
  }

  return obj;
}

@Injectable()
export class SnakeCaseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(map((data) => convertKeys(data)));
  }
}
