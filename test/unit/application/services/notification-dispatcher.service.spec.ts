import { NotificationEventDto } from "@application/dtos/notification-event.dto";
import { NotificationDispatcherService } from "@application/services/notification-dispatcher.service";
import { NotificationChannelStrategy } from "@application/strategies/notification-channel.strategy";
import { User } from "@core/domain/entities/user.entity";
import { Category } from "@core/domain/enums/category.enum";
import { Channel } from "@core/domain/enums/channel.enum";
import { NotificationStatus } from "@core/domain/enums/notification-status.enum";
import { MESSAGE_PUBLISHER_PORT } from "@core/ports/outbound/message-publisher.port";
import { NOTIFICATION_LOG_REPOSITORY_PORT } from "@core/ports/outbound/notification-log-repository.port";
import { USER_REPOSITORY_PORT } from "@core/ports/outbound/user-repository.port";
import { Test, TestingModule } from "@nestjs/testing";

const makeUser = (
  overrides: Partial<ConstructorParameters<typeof User>[0]> = {},
) =>
  new User({
    id: "usr-001",
    name: "Alice",
    email: "alice@example.com",
    phone: "+1-555-0101",
    subscriptions: [Category.SPORTS],
    channels: [Channel.SMS, Channel.EMAIL],
    ...overrides,
  });

const makeEvent = (
  overrides: Partial<NotificationEventDto> = {},
): NotificationEventDto => ({
  messageId: "msg-001",
  category: Category.SPORTS,
  body: "Championship tonight!",
  publishedAt: new Date().toISOString(),
  ...overrides,
});

