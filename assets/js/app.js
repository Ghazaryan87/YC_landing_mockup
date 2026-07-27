/* ============================================================
   assets/js/app.js
   Shared interaction layer for index, Observability, Managed
   Services, and Enterprise pages (scroll reveals, counters,
   filters, etc). NOT loaded on foundry.html today — Foundry runs
   its own assets/foundry/foundry.js instead. Kept separate from
   main.js so this migration doesn't add new behaviour to Foundry
   as a side effect of the file reorg.
   ============================================================ */
/* ============================================================
   YourCompass — homepage v4
   Vanilla port of the former dc-runtime component.
   ============================================================ */

(function () {
  'use strict';

  var SVG_NS = 'http://www.w3.org/2000/svg';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ---------- data ---------- */

  var OFFICES = [
    { flag: '🇨🇦', country: 'Canada', abbr: 'CAN', city: 'OTTAWA', role: 'Global headquarters — founded here in 2010', lat: 45.42, lng: -75.70 },
    { flag: '🇺🇸', country: 'USA', abbr: 'USA', city: 'WASHINGTON, D.C.', role: 'North American operations & partnerships', lat: 38.90, lng: -77.04 },
    { flag: '🇦🇪', country: 'UAE', abbr: 'UAE', city: 'ABU DHABI', role: 'Regional HQ & delivery hub — on-site in hours', lat: 24.45, lng: 54.38 },
    { flag: '🇦🇲', country: 'Armenia', abbr: 'ARM', city: 'YEREVAN', role: 'Engineering & R&D hub', lat: 40.18, lng: 44.51 },
    { flag: '🇸🇦', country: 'Saudi Arabia', abbr: 'KSA', city: 'KSA', role: 'In-Kingdom presence — local teams', lat: 24.71, lng: 46.68 },
    { flag: '🇶🇦', country: 'Qatar', abbr: 'QAT', city: 'DOHA', role: 'Regional delivery & collaboration', lat: 25.29, lng: 51.53 },
    { flag: '🇴🇲', country: 'Oman', abbr: 'OMN', city: 'MUSCAT', role: 'Regional delivery & collaboration', lat: 23.59, lng: 58.38 },
    { flag: '🇪🇬', country: 'Egypt', abbr: 'EGY', city: 'CAIRO', role: 'Talent & delivery center', lat: 30.04, lng: 31.23 }
  ];

  var BEARINGS = [
    { label: 'AI Business Solutions', x: '50%', y: '7%', deg: 0, href: 'Foundry.html', link: 'Explore the YC AI Foundry →' },
    { label: 'Observability', x: '88%', y: '53.2%', deg: 90, href: 'Observability.html', link: 'Observability & Intelligent Operations →' },
    { label: 'Enterprise Solutions', x: '50%', y: '96%', deg: 180, href: 'enterprise.html', link: 'Enterprise Solutions →' },
    { label: 'Managed Services', x: '12%', y: '53.2%', deg: 270, href: 'managed.html', link: 'Managed Services →' }
  ];

  var METHOD_STEPS = [
    { t: 'Discovery', d: "We start by understanding the business, not just the ticket. Objectives, constraints, stakeholders, and success criteria are captured up front — so every decision that follows is anchored to what actually matters to your organisation.", full: 'Discovery & Context Alignment' },
    { t: 'Assessment', d: "A structured audit of existing systems, infrastructure, and operations — evidence over assumption. We map what's actually running, where the gaps are, and what's already working well enough to build on.", full: 'Current State Assessment' },
    { t: 'Scope', d: "Discovery and assessment findings become a defined, agreed scope — services, boundaries, and responsibilities set out clearly, so there's no ambiguity about what's in, what's out, and who owns what.", full: 'Scope Definition & Service Alignment' },
    { t: 'Governance', d: "Escalation paths, decision rights, reporting cadence, and approval gates are agreed before delivery starts — not improvised once it's underway. Governance is infrastructure, not paperwork.", full: 'Governance & Delivery Model Setup' },
    { t: 'Design', d: "Technical architecture, delivery milestones, and resourcing are planned in detail, validated against the real environment uncovered in discovery — so the plan holds up under execution, not just on paper.", full: 'Solution Design & Delivery Planning' },
    { t: 'Mobilisation', d: "Access, environments, tooling, and integration points are provisioned and verified ahead of kick-off — the unglamorous work that prevents week-one delays from becoming month-one delays.", full: 'Mobilisation & Environment Readiness' },
    { t: 'Kick-off', d: "Teams, tools, and timelines are confirmed operational. Delivery begins from a verified starting line, not a hopeful one.", full: 'Kick-off & Execution Readiness' },
    { t: 'Alignment', d: "Delivery doesn't go dark after kick-off. Progress, outcomes, and value are tracked against agreed metrics throughout the engagement — the same evidence-first discipline that runs through everything else we do, applied to the relationship itself.", full: 'Continuous Alignment & Value Tracking' }
  ];

  var DEMO_FRAMES = {
    1: [
      'Flags a latency anomaly in live telemetry — before threshold alerting would have fired.',
      'Correlates across services, isolates the failing dependency, and drafts a diagnosis.',
      'Executes the approved remediation and files the incident report. Nobody was paged.'
    ],
    2: [
      'Reads the incoming request, checks policy, and opens the right workflow.',
      'Gathers records from three systems and prepares the resolution for sign-off.',
      'A human approves in one click; the agent completes, notifies, and documents.'
    ]
  };

  /* the showcase filter — order here is the order the chips render in */
  var DOMAINS = [
    { id: 'all', label: 'All domains' },
    { id: 'itops', label: 'IT Operations & ITSM' },
    { id: 'hr', label: 'HR & Employee Services' },
    { id: 'finance', label: 'Procurement & Finance' },
    { id: 'audit', label: 'Audit & Investigation' },
    { id: 'field', label: 'Operations & Field Services' },
    { id: 'legal', label: 'Legal & Compliance' },
    { id: 'exec', label: 'Executive & Management' },
    { id: 'knowledge', label: 'Knowledge & Training' }
  ];

  var REEL_CARDS = [
    { domain: 'itops', tag: 'OBSERVABILITY', len: '02:14', chip: 'Autonomous', title: 'A P1 caught, diagnosed, and closed — nobody paged', sub: 'Government entity · UAE · identity stripped',
      problem: "Critical incidents surface through threshold alerts long after users feel them — then triage crawls across dashboards, logs, and war rooms while the clock runs.",
      solution: "The agent flags the anomaly in live telemetry, correlates across services, isolates the failing dependency, drafts the diagnosis, and executes the approved remediation — with a replayable decision trace.",
      outcome: "\u2197 Detection-to-resolution collapses from hours to minutes — a 60% reduction in MTTR across delivered use cases.",
      caps: ['Observability Integration', 'Agentic Workflow Engine', 'Replayable Traces', 'Auto-Remediation'] },
    { domain: 'itops', tag: 'SERVICE OPS', len: '01:48', chip: 'Act-with-Approval', title: 'A service request handled end-to-end', sub: 'Banking client · GCC · identity stripped',
      problem: "Routine requests queue for days: forms, approvals, handoffs between teams — each step waiting on a human to push it forward.",
      solution: "The agent intakes the request in natural language, validates entitlements, executes fulfilment across ITSM and identity systems, and routes high-risk actions for one-tap human approval.",
      outcome: "\u2197 Requests that took days close in minutes — with every action logged and approved.",
      caps: ['Conversational AI', 'Act-with-Approval', 'ITSM Connectors', 'Audit Trail'] },
    { domain: 'itops', tag: 'IOC', len: '03:02', chip: 'Operations', title: 'Inside the Intelligent Observability Center', sub: 'Live operations wall · Abu Dhabi HQ',
      problem: "Enterprise estates emit millions of signals — without a nerve centre, teams see fragments, not the system.",
      solution: "The IOC fuses full-stack telemetry into one operations wall: watched, diagnosed, and remediated 24/7 by engineers working with the intelligent core.",
      outcome: "\u2197 One pane, full estate — operations that never go dark.",
      caps: ['Full-Stack Observability', '24/7 Operations', 'AIOps', 'Dynatrace'] },
    { domain: 'legal', tag: 'AGENTIC WORKFLOW', len: '02:31', chip: 'Act-with-Approval', title: 'Humans approve. Agents execute.', sub: 'Approval-loop pattern · in production',
      problem: "Automation either stops at suggestions — or runs unchecked. Neither survives enterprise governance.",
      solution: "Multi-step workflows execute end-to-end, with policy guardrails deciding what runs autonomously and what pauses for human approval — enforced by the platform, not by convention.",
      outcome: "\u2197 Zero unapproved high-risk actions — autonomy with governance built in.",
      caps: ['Agentic Workflow Engine', 'Policy Guardrails', 'RBAC', 'Kill-Switch'] },
    { domain: 'legal', tag: 'SOVEREIGN AI', len: '01:56', chip: 'Strategic', title: 'On-prem agentic AI, end to end', sub: 'Air-gapped deployment walkthrough',
      problem: "Cloud AI means your documents, queries, and embeddings leave the building — a non-starter for government and regulated enterprise.",
      solution: "The full stack — models, vectors, agents — runs inside your perimeter on a zero-egress boundary: air-gapped where required, with a PII-redaction gate at the door.",
      outcome: "\u2197 No document, embedding, or query ever leaves your network.",
      caps: ['On-Prem Deployment', 'Zero Egress', 'PII Redaction', 'Air-Gap Ready'] },
    { domain: 'exec', tag: 'ONBOARDING', len: '02:20', chip: 'Method', title: 'The 8-step onboarding in two minutes', sub: 'Discovery to IOC operations',
      problem: "AI initiatives die between the idea and the plan — undefined scope, improvised governance, hopeful kick-offs.",
      solution: "Eight steps from discovery to continuous value tracking — scope agreed, governance set, environments verified before delivery begins.",
      outcome: "\u2197 Delivery starts from a verified line — not a hopeful one.",
      caps: ['Discovery', 'Governance Setup', 'Mobilisation', 'Value Tracking'] },

    { domain: 'itops', tag: 'ITSM', len: '02:05', chip: 'Autonomous', title: 'A thousand tickets, triaged before the shift starts', sub: 'Telecom operator · GCC · identity stripped',
      problem: "Every morning the queue is a wall: misrouted tickets, duplicate incidents, and priorities set by whoever shouted loudest.",
      solution: "The agent reads each ticket in the user's own words, classifies and deduplicates it against open incidents, sets priority from real business impact, and routes it to the team that can actually close it.",
      outcome: "↗ First-touch routing accuracy above 90% — the queue arrives sorted, not raw.",
      caps: ['Ticket Classification', 'Deduplication', 'ITSM Connectors', 'Impact Scoring'] },

    { domain: 'hr', tag: 'HR OPS', len: '02:12', chip: 'Act-with-Approval', title: 'A new joiner, productive on day one', sub: 'Government entity · UAE · identity stripped',
      problem: "Onboarding spans HR, IT, facilities, and security — a new hire waits days for accounts, access, and a laptop that nobody owns end to end.",
      solution: "One agent orchestrates the whole joiner flow: identity created, role-based access provisioned, assets requested, induction scheduled — with the security-sensitive grants pausing for approval.",
      outcome: "↗ Two weeks of chasing collapses into a single working morning.",
      caps: ['Joiner Orchestration', 'RBAC Provisioning', 'Act-with-Approval', 'HRIS Connectors'] },

    { domain: 'hr', tag: 'EMPLOYEE SERVICES', len: '01:41', chip: 'Autonomous', title: 'Every policy question, answered from the source', sub: 'Banking client · GCC · identity stripped',
      problem: "Staff ask HR the same hundred questions about leave, benefits, and allowances — and get answers that vary by whoever happens to reply.",
      solution: "The agent answers in the employee's own language directly from the current policy documents, cites the clause it used, and escalates the genuine edge cases to a human with the context already attached.",
      outcome: "↗ Around 70% of routine HR queries resolved without a human — every answer traceable to a clause.",
      caps: ['Grounded Retrieval', 'Citations', 'Arabic & English', 'Escalation Routing'] },

    { domain: 'hr', tag: 'HR OPS', len: '02:28', chip: 'Act-with-Approval', title: 'Leave, letters, and payroll — self-service that actually serves', sub: 'Energy sector · UAE · identity stripped',
      problem: "Salary certificates, NOC letters, and leave corrections queue behind a shared inbox that only clears when someone has a quiet afternoon.",
      solution: "The agent validates entitlement against the HR system, generates the document from the approved template, and files the payroll correction — routing anything with a financial impact for sign-off.",
      outcome: "↗ Requests that waited days are issued in minutes, correctly, every time.",
      caps: ['Document Generation', 'Entitlement Checks', 'Payroll Connectors', 'Audit Trail'] },

    { domain: 'finance', tag: 'ACCOUNTS PAYABLE', len: '02:24', chip: 'Act-with-Approval', title: 'Invoice to payment, matched and cleared', sub: 'Logistics group · GCC · identity stripped',
      problem: "Invoices arrive as PDFs, scans, and photographs — then a human keys them in and goes hunting for the purchase order and the delivery note.",
      solution: "The agent extracts the invoice, performs the three-way match against purchase order and goods receipt, flags the true exceptions, and posts the clean ones straight to the ledger.",
      outcome: "↗ Straight-through processing on the majority of invoices — humans see only the exceptions.",
      caps: ['Document Extraction', 'Three-Way Match', 'ERP Connectors', 'Exception Handling'] },

    { domain: 'finance', tag: 'PROCUREMENT', len: '02:16', chip: 'Act-with-Approval', title: 'A vendor onboarded, screened, and scored', sub: 'Public sector · UAE · identity stripped',
      problem: "Vendor onboarding means collecting documents by email, checking sanctions lists by hand, and hoping the trade licence has not expired.",
      solution: "The agent collects and validates the documentation, runs the screening checks, verifies licence validity against the registry, and scores the vendor against your qualification criteria before a buyer ever looks.",
      outcome: "↗ Onboarding cycle cut from weeks to days — with the screening evidence attached to the record.",
      caps: ['Document Validation', 'Sanctions Screening', 'Vendor Scoring', 'Audit Trail'] },

    { domain: 'finance', tag: 'FINANCE', len: '01:52', chip: 'Advisory', title: 'A requisition checked against the budget that funds it', sub: 'Banking client · GCC · identity stripped',
      problem: "Purchase requests get approved on gut feel, then collide with a budget line that ran dry two months ago.",
      solution: "The agent reads the requisition, maps it to the cost centre and budget line, checks remaining headroom and existing contract coverage, and tells the approver what they are actually approving.",
      outcome: "↗ Budget overruns caught before approval, not at quarter close.",
      caps: ['Budget Lookup', 'Contract Coverage', 'Policy Checks', 'Approver Briefing'] },

    { domain: 'audit', tag: 'INTERNAL AUDIT', len: '02:47', chip: 'Autonomous', title: 'An audit trail assembled in an afternoon', sub: 'Government entity · UAE · identity stripped',
      problem: "Preparing for an audit means weeks of pulling evidence out of a dozen systems and assembling it into something a reviewer can actually follow.",
      solution: "The agent gathers the evidence across systems, reconciles it against the control being tested, assembles the working paper, and flags every gap it could not close.",
      outcome: "↗ Evidence gathering drops from weeks to hours — auditors spend their time on judgement, not collection.",
      caps: ['Evidence Collection', 'Control Mapping', 'Working Papers', 'Gap Flagging'] },

    { domain: 'audit', tag: 'FORENSICS', len: '02:33', chip: 'Autonomous', title: 'Anomalous transactions surfaced before the quarter closes', sub: 'Financial services · GCC · identity stripped',
      problem: "Sampling catches what it happens to look at. The patterns that matter hide in the transactions nobody sampled.",
      solution: "The agent examines the full population rather than a sample, scores each transaction against learned behaviour and policy rules, and hands investigators a ranked queue with the reasoning attached.",
      outcome: "↗ Full-population testing replaces sampling — exceptions arrive explained, not just flagged.",
      caps: ['Population Testing', 'Anomaly Detection', 'Explainable Scoring', 'Case Handoff'] },

    { domain: 'audit', tag: 'INVESTIGATION', len: '03:10', chip: 'Act-with-Approval', title: 'A case file read, cross-referenced, and summarised', sub: 'Law enforcement · UAE · identity stripped',
      problem: "An investigator opens a case with four hundred pages of statements, transactions, and correspondence — and a deadline.",
      solution: "The agent reads the file, builds a timeline, cross-references entities across documents, and produces a summary where every claim links back to the page it came from. Nothing is asserted without a source.",
      outcome: "↗ Days of reading become an hour of review — with every line traceable to evidence.",
      caps: ['Timeline Reconstruction', 'Entity Resolution', 'Source Linking', 'On-Prem Deployment'] },

    { domain: 'field', tag: 'FIELD SERVICE', len: '02:08', chip: 'Autonomous', title: 'The right engineer dispatched to the right site', sub: 'Utilities provider · GCC · identity stripped',
      problem: "Dispatch is a whiteboard exercise: skills, certifications, parts, and travel time balanced in someone's head, badly, under pressure.",
      solution: "The agent reads the fault, matches the skills and certifications it needs, checks van stock for the part, and schedules the engineer whose route actually absorbs the job.",
      outcome: "↗ First-time fix rate up, repeat visits down — the truck arrives with the part already in it.",
      caps: ['Skills Matching', 'Route Optimisation', 'Parts Availability', 'Scheduling'] },

    { domain: 'field', tag: 'ASSET OPS', len: '02:39', chip: 'Autonomous', title: 'A failing asset flagged three weeks early', sub: 'Energy sector · UAE · identity stripped',
      problem: "Maintenance runs on a calendar, not on condition — so healthy assets get serviced and failing ones run to breakdown.",
      solution: "The agent watches sensor telemetry against the asset's own history, detects the drift that precedes failure, and raises a work order carrying the evidence and the recommended intervention.",
      outcome: "↗ Unplanned downtime falls as failures are met before they happen, not after.",
      caps: ['Predictive Maintenance', 'Sensor Telemetry', 'Work Order Automation', 'Condition Monitoring'] },

    { domain: 'field', tag: 'INSPECTIONS', len: '01:59', chip: 'Act-with-Approval', title: 'A site inspection written from the photographs', sub: 'Construction group · GCC · identity stripped',
      problem: "Inspectors spend their evenings turning photographs and scribbled notes into reports that are already out of date by the time they are filed.",
      solution: "The agent reads the site imagery and the inspector's voice notes, drafts the report against the compliance checklist, and marks the defects it could not classify for the inspector to confirm.",
      outcome: "↗ The report is drafted before the inspector leaves site — they review rather than write.",
      caps: ['Vision Models', 'Voice Capture', 'Checklist Compliance', 'Defect Classification'] },

    { domain: 'legal', tag: 'CONTRACTS', len: '02:22', chip: 'Advisory', title: 'A contract reviewed against your playbook, not a generic one', sub: 'Public sector · UAE · identity stripped',
      problem: "Legal reviews the same clauses a hundred times a month — and the hundredth review is never as sharp as the first.",
      solution: "The agent reads the draft against your negotiation playbook, flags every deviation from the approved position, proposes fallback language, and leaves the judgement calls to counsel.",
      outcome: "↗ First-pass review in minutes — counsel arrives at the questions that actually need a lawyer.",
      caps: ['Clause Extraction', 'Playbook Comparison', 'Fallback Language', 'Redline Drafting'] },

    { domain: 'exec', tag: 'MANAGEMENT', len: '02:44', chip: 'Advisory', title: 'The board pack drafted from live systems', sub: 'Diversified group · GCC · identity stripped',
      problem: "The monthly pack is assembled by hand from a dozen exports — and by the time it reaches the board, the numbers have already moved.",
      solution: "The agent pulls the current figures from the source systems, reconciles them against last month, drafts the commentary explaining what moved and why, and cites the system each number came from.",
      outcome: "↗ A week of assembly becomes an afternoon of review — and the numbers are live.",
      caps: ['Data Reconciliation', 'Narrative Drafting', 'Source Citations', 'BI Connectors'] },

    { domain: 'exec', tag: 'DECISION SUPPORT', len: '02:01', chip: 'Advisory', title: 'One question, answered across every system', sub: 'Government entity · UAE · identity stripped',
      problem: "A simple executive question — how many, where, since when — takes three analysts two days and comes back with three different answers.",
      solution: "The agent decomposes the question, queries each authoritative system in turn, resolves the conflicts it finds, and answers with the workings shown — so the number can be challenged.",
      outcome: "↗ Answers in the meeting, not the week after it — with the derivation attached.",
      caps: ['Federated Query', 'Conflict Resolution', 'Shown Workings', 'RBAC'] },

    { domain: 'knowledge', tag: 'KNOWLEDGE', len: '02:18', chip: 'Autonomous', title: 'Every document, one answer — with citations', sub: 'Energy sector · UAE · identity stripped',
      problem: "Thirty years of standards, drawings, and procedures sit in a document store that only rewards people who already know where to look.",
      solution: "The agent answers questions from the corpus in natural language, cites the document and page behind every statement, and respects the access rights of whoever is asking.",
      outcome: "↗ Institutional knowledge becomes answerable — and every answer shows its source.",
      caps: ['Grounded Retrieval', 'Citations', 'Permission-Aware Search', 'On-Prem Vectors'] },

    { domain: 'knowledge', tag: 'TRAINING', len: '02:35', chip: 'Method', title: 'A new engineer trained on your estate, not a generic course', sub: 'Telecom operator · GCC · identity stripped',
      problem: "New engineers learn the vendor's course, then spend six months discovering how your estate actually differs from it.",
      solution: "The agent builds the curriculum from your own runbooks, incident history, and architecture — then drills the engineer against real scenarios your teams have already faced.",
      outcome: "↗ Ramp-up measured in weeks instead of quarters — on your systems, not a textbook's.",
      caps: ['Curriculum Generation', 'Scenario Drills', 'Runbook Grounding', 'Progress Tracking'] },

    { domain: 'knowledge', tag: 'TRIBAL KNOWLEDGE', len: '01:47', chip: 'Strategic', title: 'The knowledge that walks out at retirement, captured', sub: 'Utilities provider · GCC · identity stripped',
      problem: "The three people who understand the legacy plant are within five years of retiring, and almost none of what they know is written down.",
      solution: "The agent interviews the experts, structures what it hears into procedures and decision trees, and validates the result back against the systems those procedures describe.",
      outcome: "↗ Undocumented expertise becomes a queryable asset before the expertise leaves the building.",
      caps: ['Expert Elicitation', 'Procedure Structuring', 'Validation Loops', 'On-Prem Deployment'] }
  ];

  /* ---------- accent ---------- */

  function lighten(hex, amt) {
    var n = hex.replace('#', '').trim();
    var full = n.length === 3 ? n.split('').map(function (c) { return c + c; }).join('') : n;
    var v = parseInt(full, 16);
    if (isNaN(v)) return hex;
    var r = Math.min(255, (v >> 16) + amt);
    var g = Math.min(255, ((v >> 8) & 255) + amt);
    var b = Math.min(255, (v & 255) + amt);
    return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
  }

  function hexRgb(hex) {
    var n = (hex || '#2456D6').replace('#', '').trim();
    var f = n.length === 3 ? n.split('').map(function (c) { return c + c; }).join('') : n;
    var v = parseInt(f, 16);
    return isNaN(v) ? [36, 86, 214] : [(v >> 16) & 255, (v >> 8) & 255, v & 255];
  }

  function currentSig() {
    return getComputedStyle(document.documentElement).getPropertyValue('--sig').trim() || '#2456D6';
  }

  // exposed so the accent can be swapped from the console without a rebuild
  window.setAccent = function (hex) {
    document.documentElement.style.setProperty('--sig', hex);
    document.documentElement.style.setProperty('--sig2', lighten(hex, 32));
  };

  /* ---------- hero ornament: generate the animated cell grids ---------- */

  function buildOrnCells() {
    $$('[data-orn-cells]').forEach(function (g) {
      var xs = g.dataset.x.split(',').map(Number);
      var ys = g.dataset.y.split(',').map(Number);
      var size = Number(g.dataset.size);
      var step = Number(g.dataset.step);
      ys.forEach(function (y, row) {
        xs.forEach(function (x, col) {
          var r = document.createElementNS(SVG_NS, 'rect');
          var accent = (row + col) % 2 === 0;
          r.setAttribute('class', 'orn-cell ' + (accent ? 'orn-cell--accent' : 'orn-cell--node'));
          r.setAttribute('x', x);
          r.setAttribute('y', y);
          r.setAttribute('width', size);
          r.setAttribute('height', size);
          r.setAttribute('rx', 3);
          r.style.animationDelay = ((row + col) * step).toFixed(2) + 's';
          g.appendChild(r);
        });
      });
    });
  }

  /* ---------- nav ---------- */

  function initHeroDrafts() {
    var chips = $$('[data-draft]');
    var heads = $$('[data-hero]');
    if (!chips.length) return;

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var key = chip.dataset.draft;
        chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c === chip)); });
        heads.forEach(function (h) { h.hidden = h.dataset.hero !== key; });
      });
    });
  }

  /* ---------- compass bearings ---------- */

  function initBearings() {
    var host = $('[data-bearings]');
    var kicker = $('[data-bearing-kicker]');
    var link = $('[data-bearing-link]');
    if (!host) return;

    var needle = $('[data-rose-needle]');
    var rose = host.closest('.rose');
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var buttons = BEARINGS.map(function (b, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'bearing';
      btn.style.left = b.x;
      btn.style.top = b.y;
      btn.setAttribute('aria-pressed', String(i === 0));
      btn.innerHTML = '<span class="bearing__label"></span>';
      $('.bearing__label', btn).textContent = b.label;

      var select = function () { setBearing(i); hold = true; };
      btn.addEventListener('click', select);
      btn.addEventListener('mouseenter', select);
      host.appendChild(btn);
      return btn;
    });

    var current = 0, hold = false;

    /* the needle swings to whichever bearing is live — shortest path, eased */
    var angle = 0, target = 0;
    function spin() {
      var d = ((target - angle) % 360 + 540) % 360 - 180;
      angle += d * 0.07;
      if (needle) needle.style.transform = 'rotate(' + angle.toFixed(2) + 'deg)';
      requestAnimationFrame(spin);
    }
    if (needle) {
      needle.style.transformOrigin = '440px 330px';
      needle.style.transformBox = 'view-box';
      if (!reduce) spin();
    }

    function setBearing(i) {
      current = i;
      buttons.forEach(function (btn, j) { btn.setAttribute('aria-pressed', String(i === j)); });
      var b = BEARINGS[i];
      target = b.deg;
      if (reduce && needle) needle.style.transform = 'rotate(' + b.deg + 'deg)';
      if (kicker) kicker.textContent = b.tag;
      if (link) { link.textContent = b.link; link.href = b.href; }
      
      var practices = document.querySelectorAll('.practice');
      practices.forEach(function (p, j) { p.classList.toggle('is-live', i === j); });
    }

    /* auto-sweep: the compass keeps finding its next bearing until touched */
    if (!reduce) {
      setInterval(function () {
        if (hold) return;
        setBearing((current + 1) % BEARINGS.length);
      }, 3600);
      if (rose) {
        rose.addEventListener('mouseenter', function () { hold = true; });
        rose.addEventListener('mouseleave', function () { hold = false; });
      }
    }

    setBearing(0);
  }

  /* ---------- method rail ---------- */

  function initMethod() {
    var list = $('[data-msteps]');
    var num = $('[data-method-num]');
    var panel = $('[data-method-desc]');
    if (!list) return;

    var hold = 0;
    var current = 0;

    var buttons = METHOD_STEPS.map(function (s, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'mstep';
      btn.setAttribute('aria-selected', String(i === 0));
      btn.innerHTML =
        '<span class="mstep__row">' +
          '<span class="mstep__num"></span>' +
          '<span class="mstep__title"></span>' +
          '<span class="mstep__meta"></span>' +
        '</span>' +
        '<span class="mstep__reveal"><span class="mstep__clip"><span class="mstep__desc"></span></span></span>';
      $('.mstep__num', btn).textContent = String(i + 1).padStart(2, '0');
      $('.mstep__title', btn).textContent = s.t;
      $('.mstep__meta', btn).textContent = s.meta || '';
      $('.mstep__desc', btn).textContent = s.d;

      var select = function () {
        hold = performance.now() + 8000;
        setStep(i);
      };
      btn.addEventListener('click', select);
      btn.addEventListener('mouseenter', select);
      list.appendChild(btn);
      return btn;
    });

    // small/tablet screens show the rail as a slide carousel. The step
    // numbers on the rail itself are too small to read there, so this strip
    // is its top-of-component position indicator — instead of plain dots it
    // shows the step number, with the current step centered and marked and
    // one neighbour on each side.
    var dotsHost = $('[data-mstep-dots]');
    var dotEls = dotsHost ? [0, 1, 2].map(function () {
      var d = document.createElement('button');
      d.type = 'button';
      d.className = 'proc__num';
      dotsHost.appendChild(d);
      return d;
    }) : [];
    function renderDots(i) {
      if (!dotEls.length) return;
      var n = METHOD_STEPS.length;
      [(i - 1 + n) % n, i, (i + 1) % n].forEach(function (stepIdx, pos) {
        var d = dotEls[pos];
        d.textContent = String(stepIdx + 1).padStart(2, '0');
        d.classList.toggle('proc__num--active', pos === 1);
        d.setAttribute('aria-label', METHOD_STEPS[stepIdx].t);
        d.setAttribute('aria-current', String(pos === 1));
        d.onclick = function () { hold = performance.now() + 8000; setStep(stepIdx); };
      });
    }

    var prevBtn = $('[data-mstep-prev]');
    var nextBtn = $('[data-mstep-next]');
    if (prevBtn) prevBtn.addEventListener('click', function () {
      hold = performance.now() + 8000;
      setStep((current - 1 + METHOD_STEPS.length) % METHOD_STEPS.length);
    });
    if (nextBtn) nextBtn.addEventListener('click', function () {
      hold = performance.now() + 8000;
      setStep((current + 1) % METHOD_STEPS.length);
    });

    var detail = $('[data-method-detail]');
    var title = $('[data-method-title]');
    var badge = $('[data-method-badge]');
    var arts = $$('[data-step-art]');

    function setStep(i) {
      current = i;
      buttons.forEach(function (b, j) { b.setAttribute('aria-selected', String(i === j)); });
      renderDots(i);
      if (num) num.textContent = String(i + 1).padStart(2, '0');
      if (badge) badge.textContent = String(i + 1).padStart(2, '0');
      if (title) title.textContent = METHOD_STEPS[i].full || METHOD_STEPS[i].t;
      if (panel) panel.textContent = METHOD_STEPS[i].d;
      arts.forEach(function (a) { a.classList.toggle('is-art-live', a.dataset.stepArt == String(i)); });
      if (detail) {
        detail.classList.remove('swap');
        void detail.offsetWidth;      /* restart the reveal */
        detail.classList.add('swap');
      }
      // when the rail is a horizontally-scrolling slide carousel (small/
      // tablet), keep the active slide scrolled into view; a no-op on the
      // desktop grid, which never overflows
      if (list.scrollWidth > list.clientWidth + 1) {
        buttons[i].scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', inline: 'center', block: 'nearest' });
      }
    }

    setStep(0);

    if (reduce) return;

    var hovering = false;
    list.addEventListener('mouseenter', function () { hovering = true; });
    list.addEventListener('mouseleave', function () { hovering = false; });
    list.addEventListener('touchstart', function () { hold = performance.now() + 9000; }, { passive: true });

    var iv = null;
    var tick = function () {
      if (!hovering && performance.now() >= hold) setStep((current + 1) % METHOD_STEPS.length);
    };
    var start = function () { if (!iv) iv = setInterval(tick, 3400); };
    var stop = function () { if (iv) { clearInterval(iv); iv = null; } };

    whenVisible(list, start, stop, '60px', 900);
  }

  /* ---------- demo slideshows ---------- */

  function initDemos() {
    $$('[data-demo]').forEach(function (article) {
      var frames = DEMO_FRAMES[article.dataset.demo];
      if (!frames) return;

      var note = $('[data-demo-note]', article);
      var count = $('[data-demo-count]', article);
      var dotHost = $('[data-demo-dots]', article);
      var next = $('[data-demo-next]', article);
      var idx = 0;

      var dots = frames.map(function (_, i) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'demo__dot';
        b.setAttribute('aria-label', 'Frame ' + (i + 1));
        b.addEventListener('click', function () { set(i); });
        dotHost.appendChild(b);
        return b;
      });

      function set(i) {
        idx = i;
        note.textContent = frames[i];
        count.textContent = 'FRAME ' + (i + 1) + ' / ' + frames.length;
        dots.forEach(function (d, j) { d.setAttribute('aria-current', String(i === j)); });
      }

      next.addEventListener('click', function () { set((idx + 1) % frames.length); });
      set(0);
    });
  }

  /* ---------- showcase reel ---------- */

  function initReel() {
    var strip = $('[data-reel]');
    var stage = $('[data-stage]');
    if (!strip || !stage) return;

    var meta = $('[data-stage-meta]');
    var bar = $('[data-stage-prog]');
    var tag = $('[data-stage-tag]');
    var len = $('[data-stage-len]');
    var title = $('[data-stage-title]');
    var sub = $('[data-stage-sub]');
    var numEl = $('[data-reel-num]');
    var totalEl = $('[data-reel-total]');
    var totalStageEl = $('[data-stage-total]');
    var filterHost = $('[data-reel-filters]');
    var filterSelect = $('[data-reel-filter-select]');
    var emptyEl = $('[data-reel-empty]');

    /* idx is always an index into REEL_CARDS; `view` is the subset the
       active filter admits. Everything the user drives — arrows, autoplay,
       counters — walks `view`, never the full library. */
    var idx = 0;
    var view = REEL_CARDS.map(function (c, i) { return i; });
    var progress = 0;
    var hold = 0;

    function pad(n) { return String(n).padStart(2, '0'); }
    function count(id) {
      return id === 'all' ? REEL_CARDS.length : REEL_CARDS.filter(function (c) { return c.domain === id; }).length;
    }

    var thumbs = REEL_CARDS.map(function (c, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'thumb';
      btn.setAttribute('aria-current', String(i === 0));
      btn.innerHTML =
        '<span class="thumb__frame">' +
          '<span class="thumb__tag"></span>' +
          '<span class="thumb__play">' +
            '<svg width="11" height="11" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6.2 L18 12 L9 17.8 Z" fill="#F2F5F7"></path></svg>' +
          '</span>' +
          '<span class="thumb__len"></span>' +
        '</span>' +
        '<span class="thumb__body"><span class="thumb__title"></span></span>';
      $('.thumb__tag', btn).textContent = c.tag;
      $('.thumb__len', btn).textContent = c.len;
      $('.thumb__title', btn).textContent = c.title;
      btn.addEventListener('click', function () { select(i, true); });
      strip.appendChild(btn);
      return btn;
    });

    window.__reelCards = REEL_CARDS;
    function render() {
      window.__reelIdx = idx;
      var c = REEL_CARDS[idx];
      var pos = view.indexOf(idx) + 1;
      if (tag) tag.textContent = c.tag;
      if (len) len.textContent = c.chip || c.len;
      var cnt = $('[data-stage-count]');
      if (cnt) cnt.textContent = pad(pos);
      if (title) title.textContent = c.title;
      if (sub) sub.textContent = c.sub;
      if (numEl) numEl.textContent = pad(pos);
      if (totalEl) totalEl.textContent = pad(view.length);
      if (totalStageEl) totalStageEl.textContent = pad(view.length);
      thumbs.forEach(function (t, j) { t.setAttribute('aria-current', String(idx === j)); });
    }

    function select(i, user) {
      if (i === idx) return;
      progress = 0;
      if (user) hold = performance.now() + 9000;

      // Wrapping the ends of the view (last -> first) would smooth-scroll the
      // strip across every card in between. Cut straight there instead.
      var first = view[0], last = view[view.length - 1];
      var wrapped = (idx === last && i === first) || (idx === first && i === last);

      idx = i;
      render();

      // crossfade the stage meta and keep the active thumb in view
      if (meta && !reduce) {
        meta.style.animation = 'none';
        void meta.offsetWidth;
        meta.style.animation = 'ycStageIn .55s cubic-bezier(.16,.84,.44,1)';
      }
      var th = thumbs[idx];
      if (th) {
        var padLeft = parseFloat(getComputedStyle(strip).paddingLeft) || 24;
        strip.scrollTo({
          left: Math.max(0, th.offsetLeft - padLeft),
          behavior: (reduce || wrapped) ? 'auto' : 'smooth'
        });
      }
    }

    /* walk `delta` steps through the filtered view, wrapping at its ends */
    function hop(delta, user) {
      if (view.length < 2) return;
      var pos = view.indexOf(idx);
      select(view[(pos + delta + view.length) % view.length], user);
    }

    var chips = DOMAINS.map(function (d) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'showfilter__chip';
      btn.dataset.domain = d.id;
      btn.innerHTML =
        '<span class="showfilter__label"></span>' +
        '<span class="showfilter__n"></span>' +
        (d.id !== 'all'
          ? '<span class="showfilter__clear" aria-hidden="true"><svg width="9" height="9" viewBox="0 0 24 24"><path d="M5 5 L19 19 M19 5 L5 19" stroke="currentColor" stroke-width="3" stroke-linecap="round"></path></svg></span>'
          : '');
      $('.showfilter__label', btn).textContent = d.label;
      $('.showfilter__n', btn).textContent = pad(count(d.id));
      // clicking an already-active chip (or its X) clears back to "all" —
      // covers mouse and keyboard alike, no nested-button needed for the X.
      btn.addEventListener('click', function () {
        var isActive = btn.getAttribute('aria-pressed') === 'true';
        applyFilter((isActive && d.id !== 'all') ? 'all' : d.id, true);
      });
      if (filterHost) filterHost.appendChild(btn);
      return btn;
    });

    // small screens swap the chip row for a native <select> — a real
    // OS-native picker beats a wall of wrapped pill buttons on a phone
    if (filterSelect) {
      DOMAINS.forEach(function (d) {
        var opt = document.createElement('option');
        opt.value = d.id;
        opt.textContent = d.label + ' (' + count(d.id) + ')';
        filterSelect.appendChild(opt);
      });
      filterSelect.addEventListener('change', function () {
        applyFilter(filterSelect.value, true);
      });
    }

    function applyFilter(id, user) {
      view = REEL_CARDS
        .map(function (c, i) { return i; })
        .filter(function (i) { return id === 'all' || REEL_CARDS[i].domain === id; });

      chips.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.domain === id)); });
      if (filterSelect && filterSelect.value !== id) filterSelect.value = id;
      thumbs.forEach(function (t, i) { t.hidden = view.indexOf(i) === -1; });
      if (emptyEl) emptyEl.hidden = view.length > 0;

      // keep the current card if the new filter still admits it, else open the first
      if (view.length && view.indexOf(idx) === -1) idx = view[0];
      progress = 0;
      hold = performance.now() + 9000;
      render();
      strip.scrollTo({ left: 0, behavior: reduce ? 'auto' : 'smooth' });

      // a user-driven filter change brings the filter row to the top of the
      // viewport — but only when it's actually needed. If the whole
      // filter-to-stage area is already on screen, or the filter row is
      // already sitting at the top, jumping the page would just be
      // disruptive for no gain.
      var visibleFilterEl = (filterHost && filterHost.offsetParent) ? filterHost
        : (filterSelect && filterSelect.offsetParent) ? filterSelect : null;
      if (user && visibleFilterEl) {
        var navH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 96;
        var fRect = visibleFilterEl.getBoundingClientRect();
        var sRect = stage.getBoundingClientRect();
        var alreadyAtTop = fRect.top >= 0 && fRect.top <= navH + 24;
        var alreadyFullyVisible = fRect.top >= navH && sRect.bottom <= window.innerHeight;
        if (!alreadyAtTop && !alreadyFullyVisible) {
          visibleFilterEl.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
        }
      }
    }

    applyFilter('all');
    render();

    $$('[data-reel-prev], [data-reel-arrow-prev]').forEach(function (b) {
      b.addEventListener('click', function () { hop(-1, true); });
    });
    $$('[data-reel-next], [data-reel-arrow-next]').forEach(function (b) {
      b.addEventListener('click', function () { hop(1, true); });
    });

    if (reduce) return;

    var hovering = false;
    [stage, strip].forEach(function (el) {
      el.addEventListener('mouseenter', function () { hovering = true; });
      el.addEventListener('mouseleave', function () { hovering = false; });
      el.addEventListener('touchstart', function () { hold = performance.now() + 9000; }, { passive: true });
    });

    var DUR = 7000;
    var last = 0, raf = 0, running = false;

    function step(ts) {
      if (!running) return;
      if (!last) last = ts;
      var dt = Math.min(80, ts - last);
      last = ts;
      if (!hovering && performance.now() >= hold) {
        progress += dt / DUR;
        if (progress >= 1) {
          progress = 0;
          hop(1, false);
        }
      }
      if (bar) bar.style.width = (Math.min(1, progress) * 100).toFixed(2) + '%';
      raf = requestAnimationFrame(step);
    }

    var start = function () { if (!running) { running = true; last = 0; raf = requestAnimationFrame(step); } };
    var stop = function () { running = false; if (raf) cancelAnimationFrame(raf); };

    whenVisible(stage, start, stop, '80px', 900);
  }

  /* ---------- offices + globe ---------- */

  function initOffices(focusOffice) {
    var host = $('[data-offices]');
    if (!host) return [];

    var buttons = [];
    OFFICES.forEach(function (o, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'office';
      btn.setAttribute('data-flag', o.flag);
      btn.innerHTML =
        '<div class="office__row">' +
          '<span class="office__flag"></span>' +
          '<span class="office__country"></span>' +
          '<span class="office__city"></span>' +
        '</div>' +
        '<div class="office__role"></div>';
      $('.office__flag', btn).textContent = o.flag;
      $('.office__country', btn).textContent = o.country;
      $('.office__city', btn).textContent = o.city;
      $('.office__role', btn).textContent = o.role;
      btn.addEventListener('click', function () { focusOffice(i); });
      host.appendChild(btn);
      buttons.push(btn);
    });
    return buttons;
  }

  // phone-only carousel: countries slide directly under the globe. built
  // as [clone(last), item0..itemN-1, clone(first)] so a swipe past either
  // end lands on a real clone, then jumps (no animation) to its twin —
  // giving the illusion of an infinite loop off native scroll-snap
  function initOfficesCarousel(focusOffice) {
    var track = $('[data-oc-track]');
    var dotsHost = $('[data-oc-dots]');
    var viewport = $('[data-offices-carousel]');
    if (!track || !viewport) return;

    var N = OFFICES.length;

    function buildSlide(o, realIndex) {
      var el = document.createElement('div');
      el.className = 'oc-slide';
      el.innerHTML =
        '<div class="oc-slide__card">' +
          '<div class="oc-slide__row">' +
            '<span class="oc-slide__flag"></span>' +
            '<span class="oc-slide__country"></span>' +
            '<span class="oc-slide__city"></span>' +
          '</div>' +
          '<div class="oc-slide__role"></div>' +
        '</div>';
      $('.oc-slide__flag', el).textContent = o.flag;
      $('.oc-slide__country', el).textContent = o.country;
      $('.oc-slide__city', el).textContent = o.city;
      $('.oc-slide__role', el).textContent = o.role;
      $('.oc-slide__card', el).setAttribute('data-flag', o.flag);
      $('.oc-slide__card', el).addEventListener('click', function () { focusOffice(realIndex); });
      return el;
    }

    var slides = [];
    slides.push(buildSlide(OFFICES[N - 1], N - 1)); // leading clone of last
    OFFICES.forEach(function (o, i) { slides.push(buildSlide(o, i)); });
    slides.push(buildSlide(OFFICES[0], 0)); // trailing clone of first
    slides.forEach(function (s) { track.appendChild(s); });

    var dots = [];
    OFFICES.forEach(function (o, i) {
      var d = document.createElement('button');
      d.type = 'button';
      d.className = 'oc-dot';
      d.setAttribute('aria-label', o.country);
      d.addEventListener('click', function () { goTo(i + 1, true); });
      dotsHost.appendChild(d);
      dots.push(d);
    });

    function setActiveDot(realIndex) {
      dots.forEach(function (d, i) { d.classList.toggle('oc-dot--active', i === realIndex); });
    }

    var pos = 1; // index into the cloned slides array
    function goTo(index, smooth) {
      pos = index;
      viewport.scrollTo({ left: viewport.clientWidth * pos, behavior: smooth ? 'smooth' : 'auto' });
    }

    goTo(1, false);
    setActiveDot(0);

    var settleTimer = 0;
    function onScroll() {
      clearTimeout(settleTimer);
      settleTimer = setTimeout(settle, 100);
    }
    function settle() {
      var w = viewport.clientWidth || 1;
      var idx = Math.round(viewport.scrollLeft / w);
      if (idx <= 0) { idx = N; viewport.scrollLeft = w * idx; }
      else if (idx >= N + 1) { idx = 1; viewport.scrollLeft = w * idx; }
      pos = idx;
      setActiveDot(idx - 1);
    }
    viewport.addEventListener('scroll', onScroll, { passive: true });

    window.addEventListener('resize', function () {
      viewport.scrollLeft = viewport.clientWidth * pos;
    }, { passive: true });
  }

  function initGlobe(onActive) {
    var canvas = $('[data-globe]');
    var card = $('[data-globe-card]');
    var noop = function () {};
    if (!canvas || !card) return { focus: noop, resize: noop };

    var wrap = canvas.parentElement;

    // labels/highlights stay off until the copy paragraph beside the globe
    // is fully in view, so they don't fire while the section is still
    // scrolling into place
    var labelsReady = false;
    var copyEl = $('[data-globe-copy]');
    if (copyEl && 'IntersectionObserver' in window) {
      var copyIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { labelsReady = en.intersectionRatio >= 0.999; });
      }, { threshold: [0, 0.5, 0.99, 1] });
      copyIO.observe(copyEl);
    } else {
      labelsReady = true;
    }
    var ctx = canvas.getContext('2d');
    var D2R = Math.PI / 180;
    var TILT = -0.42;
    var cT = Math.cos(TILT), sT = Math.sin(TILT);

    // the globe is drawn on whatever surface the section carries, so it
    // reads its dot / ring colours from the tone tokens
    var wrapStyle = getComputedStyle(wrap);
    var dotRgb = (wrapStyle.getPropertyValue('--globe-dot-rgb').trim() || '146,178,200');
    var ringColor = (wrapStyle.getPropertyValue('--globe-ring').trim() || 'rgba(242,245,247,.08)');

    var GA = Math.PI * (3 - Math.sqrt(5));
    function fib(n) {
      var arr = [];
      for (var i = 0; i < n; i++) {
        var y = 1 - (i / (n - 1)) * 2;
        var r = Math.sqrt(Math.max(0, 1 - y * y));
        arr.push([Math.cos(GA * i) * r, y, Math.sin(GA * i) * r]);
      }
      return arr;
    }

    var dots = fib(1500);          // plain dotted sphere until land data arrives
    var N = dots.length;
    var isLand = false;
    var bgDots = fib(900);
    var redrawStatic = function () {};

    // land dots embedded (delta-encoded fib(9000) indices from world-atlas
    // land-110m) — no fetch, so continents render on file://, previews, and
    // offline alike.
    var LAND_DELTAS = [35,13,3,5,5,3,4,1,3,5,5,3,5,3,5,5,3,5,5,8,3,5,3,1,1,3,1,4,12,1,3,5,5,7,1,11,1,1,2,1,4,1,4,7,1,1,7,4,1,1,3,1,3,1,4,1,4,3,1,3,1,3,1,2,1,1,2,2,1,3,1,3,1,2,1,3,1,1,1,4,2,1,1,6,1,3,4,1,3,3,3,2,2,1,2,5,3,3,5,1,4,8,5,8,3,5,1,2,2,11,5,5,3,8,2,8,3,2,1,1,3,1,1,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3,1,1,2,1,2,1,1,1,3,2,2,1,1,1,1,1,1,2,1,1,1,1,1,1,3,2,2,1,2,1,1,1,2,1,2,1,1,1,3,1,1,2,1,2,1,1,1,3,2,2,1,1,1,1,1,1,2,1,2,1,1,1,3,2,2,1,2,1,1,1,2,1,1,1,1,1,1,1,2,1,1,2,1,4,1,3,2,2,1,2,1,1,1,2,1,1,1,1,1,1,3,2,2,1,2,2,1,3,2,2,1,3,1,1,3,3,1,1,3,2,3,3,1,1,2,1,1,3,1,3,1,1,3,2,2,1,3,2,2,1,3,1,1,2,1,1,2,1,1,3,2,1,2,3,1,1,3,4,1,3,1,1,3,1,1,2,1,3,2,3,3,1,1,2,1,1,3,1,3,1,1,3,2,1,1,1,3,5,3,1,1,3,1,3,1,3,1,1,1,2,3,1,1,2,1,1,2,1,1,3,1,1,3,1,1,1,1,1,3,1,4,3,1,1,3,1,3,1,3,1,1,1,2,1,2,1,1,3,1,4,3,1,1,3,1,1,1,1,1,3,1,1,1,2,3,1,1,3,1,2,1,1,3,1,1,1,2,1,2,1,1,3,2,3,3,1,1,3,1,2,1,1,3,1,1,1,2,1,2,1,1,3,1,2,2,3,1,1,3,1,1,1,1,1,3,1,1,1,2,3,1,1,3,1,2,1,1,3,1,1,3,1,2,1,1,3,2,1,2,3,1,1,3,1,2,1,1,3,1,1,1,2,3,1,1,3,1,2,1,1,3,1,1,3,1,2,1,1,3,1,1,1,2,3,1,1,3,1,2,1,1,3,1,1,3,3,1,1,3,1,1,1,2,3,1,1,3,3,1,1,3,1,1,1,2,3,1,1,3,1,2,2,3,1,1,3,3,1,1,3,1,2,2,3,1,1,3,3,1,1,3,1,1,1,2,1,2,1,1,3,1,2,2,3,1,1,3,3,1,1,3,1,1,1,2,3,1,1,3,1,2,2,3,1,1,3,3,1,1,3,1,1,1,2,4,1,3,1,2,1,1,4,1,3,3,1,1,3,1,2,2,3,1,1,3,3,1,1,3,1,2,2,4,1,3,1,2,1,1,3,1,1,3,3,1,1,3,1,2,2,3,1,1,3,3,1,1,3,1,2,2,4,1,3,1,2,2,3,1,1,3,3,1,1,3,1,1,1,2,4,1,3,3,1,1,4,1,3,4,1,3,1,4,3,1,1,3,3,1,1,3,1,2,2,4,1,3,1,3,1,3,1,1,1,2,3,1,1,3,1,1,3,4,1,3,3,1,1,4,2,2,4,1,3,1,4,3,1,1,3,3,1,1,3,1,1,3,3,1,1,3,3,1,1,3,1,2,2,3,1,1,3,1,4,3,1,1,3,3,1,1,3,1,2,2,3,1,1,3,5,3,1,2,2,4,1,3,1,4,3,1,1,3,4,1,4,2,2,3,1,1,3,1,4,3,1,1,3,3,1,1,3,1,4,3,1,4,4,1,3,1,2,2,3,1,1,3,1,4,3,1,4,4,1,4,2,2,3,1,1,3,5,3,1,2,2,4,1,3,1,4,3,1,4,4,1,3,1,2,2,3,1,1,3,5,3,1,4,4,1,4,1,3,3,1,1,3,5,3,1,4,4,1,3,1,2,2,3,1,4,4,1,3,1,4,4,1,3,3,2,3,1,1,3,4,1,3,1,1,1,2,4,4,5,3,1,1,1,2,4,1,3,1,2,2,3,1,4,4,1,3,1,1,1,2,4,1,3,5,3,1,4,4,1,3,1,2,2,3,1,4,5,3,1,1,1,2,4,1,3,3,2,3,1,4,4,1,3,1,2,2,4,1,3,5,3,1,1,1,2,4,1,3,3,2,3,1,4,5,3,1,2,2,4,1,3,3,2,3,1,2,2,3,1,1,3,1,2,2,3,1,1,3,5,3,1,2,2,4,1,3,3,2,3,1,4,3,2,3,1,2,2,4,1,3,3,2,3,1,2,2,3,1,1,3,3,2,3,1,4,3,2,3,1,2,2,3,1,1,3,3,2,3,1,4,3,1,1,3,1,2,2,3,1,1,3,3,2,3,1,2,2,3,1,1,3,3,2,3,1,4,3,2,3,3,2,3,1,1,3,3,2,3,3,2,3,2,3,1,2,2,3,1,1,3,3,2,6,2,3,1,1,3,3,2,3,3,2,3,2,3,3,2,4,1,3,3,2,3,3,2,3,2,3,3,2,3,1,4,3,2,6,2,3,1,1,3,3,2,3,3,2,3,2,4,2,2,4,4,3,2,3,3,2,3,2,3,3,2,3,3,2,3,2,6,2,3,1,1,3,3,2,3,3,2,3,2,6,2,3,1,4,3,2,3,3,2,3,1,1,6,2,3,3,2,3,2,3,3,2,3,1,7,2,3,3,2,3,1,1,6,2,3,1,2,2,3,2,3,3,2,3,1,1,6,2,3,3,2,3,2,3,3,2,4,1,1,5,2,3,3,2,3,2,6,2,3,3,2,3,2,3,1,2,2,3,1,7,2,3,3,2,3,2,3,1,2,6,2,2,3,2,3,3,2,3,8,2,3,3,2,3,5,3,5,1,7,2,3,1,2,2,3,6,2,2,3,1,2,5,2,3,3,2,3,1,7,2,3,3,2,3,5,3,5,1,2,5,2,3,1,2,2,3,8,2,3,3,2,3,5,3,5,1,5,2,2,3,1,2,2,3,8,6,2,5,2,3,3,2,3,6,2,2,3,1,2,2,3,5,3,5,1,1,6,2,3,1,2,2,3,8,6,2,5,2,3,3,5,8,2,3,1,2,2,3,8,5,1,2,5,2,3,3,5,8,2,4,2,2,3,2,6,5,8,2,3,1,2,2,3,8,5,3,5,2,4,2,5,8,5,3,2,3,8,5,2,1,5,2,3,1,2,5,8,8,5,2,4,2,5,8,2,3,3,2,3,8,5,2,1,5,2,4,2,5,8,8,2,3,2,6,5,8,8,5,8,5,3,5,2,4,2,5,8,8,2,3,8,5,3,5,8,5,8,5,3,5,2,6,5,6,2,2,6,2,3,8,5,3,5,2,6,5,6,2,5,3,2,1,2,8,5,6,2,5,3,5,8,5,3,3,2,2,6,5,2,4,2,5,3,2,3,6,2,5,6,2,8,5,6,2,5,3,3,2,8,5,6,2,2,3,3,2,3,6,2,5,2,1,3,2,8,5,6,2,5,3,3,2,8,5,6,2,5,3,5,6,2,5,3,3,2,8,5,6,2,5,3,3,2,8,5,6,2,8,3,2,2,4,2,5,3,3,2,13,6,2,2,3,6,2,6,2,5,6,2,11,2,2,4,2,2,3,6,2,13,6,2,2,9,2,2,4,2,5,6,2,13,6,2,2,9,2,13,6,2,11,2,2,4,2,5,6,2,13,6,2,2,9,2,2,4,7,6,2,11,2,6,2,11,2,2,4,7,6,2,11,2,2,4,2,5,2,4,2,13,2,4,2,2,9,2,2,4,7,6,2,11,2,2,4,2,11,2,2,4,5,2,6,2,2,9,2,2,4,2,5,6,2,11,2,6,2,11,2,2,4,5,2,6,2,2,9,2,2,4,2,11,2,11,2,6,2,7,4,2,2,4,5,8,2,2,5,4,2,6,2,3,4,4,2,6,1,4,2,6,2,2,5,4,2,6,5,8,2,7,4,2,2,4,1,1,3,8,2,6,1,4,8,2,2,9,2,6,5,8,2,6,1,4,2,6,2,3,8,2,6,1,4,8,2,2,5,4,2,6,2,3,8,2,2,4,1,4,2,6,2,11,2,6,5,8,2,2,5,4,2,6,2,3,8,2,2,4,1,4,8,2,11,2,6,5,8,2,7,4,2,2,4,2,3,8,2,6,1,4,8,2,11,2,6,2,3,8,2,6,5,2,2,4,2,11,2,6,1,4,8,2,11,2,6,2,11,2,6,5,8,2,11,2,6,5,8,2,11,2,6,2,11,2,6,5,8,2,11,2,6,2,7,4,2,11,2,6,2,11,2,6,5,8,2,7,4,2,6,2,5,2,4,2,6,5,4,4,2,11,2,6,2,7,4,2,7,4,2,6,2,11,2,6,5,4,4,2,11,2,6,2,5,2,4,2,11,4,4,2,11,2,4,4,1,3,2,1,1,1,1,4,1,1,1,1,1,2,1,1,2,2,1,1,2,2,3,9,2,11,4,4,2,11,2,6,2,5,2,4,2,7,4,4,4,2,7,4,2,11,2,2,4,2,7,4,8,2,5,2,4,2,7,4,4,4,2,7,4,2,8,5,2,4,2,7,4,4,4,2,7,4,2,7,4,4,4,2,7,4,4,4,2,5,2,4,1,1,7,4,4,4,2,7,4,2,2,11,2,4,2,7,4,4,4,2,7,4,2,7,4,4,4,2,7,4,2,2,11,2,4,2,7,4,4,4,2,7,4,2,2,5,6,2,4,2,7,4,4,4,2,7,4,2,7,8,4,2,7,4,2,2,5,6,2,4,2,7,8,4,2,7,4,2,2,5,8,4,2,7,4,4,4,1,1,7,4,2,7,8,4,2,7,4,2,2,5,8,4,2,7,8,4,2,7,4,2,2,5,8,4,2,7,4,4,5,8,4,2,7,8,4,2,7,4,2,2,5,8,4,2,7,4,4,4,1,8,4,2,7,8,4,2,7,4,4,5,8,4,2,7,8,4,2,7,4,2,7,8,4,2,7,8,4,1,8,4,2,7,8,4,2,7,4,4,5,12,2,7,8,4,13,9,12,2,7,8,4,1,12,2,7,8,4,9,4,4,5,12,9,5,7,22,12,22,12,9,5,7,22,12,21,13,9,12,34,21,34,21,27,7,34,21,34,21,34,22,26,7,34,21,34,48,7,34,55,55,34,55,55,34,55,34,470,5,21,8,3,2,3,5,8,3,2,8,3,2,3,5,4,4,3,2,3,5,3,2,3,3,2,3,5,3,2,3,3,2,4,1,1,2,3,2,3,2,1,2,3,2,1,2,3,2,1,2,1,1,1,2,3,2,1,2,3,1,1,3,2,1,2,3,1,1,1,2,2,1,2,3,1,1,1,2,3,1,1,1,2,1,1,1,1,1,3,1,1,1,1,1,3,1,1,3,1,1,1,1,1,3,1,1,1,2,2,1,1,1,3,1,1,1,1,1,3,1,1,1,1,1,2,1,1,1,3,1,1,1,1,1,2,1,1,1,1,1,1,2,1,1,1,1,2,1,1,1,2,2,1,1,1,3,1,1,1,1,1,1,2,1,1,1,2,1,1,1,1,1,1,2,1,1,1,1,1,1,1,1,1,1,1,2,1,1,1,1,1,1,2,1,1,1];
    function loadLand() {
      var idx = [], acc = 0, i;
      for (i = 0; i < LAND_DELTAS.length; i++) { acc += LAND_DELTAS[i]; idx.push(acc); }
      var all = fib(9000), land = [], k = 0;
      for (i = 0; i < idx.length; i++) land.push(all[idx[i]]);
      dots = land; N = dots.length; isLand = true;
      redrawStatic();
    }
    var mk = OFFICES.map(function (o) {
      return { sy: Math.sin(o.lat * D2R), cl: Math.cos(o.lat * D2R), lon: o.lng * D2R };
    });

    var W = 0, dpr = 1;
    function size() {
      var w = Math.max(240, wrap.clientWidth || 480);
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = w;
      canvas.width = w * dpr;
      canvas.height = w * dpr;
    }

    function norm(a) {
      a = a % (Math.PI * 2);
      if (a > Math.PI) a -= Math.PI * 2;
      if (a < -Math.PI) a += Math.PI * 2;
      return a;
    }

    var screens = [];

    // a marker flares white the moment it becomes the highlighted one,
    // then falls back to its steady pulse over FLASH_MS
    var FLASH_MS = 620;
    var flashAt = [];

    // progress 0→1 through the flash, or -1 when this marker isn't flaring.
    // 0 is a live value (the brightest frame), so it can't double as "off".
    function flashOf(m, time) {
      var at = flashAt[m];
      if (at == null) return -1;
      var p = (time - at) / FLASH_MS;
      if (p < 0 || p >= 1) return -1;
      return p;
    }

    function draw(rot, time, litAll) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, W);
      var c = W / 2, R = W * 0.415;
      var rgb = hexRgb(currentSig());
      var sr = rgb[0], sg = rgb[1], sb = rgb[2];

      ctx.beginPath();
      ctx.arc(c, c, R + 8, 0, 6.2832);
      ctx.strokeStyle = ringColor;
      ctx.lineWidth = 1;
      ctx.stroke();

      var cR = Math.cos(rot), sR = Math.sin(rot);
      var plot = function (p, dim) {
        var x1 = p[0] * cR + p[2] * sR;
        var z1 = p[2] * cR - p[0] * sR;
        var y2 = p[1] * cT - z1 * sT, z2 = p[1] * sT + z1 * cT;
        if (z2 < -0.1) return;
        var a = dim ? 0.09 + 0.2 * Math.max(0, z2) : (isLand ? 0.4 + 0.6 * Math.max(0, z2) : 0.10 + 0.46 * Math.max(0, z2));
        ctx.fillStyle = 'rgba(' + dotRgb + ',' + a.toFixed(3) + ')';
        var s2 = (isLand && !dim) ? 1.8 : 1.5;
        ctx.fillRect(c + x1 * R, c - y2 * R, s2, s2);
      };

      if (isLand) { for (var b = 0; b < bgDots.length; b++) plot(bgDots[b], true); }
      for (var i = 0; i < N; i++) plot(dots[i], false);

      screens.length = 0;
      for (var m = 0; m < mk.length; m++) {
        var o = mk[m];
        var x1 = o.cl * Math.sin(o.lon + rot);
        var z1 = o.cl * Math.cos(o.lon + rot);
        var y2 = o.sy * cT - z1 * sT, z2 = o.sy * sT + z1 * cT;
        var px = c + x1 * R, py = c - y2 * R;
        var front = z2 > 0.06;
        screens.push({ x: px, y: py, front: front || litAll });

        if (front || litAll) {
          var pulse = 0.5 + 0.5 * Math.sin(time / 520 + m * 1.7);

          // p runs 0→1 across the flash; blast decays fast, shock ring expands
          var p = flashOf(m, time);
          var lit = p >= 0;
          var blast = lit ? (1 - p) * (1 - p) : 0;

          var gr = (9 + 5 * pulse) * (1 + 1.7 * blast);
          var g = ctx.createRadialGradient(px, py, 0, px, py, gr);
          g.addColorStop(0, 'rgba(' + sr + ',' + sg + ',' + sb + ',' + (0.5 + 0.5 * blast).toFixed(3) + ')');
          g.addColorStop(1, 'rgba(' + sr + ',' + sg + ',' + sb + ',0)');
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(px, py, gr, 0, 6.2832); ctx.fill();

          // expanding shockwave, only while the flash is alive
          if (lit) {
            ctx.strokeStyle = 'rgba(255,255,255,' + (0.5 * (1 - p)).toFixed(3) + ')';
            ctx.lineWidth = 1.6 * (1 - p) + 0.4;
            ctx.beginPath(); ctx.arc(px, py, 5 + 34 * p, 0, 6.2832); ctx.stroke();
          }

          ctx.fillStyle = 'rgb(' + sr + ',' + sg + ',' + sb + ')';
          ctx.beginPath(); ctx.arc(px, py, 3.2 + 2.4 * blast, 0, 6.2832); ctx.fill();

          // white-hot core at the peak of the blast
          if (blast > 0.01) {
            ctx.fillStyle = 'rgba(255,255,255,' + (0.9 * blast).toFixed(3) + ')';
            ctx.beginPath(); ctx.arc(px, py, 2.2 + 1.8 * blast, 0, 6.2832); ctx.fill();
          }

          ctx.strokeStyle = 'rgba(' + sr + ',' + sg + ',' + sb + ',' + (0.25 + 0.35 * pulse + 0.4 * blast).toFixed(2) + ')';
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.arc(px, py, 6.5 + 3 * pulse, 0, 6.2832); ctx.stroke();
        } else if (z2 > -0.4) {
          ctx.fillStyle = 'rgba(' + dotRgb + ',.45)';
          ctx.beginPath(); ctx.arc(px, py, 1.8, 0, 6.2832); ctx.fill();
        }
      }
    }

    function showCard(i) {
      var o = OFFICES[i], s = screens[i];
      if (!o || !s) return;
      $('[data-gc-flag]', card).textContent = o.flag;
      $('[data-gc-name]', card).textContent = o.city;
      $('[data-gc-abbr]', card).textContent = o.abbr;
      // the card opens upward from its anchor (translate(-50%,-115%) in CSS)
      // so the anchor's minimum y must clear the card's own height or it
      // spills above the globe box
      var minTop = (card.offsetHeight || 40) * 1.15 + 10;
      card.style.left = Math.max(125, Math.min(W - 125, s.x)) + 'px';
      card.style.top = Math.max(minTop, s.y - 14) + 'px';
      card.style.opacity = '1';
    }
    function hideCard() { card.style.opacity = '0'; }

    size();
    loadLand();

    if (reduce) {
      var sRot = -mk[0].lon;
      redrawStatic = function () { draw(sRot, 0, true); };
      redrawStatic();
      showCard(0);
      if (onActive) onActive(0);
      return {
        focus: function (i) { sRot = -mk[i].lon; draw(sRot, 0, true); showCard(i); if (onActive) onActive(i); },
        resize: function () { size(); draw(sRot, 0, true); }
      };
    }

    var CRUISE = 0.16;
    // how far out (in radians of longitude) the globe starts easing down
    // as a marker approaches, and how slow it gets right at the marker
    var NEAR = 0.4, NEAR_FACTOR = 0.1;
    var rot = -mk[0].lon - 0.7, vel = CRUISE, last = 0;
    var pauseUntil = 0, active = -1, prevActive = -1, reportedActive = -2, hover = -1, rotTarget = null, targetIdx = -1;
    var running = false, raf = 0;
    redrawStatic = function () { if (!running) draw(rot, 0, false); };

    function step(ts) {
      if (!running) return;
      if (!last) last = ts;
      var dt = Math.min(0.05, (ts - last) / 1000);
      last = ts;
      var now = performance.now();

      if (rotTarget !== null) {
        var diff = norm(rotTarget - rot);
        rot += diff * Math.min(1, dt * 4);
        if (Math.abs(diff) < 0.015) {
          rot = rotTarget; rotTarget = null; vel = 0;
          pauseUntil = now + 2400; active = targetIdx;
        }
      } else {
        var bd = Infinity, bi = -1;
        for (var i = 0; i < mk.length; i++) {
          var d = Math.abs(norm(mk[i].lon + rot));
          if (d < bd) { bd = d; bi = i; }
        }

        // steady spin, west→east like the real Earth; eases down on approach
        // to a marker and pauses only for hover/tap
        var nearFactor = NEAR_FACTOR + (1 - NEAR_FACTOR) * Math.min(1, bd / NEAR);
        var tv = (hover >= 0 || now < pauseUntil) ? 0 : CRUISE * nearFactor;
        vel += (tv - vel) * Math.min(1, dt * 5);
        rot += vel * dt;
        if (hover >= 0) {
          active = hover;
        } else if (now >= pauseUntil) {
          active = bd < 0.22 ? bi : -1;
        }
      }

      // the frame a marker takes over the highlight, set it off
      if (active !== prevActive) {
        if (active >= 0) flashAt[active] = ts;
        prevActive = active;
      }

      draw(rot, ts, false);

      // labels/highlights only once the copy beside the globe is fully visible
      var effActive = labelsReady ? active : -1;
      if (effActive >= 0 && screens[effActive] && screens[effActive].front) showCard(effActive);
      else hideCard();
      if (effActive !== reportedActive) {
        reportedActive = effActive;
        if (onActive) onActive(effActive);
      }

      raf = requestAnimationFrame(step);
    }

    function hit(e) {
      var r = canvas.getBoundingClientRect();
      var x = e.clientX - r.left, y = e.clientY - r.top;
      for (var i = 0; i < screens.length; i++) {
        var s = screens[i];
        if (s && s.front && (x - s.x) * (x - s.x) + (y - s.y) * (y - s.y) < 340) return i;
      }
      return -1;
    }

    canvas.addEventListener('mousemove', function (e) {
      hover = hit(e);
      canvas.style.cursor = hover >= 0 ? 'pointer' : '';
    });
    canvas.addEventListener('mouseleave', function () { hover = -1; });
    canvas.addEventListener('click', function (e) {
      var i = hit(e);
      // re-fire even if this marker is already the active one
      if (i >= 0) { active = i; prevActive = i; flashAt[i] = performance.now(); pauseUntil = performance.now() + 2600; }
    });

    draw(rot, 0, false); // static frame before the loop starts

    var start = function () { if (!running) { running = true; last = 0; raf = requestAnimationFrame(step); } };
    var stop = function () { running = false; if (raf) cancelAnimationFrame(raf); };

    whenVisible(canvas, start, stop, '120px', 700);

    return {
      focus: function (i) { targetIdx = i; rotTarget = -mk[i].lon; },
      resize: function () { size(); if (!running) draw(rot, 0, false); }
    };
  }

  /* ---------- motion helpers ---------- */

  // run `start` while `el` is on screen, `stop` when it leaves.
  // Some embeds never fire IO callbacks — fall back to always-on.
  function whenVisible(el, start, stop, rootMargin, fallbackMs) {
    var fired = false;
    var io = new IntersectionObserver(function (entries) {
      fired = true;
      entries.forEach(function (en) { if (en.isIntersecting) start(); else stop(); });
    }, { rootMargin: rootMargin });
    io.observe(el);
    setTimeout(function () { if (!fired) { io.disconnect(); start(); } }, fallbackMs);
  }

  function initReveals() {
    if (reduce) return;
    var els = $$('[data-reveal]');
    if (!els.length) return;

    els.forEach(function (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = 'opacity .85s cubic-bezier(.16,.84,.44,1), transform .85s cubic-bezier(.16,.84,.44,1)';
      if (el.dataset.d) el.style.transitionDelay = el.dataset.d + 'ms';
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.style.opacity = '1';
          e.target.style.transform = 'none';
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    els.forEach(function (el) { io.observe(el); });
    setTimeout(function () {
      els.forEach(function (el) { el.style.opacity = '1'; el.style.transform = 'none'; });
    }, 3500);
  }

  function initWordSplit() {
    if (reduce) return;
    $$('[data-wordsplit]').forEach(function (el) {
      var i = 0;
      (function walk(node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (ch) {
          if (ch.nodeType === 3 && ch.textContent.trim()) {
            var frag = document.createDocumentFragment();
            ch.textContent.split(/(\s+)/).forEach(function (tok) {
              if (!tok) return;
              if (/^\s+$/.test(tok)) { frag.appendChild(document.createTextNode(tok)); return; }
              var s = document.createElement('span');
              s.textContent = tok;
              s.setAttribute('data-w', '');
              s.style.cssText = 'display:inline-block; opacity:0; transform:translateY(16px); filter:blur(6px); transition:opacity .6s ease, transform .6s ease, filter .6s ease; transition-delay:' + (i * 30) + 'ms;';
              i++;
              frag.appendChild(s);
            });
            node.replaceChild(frag, ch);
          } else if (ch.nodeType === 1) {
            walk(ch);
          }
        });
      })(el);

      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          $$('[data-w]', e.target).forEach(function (w) {
            w.style.opacity = '1'; w.style.transform = 'none'; w.style.filter = 'none';
          });
          io.unobserve(e.target);
        });
      }, { threshold: 0.4 });
      io.observe(el);
    });

    setTimeout(function () {
      $$('[data-w]').forEach(function (w) { w.style.opacity = '1'; w.style.transform = 'none'; w.style.filter = 'none'; });
    }, 4500);
  }

  function initParallax() {
    if (reduce) return;
    var plx = $$('[data-plx]');
    if (!plx.length) return;

    var ticking = false;
    function apply() {
      var y = window.scrollY || 0;
      plx.forEach(function (el) {
        var s = parseFloat(el.dataset.plx) || 0;
        el.style.transform = 'translate3d(0,' + (y * s).toFixed(1) + 'px,0)';
      });
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(apply); }
    }, { passive: true });
    apply();
  }

  function initCounters() {
    if (reduce) return;
    var nums = $$('[data-count]');
    if (!nums.length) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        io.unobserve(el);
        var target = parseFloat(el.getAttribute('data-count')) || 0;
        var t0 = performance.now();
        var dur = 1400;
        var tick = function (ts) {
          var p = Math.min(1, (ts - t0) / dur);
          var ease = 1 - Math.pow(1 - p, 3);
          el.textContent = String(Math.round(target * ease));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.6 });

    nums.forEach(function (el) { io.observe(el); });
  }

  /* ---------- boot ---------- */

  function boot() {
    buildOrnCells();
    initHeroDrafts();
    initBearings();
    initMethod();
    initDemos();
    initReel();

    var officeEls = [];
    var globe = initGlobe(function (idx) {
      officeEls.forEach(function (el, i) { el.classList.toggle('office--active', i === idx); });
    });
    officeEls = initOffices(globe.focus);
    initOfficesCarousel(globe.focus);
    window.addEventListener('resize', globe.resize, { passive: true });

    initReveals();
    initWordSplit();
    initParallax();
    initCounters();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

/* ---------- Atelier layer: scroll progress + glass nav ---------- */
(function () {
  var prog = document.getElementById('prog');
  function onScroll() {
    var doc = document.documentElement;
    var max = (doc.scrollHeight - window.innerHeight) || 1;
    var y = window.scrollY || 0;
    if (prog) prog.style.width = Math.min(100, (y / max) * 100) + '%';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ---------- Atelier layer: hero typewriter + icon rail sync ---------- */
(function () {
  var el = document.querySelector('.typeword');
  if (!el) return;
  var words = (el.dataset.typewords || '').split(',').map(function (w) { return w.trim(); }).filter(Boolean);
  if (!words.length) return;
  var chips = document.querySelectorAll('.hero__icon-chip');
  var needle = document.querySelector('.hero__needle');
  var compass = document.querySelector('.hero__compass');

  function setLive(word) {
    chips.forEach(function (c) { c.classList.toggle('is-live', c.dataset.word === word); });
  }

  /* ----- compass needle: eased rotation, lock-on vs wander ----- */
  var angle = 0, target = 0, wander = false, wanderTimer = null, raf = null;

  function angleToChip(word) {
    if (!compass) return 0;
    var chip = null;
    chips.forEach(function (c) { if (c.dataset.word === word) chip = c; });
    if (!chip) return 0;
    var a = compass.getBoundingClientRect(), b = chip.getBoundingClientRect();
    var cx = a.left + a.width / 2, cy = a.top + a.height / 2;
    var px = b.left + b.width / 2, py = b.top + b.height / 2;
    return Math.atan2(py - cy, px - cx) * 180 / Math.PI + 90; /* 0deg = needle up */
  }

  function lockOn(word) {
    if (!needle) return;
    wander = false;
    if (wanderTimer) { clearInterval(wanderTimer); wanderTimer = null; }
    target = angleToChip(word);
  }

  function startWander() {
    if (!needle) return;
    wander = true;
    if (wanderTimer) clearInterval(wanderTimer);
    wanderTimer = setInterval(function () {
      target += (Math.random() * 220 - 110); /* drift, both directions */
    }, 420);
  }

  function spin() {
    var d = target - angle;
    /* shortest-path easing, but allow long swings while wandering */
    if (!wander) { d = ((d % 360) + 540) % 360 - 180; }
    angle += d * 0.075;
    if (needle) needle.style.transform = 'rotate(' + angle.toFixed(2) + 'deg)';
    raf = requestAnimationFrame(spin);
  }

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    el.textContent = words[0];
    setLive(words[0]);
    if (needle) needle.style.transform = 'rotate(' + angleToChip(words[0]).toFixed(2) + 'deg)';
    return;
  }

  if (needle) spin();

  /* ----- typewriter ----- */
  var wi = 0, ci = 0, deleting = false;
  el.textContent = '';
  setLive(words[0]);
  startWander(); /* needle searches until the first word lands */

  function tick() {
    var word = words[wi];
    if (!deleting) {
      ci++;
      el.textContent = word.slice(0, ci);
      if (ci >= word.length) {
        lockOn(word);                       /* word complete: needle locks on */
        deleting = true;
        setTimeout(tick, 1600);   /* hold a bit shorter */
        return;
      }
      setTimeout(tick, 10 + Math.random() * 10);
    } else {
      if (ci === word.length) startWander(); /* word starts disappearing: needle drifts */
      ci--;
      el.textContent = word.slice(0, ci);
      if (ci <= 0) {
        deleting = false;
        wi = (wi + 1) % words.length;
        setLive(words[wi]);
        setTimeout(tick, 400);  /* breather before the next word types in */
        return;
      }
      setTimeout(tick, 5);
    }
  }
  setTimeout(tick, 700);
})();


/* ---------- Atelier layer: stat band count-up ---------- */
(function () {
  var nums = document.querySelectorAll('[data-count]');
  if (!nums.length) return;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function run(el) {
    var end = parseInt(el.dataset.count, 10) || 0;
    if (reduced) { el.textContent = String(end); return; }
    var t0 = null, dur = 1400;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur);
      p = 1 - Math.pow(1 - p, 3); /* ease-out cubic */
      el.textContent = String(Math.round(end * p));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { run(e.target); io.unobserve(e.target); }
    });
  }, { threshold: .6 });
  nums.forEach(function (n) { io.observe(n); });
})();

