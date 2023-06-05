"use strict";

/**
 * payment controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::payment.payment"
  //, ({ strapi }) => ({
  //   findCustom: async () => {
  //     const contentType = strapi.contentType("api::payment.payment");
  //     const sanitizedQueryParams = await contentAPI.query(
  //       ctx.query,
  //       contentType,
  //       ctx.state.auth
  //     );
  //     const entities = await strapi.entityService.findMany(
  //       contentType.uid,
  //       sanitizedQueryParams
  //     );
  //     console.log("------------------------------------------");
  //     console.log(entities);
  //     return await contentAPI.output(entities, contentType, ctx.state.auth);
  //   },
  // })
);
