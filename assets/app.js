let db = null;
const PLAYGROUND_QUERY_KEY = 'sqlmastery-playground-query';
const SQL_KEYWORDS = [
  'SELECT','FROM','WHERE','GROUP BY','ORDER BY','HAVING','LIMIT','JOIN','LEFT JOIN','INNER JOIN','RIGHT JOIN',
  'ON','AS','DISTINCT','CASE','WHEN','THEN','ELSE','END','WITH','UNION ALL','COUNT','SUM','AVG','MIN','MAX',
  'INSERT INTO','VALUES','UPDATE','SET','DELETE','CREATE TABLE','NULL','IS NULL','IS NOT NULL','LIKE','IN','BETWEEN','NOT EXISTS'
];

const SCHEMA = `
CREATE TABLE departments (department_id INTEGER NOT NULL PRIMARY KEY, dept_name TEXT NOT NULL, budget REAL, location TEXT);
CREATE TABLE employees (employee_id INTEGER NOT NULL PRIMARY KEY, full_name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, department_id INTEGER, manager_id INTEGER, salary REAL, hire_date TEXT, job_title TEXT, FOREIGN KEY (department_id) REFERENCES departments(department_id), FOREIGN KEY (manager_id) REFERENCES employees(employee_id));
CREATE TABLE customers (customer_id INTEGER NOT NULL PRIMARY KEY, full_name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, country TEXT, created_at TEXT);
CREATE TABLE products (product_id INTEGER NOT NULL PRIMARY KEY, product_name TEXT NOT NULL, category TEXT, unit_price REAL, stock_qty INTEGER DEFAULT 0);
CREATE TABLE orders (order_id INTEGER NOT NULL PRIMARY KEY, customer_id INTEGER, order_date TEXT NOT NULL, status TEXT, total_amount REAL, FOREIGN KEY (customer_id) REFERENCES customers(customer_id), CHECK (status IN ('pending','processing','shipped','delivered','cancelled')));
CREATE TABLE order_items (item_id INTEGER NOT NULL PRIMARY KEY, order_id INTEGER, product_id INTEGER, quantity INTEGER NOT NULL, unit_price REAL, FOREIGN KEY (order_id) REFERENCES orders(order_id), FOREIGN KEY (product_id) REFERENCES products(product_id));
CREATE TABLE reviews (review_id INTEGER NOT NULL PRIMARY KEY, product_id INTEGER, customer_id INTEGER, rating INTEGER, review_text TEXT, reviewed_at TEXT, FOREIGN KEY (product_id) REFERENCES products(product_id), FOREIGN KEY (customer_id) REFERENCES customers(customer_id), CHECK (rating BETWEEN 1 AND 5));`;

