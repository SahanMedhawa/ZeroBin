/**
 * IWmaApiService Interface
 * Abstraction for WMA API operations
 *
 * Demonstrates Dependency Inversion Principle:
 * - High-level modules (components) depend on this abstraction
 * - Low-level modules (WmaAuthService) implement this abstraction
 * - Both depend on abstractions, not concrete implementations
 */
class IWmaApiService {
  async wmaRegister(wmaData) {
    throw new Error("Method 'wmaRegister' must be implemented");
  }

  async wmaLogin(credentials) {
    throw new Error("Method 'wmaLogin' must be implemented");
  }

  async getCurrentWmaDetails() {
    throw new Error("Method 'getCurrentWmaDetails' must be implemented");
  }

  async getAllWmas() {
    throw new Error("Method 'getAllWmas' must be implemented");
  }

  async deleteWma(id) {
    throw new Error("Method 'deleteWma' must be implemented");
  }

  async updateWma(wmaProfileData) {
    throw new Error("Method 'updateWma' must be implemented");
  }

  async logoutCurrentWma() {
    throw new Error("Method 'logoutCurrentWma' must be implemented");
  }

  logout() {
    throw new Error("Method 'logout' must be implemented");
  }

  isAuthenticatedWma() {
    throw new Error("Method 'isAuthenticatedWma' must be implemented");
  }

  getWmaToken() {
    throw new Error("Method 'getWmaToken' must be implemented");
  }

  getWmaId() {
    throw new Error("Method 'getWmaId' must be implemented");
  }

  async getWMAServiceAreas() {
    throw new Error("Method 'getWMAServiceAreas' must be implemented");
  }

  async addServiceArea(areaId) {
    throw new Error("Method 'addServiceArea' must be implemented");
  }

  async removeServiceArea(areaId) {
    throw new Error("Method 'removeServiceArea' must be implemented");
  }
}

export default IWmaApiService;
