import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const AuthSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleAuthSuccess = () => {
      const token = searchParams.get("token");

      if (token) {
        try {
          const userData = JSON.parse(decodeURIComponent(token));

          // Store user data in localStorage
          localStorage.setItem("userInfo", JSON.stringify(userData));

          // Show the success message for 2 seconds before redirecting
          setTimeout(() => {
            // Redirect based on user role
            if (userData.isAdmin) {
              navigate("/admin/dashboard");
            } else if (userData.role === "WMA") {
              navigate("/wma/dashboard");
            } else if (userData.role === "Collector") {
              navigate("/collector/dashboard");
            } else {
              navigate("/user/dashboard");
            }
          }, 2000);
        } catch (error) {
          console.error("Failed to parse auth token:", error);
          navigate("/login?error=auth_failed");
        }
      } else {
        navigate("/login?error=no_token");
      }
    };

    handleAuthSuccess();
  }, [navigate, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Authentication Successful!</h2>
        <p className="text-gray-600">Redirecting to dashboard...</p>
        <div className="mt-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      </div>
    </div>
  );
};

export default AuthSuccess;
