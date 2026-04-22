import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  int,
  bigint,
} from "drizzle-orm/mysql-core";

export const staffRoleEnum = mysqlEnum("staff_role", [
  "user",
  "worker",
  "admin",
  "super_admin",
]);

export const assetTypeEnum = mysqlEnum("asset_type", ["image", "video"]);

export const campaignAudienceEnum = mysqlEnum("campaign_audience", [
  "selected",
  "everyone",
]);

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: staffRoleEnum.default("user").notNull(),
  isBlocked: int("is_blocked").notNull().default(0),
  blockedReason: text("blocked_reason"),
  blockedAt: timestamp("blocked_at"),
  createdById: int("created_by_id"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const localUsers = mysqlTable("local_users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  displayName: varchar("display_name", { length: 255 }),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: staffRoleEnum.default("user").notNull(),
  isActive: int("is_active").notNull().default(1),
  isBlocked: int("is_blocked").notNull().default(0),
  blockedReason: text("blocked_reason"),
  blockedAt: timestamp("blocked_at"),
  invitedById: int("invited_by_id"),
  lastSignInAt: timestamp("last_sign_in_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type LocalUser = typeof localUsers.$inferSelect;
export type InsertLocalUser = typeof localUsers.$inferInsert;

export const products = mysqlTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  price: int("price").notNull(),
  priceCurrency: varchar("price_currency", { length: 10 }).notNull().default("cad"),
  image: varchar("image", { length: 500 }),
  category: varchar("category", { length: 100 }).notNull().default("general"),
  inventory: int("inventory").notNull().default(0),
  featured: int("featured").notNull().default(0),
  active: int("active").notNull().default(1),
  sortOrder: int("sort_order").notNull().default(0),
  stripeProductId: varchar("stripe_product_id", { length: 255 }),
  stripePriceId: varchar("stripe_price_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

export const services = mysqlTable("services", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  price: int("price").notNull(),
  priceCurrency: varchar("price_currency", { length: 10 }).notNull().default("cad"),
  durationMinutes: int("duration_minutes").notNull(),
  image: varchar("image", { length: 500 }),
  featured: int("featured").notNull().default(0),
  active: int("active").notNull().default(1),
  sortOrder: int("sort_order").notNull().default(0),
  stripeProductId: varchar("stripe_product_id", { length: 255 }),
  stripePriceId: varchar("stripe_price_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Service = typeof services.$inferSelect;
export type InsertService = typeof services.$inferInsert;

export const galleryItems = mysqlTable("gallery_items", {
  id: serial("id").primaryKey(),
  type: assetTypeEnum.notNull(),
  url: varchar("url", { length: 500 }).notNull(),
  thumbnailUrl: varchar("thumbnail_url", { length: 500 }),
  title: varchar("title", { length: 255 }),
  caption: text("caption"),
  category: varchar("category", { length: 100 }).notNull().default("general"),
  isFeatured: int("is_featured").notNull().default(0),
  isActive: int("is_active").notNull().default(1),
  sortOrder: int("sort_order").notNull().default(0),
  createdById: int("created_by_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type GalleryItem = typeof galleryItems.$inferSelect;
export type InsertGalleryItem = typeof galleryItems.$inferInsert;

export const staffProfiles = mysqlTable("staff_profiles", {
  id: serial("id").primaryKey(),
  userId: int("user_id").notNull(),
  displayName: varchar("display_name", { length: 255 }).notNull(),
  bio: text("bio"),
  bookingEnabled: int("booking_enabled").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type StaffProfile = typeof staffProfiles.$inferSelect;

export const staffWorkingHours = mysqlTable("staff_working_hours", {
  id: serial("id").primaryKey(),
  staffUserId: int("staff_user_id").notNull(),
  dayOfWeek: int("day_of_week").notNull(),
  startTime: varchar("start_time", { length: 5 }).notNull(),
  endTime: varchar("end_time", { length: 5 }).notNull(),
  isWorking: int("is_working").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type StaffWorkingHour = typeof staffWorkingHours.$inferSelect;

export const staffTimeOff = mysqlTable("staff_time_off", {
  id: serial("id").primaryKey(),
  staffUserId: int("staff_user_id").notNull(),
  startAt: timestamp("start_at").notNull(),
  endAt: timestamp("end_at").notNull(),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type StaffTimeOff = typeof staffTimeOff.$inferSelect;

export const serviceStaffAssignments = mysqlTable("service_staff_assignments", {
  id: serial("id").primaryKey(),
  serviceId: int("service_id").notNull(),
  staffUserId: int("staff_user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ServiceStaffAssignment = typeof serviceStaffAssignments.$inferSelect;

export const orders = mysqlTable("orders", {
  id: serial("id").primaryKey(),
  userId: int("user_id"),
  userType: varchar("user_type", { length: 20 }),
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  customerEmail: varchar("customer_email", { length: 320 }).notNull(),
  customerPhone: varchar("customer_phone", { length: 50 }),
  total: int("total").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  shippingStatus: varchar("shipping_status", { length: 50 })
    .notNull()
    .default("pending"),
  shippingCarrier: varchar("shipping_carrier", { length: 120 }),
  trackingNumber: varchar("tracking_number", { length: 255 }),
  fulfilledAt: timestamp("fulfilled_at"),
  fulfilledById: int("fulfilled_by_id"),
  stripePaymentIntent: varchar("stripe_payment_intent", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Order = typeof orders.$inferSelect;

export const orderItems = mysqlTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: bigint("order_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => orders.id),
  productId: bigint("product_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => products.id),
  quantity: int("quantity").notNull(),
  price: int("price").notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;

export const orderStatusEvents = mysqlTable("order_status_events", {
  id: serial("id").primaryKey(),
  orderId: int("order_id").notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  note: text("note"),
  changedById: int("changed_by_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type OrderStatusEvent = typeof orderStatusEvents.$inferSelect;

export const bookings = mysqlTable("bookings", {
  id: serial("id").primaryKey(),
  userId: int("user_id"),
  userType: varchar("user_type", { length: 20 }),
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  customerEmail: varchar("customer_email", { length: 320 }).notNull(),
  customerPhone: varchar("customer_phone", { length: 50 }),
  serviceId: int("service_id"),
  staffUserId: int("staff_user_id"),
  serviceType: varchar("service_type", { length: 100 }).notNull(),
  durationMinutes: int("duration_minutes").notNull().default(60),
  price: int("price").notNull().default(0),
  paymentStatus: varchar("payment_status", { length: 50 }).notNull().default("unpaid"),
  stripeCheckoutSessionId: varchar("stripe_checkout_session_id", { length: 255 }),
  date: varchar("date", { length: 20 }).notNull(),
  time: varchar("time", { length: 10 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Booking = typeof bookings.$inferSelect;

export const heroImages = mysqlTable("hero_images", {
  id: serial("id").primaryKey(),
  url: varchar("url", { length: 500 }).notNull(),
  alt: varchar("alt", { length: 255 }),
  sortOrder: int("sort_order").notNull().default(0),
  active: int("active").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type HeroImage = typeof heroImages.$inferSelect;

export const subscribers = mysqlTable("subscribers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }).notNull().unique(),
  source: varchar("source", { length: 100 }).notNull().default("newsletter"),
  isActive: int("is_active").notNull().default(1),
  unsubscribedAt: timestamp("unsubscribed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Subscriber = typeof subscribers.$inferSelect;

export const newsletterCampaigns = mysqlTable("newsletter_campaigns", {
  id: serial("id").primaryKey(),
  subject: varchar("subject", { length: 255 }).notNull(),
  htmlBody: text("html_body").notNull(),
  audienceType: campaignAudienceEnum.notNull().default("selected"),
  sendToEveryone: int("send_to_everyone").notNull().default(0),
  createdById: int("created_by_id"),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type NewsletterCampaign = typeof newsletterCampaigns.$inferSelect;

export const newsletterRecipients = mysqlTable("newsletter_recipients", {
  id: serial("id").primaryKey(),
  campaignId: int("campaign_id").notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  name: varchar("name", { length: 255 }),
  deliveryStatus: varchar("delivery_status", { length: 50 })
    .notNull()
    .default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type NewsletterRecipient = typeof newsletterRecipients.$inferSelect;

export const contactMessages = mysqlTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  subject: varchar("subject", { length: 255 }),
  message: text("message").notNull(),
  read: int("read").notNull().default(0),
  status: varchar("status", { length: 50 }).notNull().default("new"),
  assignedToId: int("assigned_to_id"),
  lastRepliedAt: timestamp("last_replied_at"),
  followUpAt: timestamp("follow_up_at"),
  followUpNotes: text("follow_up_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type ContactMessage = typeof contactMessages.$inferSelect;

export const contactReplies = mysqlTable("contact_replies", {
  id: serial("id").primaryKey(),
  messageId: int("message_id").notNull(),
  sentById: int("sent_by_id").notNull(),
  body: text("body").notNull(),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
});

export type ContactReply = typeof contactReplies.$inferSelect;
