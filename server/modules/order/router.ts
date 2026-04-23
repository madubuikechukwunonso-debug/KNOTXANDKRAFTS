import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";
import {
  createRouter,
  publicQuery,
  authedQuery,
  adminQuery,
} from "../../middleware";
import { getDb } from "../../queries/connection";
import { orders, orderItems, products } from "@db/schema";

export const orderRouter = createRouter({
  create: publicQuery
    .input(
      z.object({
        items: z.array(
          z.object({
            productId: z.number(),
            quantity: z.number().min(1),
          }),
        ),
        customerName: z.string().min(1),
        customerEmail: z.string().email(),
        userId: z.number().optional(),
        userType: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      let total = 0;
      const itemDetails: {
        productId: number;
        quantity: number;
        price: number;
      }[] = [];

      for (const item of input.items) {
        const product = await db
          .select()
          .from(products)
          .where(eq(products.id, item.productId))
          .limit(1);

        if (product.length === 0) {
          throw new Error(`Product ${item.productId} not found`);
        }

        const price = product[0].price;
        total += price * item.quantity;

        itemDetails.push({
          productId: item.productId,
          quantity: item.quantity,
          price,
        });
      }

      const orderResult = await db.insert(orders).values({
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        total,
        status: "pending",
        userId: input.userId,
        userType: input.userType,
      });

      const orderId = Number(orderResult[0].insertId);

      for (const item of itemDetails) {
        await db.insert(orderItems).values({
          orderId,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        });
      }

      return {
        order: {
          id: orderId,
          total,
          status: "pending",
          customerName: input.customerName,
          customerEmail: input.customerEmail,
        },
      };
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();

      const order = await db
        .select()
        .from(orders)
        .where(eq(orders.id, input.id))
        .limit(1);

      if (order.length === 0) return null;

      const items = await db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, input.id));

      return { ...order[0], items };
    }),

  list: adminQuery.query(async () => {
    const db = getDb();

    return db.select().from(orders).orderBy(desc(orders.createdAt));
  }),

  updateStatus: adminQuery
    .input(z.object({ id: z.number(), status: z.string() }))
    .mutation(async ({ input }) => {
      const db = getDb();

      await db
        .update(orders)
        .set({ status: input.status })
        .where(eq(orders.id, input.id));

      const result = await db
        .select()
        .from(orders)
        .where(eq(orders.id, input.id))
        .limit(1);

      return result[0];
    }),

  myOrders: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const user = ctx.unifiedUser!;

    return db
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.userId, user.id),
          eq(orders.userType, user.userType),
        ),
      )
      .orderBy(desc(orders.createdAt));
  }),
});
