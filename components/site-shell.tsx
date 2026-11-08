'use client';
import {AttributionConsent} from './attribution-consent';
import {useEffect} from 'react';
import {usePathname} from 'next/navigation';
export function SiteShell({header,footer,children}:{header:React.ReactNode;footer:React.ReactNode;children:React.ReactNode}){const admin=usePathname().startsWith('/admin');useEffect(()=>{if(admin&&(document.getElementById('osmu-gtm')||document.getElementById('osmu-ga4')||document.getElementById('osmu-meta-pixel')))location.reload()},[admin]);return <>{!admin&&header}<main id="main" className={admin?'admin-main':undefined}>{children}</main>{!admin&&footer}{!admin&&<AttributionConsent/>}</>}
