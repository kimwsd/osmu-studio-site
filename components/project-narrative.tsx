'use client';
import {useId,useState} from 'react';
import {Plus,Minus} from 'lucide-react';
export default function ProjectNarrative({summary,body}:{summary:string;body:string}){const [open,setOpen]=useState(false),id=useId();const paragraphs=body.split(/\n+/).filter(Boolean);return <div className="project-narrative"><h2>{summary}</h2><p>{paragraphs[0]}</p>{paragraphs.length>1&&<><div className={`project-more ${open?'is-open':''}`} id={id} aria-hidden={!open} inert={!open}><div>{paragraphs.slice(1).map((p,i)=><p key={i}>{p}</p>)}</div></div><button className="more-info" aria-expanded={open} aria-controls={id} onClick={()=>setOpen(!open)}>{open?'Less info':'More info'}{open?<Minus size={16}/>:<Plus size={16}/>}</button></>}</div>}
