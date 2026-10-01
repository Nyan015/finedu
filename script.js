/* ===== Utilidades ===== */
const $ = (id) => document.getElementById(id);
const moeda = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const dataBR = (iso) => iso.split("-").reverse().join("/");
const carregar = (chave) => JSON.parse(localStorage.getItem(chave)) || [];
const salvar = (chave, dados) => localStorage.setItem(chave, JSON.stringify(dados));
// Escapa o texto digitado antes de colocar no HTML (evita injeção de código)
const esc = (t) => t.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
// Data de hoje no formato AAAA-MM-DD, no fuso local
const hoje = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };

/* ===== Aviso bonito (toast) ===== */
let toastTimer;
function toast(texto, tipo = "ok") {
  const t = $("toast");
  t.textContent = (tipo === "ok" ? "✅ " : "⚠️ ") + texto;
  t.className = "toast " + tipo + " mostrar";
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("mostrar"), 3500);
}

/* ===== Validação de formulários ===== */
// Mostra (ou remove) a mensagem de erro logo abaixo do campo
function erroCampo(el, texto) {
  let aviso = el.parentElement.querySelector(".erro-txt");
  if (!texto) {
    el.classList.remove("invalido"); el.removeAttribute("aria-invalid");
    if (aviso) aviso.remove();
    return true;
  }
  el.classList.add("invalido"); el.setAttribute("aria-invalid", "true");
  if (!aviso) { aviso = document.createElement("small"); aviso.className = "erro-txt"; el.parentElement.appendChild(aviso); }
  aviso.textContent = texto;
  return false;
}
// Recebe uma lista [campo, funçãoDeRegra]; a regra devolve o texto do erro ou "" se estiver ok
function validar(regras) {
  let primeiro = null;
  regras.forEach(([el, regra]) => {
    if (!erroCampo(el, regra(el.value.trim())) && !primeiro) primeiro = el;
  });
  if (primeiro) primeiro.focus();
  return !primeiro;
}
// Regras reutilizáveis
const texto = (rotulo) => (v) => (v.length < 2 ? `Informe ${rotulo} (mínimo 2 letras).` : "");
const dinheiro = (rotulo, { zero = false, obrigatorio = true } = {}) => (v) => {
  if (v === "") return obrigatorio ? `Informe ${rotulo}.` : "";
  const n = parseFloat(v);
  if (isNaN(n)) return "Digite um número válido.";
  if (n < 0) return "O valor não pode ser negativo.";
  if (n === 0 && !zero) return "O valor deve ser maior que zero.";
  return "";
};
// Limpa o erro assim que o usuário volta a digitar
document.addEventListener("input", (e) => { if (e.target.classList.contains("invalido")) erroCampo(e.target, ""); });
// Impede digitar "-" e "e" nos campos numéricos
document.addEventListener("keydown", (e) => {
  if (e.target.type === "number" && ["-", "e", "E", "+"].includes(e.key)) e.preventDefault();
});

/* ===== Animação ao rolar (cards aparecem suavemente) ===== */
const observador = "IntersectionObserver" in window
  ? new IntersectionObserver((itens) => itens.forEach((i) => {
      if (i.isIntersecting) { i.target.classList.add("visivel"); observador.unobserve(i.target); }
    }), { threshold: 0.12 })
  : null;
function revelar() {
  document.querySelectorAll(".card:not(.reveal), .section h2:not(.reveal)").forEach((el, i) => {
    el.classList.add("reveal");
    el.style.setProperty("--d", (i % 4) * 80 + "ms"); // efeito escalonado
    observador ? observador.observe(el) : el.classList.add("visivel");
  });
}

/* ===== Menu responsivo ===== */
const menu = $("menu"), menuBtn = $("menuBtn");
function alternarMenu(abrir) {
  menu.classList.toggle("aberto", abrir);
  menuBtn.setAttribute("aria-expanded", abrir);
  menuBtn.textContent = abrir ? "✕" : "☰";
}
menuBtn.addEventListener("click", () => alternarMenu(!menu.classList.contains("aberto")));
menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => alternarMenu(false)));

