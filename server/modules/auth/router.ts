import { createRouter, authedQuery } from "../../middleware";

export const authRouter = createRouter({
  // ✅ This is the unified auth router (used for social login, Google, etc.)
  // It relies on ctx.unifiedUser which is already populated + verified by createContext middleware.
  // No need for manual token parsing or extra DB calls — exactly like the updated localAuth.me
  me: authedQuery.query(({ ctx }) => {
    return ctx.unifiedUser ?? null;
  }),

  logout: authedQuery.mutation(async () => {
    return { success: true };
  }),
});
