const axios = require("axios")

const nibbsUrl = process.env.NIBBS_BASE_URL
const token = null

const generateToken = async ()=>{
  const response = await axios.post(
    `${nibbsUrl}/api/auth/token`,
    {
      apiKey: process.env.NIBBS_APIKEY,
      apiSecret: process.env.NIBBS_APISECRET,
    }
  );

  token = response.data.token;

  return token;
}

const insertBvn = async ({ bvn, firstName, lastName, dob, phone }) => {
  const jwt = await getToken();

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
        Authorization: `Bearer ${jwt}`,
      },
    }
  );

  return response.data;
};

const createAccount = async ({ bvn, dob }) => {
  const jwt = await getToken();

  const response = await axios.post(
    `${NIBSS_BASE_URL}/api/account/create`,
    {
      kycType: "BVN",
      kycID: bvn,
      dob,
    },
    {
      headers: {
        Authorization: `Bearer ${jwt}`,
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