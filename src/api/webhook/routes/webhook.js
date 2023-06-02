module.exports = {
  routes: [
    {
      method: "POST",
      path: "/webhook",
      handler: "webhook.handleEvent",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
