"use strict";
const { v4: uuidv4 } = require("uuid");
/**
 * gocardless service
 */

const gocardless = require("gocardless-nodejs");
const constants = require("gocardless-nodejs/constants");

const client = gocardless(
  "sandbox_gGzgkv3ThVLLvFl9vkHqrVyB-tMyUwqj5sv-Uaf3",
  constants.Environments.Sandbox
);

const getBillingRequest = async (id) => {
  return client.billingRequests.find(id);
};

const getBillingRequestFlow = async (id) => {
  return client.billingRequestFlows.find(id);
};

const getMandate = async (mandate_id) => {
  return client.mandates.find(mandate_id);
};

const getMandateForBillingRequest = async (customer_id, shared_link) => {
  const mandates = client.mandates.list({ customer: customer_id });
  return mandates.find((v) => v.metadata.shared_link === shared_link);
};

const getPayment = async (payment_id) => {
  const payment = await client.payments.find(payment_id).catch((e) => {
    return null;
  });
  if (payment && payment.links.mandate) {
    payment.mandate = await getMandateDetails(payment.links.mandate);
  }
  return payment;
};

const getCustomer = async (customer_id) => {
  return client.customers.find(customer_id);
};

/// this function will be used to create payment after mandate is authorized by customer
const createWeeklyPayment = async (mandate, amount, currency = "GBP") => {
  const payment = await gocardless.payments.create({
    amount, // Amount in cents/pence (e.g., £10.00 is 1000)
    currency,
    links: {
      mandate: mandate.id, // Replace with the mandate ID you obtained earlier
    },
    metadata: {
      customer: mandate.links.customer,
    },
    description: "Weekly subscription payment",
    interval: "1 week", // Specify the payment interval here
  });
  return payment;
};

const createCustomer = async ({
  email,
  given_name,
  family_name,
  address_line1,
  address_line2,
  city,
  postal_code,
  country_code,
}) => {
  console.log();
  return client.customers.create({
    email,
    given_name,
    family_name,
    address_line1,
    address_line2,
    city,
    postal_code,
    country_code,
  });
};

const createBillingRequest = async (customer_id, amount = "500") => {
  const shared_link = `${customer_id}|${uuidv4()}`;
  return client.billingRequests.create({
    metadata: {
      shared_link,
    },
    payment_request: {
      description: "First Payment",
      amount,
      currency: "GBP",
      app_fee: "500",
      metadata: { shared_link, mtype: "one-off" },
    },
    mandate_request: {
      scheme: "bacs",
      metadata: {
        shared_link,
        mtype: "recurring",
      },
    },
    links: {
      customer: customer_id,
    },
  });
};

const createBillingRequestFlow = async (billingRequestId) => {
  return client.billingRequestFlows.create({
    redirect_uri: "https://my-company.com/landing",
    exit_uri: "https://my-company.com/exit",
    links: {
      billing_request: billingRequestId,
    },
  });
};

module.exports = {
  createBillingRequest,
  createBillingRequestFlow,
  createCustomer,
  createWeeklyPayment,
  getBillingRequest,
  getBillingRequestFlow,
  getPayment,
  getMandate,
  getMandateForBillingRequest,
  getCustomer,
};
