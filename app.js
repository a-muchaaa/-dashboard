// Dashboard Interactive Application Logic

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initOverviewKpi();
  initTable1View();
  initTable4View();
  initDataExplorer();
  initCharts();
});

// 1. Tab Navigation
function initTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab');

      tabButtons.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPane = document.getElementById(targetId);
      if (targetPane) {
        targetPane.classList.add('active');
        // Trigger resize on charts in active pane to prevent rendering glitch
        window.dispatchEvent(new Event('resize'));
      }
    });
  });
}

// 2. Overview KPI Population
function initOverviewKpi() {
  const k = DashboardData.kpi;
  // Dynamic updates if needed
}

// 3. Table 1 View Logic
function initTable1View() {
  const genderFilter = document.getElementById('table1GenderFilter');
  if (!genderFilter) return;

  function renderTable1() {
    const g = genderFilter.value;
    const block = DashboardData.table1[g];
    const tbody = document.getElementById('table1Body');
    if (!tbody || !block) return;

    let html = '';
    const years = DashboardData.years;

    const rowsDef = [
      { key: 'wageWorker', label: '○ 임금근로자 (천명)', isBold: true, isRatio: false },
      { key: 'regular', label: '  - 정규직 (천명)', isBold: false, isRatio: false },
      { key: 'nonRegular', label: '  - 비정규직 (천명)', isBold: true, isRatio: false, highlight: true },
      { key: 'nonRegularRatio', label: '  ※ 비정규직 비중 (%)', isBold: true, isRatio: true, highlight: true },
      { key: 'contingent', label: '    · 한시적 근로자 (천명)', isBold: false, isRatio: false },
      { key: 'partTime', label: '    · 시간제 근로자 (천명)', isBold: false, isRatio: false },
      { key: 'atypical', label: '    · 비전형 근로자 (천명)', isBold: false, isRatio: false }
    ];

    rowsDef.forEach(rDef => {
      const vals = block[rDef.key];
      const diff = Number((vals[vals.length - 1] - vals[vals.length - 2]).toFixed(1));
      const diffFormatted = diff > 0 ? `+${diff.toLocaleString()}` : diff.toLocaleString();
      const diffClass = rDef.isRatio
        ? (diff > 0 ? 'text-red-600 font-bold' : 'text-blue-600 font-bold')
        : (diff > 0 ? 'text-emerald-600 font-bold' : 'text-slate-600 font-bold');

      const trClass = rDef.highlight ? 'class="highlight-row"' : '';
      html += `<tr ${trClass}>`;
      html += `<td style="${rDef.isBold ? 'font-weight:700;' : ''}">${rDef.label}</td>`;
      vals.forEach(v => {
        const vFmt = rDef.isRatio ? `${v.toFixed(1)}%` : v.toLocaleString();
        html += `<td class="text-right" style="${rDef.isBold ? 'font-weight:700;' : ''}">${vFmt}</td>`;
      });
      html += `<td class="text-right ${diffClass}">${diffFormatted}${rDef.isRatio ? '%p' : ''}</td>`;
      html += `</tr>`;
    });

    tbody.innerHTML = html;
  }

  genderFilter.addEventListener('change', renderTable1);
  renderTable1();
}

