"use strict";
const {} = require("@strapi/strapi").factories;
/**
 * A set of functions called "actions" for `webhook`
 */

module.exports = {
  handleEvent: async (ctx, next) => {
    try {
      const events = ctx.request.body.events;
      events.forEach((event) => {
        strapi.entityService.create("api::gc-event.gc-event", {
          data: {
            event_id: event.id,
            event_created_at: event.created_at,
            resource_type: event.resource_type,
            action: event.action,
            details: event.details,
            links: event.links,
            metadata: event.metadata,
          },
        });
      });
      ctx.body = "ok";
    } catch (err) {
      ctx.body = err;
    }
  },
};
