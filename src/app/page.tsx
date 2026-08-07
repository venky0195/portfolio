import BootSequence from './components/BootSequence';
import Footer from './components/Footer';
import Header from './components/Header';
import Hero from './components/Hero';
import NetworkField from './components/NetworkField';
import OriginSection from './components/OriginSection';
import RevealManager from './components/RevealManager';
import ScrollToTop from './components/ScrollToTop';
import SectionAtmosphere from './components/SectionAtmosphere';
import SmoothScroll from './components/SmoothScroll';
import StatusSection from './components/StatusSection';
import TraceSection from './components/TraceSection';
import WorkSection from './components/WorkSection';
import { getContent } from './lib/content';

/**
 * Ordered as an introduction, not a system diagram: what he does, what he's
 * shipped, how he got here, who he is, and how to reach him.
 */
export default function HomePage() {
  const content = getContent();

  return (
    <>
      <BootSequence />
      <NetworkField />
      <SmoothScroll />
      <RevealManager />

      <a href='#main-content' className='skip-link'>
        Skip to content
      </a>

      {content.header && <Header data={content.header} />}

      <main id='main-content' className='relative z-10'>
        {content.hero && (
          <section id='hero' aria-label='Introduction'>
            <Hero data={content.hero} />
          </section>
        )}


        {content.work && (
          <section id='work' aria-labelledby='work-heading' className='relative'>
            <SectionAtmosphere variant='work' />
            <WorkSection data={content.work} />
          </section>
        )}

        {content.trace && (
          <section id='trace' aria-labelledby='trace-heading' className='relative'>
            <SectionAtmosphere variant='trace' />
            <TraceSection data={content.trace} />
          </section>
        )}

        {content.origin && (
          <section id='origin' aria-labelledby='origin-heading' className='relative'>
            <SectionAtmosphere variant='origin' />
            <OriginSection data={content.origin} />
          </section>
        )}

        {content.status && (
          <section id='status' aria-labelledby='status-heading' className='relative'>
            <SectionAtmosphere variant='status' />
            <StatusSection data={content.status} />
          </section>
        )}
      </main>

      {content.footer && <Footer data={content.footer} />}
      <ScrollToTop />
    </>
  );
}
