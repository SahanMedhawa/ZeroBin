import IWmaApiService from "./abstractions/IWmaApiService";
import ApiHelperAdapter from "./adapters/ApiHelperAdapter";

/**
 * WmaAuthService
 * Concrete implementation of IWmaApiService
 *
 * Demonstrates Dependency Inversion Principle:
 * - Depends on IHttpClient abstraction, not concrete ApiHelper
 * - Can be injected with any IHttpClient implementation
 * - Implements IWmaApiService interface
 *
 * @extends IWmaApiService
 */
class WmaAuthService extends IWmaApiService {
  /**
   * Constructor with Dependency Injection
   * @param {IHttpClient} httpClient - HTTP client implementation (optional)
   */
  constructor(httpClient = null) {
    super();
    // Dependency Injection: Accept abstraction, not concrete class
    this.httpClient = httpClient || new ApiHelperAdapter();
  }

  async wmaRegister(wmaData) {
    try {
      const response = await this.httpClient.post("wmas", wmaData);
      if (response.token) {
        localStorage.setItem("token", response.token);
      }
      return response;
    } catch (error) {
      console.error("WMA Registration error:", error);
      throw error;
    }
  }

  async wmaLogin(credentials) {
    try {
      const response = await this.httpClient.post("wmas/auth", credentials);
      if (response.token) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("wmaId", response._id);
      }
      return response;
    } catch (error) {
      console.error("WMA Login error:", error);
      throw error;
    }
  }

  async getCurrentWmaDetails() {
    try {
      const response = await this.httpClient.get("wmas/wmaprofile", {
        withCredentials: true,
      });
      return response;
    } catch (error) {
      console.error("Error fetching current wma profile:", error);
      throw error;
    }
  }

  async getAllWmas() {
    try {
      const wmas = await this.httpClient.get("wmas", {
        withCredentials: true,
      });
      return wmas;
    } catch (error) {
      console.error("Error fetching wmas:", error.message);
      throw error;
    }
  }

  async deleteWma(id) {
    try {
      const deletedWma = await this.httpClient.delete(`wmas/${id}`);
      return deletedWma.data;
    } catch (error) {
      console.error("Error deleting wma:", error.message);
      throw error;
    }
  }

  async updateWma(wmaProfileData) {
    try {
      const response = await this.httpClient.put(
        "wmas/wmaprofile",
        wmaProfileData,
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating wma profile:", error);
      throw error;
    }
  }

  async logoutCurrentWma() {
    try {
      await this.httpClient.post("wmas/logout");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  }

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("wmaId");
    localStorage.removeItem("userInfo");
  }

  isAuthenticatedWma() {
    return localStorage.getItem("token") !== null;
  }

  getWmaToken() {
    return localStorage.getItem("token");
  }

  getWmaId() {
    return localStorage.getItem("wmaId");
  }

  async getWMAServiceAreas() {
    try {
      const response = await this.httpClient.get("wmas/service-areas", {
        withCredentials: true,
      });
      return response;
    } catch (error) {
      console.error("Error fetching WMA service areas:", error);
      throw error;
    }
  }

  async addServiceArea(areaId) {
    try {
      const response = await this.httpClient.post(
        `wmas/service-areas/${areaId}`,
        {},
        {
          withCredentials: true,
        }
      );
      return response;
    } catch (error) {
      console.error("Error adding service area:", error);
      throw error;
    }
  }

  async removeServiceArea(areaId) {
    try {
      const response = await this.httpClient.delete(
        `wmas/service-areas/${areaId}`
      );
      return response;
    } catch (error) {
      console.error("Error removing service area:", error);
      throw error;
    }
  }
}

// Export singleton instance with default adapter
export default new WmaAuthService();

// Also export class for dependency injection
export { WmaAuthService };