// 4. Table 4 Regional View Logic
function initTable4View() {
  const tbody = document.getElementById('table4Body');
  const searchInput = document.getElementById('table4Search');
  if (!tbody) return;

  function renderTable4(filterText = '') {
    const list = DashboardData.table4;
    const query = filterText.trim().toLowerCase();

    let html = '';
    list.forEach(item => {
      if (query && !item.region.toLowerCase().includes(query)) return;

      const isNat = item.isNational;
      const trClass = isNat ? 'class="highlight-row"' : (item.isMajor ? 'style="background-color:#f0fdf4;"' : '');
      const dnrClass = item.dnr > 0 ? 'color:#dc2626; font-weight:700;' : 'color:#2563eb; font-weight:700;';
      const diffRatioClass = item.diffRatio > 0 ? 'color:#dc2626; font-weight:700;' : 'color:#16a34a; font-weight:700;';

      html += `<tr ${trClass}>`;
      html += `<td><strong>${item.region}</strong>${item.isMajor ? ' <span style="color:#16a34a;font-size:10px;">[동남권]</span>' : ''}</td>`;
      // 2025
      html += `<td class="text-right">${item.w25.toLocaleString()}</td>`;
      html += `<td class="text-right">${item.r25.toLocaleString()}</td>`;
      html += `<td class="text-right">${item.nr25.toLocaleString()}</td>`;
      html += `<td class="text-right">${item.ratio25.toFixed(1)}%</td>`;
      // 2026
      html += `<td class="text-right" style="font-weight:700;">${item.w26.toLocaleString()}</td>`;
      html += `<td class="text-right">${item.r26.toLocaleString()}</td>`;
      html += `<td class="text-right" style="font-weight:700; color:#1e3a8a;">${item.nr26.toLocaleString()}</td>`;
      html += `<td class="text-right" style="font-weight:700; color:#dc2626;">${item.ratio26.toFixed(1)}%</td>`;
      // 증감
      html += `<td class="text-right">${item.dw > 0 ? '+' : ''}${item.dw.toLocaleString()}</td>`;
      html += `<td class="text-right">${item.dr > 0 ? '+' : ''}${item.dr.toLocaleString()}</td>`;
      html += `<td class="text-right" style="${dnrClass}">${item.dnr > 0 ? '+' : ''}${item.dnr.toLocaleString()}</td>`;
      html += `<td class="text-right" style="${diffRatioClass}">${item.diffRatio > 0 ? '+' : ''}${item.diffRatio.toFixed(1)}%p</td>`;
      html += `</tr>`;
    });

    tbody.innerHTML = html;
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => renderTable4(e.target.value));
  }
  renderTable4();
}

