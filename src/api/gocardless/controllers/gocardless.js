"use strict";

const {
  getPayment,
  getBillingRequest,
  getMandate,
  createBillingRequestFlow,
  getCustomer,
  getMandatesForBillingRequest,
  createWeeklyPayment,
} = require("../services/gocardless");

const {} = require("@strapi/strapi").factories;
/**
 * A set of functions called "actions" for `gocardless`
 */

async function customUpdate(uid, filter_fields, data) {
  const records = await strapi.entityService
    .findMany(uid, filter_fields)
    .catch((e) => []);
  for (const record of records) {
    strapi.entityService.update(uid, record.id, { data }).catch((e) => {
      console.log("!------------Error-----------");
      console.log(e);
    });
  }
}

async function syncPayment(event) {
  const payment = await getPayment(event.links.payment);
  if (!payment) {
    return;
  }
  const findResult = await strapi.entityService.findMany(
    "api::payment.payment",
    {
      payment_id: payment.id,
    }
  );

  if (findResult.length === 1) {
    const data = {
      amount: payment.amount,
      status: payment.status,
      remarks: payment.description,
      reference: payment.reference,
      customer_id: payment.mandate.links.customer,
    };
    customUpdate("api::payment.payment", { payment_id: payment.id }, data);
  } else {
    strapi.entityService
      .create("api::payment.payment", {
        data: {
          amount: payment.amount,
          status: payment.status,
          remarks: payment.description,
          reference: payment.reference,
          payment_id: payment.id,
          customer_id: payment.mandate.links.customer,
          date: payment.created_at,
          publishedDate: new Date(),
        },
      })
      .catch((e) => console.log("failed to save payment", e));
  }
}

async function syncBillingRequest(event) {
  const br = await getBillingRequest(event.links.billing_request);

  if (br.status) {
    const data = { status: br.status };
    customUpdate(
      "api::billing-request.billing-request",
      { billing_request_id: br.id },
      data
    );
  }
}

async function syncMandate(event) {
  const mandate_id = event.links.mandate;
  const mandate = await getMandate(mandate_id);
  if (mandate.metadata.shared_link) {
    if (mandate.metadata.mtype === "recurring") {
      customUpdate(
        "api::billing-request.billing-request",
        { shared_link: mandate.metadata.shared_link },
        { mandate_id: mandate_id, mandate_status: mandate.status }
      );
      if (mandate.status === "pending_submission") {
        createWeeklyPayment(mandate, "7000");
      }
    }
  }
}

module.exports = {
  getMandatesForBillingRequestList: async (ctx) => {
    return getMandatesForBillingRequest(
      ctx.query.customer_id,
      ctx.query.shared_link
    );
  },
  getMandateDetails: async (ctx) => {
    const mandate = await getMandate(ctx.query.id);
    console.log(ctx.query);
    return mandate;
  },
  getBillingRequestDetails: async (ctx) => {
    return getBillingRequest(ctx.query.id);
  },
  getPaymentDetails: async (ctx) => {
    return getPayment(ctx.query.id);
  },
  getCustomerDetails: async (ctx) => {
    return getCustomer(ctx.query.id);
  },

  generateFlow: async (ctx) => {
    return createBillingRequestFlow(ctx.query.billing_request_id);
  },

  createPayment: async (ctx) => {
    const mandate = await getMandate(ctx.query.mandate_id);
    if (mandate) return createWeeklyPayment(mandate, ctx.query.amount);
    else ctx.body = "error";
  },

  handleEvent: async (ctx, next) => {
    try {
      const events = ctx.request.body.events;
      events.forEach((event) => {
        const data = {
          event_id: event.id,
          event_created_at: event.created_at,
          resource_type: event.resource_type,
          action: event.action,
          details: event.details,
          links: event.links,
          metadata: event.metadata,
        };
        if (data.resource_type === "payments") syncPayment(data);
        else if (data.resource_type === "mandates") syncMandate(event);
        else if (data.resource_type === "billing_requests")
          syncBillingRequest(event);
        strapi.entityService.create("api::gc-event.gc-event", {
          data,
        });
      });
      ctx.body = "ok";
    } catch (err) {
      ctx.body = err;
    }
  },
};
