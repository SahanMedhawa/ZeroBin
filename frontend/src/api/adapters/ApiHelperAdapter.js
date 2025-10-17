import ApiHelper from "../../helpers/apiHelper";
import IHttpClient from "../abstractions/IHttpClient";

/**
 * ApiHelperAdapter
 * Adapter pattern implementation for ApiHelper
 * Implements IHttpClient interface
 *
 * This allows us to:
 * - Keep existing ApiHelper working
 * - Provide standardized interface
 * - Easily swap to different HTTP client if needed
 */
class ApiHelperAdapter extends IHttpClient {
  constructor() {
    super();
    this.apiHelper = new ApiHelper();
  }

  async get(endpoint, config = {}) {
    return await this.apiHelper.get(endpoint, config);
  }

  async post(endpoint, data, config = {}) {
    return await this.apiHelper.post(endpoint, data, config);
  }

  async put(endpoint, data, config = {}) {
    return await this.apiHelper.put(endpoint, data, config);
  }

  async delete(endpoint, config = {}) {
    return await this.apiHelper.delete(endpoint, config);
  }
}

export default ApiHelperAdapter;
