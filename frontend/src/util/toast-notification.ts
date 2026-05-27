import { toast } from "react-toastify";

/** Success toast */
export const showSuccess = (message?: string) => {
  toast.success(message || "Success", {
    position: "bottom-right",
    autoClose: 3000,
    theme: "dark",
  });
};

/** Error toast */
export const showError = (message: string) => {
  toast.error(message, {
    position: "bottom-right",
    autoClose: 8000,
    theme: "dark",
  });
};

/** Info toast */
export const showInfo = (message: string) => {
  toast.info(message, {
    position: "bottom-right",
    autoClose: 3000,
    theme: "dark",
  });
};
