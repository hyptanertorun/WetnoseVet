import React from "react";
import "./App.css";
import CustomCursor from "./components/CustomCursor";
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import ServicesSection from "./components/ServicesSection";
import StatsSection from "./components/StatsSection";
import TeamSection from "./components/TeamSection";
import AdoptionSection from "./components/AdoptionSection";
import NewsSection from "./components/NewsSection";
import TestimonialsSection from "./components/TestimonialsSection";
import ContactSection from "./components/ContactSection";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="App cursor-none lg:cursor-none">
      <CustomCursor />
      <Header />
      <main>
        <HeroSection />
        <ServicesSection />
        <StatsSection />
        <TeamSection />
        <AdoptionSection />
        <NewsSection />
        <TestimonialsSection />
        <ContactSection />
        <Footer />
      </main>
    </div>
  );
}

export default App;
