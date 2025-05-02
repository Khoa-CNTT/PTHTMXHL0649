import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import '@styles/index.css';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { store } from '@redux/store';
import { AppWrapper } from '@components/pagemeta/pagemeta';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AppWrapper>
        <QueryClientProvider client={queryClient}>
          <Provider store={store}>
            <App />
          </Provider>
        </QueryClientProvider>
      </AppWrapper>
    </GoogleOAuthProvider>
  </StrictMode>,
);
