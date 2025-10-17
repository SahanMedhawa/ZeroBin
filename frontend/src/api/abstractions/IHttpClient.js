/**
 * IHttpClient Interface
 * Abstraction for HTTP operations
 *
 * Benefits:
 * - Easy to swap implementations (fetch, axios, ApiHelper)
 * - Easy to mock for testing
 * - Loose coupling between business logic and HTTP layer
 */
class IHttpClient {
  async get(endpoint, config) {
    throw new Error("Method 'get' must be implemented");
  }

  async post(endpoint, data, config) {
    throw new Error("Method 'post' must be implemented");
  }

  async put(endpoint, data, config) {
    throw new Error("Method 'put' must be implemented");
  }

  async delete(endpoint, config) {
    throw new Error("Method 'delete' must be implemented");
  }
}

export default IHttpClient;