const SEED = `
INSERT INTO departments VALUES
(1,'Engineering',500000,'New York'),(2,'Marketing',200000,'San Francisco'),(3,'Sales',350000,'Chicago'),(4,'HR',150000,'New York'),(5,'Finance',300000,'Boston');
INSERT INTO employees VALUES
(1,'Alice Thompson','alice@company.com',1,NULL,120000,'2018-03-15','CTO'),(2,'Bob Martinez','bob@company.com',3,NULL,95000,'2017-06-01','VP Sales'),(11,'Karen Moore','karen@company.com',2,NULL,88000,'2018-11-01','Marketing Director'),(13,'Mia Taylor','mia@company.com',4,NULL,78000,'2017-04-20','HR Director'),(15,'Olivia Thomas','olivia@company.com',5,NULL,92000,'2016-01-15','CFO'),(3,'Carol White','carol@company.com',1,1,85000,'2019-07-20','Senior Engineer'),(4,'David Kim','david@company.com',1,1,80000,'2020-01-10','Backend Engineer'),(5,'Eve Johnson','eve@company.com',1,1,75000,'2020-09-15','Frontend Engineer'),(8,'Henry Brown','henry@company.com',3,2,65000,'2019-08-10','Sales Lead'),(9,'Iris Davis','iris@company.com',3,2,62000,'2020-02-14','Sales Rep'),(10,'Jack Wilson','jack@company.com',3,2,60000,'2021-07-01','Sales Rep'),(12,'Leo Garcia','leo@company.com',2,11,68000,'2020-06-15','Marketing Manager'),(14,'Nate Anderson','nate@company.com',4,13,58000,'2021-09-01','HR Specialist'),(16,'Paul Jackson','paul@company.com',5,15,72000,'2019-03-25','Senior Analyst'),(6,'Frank Lee','frank@company.com',1,3,70000,'2021-03-01','Junior Engineer'),(7,'Grace Hall','grace@company.com',1,3,72000,'2021-05-12','Junior Engineer');
INSERT INTO customers VALUES
(1,'Samantha Reed','sam@example.com','USA','2022-01-10'),(2,'Tom Harris','tom@example.com','Canada','2022-03-15'),(3,'Uma Patel','uma@example.com','India','2022-05-20'),(4,'Victor Chen','victor@example.com','USA','2022-07-05'),(5,'Wendy Scott','wendy@example.com','UK','2022-08-30'),(6,'Xander Young','xander@example.com','Australia','2022-09-15'),(7,'Yara Green','yara@example.com','Germany','2023-01-20'),(8,'Zach Baker','zach@example.com','USA','2023-03-10'),(9,'Amy Clark','amy@example.com','Canada','2023-05-05'),(10,'Brian Lewis','brian@example.com','USA','2023-06-20');
INSERT INTO products VALUES
(1,'Wireless Keyboard','Electronics',89.99,200),(2,'USB-C Hub','Electronics',49.99,350),(3,'Noise-Cancelling Headphones','Electronics',199.99,120),(4,'Mechanical Keyboard','Electronics',149.99,80),(5,'Webcam HD 1080p','Electronics',79.99,260),(6,'Laptop Stand','Accessories',39.99,400),(7,'Monitor Arm','Accessories',69.99,150),(8,'Cable Management Kit','Accessories',19.99,600),(9,'Ergonomic Mouse','Electronics',59.99,310),(10,'Standing Desk Mat','Accessories',49.99,180),(11,'Blue Light Glasses','Wellness',29.99,500),(12,'Desk Lamp LED','Accessories',44.99,220),(13,'Portable SSD 1TB','Storage',109.99,90),(14,'Cloud Backup Plan 1Y','Software',59.99,999),(15,'VPN Subscription 1Y','Software',39.99,999);
INSERT INTO orders VALUES
(1,1,'2023-01-15','delivered',339.97),(2,1,'2023-04-20','delivered',199.99),(3,2,'2023-02-10','delivered',129.98),(4,3,'2023-03-05','delivered',259.98),(5,4,'2023-04-01','shipped',89.99),(6,4,'2023-07-10','delivered',219.98),(7,5,'2023-05-15','delivered',49.99),(8,6,'2023-06-20','processing',289.98),(9,7,'2023-07-01','delivered',159.98),(10,8,'2023-08-15','pending',109.99),(11,1,'2023-09-01','delivered',449.97),(12,9,'2023-09-10','delivered',79.99),(13,10,'2023-10-05','cancelled',149.99),(14,2,'2023-10-20','delivered',219.98),(15,3,'2023-11-15','shipped',109.99);
INSERT INTO order_items VALUES
(1,1,1,1,89.99),(2,1,3,1,199.99),(3,1,8,2,19.99),(4,2,3,1,199.99),(5,3,1,1,89.99),(6,3,6,1,39.99),(7,4,4,1,149.99),(8,4,9,1,59.99),(9,4,11,1,29.99),(10,5,1,1,89.99),(11,6,5,1,79.99),(12,6,7,1,69.99),(13,6,12,1,44.99),(14,7,10,1,49.99),(15,8,2,2,49.99),(16,8,9,1,59.99),(17,9,14,1,59.99),(18,9,15,1,39.99),(19,9,6,1,39.99),(20,10,13,1,109.99),(21,11,3,1,199.99),(22,11,4,1,149.99),(23,11,13,1,109.99),(24,12,5,1,79.99),(25,13,4,1,149.99),(26,14,7,1,69.99),(27,14,5,1,79.99),(28,14,12,1,44.99),(29,15,13,1,109.99);
INSERT INTO reviews VALUES
(1,3,1,5,'Amazing noise cancellation!','2023-01-25'),(2,1,2,4,'Great keyboard, fast delivery.','2023-02-20'),(3,4,3,5,'Best mechanical keyboard ever.','2023-03-20'),(4,9,3,4,'Comfortable and precise.','2023-03-22'),(5,1,4,3,'Decent product, average quality.','2023-04-15'),(6,3,1,4,'Still great on second purchase.','2023-09-10'),(7,5,6,5,'Crystal clear video quality.','2023-07-05'),(8,13,10,5,'Fast transfer speeds.','2023-10-20'),(9,7,2,4,'Sturdy monitor arm.','2023-11-05'),(10,14,7,5,'Great cloud service.','2023-07-15');`;

