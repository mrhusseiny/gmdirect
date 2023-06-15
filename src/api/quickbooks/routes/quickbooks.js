module.exports = {
  routes: [
    {
      method: "GET",
      path: "/quickbooks/reports",
      handler: "quickbooks.reports",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/quickbooks/payments",
      handler: "quickbooks.payments",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/quickbooks/expenses",
      handler: "quickbooks.expenses",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/quickbooks/accounts",
      handler: "quickbooks.accounts",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/quickbooks/expenses",
      handler: "quickbooks.createExpense",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
