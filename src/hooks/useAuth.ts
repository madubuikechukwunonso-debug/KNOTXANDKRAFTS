import { trpc } from "@/providers/trpc";

export function useAuth() {
  const {
    data: user,
    isLoading,
    refetch,
  } = trpc.localAuth.me.useQuery(undefined, {
    retry: false,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const logoutMutation = trpc.localAuth.logout.useMutation({
    onSuccess: async () => {
      localStorage.removeItem("local_auth_token");
      await refetch();
      window.location.href = "/login";
    },
  });

  const role = user?.role ?? "user";
  const isAuthenticated = Boolean(user);
  const isAdmin = role === "admin" || role === "super_admin";
  const isWorker = role === "worker" || isAdmin;

  return {
    user,
    isLoading,
    isAuthenticated,
    isAdmin,
    isWorker,
    logout: () => logoutMutation.mutate(),
  };
}
