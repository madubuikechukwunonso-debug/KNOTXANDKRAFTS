declare module "../server/app.js" {
  const app: {
    fetch: (request: Request) => Promise<Response> | Response;
  };

  export default app;
}
