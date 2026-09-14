export default function HomeVideoHero(){
  return <section className="home-video-hero" aria-label="OSMU STUDIO 영상 소개">
    <h1 className="sr-only">OSMU STUDIO — 브랜드의 장면을 설계합니다.</h1>
    <video autoPlay muted loop playsInline preload="auto" aria-label="Pollyanna 브랜드 영상">
      <source src="/assets/hero/pollyanna-landscape.mp4" type="video/mp4"/>
    </video>
  </section>;
}
