'use client';

import { useEffect, useRef, useState } from 'react';

const assets = '/assets/hero/kinetic-v5';

export default function Hero() {
  const stage = useRef<HTMLElement>(null);
  const player = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const video = player.current;
    const section = stage.current;
    if (!video || !section) return;
    const mobile = matchMedia('(max-width: 767px)');
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    let inView = true;
    let disposed = false;

    const syncPlayback = () => {
      video.muted = true;
      video.defaultMuted = true;
      if (reducedMotion.matches) {
        video.pause();
        setReady(false);
        if (video.hasAttribute('src')) {
          video.removeAttribute('src');
          video.load();
        }
        return;
      }
      if (document.hidden || !inView) {
        video.pause();
        return;
      }
      // Assign one file after hydration; mobile never fetches the PC film.
      const src = `${assets}/hero-${mobile.matches ? 'mobile' : 'pc'}-silent.mp4`;
      if (video.getAttribute('src') !== src) {
        setReady(false);
        video.src = src;
        video.load();
      }
      void video.play().catch(() => {
        if (!disposed && video.paused) setReady(false);
      });
    };

    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      syncPlayback();
    });
    observer.observe(section);
    mobile.addEventListener('change', syncPlayback);
    reducedMotion.addEventListener('change', syncPlayback);
    document.addEventListener('visibilitychange', syncPlayback);
    syncPlayback();

    return () => {
      disposed = true;
      observer.disconnect();
      mobile.removeEventListener('change', syncPlayback);
      reducedMotion.removeEventListener('change', syncPlayback);
      document.removeEventListener('visibilitychange', syncPlayback);
      video.pause();
    };
  }, []);

  return (
    <section ref={stage} className="hero-video" aria-label="OSMU STUDIO 브랜드 필름">
      <h1 className="sr-only">OSMU STUDIO — 브랜드의 생각을 사람들이 만나는 형태로.</h1>
      <p className="sr-only">브랜딩, 그래픽 디자인, 패키징, 브랜드 필름, 마케팅을 연결하는 18초 브랜드 영상. AI 콘셉트 이미지와 오리지널 그래픽으로 구성되었습니다.</p>
      <picture className="hero-video-poster" aria-hidden="true">
        <source media="(max-width: 767px)" srcSet={`${assets}/poster-mobile.jpg`} width={1080} height={1920} />
        <img src={`${assets}/poster-pc.jpg`} alt="" width={2560} height={1440} fetchPriority="high" />
      </picture>
      <video
        ref={player}
        className="hero-video-media"
        data-ready={ready}
        autoPlay
        muted
        loop
        playsInline
        preload="none"
        disablePictureInPicture
        disableRemotePlayback
        aria-hidden="true"
        tabIndex={-1}
        onPlaying={() => setReady(true)}
        onError={() => setReady(false)}
      />
    </section>
  );
}
