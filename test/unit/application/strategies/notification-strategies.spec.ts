import { EmailNotificationStrategy } from "@application/strategies/email-notification.strategy";
import { PushNotificationStrategy } from "@application/strategies/push-notification.strategy";
import { SmsNotificationStrategy } from "@application/strategies/sms-notification.strategy";
import { NotificationPayload } from "@core/ports/outbound/notification-channel.port";
import { Channel } from "@core/domain/enums/channel.enum";

const basePayload = (
  overrides: Partial<NotificationPayload> = {},
): NotificationPayload => ({
  userId: "usr-001",
  userName: "Alice Johnson",
  userEmail: "alice@example.com",
  userPhone: "+1-555-0101",
  messageId: "msg-001",
  messageCategory: "Sports",
  messageBody: "Championship game tonight!",
  channel: Channel.SMS,
  ...overrides,
});

describe("SmsNotificationStrategy", () => {
  let strategy: SmsNotificationStrategy;

  beforeEach(() => {
    strategy = new SmsNotificationStrategy();
  });

  it("should expose channel = SMS", () => {
    expect(strategy.channel).toBe(Channel.SMS);
  });

  it("should return success: true", async () => {
    const result = await strategy.execute(basePayload());
    expect(result.success).toBe(true);
  });

  it("should return channel SMS in result", async () => {
    const result = await strategy.execute(basePayload());
    expect(result.channel).toBe(Channel.SMS);
  });

  it("should return a timestamp close to now", async () => {
    const before = Date.now();
    const result = await strategy.execute(basePayload());
    expect(result.timestamp.getTime()).toBeGreaterThanOrEqual(before);
    expect(result.timestamp.getTime()).toBeLessThanOrEqual(Date.now());
  });

  it("should have no errorMessage on success", async () => {
    const result = await strategy.execute(basePayload());
    expect(result.errorMessage).toBeUndefined();
  });

  it("should include Twilio as provider in metadata", async () => {
    const result = await strategy.execute(basePayload());
    expect(result.metadata?.provider).toBe("Twilio");
  });

  it("should include recipient phone in metadata", async () => {
    const result = await strategy.execute(
      basePayload({ userPhone: "+44-7700-900000" }),
    );
    expect(result.metadata?.recipient).toBe("+44-7700-900000");
  });

  it("should include message length in metadata", async () => {
    const body = "Short msg";
    const result = await strategy.execute(basePayload({ messageBody: body }));
    expect(result.metadata?.messageLength).toBe(body.length);
  });

  it("should handle very long message bodies", async () => {
    const body = "A".repeat(5000);
    const result = await strategy.execute(basePayload({ messageBody: body }));
    expect(result.success).toBe(true);
    expect(result.metadata?.messageLength).toBe(5000);
  });

  it("should handle special characters in phone number", async () => {
    const result = await strategy.execute(
      basePayload({ userPhone: "+55 (11) 98765-4321" }),
    );
    expect(result.success).toBe(true);
  });
});

describe("EmailNotificationStrategy", () => {
  let strategy: EmailNotificationStrategy;

  beforeEach(() => {
    strategy = new EmailNotificationStrategy();
  });

  it("should expose channel = EMAIL", () => {
    expect(strategy.channel).toBe(Channel.EMAIL);
  });

  it("should return success: true", async () => {
    const result = await strategy.execute(
      basePayload({ channel: Channel.EMAIL }),
    );
    expect(result.success).toBe(true);
  });

  it("should return channel EMAIL in result", async () => {
    const result = await strategy.execute(
      basePayload({ channel: Channel.EMAIL }),
    );
    expect(result.channel).toBe(Channel.EMAIL);
  });

  it("should return a recent timestamp", async () => {
    const before = Date.now();
    const result = await strategy.execute(
      basePayload({ channel: Channel.EMAIL }),
    );
    expect(result.timestamp.getTime()).toBeGreaterThanOrEqual(before);
  });

  it("should include SendGrid as provider", async () => {
    const result = await strategy.execute(
      basePayload({ channel: Channel.EMAIL }),
    );
    expect(result.metadata?.provider).toBe("SendGrid");
  });

  it("should include recipient email in metadata", async () => {
    const result = await strategy.execute(
      basePayload({ channel: Channel.EMAIL, userEmail: "bob@domain.com" }),
    );
    expect(result.metadata?.recipient).toBe("bob@domain.com");
  });

  it("should include a subject containing the category", async () => {
    const result = await strategy.execute(
      basePayload({ channel: Channel.EMAIL, messageCategory: "Finance" }),
    );
    expect(result.metadata?.subject).toContain("Finance");
  });

  it("should include a templateId", async () => {
    const result = await strategy.execute(
      basePayload({ channel: Channel.EMAIL }),
    );
    expect(result.metadata?.templateId).toBeDefined();
    expect(typeof result.metadata?.templateId).toBe("string");
  });

  it("should handle each category in the subject", async () => {
    for (const category of ["Sports", "Finance", "Movies"]) {
      const result = await strategy.execute(
        basePayload({ channel: Channel.EMAIL, messageCategory: category }),
      );
      expect(result.metadata?.subject).toContain(category);
    }
  });
});

describe("PushNotificationStrategy", () => {
  let strategy: PushNotificationStrategy;

  beforeEach(() => {
    strategy = new PushNotificationStrategy();
  });

  it("should expose channel = PUSH_NOTIFICATION", () => {
    expect(strategy.channel).toBe(Channel.PUSH_NOTIFICATION);
  });

  it("should return success: true", async () => {
    const result = await strategy.execute(
      basePayload({ channel: Channel.PUSH_NOTIFICATION }),
    );
    expect(result.success).toBe(true);
  });

  it("should return channel PUSH_NOTIFICATION in result", async () => {
    const result = await strategy.execute(
      basePayload({ channel: Channel.PUSH_NOTIFICATION }),
    );
    expect(result.channel).toBe(Channel.PUSH_NOTIFICATION);
  });

  it("should include Firebase FCM as provider", async () => {
    const result = await strategy.execute(
      basePayload({ channel: Channel.PUSH_NOTIFICATION }),
    );
    expect(result.metadata?.provider).toBe("Firebase FCM");
  });

  it("should include userId in metadata", async () => {
    const result = await strategy.execute(
      basePayload({ channel: Channel.PUSH_NOTIFICATION, userId: "usr-007" }),
    );
    expect(result.metadata?.userId).toBe("usr-007");
  });

  it("should truncate message body to 100 chars in notification body", async () => {
    const longBody = "X".repeat(200);
    const result = await strategy.execute(
      basePayload({
        channel: Channel.PUSH_NOTIFICATION,
        messageBody: longBody,
      }),
    );
    expect((result.metadata?.body as string).length).toBe(100);
  });

  it("should not truncate body under 100 chars", async () => {
    const shortBody = "Short";
    const result = await strategy.execute(
      basePayload({
        channel: Channel.PUSH_NOTIFICATION,
        messageBody: shortBody,
      }),
    );
    expect(result.metadata?.body).toBe(shortBody);
  });

  it("should include category in title", async () => {
    const result = await strategy.execute(
      basePayload({
        channel: Channel.PUSH_NOTIFICATION,
        messageCategory: "Movies",
      }),
    );
    expect(result.metadata?.title).toContain("Movies");
  });

  it("should return a recent timestamp", async () => {
    const before = Date.now();
    const result = await strategy.execute(
      basePayload({ channel: Channel.PUSH_NOTIFICATION }),
    );
    expect(result.timestamp.getTime()).toBeGreaterThanOrEqual(before);
  });
});
