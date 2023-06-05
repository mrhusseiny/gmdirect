"use strict";

const {
  getPaymentDetails,
  getBillingRequest,
  getMandate,
  createBillingRequestFlow,
  getPayment,
  getCustomer,
  getBillingRequestFlow,
  getMandateForBillingRequest,
  createWeeklyPayment,
} = require("../services/gocardless");

const {} = require("@strapi/strapi").factories;
/**
 * A set of functions called "actions" for `gocardless`
 */

async function syncPayment(event, entityService) {
  const payment = await getPaymentDetails(event.links.payment);
  if (!payment) {
    return;
  }
  const findResult = await entityService.findMany("api::payment.payment", {
    payment_id: payment.id,
  });

  if (findResult.length === 1) {
    entityService.update(
      "api::payment.payment",
      { payment_id: payment.id },
      {
        amount: payment.amount,
        status: payment.status,
        remarks: payment.description,
        reference: payment.reference,
      }
    );
  } else {
    entityService.create("api::payment.payment", {
      data: {
        amount: payment.amount,
        status: payment.status,
        remarks: payment.description,
        reference: payment.reference,
        payment_id: payment.id,
        customer_id: payment.links.customer,
        date: payment.created_at,
      },
    });
  }
}

async function syncBillingRequest(event, entityService) {
  const br = await getBillingRequest(event.links.billing_request);
  const mandate = await getMandateForBillingRequest(
    event.links.customer,
    br.metadata.shared_link
  );
  let data = {};
  if (br.status) data.status = br.status;
  if (mandate) {
    data.mandate_status = mandate.status;
    data.mandate_id = mandate.id;
  }

  entityService.update(
    "api::billing-request.billing-request",
    { billing_request_id: br.id },
    data
  );
}

async function syncMandate(event, entityService) {
  const mandate_id = event.links.mandate;
  const mandate = await getMandate(mandate_id);
  if (mandate.metadata.shared_link) {
    if (mandate.metadata.mtype === "recurring") {
      entityService.update(
        "api::billing-request.billing-request",
        { shared_link: mandate.metadata.shared_link },
        { mandate_id: mandate_id, mandate_status: mandate.status }
      );
      if (mandate.status === "active") {
        createWeeklyPayment(mandate, "7000");
        entityService.create("api::payment.payment", {
          data: {
            amount: payment.amount,
            status: payment.status,
            remarks: payment.description,
            reference: payment.reference,
            payment_id: payment.id,
            customer_id: mandate.links.customer,
            data: payment.created_at,
          },
        });
      }
    }
  }
}

module.exports = {
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
  getFlowDetails: async (ctx) => {
    return getBillingRequestFlow(ctx.query.id);
  },

  generateFlow: async (ctx) => {
    return createBillingRequestFlow(ctx.query.billing_request_id);
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
        if (data.resource_type === "payments")
          syncPayment(data, strapi.entityService);
        else if (data.resource_type === "mandates")
          syncMandate(event, strapi.entityService);
        else if (data.resource_type === "billing_requests")
          syncBillingRequest(event, strapi.entityService);
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
