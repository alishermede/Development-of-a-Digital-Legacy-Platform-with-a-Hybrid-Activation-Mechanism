export type Store={setItem(k:string,v:string,cb:(e:string|null,ok?:boolean)=>void):void;getItem(k:string,cb:(e:string|null,v?:string|null)=>void):void;removeItem(k:string,cb:(e:string|null,ok?:boolean)=>void):void};
export type TelegramApp={initData:string;platform:string;ready():void;expand():void;isVersionAtLeast(v:string):boolean;SecureStorage?:Store};
declare global{interface Window{Telegram?:{WebApp?:TelegramApp}}}
export function supported(a?:TelegramApp){return !!a && a.platform==='android' && a.isVersionAtLeast('9.0') && !!a.SecureStorage}
function call<T>(run:(cb:(e:string|null,v?:T)=>void)=>void):Promise<T|undefined>{return new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Время ожидания истекло. Повторите проверку.')),5000);try{run((e,v)=>{clearTimeout(timer);e?reject(Error('Ошибка хранилища.')):resolve(v)})}catch{clearTimeout(timer);reject(Error('Хранилище недоступно.'))}})}
export async function probe(a:TelegramApp,nonce:string){
 if(!supported(a))throw Error('Нужен Telegram для Android с поддержкой SecureStorage.');
 const s=a.SecureStorage!,key='mura_probe';let failure:unknown;
 try{if(await call<boolean>(cb=>s.setItem(key,nonce,cb))!==true)throw Error('Запись не подтверждена.');if(await call<string|null>(cb=>s.getItem(key,cb))!==nonce)throw Error('Значение не совпало.')}catch(e){failure=e}
 try{if(await call<boolean>(cb=>s.removeItem(key,cb))!==true)throw Error()}catch{throw Error('Очистка не подтверждена. Мог остаться безвредный тестовый маркер. Повторите проверку.')}
 if(failure)throw failure;
}
