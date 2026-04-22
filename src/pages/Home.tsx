import Navigation from "@/components/Navigation";
import HeroSection from "@/sections/HeroSection";
import ManifestoSection from "@/sections/ManifestoSection";
import HomeGallerySection from "@/sections/HomeGallerySection";
import ServicesSection from "@/sections/ServicesSection";
import ProductsSection from "@/sections/ProductsSection";
import NewsletterSection from "@/sections/NewsletterSection";
import Footer from "@/sections/Footer";

export default function Home() {
  return (
    <>
      <Navigation />
      <HeroSection />
      <ManifestoSection />
      <HomeGallerySection />
      <ServicesSection />
      <ProductsSection />
      <NewsletterSection />
      <Footer />
    </>
  );
}
