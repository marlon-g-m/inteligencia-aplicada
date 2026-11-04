import { PrimaryButton, SectionBadge } from '../components/ui'
import { ChatVisual, FlowVisual } from '../components/visuals'

export default function About() {
  return (
    <section className="overflow-hidden bg-white pb-12 pt-16 sm:pb-16 sm:pt-20 lg:pb-24 lg:pt-32">
      <div className="mx-auto max-w-[1440px]">
        <SectionBadge n={1} label="Presentamos Inteligencia Aplicada" />

        <h2 className="mb-12 px-5 text-[clamp(1.5rem,4vw,3.2rem)] font-medium leading-[1.12] tracking-[-0.02em] text-gray-900 sm:mb-16 sm:px-8 lg:mb-28 lg:px-12">
          Ingeniería con criterio, que entrega<br className="hidden sm:block" />
          <span className="sm:hidden"> </span>resultados en tu operación diaria.
        </h2>

        {/* Móvil y tablet */}
        <div className="px-5 sm:px-8 lg:hidden">
          <p className="text-[15px] font-medium leading-[1.6] text-gray-900 sm:text-[17px]">
            Diagnosticamos, conectamos y automatizamos para que tu empresa trabaje con la tecnología, no contra ella. Sin botar lo que ya funciona.
          </p>
          <PrimaryButton href="#proceso" className="mt-6">Cómo trabajamos</PrimaryButton>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:gap-5">
            <div className="aspect-square overflow-hidden rounded-xl sm:aspect-[438/346] sm:w-[45%] sm:rounded-2xl">
              <ChatVisual />
            </div>
            <div className="aspect-[900/600] overflow-hidden rounded-xl sm:w-[55%] sm:rounded-2xl">
              <FlowVisual />
            </div>
          </div>
        </div>

        {/* Escritorio */}
        <div className="hidden grid-cols-[26%_1fr_48%] items-end gap-6 px-12 lg:grid xl:gap-8">
          <div className="aspect-[438/346] self-end overflow-hidden rounded-2xl">
            <ChatVisual />
          </div>
          <div className="flex justify-end self-start">
            <div>
              <p className="whitespace-nowrap text-[16px] font-medium leading-[1.65] text-gray-900 xl:text-[18px]">
                Diagnosticamos, conectamos y automatizamos<br />
                para que tu empresa trabaje con la tecnología,<br />
                no contra ella. Sin botar lo que ya funciona.
              </p>
              <PrimaryButton href="#proceso" className="mt-6">Cómo trabajamos</PrimaryButton>
            </div>
          </div>
          <div className="aspect-[3/2] self-end overflow-hidden rounded-2xl">
            <FlowVisual />
          </div>
        </div>
      </div>
    </section>
  )
}
