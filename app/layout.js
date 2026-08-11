import "./globals.css";

import Header from "../components/Header";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import {
  ThemeProvider,
} from "../components/ThemeProvider";

export const metadata = {
  title: "Phoneme Activity Builder",

  description:
    "A frontend builder for phoneme-based Wordle and Word Search classroom activities.",
};

export default function RootLayout({
  children,
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <Navbar />

          <Header />

          <main className="main-content">
            {children}
          </main>

          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}