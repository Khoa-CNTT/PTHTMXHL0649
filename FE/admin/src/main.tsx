import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "swiper/swiper-bundle.css";
import "flatpickr/dist/flatpickr.css";
import App from "./App.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { store } from "./redux/store.ts";
import { Provider } from "react-redux";
import { Toaster } from "@/components/ui/sonner.tsx";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <AppWrapper>
            <Toaster />
            <App />
          </AppWrapper>
        </Provider>
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>
);
