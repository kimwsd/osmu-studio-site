'use client';
import Link from 'next/link';
import {ServiceDirectory} from './service-directory';
import {usePathname} from 'next/navigation';
import {useEffect,useRef,useState} from 'react';
import {ArrowRight,ArrowUpRight,ChevronDown,Menu,Search,X} from 'lucide-react';
import {services,solutions,articles,nav} from '@/lib/content';

const sectionCopy:Record<string,{title:string;description:string}>={
 Desk:{title:'생각을 실행으로, 3EO Desk.',description:'점검하고, 만들고, 다음 선택을 준비하는 무료 실무 도구입니다.'},
 About:{title:'방향을 함께 정하는 파트너.',description:'3EO가 문제를 바라보고 실행하는 방식을 소개합니다.'},
 Services:{title:'필요한 실행을 한눈에.',description:'검색부터 콘텐츠, 웹사이트와 측정까지. 지금의 과제에 맞는 서비스를 살펴보세요.'},
 Solutions:{title:'우리 비즈니스의 시작점.',description:'업종과 성장 단계에 따라 달라지는 질문과 실행의 우선순위.'},
 Insights:{title:'질문에서 시작하는 인사이트.',description:'검색과 AI, 콘텐츠와 데이터를 연결하는 실무의 생각을 기록합니다.'},
 Resources:{title:'다음 결정을 위한 도구.',description:'서비스를 비교하고, 웹사이트를 점검하고, 프로젝트의 범위를 준비하세요.'}
};
const descriptions:Record<string,string>={
 '/tools':'필요한 도구를 꺼내 쓰는 무료 작업대',
 '/tools/utm-builder':'출처와 캠페인을 구분하는 링크 생성',
 '/tools/share-preview':'제목·요약·이미지의 표시 구성 검토',
 '/about':'검색·답변·비즈니스를 연결하는 우리의 관점',
 '/process':'현황 확인부터 실행과 검증까지, 함께 일하는 순서',
 '/insights':'SEO·AI 검색·콘텐츠·데이터에 관한 실무 이야기',
 '/resources':'실무에 바로 참고할 수 있는 가이드와 도구',
 '/cases':'공개 가능한 과제와 실행의 근거를 담는 공간',
 '/tools/plan-finder':'지금의 고민에 맞는 서비스부터 찾아보세요',
 '/tools/checklist':'홈페이지의 내용과 구조를 직접 점검해 보세요',
 '/pricing':'비용과 일정을 결정하는 조건을 확인하세요',
 ...Object.fromEntries(services.map(s=>['/services/'+s.slug,s.intro])),
 ...Object.fromEntries(solutions.map(s=>['/solutions/'+s.slug,s.label]))
};
export function Header(){
 const [open,setOpen]=useState<string|null>(null),[mobile,setMobile]=useState(false),[search,setSearch]=useState(false),[q,setQ]=useState('');
 const path=usePathname();
 const dialog=useRef<HTMLDialogElement>(null),searchTrigger=useRef<HTMLButtonElement>(null),menuTrigger=useRef<HTMLButtonElement>(null);
 const triggers=useRef<Record<string,HTMLButtonElement|null>>({});
 const active=nav.find(n=>n.name===open);
 function closeNavigation(restore=false){if(restore){if(mobile)menuTrigger.current?.focus();else if(open)triggers.current[open]?.focus()}setOpen(null);setMobile(false)}
 useEffect(()=>{setOpen(null);setMobile(false);setSearch(false)},[path]);
 useEffect(()=>{if(search)dialog.current?.showModal();else dialog.current?.close()},[search]);
 useEffect(()=>{if(!mobile)return;const previous=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=previous}},[mobile]);
 useEffect(()=>{const media=window.matchMedia('(max-width:900px)');const reset=()=>{setOpen(null);setMobile(false)};media.addEventListener('change',reset);return()=>media.removeEventListener('change',reset)},[]);
 useEffect(()=>{function escape(e:KeyboardEvent){if(e.key==='Escape'&&!search)closeNavigation(true)}document.addEventListener('keydown',escape);return()=>document.removeEventListener('keydown',escape)},[open,mobile,search]);
 const items=[...services.map(s=>({title:s.name,href:'/services/'+s.slug,desc:s.intro})),...articles.map(a=>({title:a.title,href:'/insights/'+a.slug,desc:a.summary}))];
 const results=items.filter(i=>!q||`${i.title} ${i.desc}`.toLowerCase().includes(q.toLowerCase()));
 return <>
  <a className="skip" href="#main">본문으로 바로가기</a>
  <header className="header editorial-header">
   <div className="nav-wrap">
    <Link href="/" className="logo" aria-label="OSMU STUDIO · 3EO 홈" onClick={()=>closeNavigation()}><img src="/logo.svg" width="242" height="33" alt="OSMU STUDIO"/><span>3EO · SEARCH TO BUSINESS</span></Link>
    <nav className="desktop-navigation" aria-label="주 메뉴">{nav.map(n=><button key={n.name} ref={el=>{triggers.current[n.name]=el}} className={'nav-trigger'+(path.startsWith(n.href)?' is-current':'')} aria-expanded={open===n.name} aria-controls="site-mega-menu" onPointerEnter={e=>{if(e.pointerType==='mouse'){setOpen(n.name);setMobile(false)}}} onClick={()=>setOpen(n.name)} onKeyDown={e=>{if(e.key==='ArrowDown'){e.preventDefault();setOpen(n.name);requestAnimationFrame(()=>document.querySelector<HTMLAnchorElement>('#site-mega-menu a')?.focus())}}}>{n.name}<ChevronDown size={13}/></button>)}</nav>
    <div className="nav-actions"><button ref={searchTrigger} className="icon-button" aria-label="검색 열기" onClick={()=>{closeNavigation();setSearch(true)}}><Search size={21}/></button><Link className="button small outline desktop-contact" href="/contact" onClick={()=>closeNavigation()}>문의하기 <ArrowUpRight size={15}/></Link><button ref={menuTrigger} className="icon-button mobile-toggle" aria-label={mobile?'메뉴 닫기':'메뉴 열기'} aria-expanded={mobile} aria-controls="mobile-navigation" onClick={()=>{setMobile(!mobile);setOpen(null)}}>{mobile?<X/>:<Menu/>}</button></div>
   </div>
   {mobile&&<nav id="mobile-navigation" className="mobile-navigation" aria-label="모바일 주 메뉴">{nav.map(n=><section key={n.name}><button className="mobile-nav-trigger" aria-expanded={open===n.name} aria-controls={'mobile-'+n.name} onClick={()=>setOpen(open===n.name?null:n.name)}>{n.name}<ChevronDown size={19}/></button>{open===n.name&&<div className={n.name==='Services'?'mobile-service-content':'mobile-nav-links'} id={'mobile-'+n.name}><Link className="mobile-overview" href={n.href} onClick={()=>closeNavigation()}>{n.name} 전체 보기 <ArrowUpRight size={16}/></Link>{n.name==='Services'?<ServiceDirectory variant="mobile" onNavigate={()=>closeNavigation()}/>:n.children.filter(([,h])=>h!==n.href).map(([t,h])=><Link href={h} key={h} onClick={()=>closeNavigation()}><strong>{t}</strong><span>{descriptions[h]}</span></Link>)}</div>}</section>)}<Link className="button" href="/contact" onClick={()=>closeNavigation()}>프로젝트 상담하기 <ArrowUpRight size={16}/></Link></nav>}
  </header>
  {(active||mobile)&&<button className="navigation-backdrop" tabIndex={-1} aria-label="메뉴 배경 닫기" onClick={()=>closeNavigation(true)}/>}
  {active&&!mobile&&<nav className="mega-menu" id="site-mega-menu" aria-label={active.name+' 하위 페이지'}>
   <div className="mega-shell">
    <div className="mega-topline"><span><i aria-hidden="true"/>OSMU INDEX <span className="mega-section-number">{String(nav.indexOf(active)+1).padStart(2,'0')} / {String(nav.length).padStart(2,'0')}</span></span><button className="mega-close" onClick={()=>closeNavigation(true)} aria-label="하위 메뉴 닫기"><span>닫기</span><X size={18}/></button></div>
    {active.name==='Services'?<><div className="service-menu-heading"><span className="mega-display">Services<span>.</span></span><p>필요한 일을 묶고,<br/>시작할 지점을 찾습니다.</p></div><ServiceDirectory variant="menu" onNavigate={()=>closeNavigation()}/><Link className="service-menu-overview" href="/services" onClick={()=>closeNavigation()}>서비스 전체 보기 <ArrowUpRight size={17}/></Link></>:<div className="mega-body"><div className="mega-intro"><span className="mega-display" aria-hidden="true">{active.name}<span>.</span></span><h2>{sectionCopy[active.name].title}</h2><p>{sectionCopy[active.name].description}</p><Link className="mega-overview" href={active.href} onClick={()=>closeNavigation()}>전체 보기 <span><ArrowUpRight size={20}/></span></Link></div><div className="mega-links">{active.children.map(([t,h],i)=><Link key={h} href={h} onClick={()=>closeNavigation()} aria-current={path.replace(/\/$/,'')===h?'page':undefined}><span className="mega-link-number">{String(i+1).padStart(2,'0')}</span><span className="mega-link-copy"><strong>{t}</strong><span>{descriptions[h]}</span></span><span className="mega-link-arrow"><ArrowUpRight size={21}/></span></Link>)}</div></div>}
    <div className="mega-footnote"><span>SEARCH. ANSWER. BUSINESS.</span><span>{String(active.children.length).padStart(2,'0')} PAGES TO EXPLORE</span></div>
   </div>
  </nav>}
  <dialog ref={dialog} className="search-dialog" onCancel={()=>setSearch(false)} onClose={()=>{setSearch(false);searchTrigger.current?.focus()}}><div className="search-heading"><label htmlFor="search">어떤 답을 찾고 계신가요?</label><button aria-label="검색 닫기" onClick={()=>setSearch(false)}><X/></button></div><input id="search" placeholder="서비스 또는 인사이트 검색" value={q} onChange={e=>setQ(e.target.value)}/><div className="search-results">{results.map(i=><Link key={i.href} href={i.href} onClick={()=>setSearch(false)}>{i.title}<ArrowRight size={18}/></Link>)}{!results.length&&<p>검색 결과가 없습니다. 다른 단어로 검색해 주세요.</p>}</div></dialog>
 </>;
}
