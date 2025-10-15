import ApiHelper from "../helpers/apiHelper";

class AuthService {
  constructor() {
    this.api = new ApiHelper();
  }

  async register(userData) {
    try {
      const response = await this.api.post("users", userData);
      // Assuming the backend returns a token upon successful registration
      if (response.token) {
        localStorage.setItem("token", response.token);
      }
      return response;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  }

  async login(credentials) {
    try {
      const response = await this.api.post("users/auth", credentials);
      // Assuming the backend returns a token upon successful login
      if (response.token) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("userId", response._id);
      }
      return response;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  async getCurrentUserDetails() {
    try {
      const response = await this.api.get(
        "users/profile", {}// Assuming 'me' is the endpoint for fetching the current user profil
      );

      // console.log(`Current User response => `, response); // Log the response data
      return response; // Return the response data
    } catch (error) {
      console.error("Error fetching current user profile:", error);
      throw error; // Rethrow error for further handling
    }
  }

  async getAllUsers() {
    try {
      const users = await this.api.get(
        "users",
        {},
        {
          withCredentials: true,
        }
      );
      return users;
    } catch (error) {
      console.error("Error fetching users:", error.message);
      throw error;
    }
  }

  async deleteUser(id) {
    try {
      const deletedUser = await this.api.delete(`users/${id}`);
      return deletedUser.data;
    } catch (error) {
      console.error("Error deleting user:", error.message);
      throw error;
    }
  }

  async updateUser(profileData) {
    console.log("profileData",profileData);
    try {
      const response = await this.api.put("users/profile", profileData);
      console.log("response in update user",response.data);
      return response.data;
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  }

  async logoutCurrentUser() {
    try {
      const response = await this.api.post("users/logout");
      // console.log(`response => `, response);
      // alert(response.message); // Display the success message
      // Perform any additional actions like redirecting the user to the login page
    } catch (error) {
      console.error("Error logging out:", error);
    }
  }

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userInfo");
    // You might want to perform additional cleanup here
  }

  isAuthenticated() {
    return localStorage.getItem("token") !== null;
  }

  getToken() {
    return localStorage.getItem("token");
  }

  getUserId() {
    return localStorage.getItem("userId");
  }
}

export default new AuthService();
