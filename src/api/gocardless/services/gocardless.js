"use strict";
const { v4: uuidv4 } = require("uuid");
/**
 * gocardless service
 */

function logError(e) {
  console.log("<-------------------------ERROR----------------------->");
  console.log(e);
  console.log("<______________________END_ERROR______________________");
}

const gocardless = require("gocardless-nodejs");
const constants = require("gocardless-nodejs/constants");

const client = gocardless(
  process.env.GOCARDLESS_SECRET,
  constants.Environments.Sandbox
);

const getBillingRequest = async (id) => {
  return client.billingRequests.find(id).catch((e) => {
    logError(e);
    return null;
  });
};

const getMandate = async (mandate_id) => {
  return client.mandates.find(mandate_id).catch((e) => {
    logError(e);
    return null;
  });
};

const getMandatesForBillingRequest = async (customer_id, shared_link) => {
  const response = await client.mandates
    .list({ customer: customer_id })
    .catch((e) => {
      logError(e);
      return { mandates: [] };
    });

  return response.mandates.filter(
    (v) => v.metadata.shared_link === shared_link
  );
};

const getPayment = async (payment_id) => {
  const payment = await client.payments.find(payment_id).catch((e) => {
    logError(e);
    return null;
  });
  if (payment && payment.links.mandate) {
    payment.mandate = await getMandate(payment.links.mandate);
  }
  return payment;
};

const getCustomer = async (customer_id) => {
  return client.customers.find(customer_id).catch((e) => {
    logError(e);
    return null;
  });
};

/// this function will be used to create payment after mandate is authorized by customer
const createWeeklyPayment = async (
  mandate,
  amount,
  invoice,
  currency = "GBP"
) => {
  const data = {
    amount,
    currency,
    // charge_date: "2023-06-15",
    // reference: "WINEBOX001",
    metadata: {
      order_dispatch_date: "2023-05-22",
      invoice_id: invoice,
    },
    links: {
      mandate: mandate.id,
    },
  };
  console.log("creating payment:", data);
  const payment = await client.payments.create(data).catch((e) => e.message);
  return payment;

  // const data = {
  //   amount,
  //   currency,
  //   links: {
  //     mandate: mandate.id, // Replace with the mandate ID you obtained earlier
  //   },
  //   metadata: {
  //     customer: mandate.links.customer,
  //     invoice_id:invoice
  //   },
  //   interval: 1, // Specify the payment interval here
  //   interval_unit: "weekly",
  // };
  // const payment = await client.subscriptions.create(data).catch((e) => {
  //   logError(e);
  //   return null;
  // });
  // return payment;
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
  return client.customers
    .create({
      email,
      given_name,
      family_name,
      address_line1,
      address_line2,
      city,
      postal_code,
      country_code,
    })
    .catch((e) => {
      logError(e);
      return null;
    });
};

const createBillingRequest = async (customer_id, amount = "500") => {
  const shared_link = `${customer_id}|${uuidv4()}`;
  return client.billingRequests
    .create({
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
    })
    .catch((e) => {
      logError(e);
      return null;
    });
};

const createBillingRequestFlow = async (billingRequestId) => {
  return client.billingRequestFlows
    .create({
      redirect_uri: "https://my-company.com/landing",
      exit_uri: "https://my-company.com/exit",
      links: {
        billing_request: billingRequestId,
      },
    })
    .catch((e) => {
      logError(e);
      return null;
    });
};

module.exports = {
  createBillingRequest,
  createBillingRequestFlow,
  createCustomer,
  createWeeklyPayment,
  getBillingRequest,
  getPayment,
  getMandate,
  getMandatesForBillingRequest,
  getCustomer,
};
