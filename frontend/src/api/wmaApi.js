import ApiHelper from "../helpers/apiHelper";

class WmaAuthService {
  constructor() {
    this.api = new ApiHelper();
  }

  async wmaRegister(wmaData) {
    try {
      const response = await this.api.post("wmas", wmaData);
      // Assuming the backend returns a token upon successful registration
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
      const response = await this.api.post("wmas/auth", credentials);
      // Assuming the backend returns a token upon successful login
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
      const response = await this.api.get(
        "wmas/wmaprofile", // Assuming 'me' is the endpoint for fetching the current user profile
        {
          withCredentials: true, // Ensure cookies are sent with the request
        }
      );

      // console.log(`Current User response => `, response); // Log the response data
      return response; // Return the response data
    } catch (error) {
      console.error("Error fetching current wma profile:", error);
      throw error; // Rethrow error for further handling
    }
  }

  async getAllWmas() {
    try {
      const wmas = await this.api.get(
        "wmas",
        {},
        {
          withCredentials: true,
        }
      );
      return wmas;
    } catch (error) {
      console.error("Error fetching wmas:", error.message);
      throw error;
    }
  }

  async deleteWma(id) {
    try {
      const deletedWma = await this.api.delete(`wmas/${id}`, {
        withCredentials: true,
      });
      return deletedWma.data;
    } catch (error) {
      console.error("Error deleting wma:", error.message);
      throw error;
    }
  }

  async updateWma(wmaProfileData) {
    console.log(wmaProfileData);
    try {
      const response = await this.api.put("wmas/wmaprofile", wmaProfileData, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error("Error updating wma profile:", error);
      throw error;
    }
  }

  async logoutCurrentWma() {
    try {
      const response = await this.api.post("wmas/logout");
     
    } catch (error) {
      console.error("Error logging out:", error);
    }
  }

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("wmaId");
    localStorage.removeItem("userInfo");
    // You might want to perform additional cleanup here
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
}

export default new WmaAuthService();