/* ===== Modal ===== */
const modal = $("modal");
function abrirModal(titulo, conteudo) {
  $("modalTitulo").textContent = titulo;
  $("modalTexto").textContent = conteudo;
  modal.hidden = false;
  $("fecharModal").focus();
}
const fecharModal = () => (modal.hidden = true);
$("fecharModal").addEventListener("click", fecharModal);
modal.addEventListener("click", (e) => { if (e.target === modal) fecharModal(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") fecharModal(); });
document.querySelectorAll("[data-aviso]").forEach((b) =>
  b.addEventListener("click", () => { alternarMenu(false); abrirModal("Finedu", b.dataset.aviso); }));

/* ===== Conteúdos educativos ===== */
const topicos = [
  { icone: "🗂️", titulo: "Organização financeira", desc: "Saiba quanto entra e quanto sai.",
    texto: "Anote tudo o que recebe e tudo o que gasta. Separe o dinheiro em três partes: necessidades, desejos e economia. Uma sugestão simples é 50% / 30% / 20%." },
  { icone: "🐷", titulo: "Como economizar", desc: "Pequenas atitudes fazem diferença.",
    texto: "Guarde uma parte assim que receber, antes de gastar. Valores pequenos e frequentes, como R$ 10 por semana, viram uma reserva ao longo do tempo." },
  { icone: "🛍️", titulo: "Gastos por impulso", desc: "Pense antes de comprar.",
    texto: "Use a regra das 24 horas: espere um dia antes de comprar algo não planejado. Pergunte-se: eu preciso disso ou só quero agora?" },
  { icone: "🎯", titulo: "Metas financeiras", desc: "Transforme sonhos em planos.",
    texto: "Uma boa meta tem nome, valor e prazo. Divida o valor total pelo número de meses para saber quanto guardar por mês." },
  { icone: "🛒", titulo: "Planejamento de compras", desc: "Compre com estratégia.",
    texto: "Faça uma lista, compare preços em mais de um lugar e veja se cabe no orçamento do mês. Evite parcelar sem saber o total final." },
  { icone: "💼", titulo: "Renda e orçamento", desc: "Entenda o seu dinheiro do mês.",
    texto: "Orçamento é o plano do seu dinheiro: renda menos gastos fixos e variáveis. O que sobra pode ir para metas e para a reserva de emergência." },
];
$("topicos").innerHTML = topicos.map((t, i) => `
  <article class="card">
    <span class="icon" aria-hidden="true">${t.icone}</span><h3>${t.titulo}</h3><p>${t.desc}</p>
    <button class="btn btn-outline" data-i="${i}">Ver conteúdo</button>
  </article>`).join("");
$("topicos").addEventListener("click", (e) => {
  const b = e.target.closest("button[data-i]");
  if (b) { const t = topicos[b.dataset.i]; abrirModal(t.titulo, t.texto); }
});

/* ===== Metas (localStorage) ===== */
let metas = carregar("finedu_metas");

function mostrarMetas() {
  $("listaMetas").innerHTML = metas.map((m, i) => {
    const pct = Math.min(100, Math.round((m.guardado / m.total) * 100));
    const falta = Math.max(0, m.total - m.guardado);
    return `
    <article class="card">
      <span class="icon" aria-hidden="true">${pct >= 100 ? "🏆" : "🎯"}</span>
      <h3>${esc(m.nome)}</h3>
      <p>Meta: ${moeda(m.total)}<br>Guardado: ${moeda(m.guardado)}<br>Falta: ${moeda(falta)}<br>Prazo: ${dataBR(m.data)}</p>
      <div class="progresso" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100">
        <i data-pct="${pct}"></i>
      </div>
      <p><strong>${pct}% atingido${pct >= 100 ? " 🎉" : ""}</strong></p>
      <button class="excluir" data-i="${i}" aria-label="Excluir meta ${esc(m.nome)}">🗑️ Excluir</button>
    </article>`;
  }).join("") || "<p>Você ainda não criou nenhuma meta. Que tal começar agora? 🚀</p>";

  revelar();
  // Dois frames depois, a barra sai de 0% até o valor real (a transição CSS faz a animação)
  requestAnimationFrame(() => requestAnimationFrame(() =>
    document.querySelectorAll(".progresso i").forEach((b) => (b.style.width = b.dataset.pct + "%"))));
}

$("formMeta").addEventListener("submit", (e) => {
  e.preventDefault();
  const total = $("metaTotal");
  const ok = validar([
    [$("metaNome"), texto("o nome da meta")],
    [total, dinheiro("o valor total", { zero: false })],
    [$("metaGuardado"), (v) => dinheiro("o valor já economizado", { zero: true })(v) ||
      (parseFloat(v) > parseFloat(total.value) ? "Não pode ser maior que o valor total." : "")],
    [$("metaData"), (v) => (!v ? "Informe a data prevista." : v < hoje() ? "Escolha uma data de hoje em diante." : "")],
  ]);
  if (!ok) return toast("Confira os campos destacados.", "erro");

  metas.push({ nome: $("metaNome").value.trim(), total: parseFloat(total.value),
    guardado: parseFloat($("metaGuardado").value), data: $("metaData").value });
  salvar("finedu_metas", metas);
  mostrarMetas();
  e.target.reset();
  toast("Meta criada! Bora conquistar. 🎯");
});
$("listaMetas").addEventListener("click", (e) => {
  const b = e.target.closest(".excluir");
  if (!b) return;
  metas.splice(b.dataset.i, 1);
  salvar("finedu_metas", metas);
  mostrarMetas();
  toast("Meta excluída.");
});

/* ===== Gastos (localStorage) ===== */
let gastos = carregar("finedu_gastos");
const icones = { "Alimentação": "🍔", "Transporte": "🚌", "Lazer": "🎮", "Estudos": "📚", "Roupas": "👕", "Saúde": "💊", "Outros": "📦" };

function mostrarGastos() {
  $("listaGastos").innerHTML = gastos.map((g, i) => `
    <tr>
      <td data-label="Descrição">${esc(g.desc)}</td>
      <td data-label="Categoria">${icones[g.cat] || "📦"} ${g.cat}</td>
      <td data-label="Data">${dataBR(g.data)}</td>
      <td data-label="Valor">${moeda(g.valor)}</td>
      <td data-label="Ação"><button class="excluir" data-i="${i}" aria-label="Excluir gasto ${esc(g.desc)}">🗑️ Excluir</button></td>
    </tr>`).join("") || '<tr><td colspan="5">Nenhum gasto registrado ainda.</td></tr>';

  // Resumo: total, quantidade e categoria com maior gasto
  const total = gastos.reduce((s, g) => s + g.valor, 0);
  const porCat = {};
  gastos.forEach((g) => (porCat[g.cat] = (porCat[g.cat] || 0) + g.valor));
  const top = Object.entries(porCat).sort((a, b) => b[1] - a[1])[0];
  $("totalGasto").textContent = moeda(total);
  $("qtdGasto").textContent = gastos.length;
  $("topCat").textContent = top ? `${icones[top[0]]} ${top[0]} (${moeda(top[1])})` : "—";
}

$("formGasto").addEventListener("submit", (e) => {
  e.preventDefault();
  const ok = validar([
    [$("gastoDesc"), texto("a descrição")],
    [$("gastoValor"), dinheiro("o valor", { zero: false })],
    [$("gastoData"), (v) => (v ? "" : "Informe a data do gasto.")],
  ]);
  if (!ok) return toast("Confira os campos destacados.", "erro");

  gastos.push({ desc: $("gastoDesc").value.trim(), cat: $("gastoCat").value,
    valor: parseFloat($("gastoValor").value), data: $("gastoData").value });
  salvar("finedu_gastos", gastos);
  mostrarGastos();
  e.target.reset();
  toast("Gasto adicionado com sucesso!");
});
$("listaGastos").addEventListener("click", (e) => {
  const b = e.target.closest(".excluir");
  if (!b) return;
  gastos.splice(b.dataset.i, 1);
  salvar("finedu_gastos", gastos);
  mostrarGastos();
  toast("Gasto excluído.");
});

/* ===== Simulador de economia ===== */
$("formSim").addEventListener("submit", (e) => {
  e.preventDefault();
  const ok = validar([
    [$("simRenda"), dinheiro("quanto você recebe", { zero: true })],
    [$("simGasto"), dinheiro("quanto você gasta", { zero: true })],
    [$("simEco"), dinheiro("quanto quer economizar", { zero: false })],
    [$("simObj"), dinheiro("o objetivo", { obrigatorio: false })], // opcional, mas nunca negativo
  ]);
  if (!ok) return toast("Confira os campos destacados.", "erro");

  const renda = parseFloat($("simRenda").value), gasto = parseFloat($("simGasto").value);
  const eco = parseFloat($("simEco").value), obj = parseFloat($("simObj").value);
  const saldo = renda - gasto;
  let html = `<p>💰 <strong>Saldo mensal disponível:</strong> ${moeda(saldo)}</p>`;

  if (eco <= saldo) {
    html += `<p>✅ Sua meta cabe no orçamento! Se você economizar ${moeda(eco)} por mês, poderá juntar ${moeda(eco * 12)} em um ano.</p>`;
    if (obj > 0) html += `<p>🎯 Você alcançará ${moeda(obj)} em cerca de <strong>${Math.ceil(obj / eco)} meses</strong>.</p>`;
  } else if (saldo > 0) {
    html += `<p>⚠️ Essa meta é maior que o seu saldo. Tente economizar ${moeda(saldo)} por mês ou reduzir alguns gastos. Cada passo conta!</p>`;
  } else {
    html += "<p>⚠️ Seus gastos estão iguais ou maiores que sua renda. Revise o que não é essencial para abrir espaço para economizar. Você consegue! 💪</p>";
  }
  const box = $("resultadoSim");
  box.innerHTML = html;
  box.hidden = false;
  box.scrollIntoView({ behavior: "smooth", block: "nearest" });
});

/* ===== Inicialização ===== */
$("ano").textContent = new Date().getFullYear();
mostrarMetas();
mostrarGastos();
revelar();
