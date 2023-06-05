"use strict";

const {
  createCustomer,
  createBillingRequest,
} = require("../../gocardless/services/gocardless");

/**
 * driver controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

async function createCustomerBillingRequest(data, entityService) {
  const response = await createCustomer(data);
  const br = await createBillingRequest(response.id);
  const flow = await createBillingRequestFlow(br.id);
  entityService.create("api::billing-request.billing-request", {
    data: {
      billing_request_id: br.id,
      customer_id: response.id,
      status: "init",
      flow_id: flow.id,
      authorization_url: flow.authorization_url,
    },
  });
  return response;
}

module.exports = createCoreController("api::driver.driver", ({ strapi }) => ({
  async create(ctx) {
    const response = await createCustomerBillingRequest({
      ...ctx.request.body.data,
    });
    ctx.request.body.data.gc_customer_id = response.id;
    return super.create(ctx);
  },
}));
