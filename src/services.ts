import type { Character } from './data'
export type Member = { id:string; name:string; characterId?:string; answers?:string[] }
export type Round = { phrase:string; writer:string; guesser:string; original:string; prediction:string; points:number; similarity:'exacta'|'aproximada'|'distinta'; createdAt:number }
export type Room = { code:string; members:Member[]; scores:Record<string,number>; rounds:Round[]; createdAt:number }
const KEY='duo.rooms.v1', ACTIVE='duo.active.v1'
const read=():Room[]=>{try{return JSON.parse(localStorage.getItem(KEY)||'[]') as Room[]}catch{return []}}
const write=(rooms:Room[])=>localStorage.setItem(KEY,JSON.stringify(rooms))
export const getActive=()=>{try{const a=JSON.parse(localStorage.getItem(ACTIVE)||'null');return a as {code:string;memberId:string}|null}catch{return null}}
export const setActive=(a:{code:string;memberId:string}|null)=>a?localStorage.setItem(ACTIVE,JSON.stringify(a)):localStorage.removeItem(ACTIVE)
export const getRoom=(code:string)=>read().find(r=>r.code===code.toUpperCase())
export const currentRoom=()=>{const a=getActive();return a?getRoom(a.code):undefined}
const makeCode=()=>Math.random().toString(36).slice(2,7).toUpperCase()
export const createRoom=(name:string)=>{const rooms=read(),code=makeCode(),member={id:crypto.randomUUID(),name:name.trim()};const room:Room={code,members:[member],scores:{[member.id]:0},rounds:[],createdAt:Date.now()};rooms.push(room);write(rooms);setActive({code,memberId:member.id});return room}
export const joinRoom=(code:string,name:string)=>{const rooms=read(),room=rooms.find(r=>r.code===code.trim().toUpperCase());if(!room)throw Error('No encontramos esa sala. Revisa el código e inténtalo de nuevo.');let m=room.members.find(x=>x.name.toLowerCase()===name.trim().toLowerCase());if(!m){m={id:crypto.randomUUID(),name:name.trim()};room.members.push(m);room.scores[m.id]=0;write(rooms)}setActive({code:room.code,memberId:m.id});return room}
export const saveRound=(round:Round)=>{const a=getActive();if(!a)return;const rooms=read(),r=rooms.find(x=>x.code===a.code);if(!r)return;r.rounds.push(round);if(round.points){r.scores[round.guesser]=(r.scores[round.guesser]||0)+round.points}write(rooms)}
export const saveCharacter=(characterId:string,answers:string[])=>{const a=getActive();if(!a)return;const rooms=read(),r=rooms.find(x=>x.code===a.code),m=r?.members.find(x=>x.id===a.memberId);if(m){m.characterId=characterId;m.answers=answers;write(rooms)}}
export const memberId=()=>getActive()?.memberId
export const allRooms=read
export function compareAnswers(a:string,b:string):{points:number;similarity:'exacta'|'aproximada'|'distinta'}{const norm=(s:string)=>s.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9\s]/g,' ').split(/\s+/).filter(w=>w.length>2&&!['que','con','para','por','una','uno','los','las','del','como','pero','cuando','seria'].includes(w));const x=norm(a),y=norm(b);if(a.trim().toLocaleLowerCase()===b.trim().toLocaleLowerCase())return{points:3,similarity:'exacta'};const common=new Set(x.filter(w=>y.includes(w))).size,ratio=common/Math.max(new Set(x.concat(y)).size,1);return ratio>=.45?{points:2,similarity:'aproximada'}:{points:0,similarity:'distinta'}}
export const characterById=(id:string|undefined,all:Character[])=>all.find(c=>c.id===id)
