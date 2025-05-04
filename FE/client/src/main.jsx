import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { store } from "~/redux/store";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme.js";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppWrapper } from "./components/PageMeta";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { GoogleOAuthProvider } from "@react-oauth/google";

const queryClient = new QueryClient();
const isShowDevtools = __REACT_QUERY_DEVTOOLS__ === "true";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AppWrapper>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Provider store={store}>
              <ThemeProvider theme={theme}>
                <CssBaseline />
                <App />
              </ThemeProvider>
            </Provider>
          </BrowserRouter>
          {isShowDevtools && (
            <ReactQueryDevtools initialIsOpen={false} position="bottom" />
          )}
        </QueryClientProvider>
      </AppWrapper>
    </GoogleOAuthProvider>
  </StrictMode>
);
