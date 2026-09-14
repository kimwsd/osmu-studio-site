export default function HomeVideoHero(){
  return <section className="home-video-hero" aria-label="OSMU STUDIO 영상 소개">
    <h1 className="sr-only">OSMU STUDIO — 브랜드의 장면을 설계합니다.</h1>
    <video autoPlay muted loop playsInline preload="metadata" poster="/assets/osmu-showreel-2026-poster.webp" aria-label="OSMU STUDIO 키네틱 브랜드 영상">
      <source media="(max-width: 767px)" src="/assets/hero/kinetic-v5/hero-mobile-silent.mp4" type="video/mp4"/>
      <source src="/assets/hero/kinetic-v5/hero-pc-silent.mp4" type="video/mp4"/>
    </video>
  </section>;
}
