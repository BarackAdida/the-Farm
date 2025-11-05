import { useEffect } from "react";

function Logout() {
  useEffect(() => {
    const logoutUser = async () => {
      try {
        localStorage.removeItem("token")
        localStorage.removeItem("role")
        localStorage.removeItem("username")
        window.location.href = "/login";
      } catch (error) {
        console.error("Logout failed:", error);
        window.location.href = "/login"
      }
    };

    logoutUser();
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "3rem" }}>
      <h3>Logging you out...</h3>
    </div>
  );
}

export default Logout;
