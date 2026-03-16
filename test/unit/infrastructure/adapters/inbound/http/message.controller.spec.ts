import { Category } from "@core/domain/enums/category.enum";
import { NOTIFICATION_USE_CASE_PORT } from "@core/ports/inbound/notification-use-case.port";
import { MessageController } from "@infrastructure/adapters/inbound/http/message.controller";
import { Test, TestingModule } from "@nestjs/testing";

describe("MessageController", () => {
  let controller: MessageController;
  let useCase: { sendMessage: jest.Mock };

  const mockResult = {
    messageId: "msg-abc-123",
    category: Category.SPORTS,
    body: "Big game tonight!",
    publishedAt: new Date("2024-01-01T00:00:00Z"),
  };

  beforeEach(async () => {
    useCase = { sendMessage: jest.fn().mockResolvedValue(mockResult) };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessageController],
      providers: [{ provide: NOTIFICATION_USE_CASE_PORT, useValue: useCase }],
    }).compile();

    controller = module.get(MessageController);
  });

  describe("sendMessage", () => {
    it("should return success: true", async () => {
      const response = await controller.sendMessage({
        category: Category.SPORTS,
        body: "Big game tonight!",
      });
      expect(response.success).toBe(true);
    });

    it("should return the use-case result in data", async () => {
      const response = await controller.sendMessage({
        category: Category.SPORTS,
        body: "Big game tonight!",
      });
      expect(response.data).toEqual(mockResult);
    });

    it("should include an acceptance message string", async () => {
      const response = await controller.sendMessage({
        category: Category.FINANCE,
        body: "Market update",
      });
      expect(typeof response.message).toBe("string");
      expect(response.message.length).toBeGreaterThan(0);
    });

    it("should delegate to the use case with correct args", async () => {
      await controller.sendMessage({
        category: Category.MOVIES,
        body: "New releases!",
      });
      expect(useCase.sendMessage).toHaveBeenCalledWith({
        category: Category.MOVIES,
        body: "New releases!",
      });
    });

    it("should call the use case exactly once", async () => {
      await controller.sendMessage({ category: Category.FINANCE, body: "x" });
      expect(useCase.sendMessage).toHaveBeenCalledTimes(1);
    });

    it("should propagate use-case errors", async () => {
      useCase.sendMessage.mockRejectedValueOnce(new Error("Kafka unavailable"));
      await expect(
        controller.sendMessage({ category: Category.SPORTS, body: "test" }),
      ).rejects.toThrow("Kafka unavailable");
    });

    it("should work for all Category values", async () => {
      for (const category of Object.values(Category)) {
        useCase.sendMessage.mockResolvedValueOnce({ ...mockResult, category });
        const response = await controller.sendMessage({
          category,
          body: "Test",
        });
        expect(response.data.category).toBe(category);
      }
    });
  });
});
