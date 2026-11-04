import Hero from './sections/Hero'
import About from './sections/About'
import Services from './sections/Services'
import Process from './sections/Process'
import { Contact, Faq, Footer, Sectors } from './sections/Rest'

export default function App() {
  return (
    <>
      <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-gray-900">
        Saltar al contenido
      </a>
      <Hero />
      <main id="contenido">
        <About />
        <Services />
        <Sectors />
        <Process />
        <Faq />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