describe("NotificationDispatcherService", () => {
  let service: NotificationDispatcherService;
  let userRepo: {
    findBySubscription: jest.Mock;
    findAll: jest.Mock;
    findById: jest.Mock;
  };
  let logRepo: {
    create: jest.Mock;
    findAll: jest.Mock;
    findById: jest.Mock;
    findByMessageId: jest.Mock;
    findByUserId: jest.Mock;
  };
  let channelStrategy: {
    getStrategy: jest.Mock;
    getSupportedChannels: jest.Mock;
  };
  let publisher: { publish: jest.Mock };
  let mockSmsStrategy: { channel: Channel; execute: jest.Mock };
  let mockEmailStrategy: { channel: Channel; execute: jest.Mock };

  const mockLog = { id: "log-001", status: NotificationStatus.SENT };

  beforeEach(async () => {
    mockSmsStrategy = {
      channel: Channel.SMS,
      execute: jest.fn().mockResolvedValue({
        success: true,
        channel: Channel.SMS,
        timestamp: new Date(),
      }),
    };

    mockEmailStrategy = {
      channel: Channel.EMAIL,
      execute: jest.fn().mockResolvedValue({
        success: true,
        channel: Channel.EMAIL,
        timestamp: new Date(),
      }),
    };

    userRepo = {
      findBySubscription: jest.fn().mockResolvedValue([makeUser()]),
      findAll: jest.fn().mockResolvedValue([]),
      findById: jest.fn().mockResolvedValue(null),
    };

    logRepo = {
      create: jest.fn().mockResolvedValue(mockLog),
      findAll: jest.fn().mockResolvedValue([]),
      findById: jest.fn().mockResolvedValue(null),
      findByMessageId: jest.fn().mockResolvedValue([]),
      findByUserId: jest.fn().mockResolvedValue([]),
    };

    channelStrategy = {
      getStrategy: jest.fn().mockImplementation((ch: Channel) => {
        if (ch === Channel.SMS) return mockSmsStrategy;
        return mockEmailStrategy;
      }),
      getSupportedChannels: jest
        .fn()
        .mockReturnValue([Channel.SMS, Channel.EMAIL]),
    };

    publisher = { publish: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationDispatcherService,
        { provide: USER_REPOSITORY_PORT, useValue: userRepo },
        { provide: NOTIFICATION_LOG_REPOSITORY_PORT, useValue: logRepo },
        { provide: MESSAGE_PUBLISHER_PORT, useValue: publisher },
        { provide: NotificationChannelStrategy, useValue: channelStrategy },
      ],
    }).compile();

    service = module.get(NotificationDispatcherService);
  });

  describe("dispatch", () => {
    it("should query subscribers for the event category", async () => {
      await service.dispatch(makeEvent());
      expect(userRepo.findBySubscription).toHaveBeenCalledWith(Category.SPORTS);
    });

    it("should return totalNotifications = channels × users", async () => {
      const result = await service.dispatch(makeEvent());
      expect(result.totalNotifications).toBe(2);
    });

    it("should return successful count matching channels when all succeed", async () => {
      const result = await service.dispatch(makeEvent());
      expect(result.successful).toBe(2);
      expect(result.failed).toBe(0);
    });

    it("should return zeros when no subscribers found", async () => {
      userRepo.findBySubscription.mockResolvedValueOnce([]);
      const result = await service.dispatch(makeEvent());
      expect(result).toEqual({
        messageId: "msg-001",
        totalNotifications: 0,
        successful: 0,
        failed: 0,
      });
    });

    it("should create one log entry per channel per user", async () => {
      await service.dispatch(makeEvent());
      expect(logRepo.create).toHaveBeenCalledTimes(2);
    });

    it("should log status SENT on success", async () => {
      await service.dispatch(makeEvent());
      logRepo.create.mock.calls.forEach(([dto]) => {
        expect(dto.status).toBe(NotificationStatus.SENT);
      });
    });

    it("should log status FAILED when strategy throws", async () => {
      mockSmsStrategy.execute.mockRejectedValueOnce(
        new Error("SMS gateway down"),
      );

      const result = await service.dispatch(makeEvent());

      expect(result.failed).toBe(1);
      expect(result.successful).toBe(1);

      const smsCall = logRepo.create.mock.calls.find(
        ([dto]) => dto.channel === Channel.SMS,
      );
      expect(smsCall![0].status).toBe(NotificationStatus.FAILED);
      expect(smsCall![0].errorMessage).toBe("SMS gateway down");
    });

    it("should include errorMessage in the log when strategy throws", async () => {
      mockEmailStrategy.execute.mockRejectedValueOnce(new Error("SMTP error"));

      await service.dispatch(makeEvent());

      const emailCall = logRepo.create.mock.calls.find(
        ([dto]) => dto.channel === Channel.EMAIL,
      );
      expect(emailCall![0].errorMessage).toBe("SMTP error");
    });

    it("should not set sentAt on failure", async () => {
      mockSmsStrategy.execute.mockRejectedValueOnce(new Error("fail"));

      await service.dispatch(makeEvent());

      const smsCall = logRepo.create.mock.calls.find(
        ([dto]) => dto.channel === Channel.SMS,
      );
      expect(smsCall![0].sentAt).toBeUndefined();
    });

    it("should set sentAt on success", async () => {
      await service.dispatch(makeEvent());
      logRepo.create.mock.calls.forEach(([dto]) => {
        expect(dto.sentAt).toBeInstanceOf(Date);
      });
    });

    it("should include correct user data in each log entry", async () => {
      await service.dispatch(makeEvent());
      logRepo.create.mock.calls.forEach(([dto]) => {
        expect(dto.userId).toBe("usr-001");
        expect(dto.userName).toBe("Alice");
        expect(dto.userEmail).toBe("alice@example.com");
      });
    });

    it("should include correct message data in each log entry", async () => {
      const event = makeEvent({ messageId: "msg-xyz", body: "Hello!" });
      await service.dispatch(event);
      logRepo.create.mock.calls.forEach(([dto]) => {
        expect(dto.messageId).toBe("msg-xyz");
        expect(dto.messageBody).toBe("Hello!");
        expect(dto.messageCategory).toBe(Category.SPORTS);
      });
    });

    it("should call getStrategy for every channel", async () => {
      await service.dispatch(makeEvent());
      expect(channelStrategy.getStrategy).toHaveBeenCalledWith(Channel.SMS);
      expect(channelStrategy.getStrategy).toHaveBeenCalledWith(Channel.EMAIL);
    });

    it("should handle multiple users correctly", async () => {
      const user2 = makeUser({
        id: "usr-002",
        name: "Bob",
        channels: [Channel.EMAIL],
        subscriptions: [Category.SPORTS],
      });
      userRepo.findBySubscription.mockResolvedValueOnce([makeUser(), user2]);

      const result = await service.dispatch(makeEvent());

      expect(result.totalNotifications).toBe(3);
      expect(result.successful).toBe(3);
    });

    it("should still process other channels when one fails", async () => {
      mockSmsStrategy.execute.mockRejectedValueOnce(new Error("fail"));

      const result = await service.dispatch(makeEvent());

      expect(result.successful).toBe(1);
      expect(result.failed).toBe(1);
      expect(mockEmailStrategy.execute).toHaveBeenCalled();
    });

    it("should return messageId in the dispatch result", async () => {
      const event = makeEvent({ messageId: "abc-123" });
      const result = await service.dispatch(event);
      expect(result.messageId).toBe("abc-123");
    });
  });

  describe("handleDlqMessage", () => {
    it("should not throw for any input", async () => {
      await expect(service.handleDlqMessage(null)).resolves.not.toThrow();
      await expect(service.handleDlqMessage(undefined)).resolves.not.toThrow();
      await expect(
        service.handleDlqMessage({ messageId: "x", error: "broker down" }),
      ).resolves.not.toThrow();
    });
  });
});
