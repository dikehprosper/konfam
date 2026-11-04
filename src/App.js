import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import clientStore, { persistor } from "./redux/store/clientStore";
import { ModalProvider } from "./context/ModalProvider";
import { ToastProvider } from "./context/ToastProvider";
import { LiveProvider } from "./context/LiveContext";
import ConnectionBanner from "./components/organisms/ConnectionBanner";
import Home from "./pages/home/Home";

const queryClient = new QueryClient({ defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } } });
// Home is public for guests AND logged-in users (no PublicGuard). Protected pages use ProtectedRoute in later stages.
export default function App() {
  return (
    <Provider store={clientStore}>
      <ToastProvider>
        <PersistGate loading={null} persistor={persistor}>
          <QueryClientProvider client={queryClient}>
            <LiveProvider>
              <BrowserRouter>
                <ModalProvider>
                  <ConnectionBanner />
                  <Routes><Route path="/" element={<Home />} /></Routes>
                </ModalProvider>
              </BrowserRouter>
            </LiveProvider>
          </QueryClientProvider>
        </PersistGate>
      </ToastProvider>
    </Provider>
  );
}
