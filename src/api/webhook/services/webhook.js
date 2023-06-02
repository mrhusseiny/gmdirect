"use strict";

/**
 * webhook service
 */

const gocardless = require("gocardless-nodejs");
const constants = require("gocardless-nodejs/constants");

const client = gocardless(
  "sandbox_gGzgkv3ThVLLvFl9vkHqrVyB-tMyUwqj5sv-Uaf3",
  constants.Environments.Sandbox
);

const createBillingRequest = async (billAmount, customer_email) => {
  const amount = billAmount ?? "500";

  const customerId = "CU000WJ9Y46NGN";
  // we can query our database to find the customerId based on customerEmail

  return client.billingRequests.create({
    payment_request: {
      description: "First Payment",
      amount,
      currency: "GBP",
      app_fee: "500",
    },
    mandate_request: {
      scheme: "bacs",
    },
    links: {
      customer: customerId,
    },
  });
};

const createBillingRequestFlow = async (billingRequestId) => {
  return await client.billingRequestFlows.create({
    redirect_uri: "https://my-company.com/landing",
    exit_uri: "https://my-company.com/exit",
    links: {
      billing_request: billingRequestId,
    },
  });
  ///this will return an object with authorization_url
};

const getDetails = async (id) => {
  return client.billingRequests.find(id);
};

/// this function will be used to create payment after mandate is authorized by customer
const createPayment = async (mandate_id) => {
  const payment = await gocardless.payments.create({
    amount: 1000, // Amount in cents/pence (e.g., £10.00 is 1000)
    currency: "GBP",
    links: {
      mandate: mandate_id, // Replace with the mandate ID you obtained earlier
    },
    metadata: {
      invoice_number: "INV001",
      customer_id: "CUS000112",
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

module.exports = {
  createBillingRequest,
  createBillingRequestFlow,
  createCustomer,
  createPayment,
  getDetails,
};
