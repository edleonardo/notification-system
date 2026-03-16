import { EmailNotificationStrategy } from "@application/strategies/email-notification.strategy";
import { NotificationChannelStrategy } from "@application/strategies/notification-channel.strategy";
import { PushNotificationStrategy } from "@application/strategies/push-notification.strategy";
import { SmsNotificationStrategy } from "@application/strategies/sms-notification.strategy";
import { Test, TestingModule } from "@nestjs/testing";
import { InvalidChannelException } from "@shared/exceptions/app.exceptions";
import { Channel } from "@core/domain/enums/channel.enum";

describe("NotificationChannelStrategy", () => {
  let context: NotificationChannelStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationChannelStrategy,
        SmsNotificationStrategy,
        EmailNotificationStrategy,
        PushNotificationStrategy,
      ],
    }).compile();

    context = module.get(NotificationChannelStrategy);
  });

  describe("getStrategy", () => {
    it("should return SmsNotificationStrategy for SMS channel", () => {
      expect(context.getStrategy(Channel.SMS)).toBeInstanceOf(
        SmsNotificationStrategy,
      );
    });

    it("should return EmailNotificationStrategy for EMAIL channel", () => {
      expect(context.getStrategy(Channel.EMAIL)).toBeInstanceOf(
        EmailNotificationStrategy,
      );
    });

    it("should return PushNotificationStrategy for PUSH_NOTIFICATION channel", () => {
      expect(context.getStrategy(Channel.PUSH_NOTIFICATION)).toBeInstanceOf(
        PushNotificationStrategy,
      );
    });

    it("should return a strategy whose channel property matches the requested channel", () => {
      expect(context.getStrategy(Channel.SMS).channel).toBe(Channel.SMS);
      expect(context.getStrategy(Channel.EMAIL).channel).toBe(Channel.EMAIL);
      expect(context.getStrategy(Channel.PUSH_NOTIFICATION).channel).toBe(
        Channel.PUSH_NOTIFICATION,
      );
    });

    it("should throw InvalidChannelException for an unknown channel", () => {
      expect(() => context.getStrategy("WHATSAPP" as Channel)).toThrow(
        InvalidChannelException,
      );
    });

    it("should throw with a descriptive message for unknown channel", () => {
      expect(() => context.getStrategy("UNKNOWN" as Channel)).toThrow(
        /UNKNOWN/,
      );
    });
  });

  describe("getSupportedChannels", () => {
    it("should return exactly 3 channels", () => {
      expect(context.getSupportedChannels()).toHaveLength(3);
    });

    it("should include SMS", () => {
      expect(context.getSupportedChannels()).toContain(Channel.SMS);
    });

    it("should include EMAIL", () => {
      expect(context.getSupportedChannels()).toContain(Channel.EMAIL);
    });

    it("should include PUSH_NOTIFICATION", () => {
      expect(context.getSupportedChannels()).toContain(
        Channel.PUSH_NOTIFICATION,
      );
    });

    it("should return all Channel enum values", () => {
      const supported = context.getSupportedChannels();
      Object.values(Channel).forEach((ch) => {
        expect(supported).toContain(ch);
      });
    });
  });
});
