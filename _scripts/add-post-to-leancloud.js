#!/usr/bin/env node

const axios = require("axios");
const fs = require("fs");
const path = require("path");
const os = require("os");

const LEAN_CLOUD_HOST = "https://54ebbnax.api.lncldglobal.com/1.1";
const LEAN_CLOUD_CONFIG_PATH = os.homedir + "/apps/leancloud/.user";

const getHeaders = () => {
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    "x-lc-id": "54EbbNAX5QuGHXTuxTzisCKl-MdYXbMMI",
    "x-lc-key": "qtJ4MdvYSeDJvhLWQRUdr50C",
  };
};

const getLeanCloudLocalUserInfo = (configPath) => {
  if (fs.existsSync(configPath)) {
    const text = fs.readFileSync(configPath).toString();
    return text.split(":");
  }
  return [];
};

const axiosWrapper = async ({ url, method, headers, params, data }) => {
  try {
    const { data: responseData } = await axios({
      baseURL: LEAN_CLOUD_HOST,
      url,
      method,
      headers: { ...getHeaders(), ...headers },
      params,
      data,
    });
    return responseData;
  } catch (__error) {
    return null;
  }
};

const getUserToken = async (username, password) => {
  const data = await axiosWrapper({
    method: "get",
    url: "/login",
    params: { username, password },
  });

  if (data) {
    return data.sessionToken;
  } else {
    return null;
  }
};

const getArticle = async (sessionToken, articleUrl) => {
  const data = await axiosWrapper({
    method: "get",
    url: "/classes/Counter",
    headers: { "X-LC-Session": sessionToken },
    params: { where: '{"url":"' + articleUrl + '"}' },
  });

  return data;
};

const addArticle = async (sessionToken, articleUrl) => {
  const data = await axiosWrapper({
    method: "post",
    url: "/classes/Counter",
    headers: { "X-LC-Session": sessionToken },
    data: {
      title: articleUrl.substr(12, articleUrl.length - 12 - 1),
      url: articleUrl,
      time: 0,
    },
  });

  return data;
};

const deleteArticle = async (sessionToken, objectId) => {
  if (!objectId) {
    return null;
  }
  const data = await axiosWrapper({
    method: "delete",
    url: `/classes/Counter/${objectId}`,
    headers: { "X-LC-Session": sessionToken },
  });

  return data;
};

const main = async () => {
  const [username, password] = getLeanCloudLocalUserInfo(
    LEAN_CLOUD_CONFIG_PATH
  );
  if (!username) {
    console.error(
      `not find leancloud ops user config, path: ${LEAN_CLOUD_CONFIG_PATH}`
    );
    return;
  }

  const token = await getUserToken(username, password);
  if (!token) {
    console.error("get token error");
    return;
  }

  const articleUrl = "/2019/09/18/2019-9-18/";

  // const newData = await addArticle(token, articleUrl);
  // console.log(newData);

  const { results } = await getArticle(token, articleUrl);
  const articleData = results[0];

  const deletedData = await deleteArticle(token, articleData? articleData.objectId : null);
  console.log(deletedData);
};

main();
