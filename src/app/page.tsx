'use client';

import {
  useEffect,
  useState,
} from 'react';

import AboutSection from './components/AboutSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import Header from './components/Header';
import Hero from './components/Hero';
import ProjectsSection from './components/ProjectsSection';
import ScrollToTop from './components/ScrollToTop';
import WebsitesSection from './components/WebsitesSection';
import { ContentData } from './types';

export default function HomePage() {
  const [content, setContent] = useState<ContentData | null>(null);

  useEffect(() => {
    fetch('/content.json')
      .then((res) => res.json())
      .then((data) => setContent(data));
  }, []);

  if (!content) return null;

  return (
    <>
      {content.header && <Header data={content.header} />}

      {content.hero && (
        <section id='hero'>
          <Hero data={content.hero} />
        </section>
      )}

      {content.about && (
        <section id='about'>
          <AboutSection data={content.about} />
        </section>
      )}

      {content.projects && (
        <section id='projects'>
          <ProjectsSection data={content.projects} />
        </section>
      )}

      {content.websites && (
        <section id='websites'>
          <WebsitesSection data={content.websites} />
        </section>
      )}

      {content.contact && (
        <section id='contact'>
          <ContactSection data={content.contact} />
        </section>
      )}

      {content.footer && <Footer data={content.footer} />}
      <ScrollToTop />
    </>
  );
}
