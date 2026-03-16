import { User } from "../../../core/domain/entities/user.entity";
import { Category } from "../../../core/domain/enums/category.enum";
import { Channel } from "../../../core/domain/enums/channel.enum";

export const MOCK_USERS: User[] = [
  new User({
    id: "usr-001",
    name: "Alice Johnson",
    email: "alice.johnson@example.com",
    phone: "+1-555-0101",
    subscriptions: [Category.SPORTS, Category.FINANCE],
    channels: [Channel.SMS, Channel.EMAIL],
  }),
  new User({
    id: "usr-002",
    name: "Bob Martinez",
    email: "bob.martinez@example.com",
    phone: "+1-555-0102",
    subscriptions: [Category.MOVIES, Category.FINANCE],
    channels: [Channel.EMAIL, Channel.PUSH_NOTIFICATION],
  }),
  new User({
    id: "usr-003",
    name: "Carol Williams",
    email: "carol.williams@example.com",
    phone: "+1-555-0103",
    subscriptions: [Category.SPORTS],
    channels: [Channel.SMS],
  }),
  new User({
    id: "usr-004",
    name: "David Chen",
    email: "david.chen@example.com",
    phone: "+1-555-0104",
    subscriptions: [Category.SPORTS, Category.MOVIES, Category.FINANCE],
    channels: [Channel.SMS, Channel.EMAIL, Channel.PUSH_NOTIFICATION],
  }),
  new User({
    id: "usr-005",
    name: "Eva Rodriguez",
    email: "eva.rodriguez@example.com",
    phone: "+1-555-0105",
    subscriptions: [Category.MOVIES],
    channels: [Channel.PUSH_NOTIFICATION],
  }),
  new User({
    id: "usr-006",
    name: "Frank Thompson",
    email: "frank.thompson@example.com",
    phone: "+1-555-0106",
    subscriptions: [Category.FINANCE],
    channels: [Channel.EMAIL],
  }),
  new User({
    id: "usr-007",
    name: "Grace Kim",
    email: "grace.kim@example.com",
    phone: "+1-555-0107",
    subscriptions: [Category.SPORTS, Category.MOVIES],
    channels: [Channel.SMS, Channel.PUSH_NOTIFICATION],
  }),
];
