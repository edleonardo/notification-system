import { NotificationService } from "@application/services/notification.service";
import { Category } from "@core/domain/enums/category.enum";
import {
  IMessagePublisher,
  MESSAGE_PUBLISHER_PORT,
} from "@core/ports/outbound/message-publisher.port";
import { KAFKA_TOPICS } from "@infrastructure/config/kafka.config";
import { Test, TestingModule } from "@nestjs/testing";
import { MessagePublishException } from "@shared/exceptions/app.exceptions";

describe("NotificationService", () => {
  let service: NotificationService;
  let publisher: jest.Mocked<IMessagePublisher>;

  beforeEach(async () => {
    publisher = { publish: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: MESSAGE_PUBLISHER_PORT, useValue: publisher },
      ],
    }).compile();

    service = module.get(NotificationService);
  });

  describe("sendMessage", () => {
    it("should return a result with a generated messageId", async () => {
      const result = await service.sendMessage({
        category: Category.SPORTS,
        body: "Championship tonight!",
      });

      expect(result.messageId).toBeDefined();
      expect(result.messageId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });

    it("should return the correct category", async () => {
      const result = await service.sendMessage({
        category: Category.FINANCE,
        body: "Markets update",
      });
      expect(result.category).toBe(Category.FINANCE);
    });

    it("should return the correct body", async () => {
      const body = "New movies this week!";
      const result = await service.sendMessage({
        category: Category.MOVIES,
        body,
      });
      expect(result.body).toBe(body);
    });

    it("should return a publishedAt Date", async () => {
      const before = new Date();
      const result = await service.sendMessage({
        category: Category.SPORTS,
        body: "Test",
      });
      const after = new Date();

      expect(result.publishedAt).toBeInstanceOf(Date);
      expect(result.publishedAt.getTime()).toBeGreaterThanOrEqual(
        before.getTime(),
      );
      expect(result.publishedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it("should publish to the correct Kafka topic", async () => {
      await service.sendMessage({ category: Category.SPORTS, body: "Test" });

      expect(publisher.publish).toHaveBeenCalledWith(
        KAFKA_TOPICS.NOTIFICATIONS_SEND,
        expect.any(Object),
      );
    });

    it("should include all required fields in the published event", async () => {
      await service.sendMessage({
        category: Category.MOVIES,
        body: "Blockbuster alert",
      });

      const [, event] = publisher.publish.mock.calls[0];
      expect(event).toMatchObject({
        messageId: expect.any(String),
        category: Category.MOVIES,
        body: "Blockbuster alert",
        publishedAt: expect.any(String),
      });
    });

    it("should generate a unique messageId on each call", async () => {
      const r1 = await service.sendMessage({
        category: Category.SPORTS,
        body: "A",
      });
      const r2 = await service.sendMessage({
        category: Category.SPORTS,
        body: "B",
      });

      expect(r1.messageId).not.toBe(r2.messageId);
    });

    it("should call publisher exactly once per invocation", async () => {
      await service.sendMessage({ category: Category.FINANCE, body: "Test" });
      expect(publisher.publish).toHaveBeenCalledTimes(1);
    });

    it("should handle all Category enum values", async () => {
      for (const category of Object.values(Category)) {
        publisher.publish.mockClear();
        const result = await service.sendMessage({
          category,
          body: `Test ${category}`,
        });
        expect(result.category).toBe(category);
        expect(publisher.publish).toHaveBeenCalledTimes(1);
      }
    });

    it("should propagate publisher errors", async () => {
      publisher.publish.mockRejectedValueOnce(
        new MessagePublishException("notifications.send", "broker down"),
      );

      await expect(
        service.sendMessage({ category: Category.SPORTS, body: "Test" }),
      ).rejects.toThrow(MessagePublishException);
    });
  });
});
