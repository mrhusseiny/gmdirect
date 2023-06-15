"use strict";

/**
 * quckbooks service
 */
const fs = require("fs");
const axios = require("axios");
const OAuthClient = require("intuit-oauth");

const clientID = process.env.QB_CLIENT_ID;
const clientSecret = process.env.QB_CLIENT_SECRET;

function readFile(path) {
  const result = fs.readFileSync(path);
  return JSON.parse(result);
}
const data = readFile("./data.json");

class QbAuth {
  refreshToken = data.refresh_token;
  accessToken = data.access_token;
  oauthClient = null;

  write(val) {
    fs.writeFileSync("./data.json", JSON.stringify(val));
  }

  async #init() {
    const thisObj = this;
    this.oauthClient = new OAuthClient({
      clientId: clientID,
      clientSecret: clientSecret,
      environment: "sandbox",
      redirectUri: "https://google.com",
      token: thisObj.accessToken,
    });
    this.oauthClient.setToken(this.accessToken);
    await this.oauthClient
      .refreshUsingToken(this.refreshToken)
      .then((response) => {
        const val = response.getJson();
        thisObj.accessToken = val.access_token;
        thisObj.refreshToken = val.refresh_token;
        thisObj.write(val);
      });
  }

  async getAccessToken() {
    if (this.oauthClient === null) await this.#init();
    if (!this.oauthClient.isAccessTokenValid()) {
      await this.oauthClient.refresh().then(console.log);
    }
    return this.oauthClient.getToken().getToken();
  }
}

const QuickbookAuth = new QbAuth();

module.exports = QuickbookAuth;