const TABLES = ['departments','employees','customers','products','orders','order_items','reviews'];

function setActivePage(page) {
  document.querySelectorAll('.nav-links a[data-page]').forEach(a => {
    a.classList.toggle('active', a.dataset.page === page);
  });
}

function showMsg(msg, cls='') {
  const r = document.getElementById('result');
  if (!r) return;
  r.innerHTML = `<div class="res-msg ${cls}">${msg}</div>`;
}

function escapeHtml(s) {
  return s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
}

function highlightSQL(sql) {
  let out = escapeHtml(sql);
  out = out.replace(/--.*$/gm, m => `<span class="tok-cm">${m}</span>`);
  out = out.replace(/'(?:''|[^'])*'/g, m => `<span class="tok-str">${m}</span>`);
  out = out.replace(/\b\d+(?:\.\d+)?\b/g, m => `<span class="tok-num">${m}</span>`);
  out = out.replace(/\b(select|from|where|group\s+by|order\s+by|having|limit|join|left\s+join|inner\s+join|right\s+join|on|as|distinct|case|when|then|else|end|with|union\s+all|insert\s+into|values|update|set|delete|create\s+table|null|is\s+null|is\s+not\s+null|like|in|between|not\s+exists)\b/gi,
    m => `<span class="tok-kw">${m.toUpperCase()}</span>`);
  return out || '<span class="tok-id"> </span>';
}

function getCurrentWord(editor) {
  const pos = editor.selectionStart;
  const left = editor.value.slice(0, pos);
  const match = left.match(/[A-Za-z_ ]+$/);
  return match ? match[0] : '';
}

function showSuggestion() {
  const editor = document.getElementById('editor');
  const chip = document.getElementById('suggest-chip');
  if (!editor || !chip) return;
  const raw = getCurrentWord(editor).trim().toUpperCase();
  if (!raw) {
    chip.textContent = 'No suggestion';
    chip.dataset.value = '';
    return;
  }
  const hit = SQL_KEYWORDS.find(k => k.startsWith(raw) && k !== raw);
  chip.textContent = hit ? `TAB → ${hit}` : 'No suggestion';
  chip.dataset.value = hit || '';
}

function applySuggestion() {
  const editor = document.getElementById('editor');
  const chip = document.getElementById('suggest-chip');
  if (!editor || !chip || !chip.dataset.value) return;
  const pos = editor.selectionStart;
  const left = editor.value.slice(0, pos);
  const right = editor.value.slice(pos);
  const match = left.match(/[A-Za-z_ ]+$/);
  if (!match) return;
  const start = pos - match[0].length;
  editor.value = editor.value.slice(0, start) + chip.dataset.value + ' ' + right;
  editor.selectionStart = editor.selectionEnd = start + chip.dataset.value.length + 1;
  syncHighlight();
}

function syncHighlight() {
  const editor = document.getElementById('editor');
  const hl = document.getElementById('sql-highlight');
  if (!editor || !hl) return;
  hl.innerHTML = highlightSQL(editor.value + '\n');
  hl.scrollTop = editor.scrollTop;
  hl.scrollLeft = editor.scrollLeft;
  showSuggestion();
}

