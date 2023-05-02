/*
    `gatey-sdk-js`
    Gatey JavaScript library.
    Error Monitoring service.
    https://gatey.florgon.com


    Current SDK version:
        v0.0.0
    Expected API version: 
        v0.0.1

    Source code:
        https://github.com/florgon/gatey-sdk-js
    
    API documentation:
        https://gatey.florgon.com/dev/api
    
    Homepages:
        https://gatey.florgon.com/
*/

const sumObjectsByKey = (...objs) => {
  const res = objs.reduce((a, b) => {
    for (let k in b) {
      if (b.hasOwnProperty(k)) a[k] = (a[k] || 0) + b[k];
    }
    return a;
  }, {});
  return res;
};

class Client {
  HTTP_API_URL = "https://api-gatey.florgon.com/v1/";
  HTTP_DEFAULT_HEADERS = {
    "Content-Type": "application/json",
  };
  HTTP_DEFAULT_METHOD = "GET";

  constructor(
    projectId = undefined,
    clientSecret = undefined,
    serverSecret = undefined,
    logDebug = false
  ) {
    if (!projectId) {
      throw Error("Project ID is required for gatey::Client!");
    }
    if (!clientSecret && serverSecret) {
      throw Error(
        "None of client and server secrets is not passed to the gatey::Client!"
      );
    }

    this.logDebug = logDebug;
    this.projectId = projectId;
    this.clientSecret = clientSecret;
    this.serverSecret = serverSecret;
  }

  captureEvent = function (message, level = undefined, tags = undefined) {
    const params = {};
    tags ??= {};
    tags = Object.assign({}, tags, this._getDefaultTags());
    if (level) {
      params.level = level;
    }
    params.message = message;
    params.tags = JSON.stringify(tags);

    this.apiRequest("event.capture", params)
      .then(() => {
        if (this.logDebug) console.log("captured! OK!");
      })
      .catch((j) => {
        if (this.logDebug) console.log("not captured! not OK!");
        console.error(j.error);
      });
  };

  apiRequest = function (method, params) {
    if (this.logDebug) console.log(this._buildRequestURL(method, params).href);
    return this._wrapSentRequestPromise(
      fetch(this._buildRequestURL(method, params), {
        method: this.HTTP_DEFAULT_METHOD,
        headers: this._getHeaders(),
      })
    );
  };

  _buildRequestURL = function (method, params) {
    /// @description Returns ready request URL for the API call.
    const url = new URL(`${this.HTTP_API_URL}${method}`);
    params.project_id = this.projectId;
    params.server_secret = this.serverSecret;
    params.client_secret = this.clientSecret;
    url.search = new URLSearchParams(params);
    return url;
  };

  _getDefaultTags = function () {
    return {
      "sdk.ver": "0.0.0",
      "sdk.name": "gatey.js.official",
      "runtime.name": "JavaScript",
      "runtime.ver": "Undetected",
    };
  };

  _getHeaders = function () {
    /// @description Returns headers object for request.
    let headers = this.HTTP_DEFAULT_HEADERS;

    return headers;
  };

  _wrapSentRequestPromise = function (promise) {
    return new Promise((resolve, reject) => {
      promise
        .then((httpResponse) => {
          httpResponse
            .json()
            .then((jsonResponse) => {
              if ("success" in jsonResponse)
                resolve(jsonResponse, httpResponse);
              reject(jsonResponse, httpResponse);
            })
            .catch(reject);
        })
        .catch(reject);
    });
  };
}

const client = new Client(3, "tbsN0wl8BbV54_QjxeesWbbmB5rI6sW4EpIzHj_Io2c");
client.captureEvent("hi", undefined, { "proprietary-tag": "some" });

export default {
  Client,
};