/* ---------- journey rail: slideshow controls ---------- */
(function () {
  var track = document.querySelector('[data-htl-track]');
  if (!track) return;
  var prev = document.querySelector('[data-htl-prev]');
  var next = document.querySelector('[data-htl-next]');

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function step() {
    var item = track.querySelector('.htl__item');
    return item ? item.getBoundingClientRect().width + 20 : 340;
  }
  function maxScroll() { return track.scrollWidth - track.clientWidth - 2; }
  function update() {
    /* the rail loops, so the arrows never dead-end — they wrap instead */
    if (prev) prev.disabled = false;
    if (next) next.disabled = false;
  }

  /* one milestone in `dir`, wrapping around the ends */
  function go(dir, smooth) {
    var max = maxScroll();
    var to = track.scrollLeft + dir * step();
    if (dir > 0 && track.scrollLeft >= max) to = 0;            // past the last -> back to 2010
    else if (dir < 0 && track.scrollLeft <= 2) to = max;       // before the first -> jump to the end
    track.scrollTo({ left: Math.max(0, Math.min(to, max)), behavior: (smooth && !reduce) ? 'smooth' : 'auto' });
  }

  if (prev) prev.addEventListener('click', function () { hold(); go(-1, true); });
  if (next) next.addEventListener('click', function () { hold(); go(1, true); });
  track.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();

  /* ---- the rail plays itself ---- */
  var DWELL = 3800;
  var timer = 0, hovering = false, held = 0, onScreen = false;

  function hold() { held = Date.now() + 9000; }   /* a touch of the controls buys quiet time */

  function tick() {
    if (!onScreen || hovering || down || Date.now() < held) return;
    go(1, true);
  }
  function start() {
    if (timer || reduce) return;
    timer = setInterval(tick, DWELL);
  }
  function stop() {
    if (timer) { clearInterval(timer); timer = 0; }
  }

  track.addEventListener('mouseenter', function () { hovering = true; });
  track.addEventListener('mouseleave', function () { hovering = false; });
  track.addEventListener('touchstart', hold, { passive: true });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      onScreen = entries[0].isIntersecting;
      if (onScreen) start(); else stop();
    }, { rootMargin: '0px 0px -15% 0px', threshold: 0.25 }).observe(track);
  } else {
    onScreen = true;
    start();
  }

  /* pointer drag — the slideshow feel on desktop */
  var down = false, startX = 0, startScroll = 0, moved = false;
  track.addEventListener('pointerdown', function (e) {
    if (e.pointerType !== 'mouse') return;      /* touch scrolls natively */
    hold();                                     /* dragging pauses the autoplay */
    down = true; moved = false;
    startX = e.clientX; startScroll = track.scrollLeft;
    track.classList.add('is-dragging');
  });
  window.addEventListener('pointermove', function (e) {
    if (!down) return;
    var dx = e.clientX - startX;
    if (Math.abs(dx) > 4) moved = true;
    track.scrollLeft = startScroll - dx;
  });
  window.addEventListener('pointerup', function () {
    if (!down) return;
    down = false;
    track.classList.remove('is-dragging');
  });
  /* swallow accidental clicks after a drag */
  track.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
})();

