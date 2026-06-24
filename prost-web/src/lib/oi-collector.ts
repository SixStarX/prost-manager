/**
 * Código-fonte do "Coletor Prost" — o bookmarklet que roda dentro do painel
 * da Oficina Inteligente, lê a tabela do relatório aberto na tela e envia
 * para o backend do Prost (POST /oi/scrape).
 *
 * Importante para o formato bookmarklet:
 *  - Sem comentários de linha (//) — apenas blocos não são incluídos no build.
 *  - Tudo termina com ponto-e-vírgula para permitir achatar em uma linha.
 *  - {{API_URL}} é substituído pela URL real do backend ao gerar o link.
 */
export const COLLECTOR_SOURCE = String.raw`
(function(){
  var API = "{{API_URL}}";
  var PANEL_ID = "prost-collector-panel";
  var old = document.getElementById(PANEL_ID);
  if (old) { old.remove(); }

  function txt(el){ return (el.textContent || "").replace(/\s+/g, " ").trim(); }

  function extract(table){
    var headers = [];
    var head = table.querySelector("thead tr");
    if (head) {
      head.querySelectorAll("th,td").forEach(function(c){ headers.push(txt(c)); });
    }
    var bodyRows = [].slice.call(table.querySelectorAll("tbody tr"));
    if (bodyRows.length === 0) { bodyRows = [].slice.call(table.querySelectorAll("tr")); }
    if (headers.length === 0 && bodyRows.length > 0) {
      var first = bodyRows.shift();
      first.querySelectorAll("th,td").forEach(function(c){ headers.push(txt(c)); });
    }
    var rows = [];
    bodyRows.forEach(function(tr){
      var cells = [].slice.call(tr.querySelectorAll("th,td")).map(txt);
      var hasContent = cells.some(function(v){ return v.length > 0; });
      if (hasContent) { rows.push(cells); }
    });
    return { headers: headers, rows: rows };
  }

  var tables = [].slice.call(document.querySelectorAll("table")).filter(function(t){
    var rows = t.querySelectorAll("tr").length;
    var cols = (t.querySelector("tr") ? t.querySelector("tr").children.length : 0);
    return rows >= 2 && cols >= 2;
  });

  var panel = document.createElement("div");
  panel.id = PANEL_ID;
  panel.style.cssText = "position:fixed;top:16px;right:16px;z-index:2147483647;width:380px;max-height:85vh;overflow:auto;background:#0d1017;color:#f0f4f8;border:1px solid rgba(255,255,255,.12);border-radius:10px;box-shadow:0 12px 40px rgba(0,0,0,.6);font-family:system-ui,Segoe UI,sans-serif;font-size:13px;padding:0;";

  var header = document.createElement("div");
  header.style.cssText = "display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-bottom:1px solid rgba(255,255,255,.08);background:linear-gradient(180deg,rgba(230,57,70,.12),transparent);";
  header.innerHTML = "<strong style='font-size:13px;letter-spacing:.02em;'>🔧 Coletor Prost</strong>";
  var close = document.createElement("button");
  close.textContent = "✕";
  close.style.cssText = "background:none;border:none;color:#9aa4b2;font-size:16px;cursor:pointer;line-height:1;";
  close.onclick = function(){ panel.remove(); };
  header.appendChild(close);
  panel.appendChild(header);

  var body = document.createElement("div");
  body.style.cssText = "padding:12px 14px;";
  panel.appendChild(body);

  function setStatus(msg, color){
    var s = document.createElement("div");
    s.style.cssText = "margin-top:10px;padding:9px 11px;border-radius:6px;font-size:12px;line-height:1.4;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);color:" + (color || "#cdd5df") + ";";
    s.innerHTML = msg;
    body.appendChild(s);
    s.scrollIntoView({ block: "nearest" });
    return s;
  }

  function send(kind, data, btn){
    btn.disabled = true;
    var original = btn.textContent;
    btn.textContent = "Enviando...";
    fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: kind, headers: data.headers, rows: data.rows })
    })
    .then(function(r){ return r.json().then(function(j){ return { ok: r.ok, j: j }; }); })
    .then(function(res){
      btn.disabled = false; btn.textContent = original;
      if (!res.ok) { throw new Error(res.j && res.j.message ? res.j.message : "Erro no servidor"); }
      var j = res.j;
      setStatus("✅ <b>" + kind + "</b>: " + j.created + " criados, " + j.updated + " atualizados, " + j.skipped + " ignorados (de " + j.total + ").", "#34d399");
      if (j.errors && j.errors.length) {
        setStatus("⚠ " + j.errors.slice(0,5).join("<br>"), "#fbbf24");
      }
    })
    .catch(function(err){
      btn.disabled = false; btn.textContent = original;
      setStatus("❌ Falha ao enviar: " + err.message + "<br><small>O backend do Prost (" + API + ") está rodando?</small>", "#f87171");
    });
  }

  if (tables.length === 0) {
    setStatus("Nenhuma tabela encontrada nesta página. Abra um relatório (Clientes, Veículos ou Ordens de Serviço) e clique novamente.", "#fbbf24");
  } else {
    var intro = document.createElement("div");
    intro.style.cssText = "font-size:12px;color:#9aa4b2;margin-bottom:10px;";
    intro.textContent = "Encontrei " + tables.length + " tabela(s). Escolha qual enviar e o tipo de dado:";
    body.appendChild(intro);

    tables.forEach(function(table, i){
      var data = extract(table);
      if (data.rows.length === 0) { return; }

      var card = document.createElement("div");
      card.style.cssText = "border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:10px;margin-bottom:10px;background:rgba(255,255,255,.02);";

      var preview = document.createElement("div");
      preview.style.cssText = "font-size:11px;color:#cdd5df;margin-bottom:8px;";
      preview.innerHTML = "<b>" + data.rows.length + " linha(s)</b> &middot; colunas: <span style='color:#60a5fa'>" + (data.headers.slice(0,6).join(", ") || "(sem cabeçalho)") + "</span>";
      card.appendChild(preview);

      var btnRow = document.createElement("div");
      btnRow.style.cssText = "display:flex;gap:6px;flex-wrap:wrap;";

      [["Clientes","clients"],["Veículos","vehicles"],["Ordens","orders"]].forEach(function(opt){
        var b = document.createElement("button");
        b.textContent = opt[0];
        b.style.cssText = "flex:1;min-width:90px;padding:7px 8px;border:1px solid rgba(230,57,70,.4);background:rgba(230,57,70,.12);color:#f87171;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;";
        b.onmouseover = function(){ b.style.background = "rgba(230,57,70,.25)"; };
        b.onmouseout = function(){ b.style.background = "rgba(230,57,70,.12)"; };
        b.onclick = function(){ send(opt[1], data, b); };
        btnRow.appendChild(b);
      });
      card.appendChild(btnRow);

      var mark = document.createElement("button");
      mark.textContent = "Destacar esta tabela na página";
      mark.style.cssText = "margin-top:7px;width:100%;padding:5px;border:1px dashed rgba(255,255,255,.15);background:none;color:#9aa4b2;border-radius:5px;font-size:11px;cursor:pointer;";
      mark.onclick = function(){
        table.scrollIntoView({ behavior: "smooth", block: "center" });
        var prev = table.style.outline;
        table.style.outline = "3px solid #e63946";
        setTimeout(function(){ table.style.outline = prev; }, 2000);
      };
      card.appendChild(mark);

      body.appendChild(card);
    });
  }

  document.body.appendChild(panel);
})();
`;

/** Gera a string javascript: do bookmarklet, embutindo a URL do backend. */
export function buildBookmarklet(apiUrl: string): string {
  const code = COLLECTOR_SOURCE.replace('{{API_URL}}', apiUrl)
    .replace(/\n\s*/g, ' ') // achata em uma linha (seguro: sem comentários //)
    .trim();
  return 'javascript:' + encodeURIComponent(code);
}