// 5. Data Explorer & CSV Export
let dbCache = [];
function initDataExplorer() {
  const tbody = document.getElementById('dbTableBody');
  const catFilter = document.getElementById('dbCatFilter');
  const searchInput = document.getElementById('dbSearchInput');
  const totalCountElem = document.getElementById('dbTotalCount');
  const exportBtn = document.getElementById('btnExportCsv');

  if (!tbody) return;

  // Build DB Rows
  dbCache = [];
  let id = 1;
  const years = DashboardData.years;

  // 1. Table 1
  ['total', 'male', 'female'].forEach(gKey => {
    const b = DashboardData.table1[gKey];
    const gName = b.title;
    [
      { k: 'wageWorker', item: '임금근로자', unit: '천명', type: '인원' },
      { k: 'regular', item: '정규직', unit: '천명', type: '인원' },
      { k: 'nonRegular', item: '비정규직', unit: '천명', type: '인원' },
      { k: 'nonRegularRatio', item: '비정규직 비중', unit: '%', type: '비율' },
      { k: 'contingent', item: '한시적 근로자', unit: '천명', type: '인원' },
      { k: 'partTime', item: '시간제 근로자', unit: '천명', type: '인원' },
      { k: 'atypical', item: '비전형 근로자', unit: '천명', type: '인원' }
    ].forEach(rowDef => {
      b[rowDef.k].forEach((val, yIdx) => {
        dbCache.push({
          id: id++,
          cat: '통계표1',
          dim1: '근로형태별규모',
          dim2: gName,
          item: rowDef.item,
          year: years[yIdx],
          gender: gName,
          val: val,
          unit: rowDef.unit,
          note: rowDef.type
        });
      });
    });
  });

  // 2. Table 2
  years.forEach((y, yIdx) => {
    dbCache.push({
      id: id++,
      cat: '통계표2',
      dim1: '비정규직총규모',
      dim2: '합계',
      item: '비정규직',
      year: y,
      gender: '전체',
      val: DashboardData.table2.totalNonRegular[yIdx],
      unit: '천명',
      note: '인원'
    });
  });

  DashboardData.table2.age.forEach(r => {
    r.vals.forEach((v, yIdx) => {
      dbCache.push({
        id: id++,
        cat: '통계표2',
        dim1: '연령계층별',
        dim2: '비정규직',
        item: r.name,
        year: years[yIdx],
        gender: '전체',
        val: v,
        unit: '%',
        note: '연령비중'
      });
    });
  });

  DashboardData.table2.industry.forEach(r => {
    r.vals.forEach((v, yIdx) => {
      dbCache.push({
        id: id++,
        cat: '통계표2',
        dim1: '산업별',
        dim2: '비정규직',
        item: r.name,
        year: years[yIdx],
        gender: '전체',
        val: v,
        unit: '%',
        note: '산업비중'
      });
    });
  });

  DashboardData.table2.occupation.forEach(r => {
    r.vals.forEach((v, yIdx) => {
      dbCache.push({
        id: id++,
        cat: '통계표2',
        dim1: '직업별',
        dim2: '비정규직',
        item: r.name,
        year: years[yIdx],
        gender: '전체',
        val: v,
        unit: '%',
        note: '직업비중'
      });
    });
  });

  // 3. Table 3
  const t3Cats = [
    { key: 'tenure', name: '평균근속기간' },
    { key: 'workHours', name: '평균취업시간' },
    { key: 'monthlyWage', name: '월평균임금' },
    { key: 'nationalPension', name: '국민연금가입률' },
    { key: 'healthInsurance', name: '건강보험가입률' },
    { key: 'employmentInsurance', name: '고용보험가입률' },
    { key: 'severancePay', name: '퇴직급여수혜율' },
    { key: 'bonus', name: '상여금수혜율' },
    { key: 'overtimePay', name: '시간외수당수혜율' },
    { key: 'paidLeave', name: '유급휴가수혜율' }
  ];

  t3Cats.forEach(c => {
    const item = DashboardData.table3[c.key];
    ['total', 'regular', 'nonRegular'].forEach(g => {
      const gLabel = g === 'total' ? '임금근로자' : (g === 'regular' ? '정규직' : '비정규직');
      item[g].forEach((v, yIdx) => {
        dbCache.push({
          id: id++,
          cat: '통계표3',
          dim1: '근로조건특성',
          dim2: c.name,
          item: gLabel,
          year: years[yIdx],
          gender: gLabel,
          val: v,
          unit: item.unit,
          note: c.name
        });
      });
    });
  });

  // 4. Table 4
  DashboardData.table4.forEach(d => {
    const reg = d.region.trim();
    [2025, 2026].forEach(yr => {
      const w = yr === 2025 ? d.w25 : d.w26;
      const r = yr === 2025 ? d.r25 : d.r26;
      const nr = yr === 2025 ? d.nr25 : d.nr26;
      const ratio = yr === 2025 ? d.ratio25 : d.ratio26;

      dbCache.push({ id: id++, cat: '통계표4', dim1: '시도별규모', dim2: reg, item: '임금근로자', year: yr, gender: '전체', val: w, unit: '천명', note: '시도총근로자' });
      dbCache.push({ id: id++, cat: '통계표4', dim1: '시도별규모', dim2: reg, item: '정규직', year: yr, gender: '전체', val: r, unit: '천명', note: '시도정규직' });
      dbCache.push({ id: id++, cat: '통계표4', dim1: '시도별규모', dim2: reg, item: '비정규직', year: yr, gender: '전체', val: nr, unit: '천명', note: '시도비정규직' });
      dbCache.push({ id: id++, cat: '통계표4', dim1: '시도별비중', dim2: reg, item: '비정규직비중', year: yr, gender: '전체', val: ratio, unit: '%', note: '시도비정규비중' });
    });
  });

  function renderDbTable() {
    const selectedCat = catFilter ? catFilter.value : 'all';
    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';

    const filtered = dbCache.filter(row => {
      if (selectedCat !== 'all' && row.cat !== selectedCat) return false;
      if (query) {
        const text = `${row.cat} ${row.dim1} ${row.dim2} ${row.item} ${row.year} ${row.gender} ${row.unit} ${row.note}`.toLowerCase();
        if (!text.includes(query)) return false;
      }
      return true;
    });

    if (totalCountElem) {
      totalCountElem.textContent = `총 ${filtered.length.toLocaleString()}건`;
    }

    // Render limit 150 rows for fast DOM rendering
    const displayList = filtered.slice(0, 150);
    let html = '';
    displayList.forEach(r => {
      const valFmt = typeof r.val === 'number' && r.val % 1 !== 0 ? r.val.toFixed(1) : r.val.toLocaleString();
      html += `<tr>`;
      html += `<td class="text-center" style="color:#64748b;">${r.id}</td>`;
      html += `<td class="text-center"><span class="badge" style="background:#e2e8f0;color:#334155;">${r.cat}</span></td>`;
      html += `<td>${r.dim1}</td>`;
      html += `<td><strong>${r.dim2}</strong></td>`;
      html += `<td>${r.item}</td>`;
      html += `<td class="text-center font-bold">${r.year}</td>`;
      html += `<td class="text-center">${r.gender}</td>`;
      html += `<td class="text-right" style="font-weight:700;color:#1e3a8a;">${valFmt}</td>`;
      html += `<td class="text-center" style="color:#64748b;">${r.unit}</td>`;
      html += `<td>${r.note}</td>`;
      html += `</tr>`;
    });

    if (filtered.length > 150) {
      html += `<tr><td colspan="10" class="text-center" style="padding:12px;background:#f8fafc;color:#64748b;">전체 ${filtered.length}건 중 상위 150건 표시 중 (검색어를 입력하여 좁히실 수 있습니다)</td></tr>`;
    }

    tbody.innerHTML = html;
  }

  if (catFilter) catFilter.addEventListener('change', renderDbTable);
  if (searchInput) searchInput.addEventListener('input', renderDbTable);

  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      exportToCsv(dbCache);
    });
  }

  renderDbTable();
}

