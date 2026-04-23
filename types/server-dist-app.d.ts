declare module "../server-dist/app.js" {
  const app: {
    fetch: (request: Request) => Promise<Response> | Response;
  };

  export default app;
}
