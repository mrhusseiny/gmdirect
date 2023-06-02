"use strict";

const { createCustomer } = require("../../webhook/services/webhook");

/**
 * driver controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::driver.driver", ({ strapi }) => ({
  async create(ctx) {
    const response = await createCustomer({ ...ctx.request.body.data });
    ctx.request.body.data.gc_customer_id = response.id;
    return super.create(ctx);
  },
}));
