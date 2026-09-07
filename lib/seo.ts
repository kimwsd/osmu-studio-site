import type { Project } from './projects';

export const siteUrl = 'https://osmu-studio.com';
export const organizationId = `${siteUrl}/#organization`;

export const siteJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': ['Organization', 'ProfessionalService'],
      '@id': organizationId,
      name: 'OSMU STUDIO',
      alternateName: '오스무 스튜디오',
      url: siteUrl,
      logo: `${siteUrl}/logo.svg`,
      email: 'osmu_studio@naver.com',
      description: '브랜드 전략에서 그래픽, 패키지, 사진·영상, 마케팅과 디지털 경험까지 설계하는 디자인 스튜디오',
      address: { '@type': 'PostalAddress', addressLocality: 'Cheonan', addressCountry: 'KR' },
      sameAs: ['https://www.instagram.com/studio_osmu/'],
    },
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      name: 'OSMU STUDIO',
      url: siteUrl,
      inLanguage: 'ko-KR',
      publisher: { '@id': organizationId },
    },
  ],
};

export function projectMetaDescription(project: Project) {
  const source = `${project.summary} ${project.body}`.replace(/\s+/g, ' ').trim();
  return source.length > 155 ? `${source.slice(0, 152).trim()}...` : source;
}
