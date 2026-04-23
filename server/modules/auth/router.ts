import { createRouter, authedQuery } from "../../middleware.js";

export const authRouter = createRouter({
  me: authedQuery.query(({ ctx }) => {
    return ctx.unifiedUser ?? null;
  }),

  logout: authedQuery.mutation(async () => {
    return { success: true };
  }),
});
