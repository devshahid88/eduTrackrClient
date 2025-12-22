import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import  store  from './redux/store.js';
import App from './App';
import { setupInterceptor } from './api/interceptor';
import axiosInstance from './api/axiosInstance';
import './index.css';

// Setup Axios Interceptors (Auth & Error Handling)
setupInterceptor(axiosInstance);

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    </StrictMode>
  );
}
