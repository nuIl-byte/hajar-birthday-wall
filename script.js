import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 1) الصقي هنا إعدادات مشروعك من Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCQdnPjJisgMcIijrh0snk5SJ2kEhwQEdE",
  authDomain: "hajar-birthday.firebaseapp.com",
  projectId: "hajar-birthday",
  storageBucket: "hajar-birthday.firebasestorage.app",
  messagingSenderId: "407573496200",
  appId: "1:407573496200:web:ab858ced82df918ae53a3d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const wishes = collection(db, "wishes");

/* ===== العد التنازلي ===== */
function pad(n){ return n < 10 ? "0" + n : "" + n; }
function target(){
  const now = new Date(), y = now.getFullYear();
  let t = new Date(y, 10, 1, 0, 0, 0);   // 10 = نوفمبر، 1 = اليوم
  if (now >= new Date(y, 10, 2)) t = new Date(y + 1, 10, 1, 0, 0, 0);
  return t;
}
let T = target();
function tick(){
  const now = new Date();
  let diff = T - now;
  const party = document.getElementById("party");
  if (diff <= 0){
    if (now < new Date(T.getFullYear(), 10, 2)){ party.style.display = "block"; diff = 0; }
    else { T = target(); diff = T - now; party.style.display = "none"; }
  } else party.style.display = "none";
  const s = Math.floor(diff / 1000);
  document.getElementById("d").textContent = pad(Math.floor(s / 86400));
  document.getElementById("h").textContent = pad(Math.floor(s % 86400 / 3600));
  document.getElementById("m").textContent = pad(Math.floor(s % 3600 / 60));
  document.getElementById("s").textContent = pad(s % 60);
}
tick(); setInterval(tick, 1000);

/* ===== جدار التهاني ===== */
const box = document.getElementById("list");
function render(items){
  box.innerHTML = "";
  if (!items.length){
    const e = document.createElement("div");
    e.className = "msg empty";
    e.textContent = "كوني أول من تهنئ هاجر!";
    box.appendChild(e);
    return;
  }
  items.forEach(it => {
    const d = document.createElement("div"); d.className = "msg";
    const b = document.createElement("b"); b.textContent = it.n || "مجهول";
    const p = document.createElement("p"); p.textContent = it.t;
    const sm = document.createElement("small"); sm.textContent = it.d;
    d.append(b, p, sm); box.appendChild(d);
  });
}

onSnapshot(query(wishes, orderBy("ts", "desc"), limit(200)), snap => {
  render(snap.docs.map(doc => {
    const x = doc.data();
    const date = x.ts ? x.ts.toDate() : new Date();
    return { n: x.n, t: x.t, d: date.toLocaleString("ar", { dateStyle: "medium", timeStyle: "short" }) };
  }));
}, err => { console.error(err); });

document.getElementById("go").addEventListener("click", async () => {
  const txEl = document.getElementById("tx");
  const t = txEl.value.trim();
  if (!t) return;
  const n = document.getElementById("nm").value.trim();
  const btn = document.getElementById("go");
  btn.disabled = true;
  try {
    await addDoc(wishes, { n: n.slice(0, 30), t: t.slice(0, 300), ts: serverTimestamp() });
    txEl.value = "";
  } catch (e) {
    console.error(e);
    alert("صار خطأ، حاولي مرة ثانية.");
  }
  btn.disabled = false;
});