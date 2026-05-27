import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { getAuthUserData } from "@/api/auth";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { showError } from "@/util/toast-notification";

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const fetchedRef = useRef(false);

  useEffect(() => {
    // Prevent double-fetching in React Strict Mode
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    async function handleAuth() {
      try {
        const userData = await getAuthUserData();
        if (userData && userData._id) {
          localStorage.setItem("userData", JSON.stringify(userData));
          navigate("/notes", { replace: true });
        } else {
          throw new Error("Invalid user data received");
        }
      } catch (error) {
        showError("Authentication failed. Please try again.");
        navigate("/auth/login", { replace: true });
      }
    }

    handleAuth();
  }, [navigate]);

  return <LoadingSpinner fullPage label="Authenticating securely..." size="lg" />;
}
