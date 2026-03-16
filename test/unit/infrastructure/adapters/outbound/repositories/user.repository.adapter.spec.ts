import { Category } from "@core/domain/enums/category.enum";
import { Channel } from "@core/domain/enums/channel.enum";
import { UserRepositoryAdapter } from "@infrastructure/adapters/outbound/repositories/user.repository.adapter";

describe("UserRepositoryAdapter", () => {
  let adapter: UserRepositoryAdapter;

  beforeEach(() => {
    adapter = new UserRepositoryAdapter();
  });

  describe("findAll", () => {
    it("should return all 7 mock users", async () => {
      const users = await adapter.findAll();
      expect(users).toHaveLength(7);
    });

    it("should return User instances with required fields", async () => {
      const users = await adapter.findAll();
      users.forEach((u) => {
        expect(u.id).toBeDefined();
        expect(u.name).toBeDefined();
        expect(u.email).toBeDefined();
        expect(u.phone).toBeDefined();
      });
    });

    it("should return a copy (not the internal reference)", async () => {
      const first = await adapter.findAll();
      const second = await adapter.findAll();
      expect(first).not.toBe(second);
    });
  });

  describe("findById", () => {
    it("should return Alice for id usr-001", async () => {
      const user = await adapter.findById("usr-001");
      expect(user).not.toBeNull();
      expect(user!.name).toBe("Alice Johnson");
    });

    it("should return null for an unknown id", async () => {
      const user = await adapter.findById("usr-999");
      expect(user).toBeNull();
    });

    it("should return each seeded user by id", async () => {
      for (let i = 1; i <= 7; i++) {
        const id = `usr-00${i}`;
        const user = await adapter.findById(id);
        expect(user).not.toBeNull();
        expect(user!.id).toBe(id);
      }
    });
  });

  describe("findBySubscription", () => {
    it("should return users subscribed to Sports", async () => {
      const users = await adapter.findBySubscription(Category.SPORTS);
      expect(users.length).toBe(4);
      users.forEach((u) =>
        expect(u.isSubscribedTo(Category.SPORTS)).toBe(true),
      );
    });

    it("should return users subscribed to Finance", async () => {
      const users = await adapter.findBySubscription(Category.FINANCE);
      expect(users.length).toBe(4);
      users.forEach((u) =>
        expect(u.isSubscribedTo(Category.FINANCE)).toBe(true),
      );
    });

    it("should return users subscribed to Movies", async () => {
      const users = await adapter.findBySubscription(Category.MOVIES);
      expect(users.length).toBe(4);
      users.forEach((u) =>
        expect(u.isSubscribedTo(Category.MOVIES)).toBe(true),
      );
    });

    it("should not return users NOT subscribed to the given category", async () => {
      const sportsUsers = await adapter.findBySubscription(Category.SPORTS);
      const carolOnly = sportsUsers.find((u) => u.id === "usr-003");
      expect(carolOnly).toBeDefined();
      expect(carolOnly!.isSubscribedTo(Category.FINANCE)).toBe(false);
    });

    it("David should appear in all three categories", async () => {
      for (const category of Object.values(Category)) {
        const users = await adapter.findBySubscription(category);
        expect(users.some((u) => u.id === "usr-004")).toBe(true);
      }
    });
  });

  describe("User domain methods", () => {
    it("getNotificationChannels should return a copy", async () => {
      const user = await adapter.findById("usr-001");
      const ch1 = user!.getNotificationChannels();
      const ch2 = user!.getNotificationChannels();
      expect(ch1).not.toBe(ch2);
      expect(ch1).toEqual(ch2);
    });

    it("Alice should have SMS and Email channels", async () => {
      const alice = await adapter.findById("usr-001");
      expect(alice!.getNotificationChannels()).toContain(Channel.SMS);
      expect(alice!.getNotificationChannels()).toContain(Channel.EMAIL);
    });

    it("David should have all three channels", async () => {
      const david = await adapter.findById("usr-004");
      const channels = david!.getNotificationChannels();
      expect(channels).toContain(Channel.SMS);
      expect(channels).toContain(Channel.EMAIL);
      expect(channels).toContain(Channel.PUSH_NOTIFICATION);
    });
  });
});
