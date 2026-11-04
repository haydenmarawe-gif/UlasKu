async function api(body,path,headers){
  const r=await fetch(path||'/api/card',{method:'POST',headers:Object.assign({'Content-Type':'application/json'},headers||{}),body:JSON.stringify(body)});
  const j=await r.json().catch(()=>({error:'Server tidak merespons.'}));
  if(!r.ok) throw new Error(j.error||'Terjadi kesalahan.');
  return j;
}
function show(el,type,text){el.className='msg '+type;el.textContent=text}
// Ambil kode dari teks: bisa "ABC123" atau URL ".../r/ABC123"
function parseCode(t){const m=String(t).match(/\/r\/([A-Za-z0-9]+)/);return (m?m[1]:String(t)).toUpperCase().replace(/[^A-Z0-9]/g,'')}
