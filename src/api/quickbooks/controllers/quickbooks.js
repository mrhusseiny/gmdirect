"use strict";

const { default: axios } = require("axios");
const QuickbookAuth = require("../services/quickbooks");

/**
 * A set of functions called "actions" for `quckbooks`
 */

async function getBalanceSheet(reportName = "BalanceSheet") {
  const baseURL = process.env.QUICKBOOKS_BASE_URL;
  const url = `${baseURL}reports/${reportName}`;

  const accessToken = await QuickbookAuth.getAccessToken();

  const headers = {
    Authorization: `Bearer ${accessToken.access_token}`,
    Accept: "application/json",
  };

  return axios
    .get(url, { headers })
    .then((resp) => {
      return resp.data;
    })
    .catch((e) => {
      return {
        success: false,
        message: e.message ?? "something went wrong!",
        error: e.response?.data?.Fault?.Error,
      };
    });
}

async function getPayments(paymentId = null) {
  const baseURL = process.env.QUICKBOOKS_BASE_URL;
  const query = `select * from Payment${
    paymentId ? ` Where Id=${paymentId}` : ""
  }`;
  const url = `${baseURL}query?query=${query}`;

  const accessToken = await QuickbookAuth.getAccessToken();

  const headers = {
    Authorization: `Bearer ${accessToken.access_token}`,
    Accept: "application/json",
  };

  return axios
    .get(url, { headers })
    .then((resp) => {
      return resp.data.QueryResponse;
    })
    .catch((e) => {
      return {
        success: false,
        message: e.message ?? "something went wrong!",
        error: e.response?.data?.Fault?.Error,
      };
    });
}

async function getExpenses(expenseId = null) {
  const baseURL = process.env.QUICKBOOKS_BASE_URL;
  const query = `select * from Purchase${
    expenseId ? ` Where Id=${expenseId}` : ""
  }`;
  const url = `${baseURL}query?query=${query}`;

  const accessToken = await QuickbookAuth.getAccessToken();

  const headers = {
    Authorization: `Bearer ${accessToken.access_token}`,
    Accept: "application/json",
  };

  return axios
    .get(url, { headers })
    .then((resp) => {
      return resp.data.QueryResponse;
    })
    .catch((e) => {
      return {
        success: false,
        message: e.message ?? "something went wrong!",
        error: e.response?.data?.Fault?.Error,
      };
    });
}

async function getAccounts(accountId = null) {
  const baseURL = process.env.QUICKBOOKS_BASE_URL;
  const query = `select * from Account${
    accountId ? ` Where Id=${accountId}` : ""
  }`;
  const url = `${baseURL}query?query=${query}`;

  const accessToken = await QuickbookAuth.getAccessToken();

  const headers = {
    Authorization: `Bearer ${accessToken.access_token}`,
    Accept: "application/json",
  };

  return axios
    .get(url, { headers })
    .then((resp) => {
      return resp.data.QueryResponse;
    })
    .catch((e) => {
      return {
        success: false,
        message: e.message ?? "something went wrong!",
        error: e.response?.data?.Fault?.Error,
      };
    });
}

async function createExpense(data) {
  const baseURL = process.env.QUICKBOOKS_BASE_URL;
  const url = `${baseURL}purchase`;

  const accessToken = await QuickbookAuth.getAccessToken();

  const headers = {
    Authorization: `Bearer ${accessToken.access_token}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  return axios
    .post(url, data, { headers })
    .then((resp) => resp.data)
    .catch((e) => ({
      success: false,
      message: e.message ?? e.data?.message ?? "something went wrong!!!",
    }));
}

module.exports = {
  reports: async (ctx) => {
    try {
      const { reportName } = ctx.request.query;
      ctx.body = await getBalanceSheet(reportName);
    } catch (err) {
      ctx.body = { error: err.message ?? "something went wrong" };
    }
  },
  payments: async (ctx) => {
    try {
      const { paymentId } = ctx.request.query;
      ctx.body = await getPayments(paymentId);
    } catch (err) {
      ctx.body = { error: err.message ?? "something went wrong" };
    }
  },
  expenses: async (ctx) => {
    try {
      const { expenseId } = ctx.request.query;
      ctx.body = await getExpenses(expenseId);
    } catch (err) {
      ctx.body = { error: err.message ?? "something went wrong" };
    }
  },
  accounts: async (ctx) => {
    try {
      const { accountId } = ctx.request.query;
      ctx.body = await getAccounts(accountId);
    } catch (err) {
      ctx.body = { error: err.message ?? "something went wrong" };
    }
  },
  createExpense: async (ctx) => {
    return createExpense(ctx.request.body);
  },
};