/* ---------- method steps: the count keeps moving on its own ---------- */
(function () {
  var cards = document.querySelectorAll('.stepcard');
  if (!cards.length) return;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var i = 0, hold = false;

  function setLive(n) {
    i = n;
    cards.forEach(function (c, j) { c.classList.toggle('is-live', j === n); });
  }
  setLive(0);
  if (reduced) return;

  setInterval(function () {
    if (hold) return;
    setLive((i + 1) % cards.length);
  }, 3000);

  cards.forEach(function (c, j) {
    c.addEventListener('mouseenter', function () { hold = true; setLive(j); });
    c.addEventListener('mouseleave', function () { hold = false; });
  });
})();


/* ---------- demo modal: the card opens a popup, not a page ---------- */
(function () {
  var modal = document.querySelector('[data-vmodal]');
  var stagePlay = document.querySelector('.stage--card .stage__play');
  if (!modal || !stagePlay) return;

  var cat = modal.querySelector('[data-vm-cat]');
  var chip = modal.querySelector('[data-vm-chip]');
  var title = modal.querySelector('[data-vm-title]');
  var problem = modal.querySelector('[data-vm-problem]');
  var solution = modal.querySelector('[data-vm-solution]');
  var outcome = modal.querySelector('[data-vm-outcome]');
  var caps = modal.querySelector('[data-vm-caps]');

  function fill(c) {
    if (cat) cat.textContent = c.tag;
    if (chip) chip.textContent = c.chip || '';
    if (title) title.textContent = c.title;
    if (problem) problem.textContent = c.problem || c.sub;
    if (solution) solution.textContent = c.solution || '';
    if (outcome) outcome.textContent = c.outcome || '';
    if (caps) {
      caps.innerHTML = '';
      (c.caps || []).forEach(function (k) {
        var s = document.createElement('span');
        s.textContent = k;
        caps.appendChild(s);
      });
    }
  }

  function open() {
    var cards = window.__reelCards || [];
    var i = window.__reelIdx || 0;
    if (!cards[i]) return;
    fill(cards[i]);
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(function () { modal.classList.add('is-open'); });
  }
  function close() {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
    setTimeout(function () { modal.hidden = true; }, 250);
  }

  stagePlay.addEventListener('click', function (e) {
    e.preventDefault();
    open();
  });
  modal.querySelectorAll('[data-vmodal-close]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      if (el.classList.contains('vmodal__cta')) { close(); return; }
      e.preventDefault();
      close();
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !modal.hidden) close();
  });
})();

