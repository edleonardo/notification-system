export const MESSAGE_PUBLISHER_PORT = Symbol('IMessagePublisher');

export interface IMessagePublisher {
  publish<T>(topic: string, message: T): Promise<void>;
}
