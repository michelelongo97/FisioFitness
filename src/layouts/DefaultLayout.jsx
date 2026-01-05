import { Outlet } from "react-router";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ScrollToTopButton from "../components/ScrollToTopButton";

export default function DefaultLayout() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
      <ScrollToTopButton />
    </>
  );
}
