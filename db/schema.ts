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

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
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
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type LocalUser = typeof localUsers.$inferSelect;
export type InsertLocalUser = typeof localUsers.$inferInsert;

export const products = mysqlTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: int("price").notNull(),
  image: varchar("image", { length: 500 }),
  category: varchar("category", { length: 100 }).notNull().default("general"),
  inventory: int("inventory").notNull().default(0),
  featured: int("featured").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Product = typeof products.$inferSelect;

export const orders = mysqlTable("orders", {
  id: serial("id").primaryKey(),
  userId: int("user_id"),
  userType: varchar("user_type", { length: 20 }),
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  customerEmail: varchar("customer_email", { length: 320 }).notNull(),
  total: int("total").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  stripePaymentIntent: varchar("stripe_payment_intent", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
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

export const bookings = mysqlTable("bookings", {
  id: serial("id").primaryKey(),
  userId: int("user_id"),
  userType: varchar("user_type", { length: 20 }),
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  customerEmail: varchar("customer_email", { length: 320 }).notNull(),
  customerPhone: varchar("customer_phone", { length: 50 }),
  serviceType: varchar("service_type", { length: 100 }).notNull(),
  date: varchar("date", { length: 20 }).notNull(),
  time: varchar("time", { length: 10 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
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
  email: varchar("email", { length: 320 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Subscriber = typeof subscribers.$inferSelect;

export const contactMessages = mysqlTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  subject: varchar("subject", { length: 255 }),
  message: text("message").notNull(),
  read: int("read").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ContactMessage = typeof contactMessages.$inferSelect;
