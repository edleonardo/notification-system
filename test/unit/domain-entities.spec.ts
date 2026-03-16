import { Message } from "@core/domain/entities/message.entity";
import { NotificationLog } from "@core/domain/entities/notification-log.entity";
import { User } from "@core/domain/entities/user.entity";
import { Category } from "@core/domain/enums/category.enum";
import { NotificationStatus } from "@core/domain/enums/notification-status.enum";
import { Channel } from "@core/domain/enums/channel.enum";

describe("User", () => {
  const makeUser = (overrides = {}) =>
    new User({
      id: "usr-1",
      name: "Alice",
      email: "alice@test.com",
      phone: "+1-555-0101",
      subscriptions: [Category.SPORTS, Category.FINANCE],
      channels: [Channel.SMS, Channel.EMAIL],
      ...overrides,
    });

  it("should assign all properties from constructor", () => {
    const user = makeUser();
    expect(user.id).toBe("usr-1");
    expect(user.name).toBe("Alice");
    expect(user.email).toBe("alice@test.com");
    expect(user.phone).toBe("+1-555-0101");
  });

  describe("isSubscribedTo", () => {
    it("should return true for a subscribed category", () => {
      expect(makeUser().isSubscribedTo(Category.SPORTS)).toBe(true);
    });

    it("should return false for a non-subscribed category", () => {
      expect(makeUser().isSubscribedTo(Category.MOVIES)).toBe(false);
    });

    it("should return true for all subscribed categories", () => {
      const user = makeUser();
      [Category.SPORTS, Category.FINANCE].forEach((c) =>
        expect(user.isSubscribedTo(c)).toBe(true),
      );
    });
  });

  describe("getNotificationChannels", () => {
    it("should return the user channels", () => {
      const channels = makeUser().getNotificationChannels();
      expect(channels).toContain(Channel.SMS);
      expect(channels).toContain(Channel.EMAIL);
    });

    it("should return a new array each call (defensive copy)", () => {
      const user = makeUser();
      expect(user.getNotificationChannels()).not.toBe(
        user.getNotificationChannels(),
      );
    });

    it("mutation of returned array should not affect the entity", () => {
      const user = makeUser();
      const channels = user.getNotificationChannels();
      channels.push(Channel.PUSH_NOTIFICATION);
      expect(user.getNotificationChannels()).toHaveLength(2);
    });
  });
});

describe("Message", () => {
  it("should generate a UUID when id is not provided", () => {
    const msg = new Message({ category: Category.SPORTS, body: "Test" });
    expect(msg.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  it("should use provided id", () => {
    const msg = new Message({
      id: "custom-id",
      category: Category.FINANCE,
      body: "Test",
    });
    expect(msg.id).toBe("custom-id");
  });

  it("should set category and body", () => {
    const msg = new Message({ category: Category.MOVIES, body: "Hello" });
    expect(msg.category).toBe(Category.MOVIES);
    expect(msg.body).toBe("Hello");
  });

  it("should default createdAt to now when not provided", () => {
    const before = Date.now();
    const msg = new Message({ category: Category.SPORTS, body: "Test" });
    expect(msg.createdAt.getTime()).toBeGreaterThanOrEqual(before);
  });

  it("should use provided createdAt", () => {
    const date = new Date("2020-01-01");
    const msg = new Message({
      category: Category.SPORTS,
      body: "Test",
      createdAt: date,
    });
    expect(msg.createdAt).toBe(date);
  });

  it("should produce unique ids for different instances", () => {
    const m1 = new Message({ category: Category.SPORTS, body: "A" });
    const m2 = new Message({ category: Category.SPORTS, body: "B" });
    expect(m1.id).not.toBe(m2.id);
  });
});

describe("NotificationLog", () => {
  const makeLog = (status = NotificationStatus.SENT) =>
    new NotificationLog({
      id: "log-1",
      messageId: "msg-1",
      messageCategory: Category.SPORTS,
      messageBody: "Test",
      userId: "usr-1",
      userName: "Alice",
      userEmail: "alice@test.com",
      userPhone: "+1-555",
      channel: Channel.EMAIL,
      status,
      createdAt: new Date(),
    });

  it("should assign all properties", () => {
    const log = makeLog();
    expect(log.id).toBe("log-1");
    expect(log.messageId).toBe("msg-1");
    expect(log.channel).toBe(Channel.EMAIL);
  });

  describe("isSuccessful", () => {
    it("should return true when status is SENT", () => {
      expect(makeLog(NotificationStatus.SENT).isSuccessful).toBe(true);
    });

    it("should return false when status is FAILED", () => {
      expect(makeLog(NotificationStatus.FAILED).isSuccessful).toBe(false);
    });

    it("should return false when status is PENDING", () => {
      expect(makeLog(NotificationStatus.PENDING).isSuccessful).toBe(false);
    });
  });
});
