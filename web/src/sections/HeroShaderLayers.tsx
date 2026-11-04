import { Shader, Swirl, ChromaFlow, FlutedGlass, FilmGrain } from 'shaders/react'

/** Capas del shader de la portada (se carga aparte para no frenar la primera pintura). */
export default function HeroShaderLayers({ onUnavailable }: { onUnavailable: () => void }) {
  return (
    <Shader className="h-full w-full" disableTelemetry onUnavailable={onUnavailable}>
      <Swirl colorA="#0B1F3A" colorB="#10284A" detail={1.7} />
      <ChromaFlow
        baseColor="#0B1F3A"
        downColor="#2A44EE"
        leftColor="#2A44EE"
        rightColor="#2A44EE"
        upColor="#2A44EE"
        momentum={13}
        radius={3.5}
      />
      <FlutedGlass
        aberration={0.61}
        angle={31}
        frequency={8}
        highlight={0.12}
        highlightSoftness={0}
        lightAngle={-90}
        refraction={4}
        shape="rounded"
        softness={1}
        speed={0.15}
      />
      <FilmGrain strength={0.05} />
    </Shader>
  )
}