function exportToCsv(data) {
  let csv = '\uFEFFID,통계표,분류차원1,분류차원2,세부항목,연도,성별_구분,지표값,단위,비고\n';
  data.forEach(r => {
    csv += `"${r.id}","${r.cat}","${r.dim1}","${r.dim2}","${r.item}","${r.year}","${r.gender}","${r.val}","${r.unit}","${r.note}"\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `고용동향_통계표_정규화DB_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// 6. Chart.js Initializations
function initCharts() {
  if (typeof Chart === 'undefined') {
    console.warn('Chart.js not loaded. Skipping chart init.');
    return;
  }

  const years = DashboardData.years;

  // Chart 1: Overview Trend Combo (정규직 vs 비정규직 규모 & 비정규직 비중)
  const ctx1 = document.getElementById('chartOverviewTrend');
  if (ctx1) {
    new Chart(ctx1, {
      data: {
        labels: years,
        datasets: [
          {
            type: 'bar',
            label: '정규직 (천명)',
            data: DashboardData.table1.total.regular,
            backgroundColor: 'rgba(59, 130, 246, 0.75)',
            yAxisID: 'y'
          },
          {
            type: 'bar',
            label: '비정규직 (천명)',
            data: DashboardData.table1.total.nonRegular,
            backgroundColor: 'rgba(239, 68, 68, 0.75)',
            yAxisID: 'y'
          },
          {
            type: 'line',
            label: '비정규직 비중 (%)',
            data: DashboardData.table1.total.nonRegularRatio,
            borderColor: '#b45309',
            backgroundColor: '#f59e0b',
            borderWidth: 3,
            pointRadius: 5,
            pointHoverRadius: 7,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' },
          tooltip: { mode: 'index', intersect: false }
        },
        scales: {
          x: { grid: { display: false } },
          y: {
            type: 'linear',
            position: 'left',
            min: 6000,
            max: 16000,
            title: { display: true, text: '근로자 수 (천명)' }
          },
          y1: {
            type: 'linear',
            position: 'right',
            min: 30,
            max: 45,
            grid: { drawOnChartArea: false },
            title: { display: true, text: '비정규직 비중 (%)' }
          }
        }
      }
    });
  }

  // Chart 2: Non-regular Types (한시적, 시간제, 비전형 2026 비중)
  const ctx2 = document.getElementById('chartNonRegTypes');
  if (ctx2) {
    new Chart(ctx2, {
      type: 'doughnut',
      data: {
        labels: ['한시적 근로자 (6,035천)', '시간제 근로자 (4,382천)', '비전형 근로자 (1,786천)'],
        datasets: [{
          data: [6035, 4382, 1786],
          backgroundColor: ['#3b82f6', '#10b981', '#f59e0b']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.label}: ${ctx.raw.toLocaleString()}천명`
            }
          }
        }
      }
    });
  }

  // Chart 3: Trends Sub-types (2019~2026 근로형태 세부)
  const ctx3 = document.getElementById('chartSubTypesTrend');
  if (ctx3) {
    new Chart(ctx3, {
      type: 'line',
      data: {
        labels: years,
        datasets: [
          {
            label: '한시적 근로자',
            data: DashboardData.table1.total.contingent,
            borderColor: '#2563eb',
            backgroundColor: '#93c5fd',
            borderWidth: 2.5,
            pointRadius: 4
          },
          {
            label: '시간제 근로자',
            data: DashboardData.table1.total.partTime,
            borderColor: '#059669',
            backgroundColor: '#6ee7b7',
            borderWidth: 2.5,
            pointRadius: 4
          },
          {
            label: '비전형 근로자',
            data: DashboardData.table1.total.atypical,
            borderColor: '#d97706',
            backgroundColor: '#fcd34d',
            borderWidth: 2.5,
            pointRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' },
          tooltip: { mode: 'index', intersect: false }
        },
        scales: {
          y: { title: { display: true, text: '근로자 수 (천명)' } }
        }
      }
    });
  }

  // Chart 4: Gender Comparison (남녀 비정규직 비중 추이)
  const ctx4 = document.getElementById('chartGenderTrend');
  if (ctx4) {
    new Chart(ctx4, {
      type: 'line',
      data: {
        labels: years,
        datasets: [
          {
            label: '여성 비정규직 비중 (%)',
            data: DashboardData.table1.female.nonRegularRatio,
            borderColor: '#e11d48',
            backgroundColor: '#fda4af',
            borderWidth: 2.5,
            pointRadius: 4
          },
          {
            label: '전체 비정규직 비중 (%)',
            data: DashboardData.table1.total.nonRegularRatio,
            borderColor: '#4b5563',
            borderDash: [5, 5],
            borderWidth: 2,
            pointRadius: 3
          },
          {
            label: '남성 비정규직 비중 (%)',
            data: DashboardData.table1.male.nonRegularRatio,
            borderColor: '#2563eb',
            backgroundColor: '#93c5fd',
            borderWidth: 2.5,
            pointRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'top' } },
        scales: {
          y: { min: 25, max: 50, title: { display: true, text: '비정규직 비중 (%)' } }
        }
      }
    });
  }

  // Chart 5: Age Demographics (2019 vs 2026)
  const ctx5 = document.getElementById('chartAgeCompare');
  if (ctx5) {
    const ageLabels = DashboardData.table2.age.map(a => a.name);
    const age2019 = DashboardData.table2.age.map(a => a.vals[0]);
    const age2026 = DashboardData.table2.age.map(a => a.vals[a.vals.length - 1]);

    new Chart(ctx5, {
      type: 'bar',
      data: {
        labels: ageLabels,
        datasets: [
          {
            label: '2019년 비중 (%)',
            data: age2019,
            backgroundColor: '#94a3b8'
          },
          {
            label: '2026년 비중 (%)',
            data: age2026,
            backgroundColor: '#1e3a8a'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'top' } },
        scales: {
          y: { title: { display: true, text: '비중 (%)' } }
        }
      }
    });
  }

  // Chart 6: Industry Non-regular Share (2026 Top Industries)
  const ctx6 = document.getElementById('chartIndustry');
  if (ctx6) {
    const indData = [...DashboardData.table2.industry].sort((a, b) => b.vals[b.vals.length - 1] - a.vals[a.vals.length - 1]);
    new Chart(ctx6, {
      type: 'bar',
      data: {
        labels: indData.map(i => i.name),
        datasets: [{
          label: '2026 비정규직 산업 비중 (%)',
          data: indData.map(i => i.vals[i.vals.length - 1]),
          backgroundColor: indData.map((_, i) => i === 0 ? '#dc2626' : (i < 3 ? '#2563eb' : '#64748b'))
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { title: { display: true, text: '비중 (%)' } }
        }
      }
    });
  }

  // Chart 7: Wages Comparison Trend (2019~2026)
  const ctx7 = document.getElementById('chartWagesTrend');
  if (ctx7) {
    new Chart(ctx7, {
      type: 'line',
      data: {
        labels: years,
        datasets: [
          {
            label: '정규직 월평균임금 (만원)',
            data: DashboardData.table3.monthlyWage.regular,
            borderColor: '#2563eb',
            borderWidth: 2.5,
            pointRadius: 4
          },
          {
            label: '전체 임금근로자 (만원)',
            data: DashboardData.table3.monthlyWage.total,
            borderColor: '#64748b',
            borderDash: [4, 4],
            borderWidth: 2,
            pointRadius: 3
          },
          {
            label: '비정규직 월평균임금 (만원)',
            data: DashboardData.table3.monthlyWage.nonRegular,
            borderColor: '#dc2626',
            borderWidth: 2.5,
            pointRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'top' } },
        scales: {
          y: { title: { display: true, text: '만원' } }
        }
      }
    });
  }

  // Chart 8: Social Insurance & Welfare Gap (2026 Regular vs Non-Regular)
  const ctx8 = document.getElementById('chartConditionsGap');
  if (ctx8) {
    const condLabels = ['국민연금', '건강보험', '고용보험', '퇴직급여', '상여금', '시간외수당', '유급휴가'];
    const t3 = DashboardData.table3;
    const lastIdx = years.length - 1;
    const regValues = [
      t3.nationalPension.regular[lastIdx],
      t3.healthInsurance.regular[lastIdx],
      t3.employmentInsurance.regular[lastIdx],
      t3.severancePay.regular[lastIdx],
      t3.bonus.regular[lastIdx],
      t3.overtimePay.regular[lastIdx],
      t3.paidLeave.regular[lastIdx]
    ];
    const nonRegValues = [
      t3.nationalPension.nonRegular[lastIdx],
      t3.healthInsurance.nonRegular[lastIdx],
      t3.employmentInsurance.nonRegular[lastIdx],
      t3.severancePay.nonRegular[lastIdx],
      t3.bonus.nonRegular[lastIdx],
      t3.overtimePay.nonRegular[lastIdx],
      t3.paidLeave.nonRegular[lastIdx]
    ];

    new Chart(ctx8, {
      type: 'bar',
      data: {
        labels: condLabels,
        datasets: [
          {
            label: '정규직 (%)',
            data: regValues,
            backgroundColor: '#2563eb'
          },
          {
            label: '비정규직 (%)',
            data: nonRegValues,
            backgroundColor: '#f87171'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'top' } },
        scales: {
          y: { min: 0, max: 100, title: { display: true, text: '가입률 / 수혜율 (%)' } }
        }
      }
    });
  }

  // Chart 9: Regional Ranking (17 Regions 2026 Non-regular share)
  const ctx9 = document.getElementById('chartRegionalRanking');
  if (ctx9) {
    const regList = DashboardData.table4
      .filter(d => !d.isNational && !d.region.startsWith('  '))
      .sort((a, b) => b.ratio26 - a.ratio26);

    new Chart(ctx9, {
      type: 'bar',
      data: {
        labels: regList.map(r => r.region),
        datasets: [{
          label: '2026 비정규직 비중 (%)',
          data: regList.map(r => r.ratio26),
          backgroundColor: regList.map(r => {
            if (r.region === '부산' || r.region === '울산') return '#dc2626'; // Highlight 동남권
            if (r.region === '경남') return '#16a34a';
            return '#3b82f6';
          })
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              afterLabel: (ctx) => {
                const item = regList[ctx.dataIndex];
                return `전년대비 증감: ${item.diffRatio > 0 ? '+' : ''}${item.diffRatio}%p`;
              }
            }
          }
        },
        scales: {
          y: { min: 25, max: 55, title: { display: true, text: '비정규직 비중 (%)' } }
        }
      }
    });
  }
}