function renderTable(res) {
  const container = document.getElementById('result');
  if (!container) return;
  const t = document.createElement('table');
  t.className = 'res-table';
  const thead = document.createElement('thead');
  const hr = document.createElement('tr');
  res.columns.forEach(c => {
    const th = document.createElement('th');
    th.textContent = c;
    hr.appendChild(th);
  });
  thead.appendChild(hr);
  t.appendChild(thead);

  const tbody = document.createElement('tbody');
  res.values.slice(0, 200).forEach(row => {
    const tr = document.createElement('tr');
    row.forEach(v => {
      const td = document.createElement('td');
      if (v === null) { td.textContent = 'NULL'; td.className = 'res-null'; }
      else if (typeof v === 'number') { td.textContent = v; td.className = 'res-num'; }
      else { td.textContent = v; td.className = 'res-str'; }
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  t.appendChild(tbody);

  container.innerHTML = `<div class="res-msg res-ok">✓ ${res.values.length} row${res.values.length === 1 ? '' : 's'} returned</div>`;
  container.appendChild(t);
}

function renderTablesWithValues() {
  const host = document.getElementById('tables-values');
  if (!host || !db) return;
  host.innerHTML = '';

  TABLES.forEach(tbl => {
    const rowsRes = db.exec(`SELECT * FROM ${tbl} LIMIT 20`);
    const countRes = db.exec(`SELECT COUNT(*) AS c FROM ${tbl}`);
    const total = countRes[0].values[0][0];

    const card = document.createElement('div');
    card.className = 'tbl-card';

    const head = document.createElement('div');
    head.className = 'tbl-head';
    head.innerHTML = `<span>${tbl}</span><span>${total} rows</span>`;
    card.appendChild(head);

    const body = document.createElement('div');
    body.className = 'tbl-values';

    if (!rowsRes.length) {
      body.innerHTML = '<div class="res-msg">No rows</div>';
    } else {
      const res = rowsRes[0];
      const table = document.createElement('table');
      const thead = document.createElement('thead');
      const tr = document.createElement('tr');
      res.columns.forEach(c => {
        const th = document.createElement('th');
        th.textContent = c;
        tr.appendChild(th);
      });
      thead.appendChild(tr);
      table.appendChild(thead);

      const tbody = document.createElement('tbody');
      res.values.forEach(row => {
        const r = document.createElement('tr');
        row.forEach(v => {
          const td = document.createElement('td');
          td.textContent = v === null ? 'NULL' : v;
          r.appendChild(td);
        });
        tbody.appendChild(r);
      });
      table.appendChild(tbody);
      body.appendChild(table);
    }

    card.appendChild(body);
    host.appendChild(card);
  });
}

function runSQL() {
  const editor = document.getElementById('editor');
  if (!editor) return;
  const sql = editor.value.trim();
  if (!sql) { showMsg('Write a SQL query first.', 'res-err'); return; }
  if (!db) { showMsg('Database is not ready yet. Please wait…', 'res-err'); return; }

  try {
    const stmts = sql.split(';').map(s => s.trim()).filter(Boolean);
    let lastRes = null;
    let affected = '';

    for (const stmt of stmts) {
      const lower = stmt.toLowerCase();
      if (lower.startsWith('select') || lower.startsWith('with') || lower.startsWith('pragma')) {
        const r = db.exec(stmt);
        if (r.length) lastRes = r[0];
      } else {
        db.run(stmt + ';');
        affected = `✓ ${lower.split(' ')[0].toUpperCase()} executed successfully.`;
      }
    }

    if (lastRes) renderTable(lastRes);
    else if (affected) showMsg(affected, 'res-ok');
    else showMsg('Query executed. No rows returned.', 'res-ok');

    if (document.getElementById('tables-values')) renderTablesWithValues();
  } catch (e) {
    showMsg('❌ Error: ' + e.message, 'res-err');
  }
}

function clearEditor() {
  const editor = document.getElementById('editor');
  if (editor) editor.value = '';
  syncHighlight();
  showMsg('Run a query to see results here.');
}

function trySQL(btn) {
  const code = btn.closest('.cw').querySelector('pre code').innerText;
  const inPlayground = document.body.dataset.page === 'playground';
  if (inPlayground) {
    const editor = document.getElementById('editor');
    if (!editor) return;
    editor.value = code;
    syncHighlight();
    setTimeout(runSQL, 200);
    return;
  }
  sessionStorage.setItem(PLAYGROUND_QUERY_KEY, code);
  window.location.href = 'playground.html';
}

function copyCode(btn) {
  const code = btn.closest('.cw').querySelector('pre code').innerText;
  navigator.clipboard.writeText(code).then(() => {
    const prev = btn.textContent;
    btn.textContent = '✓ Copied';
    setTimeout(() => btn.textContent = prev, 1200);
  });
}

function fillStarter() {
  const editor = document.getElementById('editor');
  if (!editor) return;
  editor.value = `SELECT product_name, category, unit_price\nFROM products\nORDER BY unit_price DESC\nLIMIT 5;`;
  syncHighlight();
}

function toggleSchema() {
  const panel = document.getElementById('schema-panel');
  if (panel) panel.classList.toggle('open');
}

function addLessonNavigation() {
  const lessons = Array.from(document.querySelectorAll('.section .lesson'));
  if (!lessons.length) return;
  lessons.forEach((lesson, i) => { if (!lesson.id) lesson.id = `lesson-${i + 1}`; });

  lessons.forEach(lesson => {
    lesson.querySelector('.lesson-open-wrap')?.remove();
    const firstCode = lesson.querySelector('pre code');
    if (!firstCode) return;

    const target = lesson.querySelector('.lhd div > .lsub') || lesson.querySelector('.lhd div');
    if (!target) return;

    const wrap = document.createElement('div');
    wrap.className = 'lesson-open-wrap';

    const open = document.createElement('a');
    open.href = 'playground.html';
    open.className = 'lesson-open-btn';
    open.textContent = 'Open in Playground';
    open.onclick = e => {
      e.preventDefault();
      sessionStorage.setItem(PLAYGROUND_QUERY_KEY, firstCode.innerText);
      window.location.href = 'playground.html';
    };

    wrap.appendChild(open);
    if (target.classList?.contains('lsub')) target.insertAdjacentElement('afterend', wrap);
    else target.appendChild(wrap);
  });

  lessons.forEach((lesson, i) => {
    lesson.querySelector('.lesson-nav')?.remove();
    const nav = document.createElement('div');
    nav.className = 'lesson-nav';
    if (lessons[i - 1]) {
      const a = document.createElement('a');
      a.href = `#${lessons[i - 1].id}`;
      a.textContent = '← Previous Lesson';
      nav.appendChild(a);
    } else {
      const spacer = document.createElement('span');
      spacer.style.flex = '1';
      nav.appendChild(spacer);
    }
    if (lessons[i + 1]) {
      const a = document.createElement('a');
      a.href = `#${lessons[i + 1].id}`;
      a.textContent = 'Next Lesson →';
      nav.appendChild(a);
    }
    lesson.appendChild(nav);
  });
}

function ensureBackTop() {
  let btn = document.getElementById('back-top');
  if (!btn) {
    btn = document.createElement('a');
    btn.id = 'back-top';
    btn.href = '#';
    btn.textContent = '↑';
    document.body.appendChild(btn);
  }
  const toggle = () => btn.classList.toggle('show', window.scrollY > 260);
  btn.onclick = e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  window.addEventListener('scroll', toggle, { passive: true });
  toggle();
}

async function initDB() {
  const dbTxt = document.getElementById('db-txt');
  const runnerStatus = document.getElementById('runner-status');
  try {
    if (dbTxt) dbTxt.textContent = 'Loading database…';
    if (runnerStatus) runnerStatus.textContent = 'DB Loading…';
    const SQL = await initSqlJs({ locateFile: f => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/${f}` });
    db = new SQL.Database();
    db.run(SCHEMA);
    db.run(SEED);
    if (dbTxt) dbTxt.textContent = 'Database ready — 7 tables loaded';
    if (runnerStatus) runnerStatus.textContent = 'Live DB ✓';
    if (document.getElementById('tables-values')) renderTablesWithValues();

    const seeded = sessionStorage.getItem(PLAYGROUND_QUERY_KEY);
    if (seeded && document.body.dataset.page === 'playground') {
      const editor = document.getElementById('editor');
      if (editor) {
        editor.value = seeded;
        syncHighlight();
        setTimeout(runSQL, 120);
      }
      sessionStorage.removeItem(PLAYGROUND_QUERY_KEY);
    }
  } catch (e) {
    if (dbTxt) dbTxt.textContent = 'DB load failed — ' + e.message;
    if (runnerStatus) runnerStatus.textContent = 'Error';
  }
}

function bindKeyboard() {
  const editor = document.getElementById('editor');
  if (!editor) return;
  editor.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      runSQL();
    }
    if (e.key === 'Tab' && document.body.dataset.page === 'playground') {
      e.preventDefault();
      applySuggestion();
    }
  });
  editor.addEventListener('input', syncHighlight);
  editor.addEventListener('scroll', syncHighlight);
}

function setupPlaygroundEditor() {
  if (document.body.dataset.page !== 'playground') return;
  bindKeyboard();
  syncHighlight();
  const chip = document.getElementById('suggest-chip');
  if (chip) chip.onclick = applySuggestion;
}

function bootPage(page) {
  document.body.dataset.page = page;
  setActivePage(page);
  ensureBackTop();

  if (page === 'playground') {
    setupPlaygroundEditor();
    initDB();
  } else {
    document.querySelector('.runner')?.remove();
    addLessonNavigation();
  }
}

window.SqlMastery = {
  bootPage,
  runSQL,
  clearEditor,
  toggleSchema,
  fillStarter,
  trySQL,
  copyCode
};

window.trySQL = trySQL;
window.copyCode = copyCode;
window.runSQL = runSQL;
window.clearEditor = clearEditor;
window.toggleSchema = toggleSchema;
window.fillStarter = fillStarter;
