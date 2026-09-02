import { BrowserRouter, Routes, Route } from "react-router";
import HomePage from "./pages/HomePage";
import DefaultLayout from "./layouts/DefaultLayout";
import PageNotFound from "./pages/PageNotFound";
import CookiePolicy from "./pages/CookiePolicy";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import ScollToTop from "./components/ScrollToTop";
import BlogPage from "./pages/BlogPage";
import ArticlePage from "./pages/ArticlePage";
import ReelsPage from "./pages/ReelsPage";
import AdminPage from "./pages/AdminPage";
import LoginPage from "./pages/LoginPage";
import AreaPersonalePage from "./pages/AreaPersonalePage";
import BookingPage from "./pages/BookingPage";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <ScollToTop />
      <Routes>
        <Route element={<DefaultLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/cookie-policy" element={<CookiePolicy />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<ArticlePage />} />
          <Route path="/reel" element={<ReelsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/area-personale"
            element={
              <ProtectedRoute>
                <AreaPersonalePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/prenota"
            element={
              <ProtectedRoute>
                <BookingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/prenota-corso"
            element={
              <ProtectedRoute>
                <BookingPage
                  type="course"
                  title="Prenota il corso"
                  subtitle="Scegli data e orario del corso"
                />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<PageNotFound />} />
        </Route>
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}
