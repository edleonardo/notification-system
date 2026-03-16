import { HttpException, HttpStatus } from '@nestjs/common';

export class AppException extends HttpException {
  constructor(
    message: string,
    statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    public readonly details?: unknown,
  ) {
    super({ message, statusCode, details }, statusCode);
  }
}

export class ValidationException extends AppException {
  constructor(message: string, details?: unknown) {
    super(message, HttpStatus.BAD_REQUEST, details);
  }
}

export class NotFoundException extends AppException {
  constructor(resource: string, id: string) {
    super(`${resource} with id "${id}" was not found`, HttpStatus.NOT_FOUND);
  }
}

export class InvalidChannelException extends AppException {
  constructor(channel: string) {
    super(
      `No notification strategy registered for channel: "${channel}"`,
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class MessagePublishException extends AppException {
  constructor(topic: string, cause?: string) {
    super(
      `Failed to publish message to topic "${topic}"${cause ? `: ${cause}` : ''}`,
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
}
