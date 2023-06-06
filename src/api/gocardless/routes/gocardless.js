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
      path: "/gc/mandates",
      handler: "gocardless.getMandateDetails",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/gc/billing-requests",
      handler: "gocardless.getBillingRequestDetails",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/gc/customers",
      handler: "gocardless.getCustomerDetails",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/gc/payments",
      handler: "gocardless.getPaymentDetails",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/gc/generate-flow",
      handler: "gocardless.generateFlow",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/gc/billing-request-mandates",
      handler: "gocardless.getMandatesForBillingRequestList",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/gc/create-payment",
      handler: "gocardless.createPayment",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
