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
import Market from "./pages/market/Market";
import Cash from "./pages/cash/Cash";
import RequireAuth from "./components/wrappers/guards/RequireAuth";
import Watchlist from "./pages/watchlist/Watchlist";
import Activities from "./pages/activities/Activities";
import Settings from "./pages/settings/Settings";
import Contact from "./pages/contact/Contact";
import Portfolio from "./pages/portfolio/Portfolio";
import { OnboardingGate } from "./components/molecules/modals/OnboardingModals";

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
                  <OnboardingGate />
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/trade/:id" element={<Market />} />
                    <Route path="/cash" element={<RequireAuth><Cash /></RequireAuth>} />
                    <Route path="/portfolio" element={<RequireAuth><Portfolio /></RequireAuth>} />
                    <Route path="/watchlist" element={<RequireAuth><Watchlist /></RequireAuth>} />
                    <Route path="/activities" element={<RequireAuth><Activities /></RequireAuth>} />
                    <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
                    <Route path="/contact" element={<Contact />} />
                  </Routes>
                </ModalProvider>
              </BrowserRouter>
            </LiveProvider>
          </QueryClientProvider>
        </PersistGate>
      </ToastProvider>
    </Provider>
  );
}
