const axios = require("axios");

const NIBSS_BASE_URL = process.env.NIBSS_BASE_URL;

let cachedToken = null;
let tokenExpiresAt = 0;

const getToken = async () => {
  // Reuse token if it is still valid
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  const response = await axios.post(
    `${NIBSS_BASE_URL}/api/auth/token`,
    {
      apiKey: process.env.NIBBS_APIKEY,
      apiSecret: process.env.NIBBS_APISECRET,
    }
  );

  cachedToken = response.data.token;

  // JWT expires in 1 hour in your response.
  // Refresh 1 minute early.
  tokenExpiresAt = Date.now() + 59 * 60 * 1000;

  return cachedToken;
};

const insertBvn = async ({
  bvn,
  firstName,
  lastName,
  dob,
  phone,
}) => {
  const token = await getToken();

  const response = await axios.post(
    `${NIBSS_BASE_URL}/api/insertBvn`,
    {
      bvn,
      firstName,
      lastName,
      dob,
      phone,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

const createAccount = async ({ bvn, dob }) => {
  const token = await getToken();

  const response = await axios.post(
    `${NIBSS_BASE_URL}/api/account/create`,
    {
      kycType: "BVN",
      kycID: bvn,
      dob,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

module.exports = {
  getToken,
  insertBvn,
  createAccount,
};