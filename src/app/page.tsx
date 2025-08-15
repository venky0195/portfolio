'use client'

import AboutSection from './components/AboutSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import Hero from './components/Hero';
import ProjectsSection from './components/ProjectsSection';
import ScrollToTop from './components/ScrollToTop';
import WebsitesSection from './components/WebsitesSection';

export default function HomePage() {
  return (
    <>
      <section id="hero">
        <Hero />
      </section>

      <section id="about">
        <AboutSection />
      </section>

      <section id="projects">
        <ProjectsSection />
      </section>

      <section id="websites">
        <WebsitesSection />
      </section>

      <section id="contact">
        <ContactSection />
      </section>

      <Footer />
      <ScrollToTop />
    </>
  )
}
