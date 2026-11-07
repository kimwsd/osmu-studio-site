'use client';
import {usePathname} from 'next/navigation';
export function SiteShell({header,footer,children}:{header:React.ReactNode;footer:React.ReactNode;children:React.ReactNode}){const admin=usePathname().startsWith('/admin');return <>{!admin&&header}<main id="main" className={admin?'admin-main':undefined}>{children}</main>{!admin&&footer}</>}