/* ---------- observability loop: a telemetry packet runs the ring ---------- */
(function () {
  var loop = document.querySelector('[data-loop]');
  if (!loop) return;
  var pulse = loop.querySelector('[data-loop-pulse]');
  var nodes = loop.querySelectorAll('[data-loop-node]');
  var edges = loop.querySelectorAll('[data-loop-edge]');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ring geometry in container %: centre (50, 51.8), radius 26.11% x / 33.57% y */
  function pos(deg) {
    var r = deg * Math.PI / 180;
    return { x: 50 + 26.11 * Math.sin(r), y: 51.8 - 33.57 * Math.cos(r) };
  }
  function nearest(deg, target) {
    var d = Math.abs(((deg - target) % 360 + 540) % 360 - 180);
    return d;
  }

  if (reduced) {
    if (pulse) pulse.style.display = 'none';
    if (nodes[0]) nodes[0].classList.add('is-live');
    return;
  }

  var angle = 0;
  var last = null;
  function frame(t) {
    if (last == null) last = t;
    var dt = Math.min(64, t - last);
    last = t;
    angle = (angle + dt * 0.04) % 360;      /* ~9s per revolution */

    if (pulse) {
      var p = pos(angle);
      pulse.style.left = p.x + '%';
      pulse.style.top = p.y + '%';
    }
    nodes.forEach(function (n) {
      n.classList.toggle('is-live', nearest(angle, parseFloat(n.dataset.loopNode)) < 16);
    });
    edges.forEach(function (e) {
      var start = parseFloat(e.dataset.loopEdge);
      var rel = ((angle - start) % 360 + 360) % 360;
      e.classList.toggle('is-live', rel > 16 && rel < 104);
    });
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();

/* ---------- observability triangle: detect -> decide -> act, on loop ---------- */
(function () {
  var tri = document.querySelector('[data-tri]');
  if (!tri) return;
  var pkt = tri.querySelector('[data-tri-pkt]');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var nodes = {};
  tri.querySelectorAll('[data-tri-node]').forEach(function (n) { nodes[n.dataset.triNode] = n; });
  var stats = {};
  tri.querySelectorAll('[data-tri-status]').forEach(function (s) { stats[s.dataset.triStatus] = s; });
  var lines = tri.querySelectorAll('[data-tri-line]');
  var lbls = tri.querySelectorAll('[data-tri-lbl]');

  /* edge endpoints in container % (viewBox 720x560) */
  var EDGES = [
    [{ x: 43.5, y: 33.0 }, { x: 28.7, y: 63.5 }],   /* obs -> aiops */
    [{ x: 34.2, y: 76.8 }, { x: 65.8, y: 76.8 }],   /* aiops -> agents */
    [{ x: 71.4, y: 63.8 }, { x: 56.3, y: 32.7 }]    /* agents -> obs */
  ];

  var PHASES = [
    { type: 'node', node: 'obs', text: 'ANOMALY DETECTED', dur: 1400 },
    { type: 'edge', edge: 0, dur: 1400 },
    { type: 'node', node: 'aiops', text: 'DECISION · REMEDIATE — APPROVED', dur: 1800 },
    { type: 'edge', edge: 1, dur: 1400 },
    { type: 'node', node: 'agents', text: 'EXECUTING REMEDIATION', dur: 1800 },
    { type: 'edge', edge: 2, dur: 1400 },
    { type: 'node', node: 'obs', text: 'NEW SIGNALS · VERIFIED HEALTHY', dur: 1600 }
  ];

  function clearAll() {
    Object.keys(nodes).forEach(function (k) { nodes[k].classList.remove('is-hot'); });
    Object.keys(stats).forEach(function (k) { stats[k].classList.remove('is-on'); });
    lines.forEach(function (l) { l.classList.remove('is-live'); });
    lbls.forEach(function (l) { l.classList.remove('is-live'); });
  }

  if (reduced) {
    /* static: show the whole story at once */
    stats.obs.textContent = 'ANOMALY DETECTED';
    stats.aiops.textContent = 'DECISION · APPROVED';
    stats.agents.textContent = 'EXECUTING REMEDIATION';
    Object.keys(stats).forEach(function (k) { stats[k].classList.add('is-on'); });
    if (pkt) pkt.style.display = 'none';
    return;
  }

  var pi = 0, t0 = null;
  function ease(p) { return p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; }

  function frame(t) {
    if (t0 == null) t0 = t;
    var ph = PHASES[pi];
    var p = Math.min(1, (t - t0) / ph.dur);

    if (ph.type === 'edge' && pkt) {
      var e = EDGES[ph.edge], q = ease(p);
      pkt.style.left = (e[0].x + (e[1].x - e[0].x) * q) + '%';
      pkt.style.top = (e[0].y + (e[1].y - e[0].y) * q) + '%';
    }

    if (p >= 1) {
      pi = (pi + 1) % PHASES.length;
      t0 = t;
      clearAll();
      var next = PHASES[pi];
      if (next.type === 'node') {
        if (pkt) pkt.classList.remove('is-on');
        nodes[next.node].classList.add('is-hot');
        stats[next.node].textContent = next.text;
        stats[next.node].classList.add('is-on');
      } else {
        if (pkt) pkt.classList.add('is-on');
        lines[next.edge].classList.add('is-live');
        lbls[next.edge].classList.add('is-live');
        /* destination pre-warms as the packet approaches */
        var dest = ['aiops', 'agents', 'obs'][next.edge];
        nodes[dest].classList.add('is-hot');
      }
    }
    requestAnimationFrame(frame);
  }

  /* boot into phase 0 */
  nodes.obs.classList.add('is-hot');
  stats.obs.textContent = PHASES[0].text;
  stats.obs.classList.add('is-on');
  requestAnimationFrame(frame);
})();
