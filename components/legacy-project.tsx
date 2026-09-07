'use client';
import {useEffect} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
export default function LegacyProject(){const router=useRouter();useEffect(()=>{const slug=new URLSearchParams(location.search).get('slug');router.replace(slug&&/^[\w-]+$/.test(slug)?`/work/${slug}/`:'/work/');},[router]);return <section className="section-pad"><h1>프로젝트로 이동합니다.</h1><Link href="/work/" className="text-link">작업 목록 보기</Link></section>}
