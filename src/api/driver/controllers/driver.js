"use strict";

const { default: axios } = require("axios");
const {
  createCustomer,
  createBillingRequest,
  createBillingRequestFlow,
} = require("../../gocardless/services/gocardless");
const QuickbookAuth = require("../../quickbooks/services/quickbooks");

/**
 * driver controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

async function createCustomerBillingRequest(data, entityService) {
  const response = await createCustomer(data);
  if (!response) return;
  const br = await createBillingRequest(response.id);
  const flow = await createBillingRequestFlow(br.id);
  entityService.create("api::billing-request.billing-request", {
    data: {
      billing_request_id: br.id,
      customer_id: response.id,
      status: "init",
      flow_id: flow.id,
      authorization_url: flow.authorisation_url,
      actions: ["initialized"],
      publishedAt: new Date(),
    },
  });
  return response;
}

async function createQuickbooksCustomer({
  email,
  given_name,
  family_name,
  address_line1,
  // address_line2,
  city,
  postal_code,
  country_code,
}) {
  const baseURL = process.env.QUICKBOOKS_BASE_URL;
  const url = `${baseURL}customer`;
  const data = {
    FullyQualifiedName: given_name + family_name,
    PrimaryEmailAddr: {
      Address: email,
    },
    DisplayName: given_name + family_name,
    Title: "Mr",
    Notes: "Customer Created By The System",
    FamilyName: family_name,
    PrimaryPhone: {
      FreeFormNumber: "(555) 555-5555",
    },
    BillAddr: {
      City: city,
      PostalCode: postal_code,
      Line1: address_line1,
      Country: country_code,
    },
    GivenName: given_name,
  };
  const accessToken = await QuickbookAuth.getAccessToken();
  const headers = {
    Authorization: `Bearer ${accessToken.access_token}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  return axios
    .post(url, data, { headers })
    .then((resp) => {
      const res = resp.response?.data ?? resp.data;
      return {
        success: true,
        Customer: res.Customer,
        message: "Customer Created!",
      };
    })
    .catch((e) => {
      return {
        success: false,
        message: e.message ?? "something went wrong!",
        error: e.response?.data?.Fault?.Error,
      };
    });
}

module.exports = createCoreController("api::driver.driver", ({ strapi }) => ({
  async create(ctx) {
    const response = await createCustomerBillingRequest(
      {
        ...ctx.request.body.data,
      },
      strapi.entityService
    );

    if (response) ctx.request.body.data.gc_customer_id = response.id;
    // const response2 = await createQuickbooksCustomer({
    //   ...ctx.request.body.data,
    // });

    // if (response2.success)
    //   ctx.request.body.data.qb_customer_id = response2.Customer.Id;

    // const success = response || response2.success;

    if (response) return super.create(ctx);
    return {
      error: response.error ?? [
        { message: "somthing went wrong, in the server!" },
      ],
    };
  },
}));
