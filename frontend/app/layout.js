import "./globals.css";
import { Inter } from "next/font/google";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { CombinedProviders } from "../components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Prime Store - E-commerce Premium",
  description: "Loja online premium com produtos selecionados. Dropshipping profissional."
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className + " min-h-screen bg-black text-white"}>
        <CombinedProviders>
          <NavBar />
          <main className="mt-24">{children}</main>
          <Footer />
        </CombinedProviders>
      </body>
    </html>
  );
}
