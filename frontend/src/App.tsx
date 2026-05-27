import { Suspense } from "react";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router";
import { store } from "@/store";
import { router } from "@/router";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";

function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <Suspense fallback={<LoadingSpinner fullPage label="Loading..." />}>
          <RouterProvider router={router} />
        </Suspense>
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          theme="dark"
          toastClassName="!bg-card !text-foreground !border !border-border !rounded-xl !shadow-lg"
        />
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
