import Navigation from "@/components/Navigation";
import HeroSection from "@/sections/HeroSection";
import ManifestoSection from "@/sections/ManifestoSection";
import ServicesSection from "@/sections/ServicesSection";
import ProductsSection from "@/sections/ProductsSection";
import NewsletterSection from "@/sections/NewsletterSection";
import Footer from "@/sections/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <HeroSection />
      <ManifestoSection />
      <ServicesSection />
      <ProductsSection />
      <NewsletterSection />
      <Footer />
    </div>
  );
}
