module.exports = {
  routes: [
    {
      method: "POST",
      path: "/gocardless",
      handler: "gocardless.handleEvent",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/mandates",
      handler: "gocardless.getMandateDetails",
      confirm: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/billing-requests",
      handler: "gocardless.getBillingRequestDetails",
      confirm: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/billing-request-flows",
      handler: "gocardless.getFlowDetails",
      confirm: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/customers",
      handler: "gocardless.getCustomerDetails",
      confirm: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/payments",
      handler: "gocardless.getPaymentDetails",
      confirm: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/generate-flow",
      handler: "gocardless.generateFlow",
      confirm: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
