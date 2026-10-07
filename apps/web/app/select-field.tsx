'use client';
import {useEffect,useId,useRef,useState,type KeyboardEvent} from 'react';

type Option={value:string;label:string;description?:string};
type Props={label:string;value:string;options:Option[];onChange:(value:string)=>void;disabled?:boolean};

/** Select-only combobox: focus stays on the trigger while the list is explored. */
export default function SelectField({label,value,options,onChange,disabled=false}:Props){
 const id=useId(),root=useRef<HTMLDivElement>(null),trigger=useRef<HTMLButtonElement>(null),menu=useRef<HTMLDivElement>(null);
 const [open,setOpen]=useState(false),[active,setActive]=useState(0),[above,setAbove]=useState(false),[height,setHeight]=useState(280);
 const search=useRef({text:'',time:0}),selected=options.findIndex(option=>option.value===value),expanded=open&&!disabled&&options.length>0;
 function show(index=selected){
  const bounds=trigger.current?.getBoundingClientRect();
  if(bounds){const below=window.innerHeight-bounds.bottom-16,up=bounds.top-16;const flip=below<240&&up>below;setAbove(flip);setHeight(Math.min(280,Math.max(80,flip?up:below)));}
  search.current={text:'',time:0};setActive(Math.max(0,index));setOpen(true);
 }
 function choose(index:number){const option=options[index];if(!option||disabled)return;setOpen(false);trigger.current?.focus();if(option.value!==value)onChange(option.value);}
 useEffect(()=>{
  if(!expanded)return;
  function outside(event:PointerEvent){if(!root.current?.contains(event.target as Node))setOpen(false);}
  function close(){setOpen(false);}
  document.addEventListener('pointerdown',outside);window.addEventListener('resize',close);
  return()=>{document.removeEventListener('pointerdown',outside);window.removeEventListener('resize',close);};
 },[expanded]);
 useEffect(()=>{setOpen(false);},[value,disabled]);
 useEffect(()=>{
  if(!expanded||!menu.current)return;
  const list=menu.current,item=list.children[active] as HTMLElement|undefined;
  if(item){if(item.offsetTop<list.scrollTop)list.scrollTop=item.offsetTop;else if(item.offsetTop+item.offsetHeight>list.scrollTop+list.clientHeight)list.scrollTop=item.offsetTop+item.offsetHeight-list.clientHeight;}
 },[active,expanded]);
 function keyDown(event:KeyboardEvent<HTMLButtonElement>){
  if(disabled||!options.length||event.nativeEvent.isComposing)return;
  const key=event.key;
  if(key==='Escape'){if(expanded){event.preventDefault();event.stopPropagation();setOpen(false);}return;}
  if(key==='Tab'){setOpen(false);return;}
  if(['Enter',' ','ArrowDown','ArrowUp','Home','End'].includes(key)){
   event.preventDefault();
   if(key==='Enter'||key===' '){if(expanded)choose(active);else show();}
   else if(key==='Home'||key==='End'){const index=key==='Home'?0:options.length-1;if(expanded)setActive(index);else show(index);}
   else if(!expanded)show();
   else setActive(index=>Math.max(0,Math.min(options.length-1,index+(key==='ArrowDown'?1:-1))));
   return;
  }
  if(key.length===1&&!event.ctrlKey&&!event.metaKey&&!event.altKey){
   event.preventDefault();const now=Date.now(),previous=search.current;
   const text=(now-previous.time<700?previous.text:'')+key.toLowerCase();
   const query=Array.from(text).every(char=>char===text[0])?text[0]:text;
   const start=expanded?active:Math.max(0,selected);
   const match=Array.from({length:options.length},(_,offset)=>(start+offset+1)%options.length).find(index=>options[index].label.toLowerCase().startsWith(query));
   if(!expanded)show(match??start);else if(match!==undefined)setActive(match);
   search.current={text,time:now};
  }
 }
 return <div className="select-field" ref={root} onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node|null))setOpen(false);}}>
  <span className="select-label" id={`${id}-label`}>{label}</span>
  <div className="select-control">
  <button className="select-trigger" type="button" ref={trigger} role="combobox" aria-labelledby={`${id}-label`} aria-haspopup="listbox" aria-expanded={expanded} aria-controls={expanded?`${id}-list`:undefined} aria-activedescendant={expanded&&options[active]?`${id}-option-${active}`:undefined} disabled={disabled||!options.length} onClick={()=>expanded?setOpen(false):show()} onKeyDown={keyDown}>
   <span>{options[selected]?.label||'Choose an option'}</span><svg className="select-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
  </button>
  {expanded?<div className={`select-menu${above?' select-menu-above':''}`} ref={menu} id={`${id}-list`} role="listbox" aria-labelledby={`${id}-label`} style={{maxHeight:height}}>
   {options.map((option,index)=><div className={`select-option${index===active?' is-active':''}`} key={option.value} id={`${id}-option-${index}`} role="option" aria-selected={option.value===value} onPointerMove={()=>setActive(index)} onMouseDown={event=>event.preventDefault()} onClick={()=>choose(index)}>
    <span className="select-option-copy"><span>{option.label}</span>{option.description?<small>{option.description}</small>:null}</span>
    {option.value===value?<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m5 12 4 4L19 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>:null}
   </div>)}
  </div>:null}
  </div>
 </div>;
}
