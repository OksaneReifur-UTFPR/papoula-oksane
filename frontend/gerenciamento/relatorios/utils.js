// utils.js - funções utilitárias usadas pelas páginas

function parseDate(d){ // "YYYY-MM-DD" -> Date
  const [y,m,day] = d.split("-").map(Number);
  return new Date(y,m-1,day);
}
function monthKey(d){ // date -> "YYYY-MM"
  const dd = parseDate(d);
  return `${dd.getFullYear()}-${String(dd.getMonth()+1).padStart(2,"0")}`;
}
function monthLabel(key){
  const [y,m]=key.split("-");
  const names=["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  return `${names[Number(m)-1]} ${y}`;
}
function formatCurrency(v){ return "R$ "+v.toFixed(2).replace(".",","); }

function aggregateByMonth(sales){
  const map = {};
  sales.forEach(s=>{
    const k = monthKey(s.date);
    map[k] = map[k] || { key:k, total:0, items:[] };
    map[k].total += s.total;
  });
  const arr = Object.values(map).sort((a,b)=>a.key.localeCompare(b.key));
  return arr;
}

function aggregateFlowers(sales){
  const map = {};
  sales.forEach(s=>{
    s.items.forEach(it=>{
      map[it.flower] = map[it.flower] || {flower:it.flower, qty:0, revenue:0};
      map[it.flower].qty += it.qty;
      map[it.flower].revenue += it.qty * it.price;
    })
  })
  return Object.values(map).sort((a,b)=>b.qty - a.qty);
}

function topBuyer(sales){
  const map = {};
  sales.forEach(s=>{
    const id = s.buyer.id;
    map[id] = map[id] || { buyer: s.buyer, total:0, purchases:[] };
    map[id].total += s.total;
    map[id].purchases.push(s);
  });
  const arr = Object.values(map).sort((a,b)=>b.total - a.total);
  return arr[0];
}

function exportTableToCSV(filename, rows) {
  const processRow = row => row.map(cell => {
    if (typeof cell === "string" && (cell.includes(",")||cell.includes("\"")||cell.includes("\n"))) {
      return `"${cell.replace(/"/g,'""')}"`;
    }
    return cell;
  }).join(",");
  const csvContent = rows.map(processRow).join("\n");
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}