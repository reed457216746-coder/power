const STORAGE_KEY = "energy-checkin-v1";
const BACKFILL_START_DATE = "2026-06-18";
const BACKFILL_END_DATE = "2026-06-24";

const encouragements = [
  "把能量留给真正想成为的自己。",
  "你不是在忍耐，你是在训练掌控感。",
  "今天的你，赢了一次冲动。",
  "一次稳定的选择，会慢慢变成新的自己。",
  "不用完美，只要今天比昨天更清醒。",
  "你正在把注意力，从冲动手里拿回来。",
  "今天多出来的时间，会慢慢变成底气。",
  "能停下来，就是很实在的进步。",
  "别小看这一天，它正在改变你的节奏。",
  "你没有被习惯推着走，这就是主动权。",
  "把这份清醒留住，晚上会睡得更踏实。",
  "冲动只是路过，你的选择才算数。",
  "今天守住一次，明天就轻一点。",
  "你的精力值得放在更重要的地方。",
  "你已经在练习一种更自由的生活方式。",
  "这一小时，可以交给身体、学习或好好休息。",
  "坚持不是硬扛，是一次次把自己带回来。",
  "你正在用行动证明：我可以选择。",
  "今天的稳定，会给明天一个更好的开头。",
  "少一次消耗，多一份专注。",
  "这不是压抑自己，是把精力重新分配。",
  "你没有浪费今天，这很重要。",
  "慢慢来，但不要停。",
  "每一次清醒，都在削弱旧习惯的惯性。",
  "把时间攒起来，它会变成你想要的生活。",
  "你正在建立一种更稳的状态。",
  "今天的选择，已经站在你这边。",
  "你不需要靠后悔改变，只需要靠记录和行动。",
  "这一刻稳住了，后面会容易很多。",
  "真正有力量的人，是能照顾好自己的状态。",
  "今天没有交给自动反应，做得很好。",
  "你正在变得更能掌控自己的时间。",
  "这一天值得被记录下来。",
  "继续把能量留给长期目标。"
];

const streakMantras = [
  "每一次选择，都是在成为更好的自己",
  "把注意力交还给今天真正重要的事",
  "你正在练习掌控，而不是单纯忍耐",
  "先稳住 3 分钟，冲动会自己下降",
  "清醒的一天，会给明天更多底气",
  "今天少一次消耗，明天多一点力量",
  "真正的改变，来自一次次小选择",
  "把时间拿回来，交给睡眠、学习和身体",
  "你不需要完美，只需要继续回来",
  "能停下来，就是一次很实际的进步",
  "冲动会过去，选择会留下",
  "把精力留给想完成的目标",
  "今天的自律，是在给未来存钱",
  "不跟冲动争辩，先换一个环境",
  "你已经开始重新拥有主动权",
  "稳住当下，就是在保护长期状态",
  "少一点自动反应，多一点主动选择",
  "把这一小时，换成更好的自己",
  "不用证明给谁看，自己知道就够了",
  "今天的清醒，会变成明天的轻松"
];

const replacementActions = [
  "散步 10 分钟",
  "做 20 个深蹲",
  "洗把脸，离开房间",
  "整理桌面 5 分钟",
  "看书或学习 15 分钟",
  "给朋友发一句问候"
];

const rescueSteps = [
  "把手机放远一点，站起来离开当前位置。",
  "慢慢吸气 4 秒，呼气 6 秒，重复 5 次。",
  "喝水或洗脸，让身体先换一个状态。",
  "选一个替代行动，只做 3 分钟就好。"
];

const state = loadState();

const el = {
  app: document.querySelector(".app-shell"),
  todayLabel: document.querySelector("#todayLabel"),
  privacyToggle: document.querySelector("#privacyToggle"),
  streakDays: document.querySelector("#streakDays"),
  streakMantra: document.querySelector("#streakMantra"),
  ringValue: document.querySelector("#ringValue"),
  checkinButton: document.querySelector("#checkinButton"),
  checkinText: document.querySelector("#checkinText"),
  savedHours: document.querySelector("#savedHours"),
  timeEquivalent: document.querySelector("#timeEquivalent"),
  totalDays: document.querySelector("#totalDays"),
  encouragement: document.querySelector("#encouragement"),
  weekRow: document.querySelector("#weekRow"),
  viewRecords: document.querySelector("#viewRecords"),
  weekOpen: document.querySelector("#weekOpen"),
  averageMinutes: document.querySelector("#averageMinutes"),
  exportBackup: document.querySelector("#exportBackup"),
  importBackup: document.querySelector("#importBackup"),
  backupFile: document.querySelector("#backupFile"),
  urgeButton: document.querySelector("#urgeButton"),
  actionButton: document.querySelector("#actionButton"),
  noteButton: document.querySelector("#noteButton"),
  suggestedAction: document.querySelector("#suggestedAction"),
  sheet: document.querySelector("#sheet"),
  sheetTitle: document.querySelector("#sheetTitle"),
  sheetContent: document.querySelector("#sheetContent")
};

let timerId = null;
let rescueSeconds = 180;
let renderedDateKey = "";

init();

function init() {
  backfillInitialCheckIns();
  el.todayLabel.textContent = formatToday();
  el.averageMinutes.value = state.averageMinutes;
  el.suggestedAction.textContent = pickDaily(replacementActions);
  el.encouragement.textContent = state.todayChecked ? pickDaily(encouragements) : encouragements[0];
  bindEvents();
  render();
  registerServiceWorker();
}

function bindEvents() {
  el.checkinButton.addEventListener("click", () => {
    const today = dateKey(new Date());
    if (!state.checkIns.includes(today)) {
      state.checkIns.push(today);
      state.lastQuoteIndex = getNextEncouragementIndex();
      saveState();
      render();
      showCheckedSheet();
    }
  });

  el.averageMinutes.addEventListener("change", () => {
    const value = Number(el.averageMinutes.value);
    state.averageMinutes = Math.min(240, Math.max(10, Number.isFinite(value) ? value : 60));
    el.averageMinutes.value = state.averageMinutes;
    saveState();
    render();
  });

  el.privacyToggle.addEventListener("click", () => {
    state.privacy = !state.privacy;
    saveState();
    render();
  });

  el.exportBackup.addEventListener("click", exportBackup);
  el.importBackup.addEventListener("click", () => el.backupFile.click());
  el.backupFile.addEventListener("change", importBackup);
  el.viewRecords.addEventListener("click", showRecordsSheet);
  el.weekOpen.addEventListener("click", showRecordsSheet);
  el.urgeButton.addEventListener("click", showRescueSheet);
  el.actionButton.addEventListener("click", showActionsSheet);
  el.noteButton.addEventListener("click", showNotesSheet);
  el.sheet.addEventListener("click", (event) => {
    if (event.target.closest("[data-close-sheet]")) closeSheet();
  });

  window.addEventListener("focus", refreshForCurrentDay);
  window.addEventListener("pageshow", refreshForCurrentDay);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) refreshForCurrentDay();
  });
  setInterval(refreshForCurrentDay, 60 * 1000);
}

function render() {
  const today = dateKey(new Date());
  renderedDateKey = today;
  el.todayLabel.textContent = formatToday();
  state.checkIns = [...new Set(state.checkIns)].sort();
  state.todayChecked = state.checkIns.includes(today);

  const streak = calculateStreak(state.checkIns);
  const total = state.checkIns.length;
  const savedMinutes = total * state.averageMinutes;
  const savedHours = savedMinutes / 60;
  const progress = Math.min(360, (streak / 30) * 360);

  el.streakDays.textContent = streak;
  el.streakMantra.textContent = getStreakMantra(streak);
  el.ringValue.textContent = streak;
  el.savedHours.textContent = `${formatHours(savedHours)} 小时`;
  el.timeEquivalent.textContent = getTimeEquivalent(savedMinutes);
  el.totalDays.textContent = `${total} 天`;
  el.checkinText.textContent = state.todayChecked ? "今天已签到" : "今日签到";
  el.checkinButton.classList.toggle("checked", state.todayChecked);
  el.checkinButton.disabled = state.todayChecked;
  el.encouragement.textContent = state.todayChecked
    ? encouragements[state.lastQuoteIndex % encouragements.length]
    : getDailyEncouragement();
  el.app.classList.toggle("privacy", state.privacy);
  document.documentElement.style.setProperty("--progress", `${progress}deg`);
  renderWeek();
}

function renderWeek() {
  const now = new Date();
  const firstDay = new Date(now);
  firstDay.setDate(now.getDate() - 6);
  const labels = ["日", "一", "二", "三", "四", "五", "六"];
  el.weekRow.innerHTML = "";

  Array.from({ length: 7 }).forEach((_, index) => {
    const date = new Date(firstDay);
    date.setDate(firstDay.getDate() + index);
    const key = dateKey(date);
    const item = document.createElement("div");
    const label = labels[date.getDay()];
    item.className = [
      "day-dot",
      state.checkIns.includes(key) ? "done" : "",
      key === dateKey(now) ? "today" : ""
    ].join(" ");
    item.innerHTML = `<span>${label}</span><span>${date.getDate()}</span>`;
    el.weekRow.appendChild(item);
  });
}

function showCheckedSheet() {
  openSheet("签到完成", `
    <div class="rescue-timer" style="--timer-progress: 360deg">+1</div>
    <ul class="sheet-list">
      <li>${el.encouragement.textContent}</li>
      <li>今天预计节省 ${state.averageMinutes} 分钟。把这段时间交给睡眠、运动、学习，都会变成复利。</li>
    </ul>
    <div class="sheet-actions">
      <button class="secondary" type="button" data-close-sheet>稍后再看</button>
      <button type="button" id="sheetAction">做个替代行动</button>
    </div>
  `);
  document.querySelector("#sheetAction").addEventListener("click", showActionsSheet);
}

function showRescueSheet() {
  rescueSeconds = 180;
  openSheet("冲动急救", `
    <div class="rescue-timer" id="rescueTimer">3:00</div>
    <ul class="sheet-list">
      ${rescueSteps.map((step) => `<li>${step}</li>`).join("")}
    </ul>
    <div class="sheet-actions">
      <button class="secondary" type="button" data-close-sheet>先关闭</button>
      <button type="button" id="startRescue">开始 3 分钟</button>
    </div>
  `);
  document.querySelector("#startRescue").addEventListener("click", startRescueTimer);
}

function showActionsSheet() {
  openSheet("替代行动", `
    <ul class="sheet-list">
      ${replacementActions.map((action) => `<li>${action}</li>`).join("")}
    </ul>
    <div class="sheet-actions">
      <button class="secondary" type="button" data-close-sheet>先记下</button>
      <button type="button" data-close-sheet>现在去做</button>
    </div>
  `);
}

function showNotesSheet() {
  const notes = state.notes.slice(-4).reverse();
  openSheet("记录诱因", `
    <form class="note-form" id="noteForm">
      <textarea class="note-input" id="noteInput" maxlength="160" placeholder="现在是什么状态？比如：无聊、压力大、熬夜、刷短视频之后……"></textarea>
      <button type="submit">保存记录</button>
    </form>
    <div class="note-list" id="noteList">
      ${
        notes.length
          ? notes.map((note) => `
              <article>
                <time>${note.time}</time>
                <p>${escapeHtml(note.text)}</p>
              </article>
            `).join("")
          : `<article><p>还没有记录。写下来不是批评自己，是为了看见触发点。</p></article>`
      }
    </div>
  `);
  document.querySelector("#noteForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const input = document.querySelector("#noteInput");
    const text = input.value.trim();
    if (!text) return;
    state.notes.push({ text, time: formatDateTime(new Date()) });
    saveState();
    showNotesSheet();
  });
}

function showRecordsSheet() {
  const calendar = getRecordCalendarDays();
  const recent = [...state.checkIns].sort().reverse();
  openSheet("签到记录", `
    <div class="records-summary">
      <article>
        <span>累计签到</span>
        <strong>${state.checkIns.length} 天</strong>
      </article>
      <article>
        <span>连续坚持</span>
        <strong>${calculateStreak(state.checkIns)} 天</strong>
      </article>
    </div>
    <div class="record-calendar" aria-label="签到日历">
      ${calendar.map((day) => `
        <span class="${day.checked ? "done" : ""} ${day.isToday ? "today" : ""}">
          <small>${day.weekday}</small>
          <strong>${day.day}</strong>
        </span>
      `).join("")}
    </div>
    <div class="record-history">
      <h3>全部签到日期</h3>
      ${
        recent.length
          ? `<ul>${recent.map((day) => `<li>${formatRecordDate(day)}</li>`).join("")}</ul>`
          : `<p>还没有签到记录。</p>`
      }
    </div>
    <div class="sheet-actions">
      <button class="secondary" type="button" id="undoTodayInSheet">撤销今天</button>
      <button type="button" data-close-sheet>关闭</button>
    </div>
  `);

  document.querySelector("#undoTodayInSheet").addEventListener("click", () => {
    const today = dateKey(new Date());
    state.checkIns = state.checkIns.filter((day) => day !== today);
    saveState();
    render();
    showRecordsSheet();
  });
}

function openSheet(title, content) {
  clearInterval(timerId);
  el.sheetTitle.textContent = title;
  el.sheetContent.innerHTML = content;
  el.sheet.hidden = false;
}

function closeSheet() {
  clearInterval(timerId);
  el.sheet.hidden = true;
}

function exportBackup() {
  const backup = {
    app: "energy-checkin",
    version: 1,
    exportedAt: new Date().toISOString(),
    data: {
      checkIns: state.checkIns,
      notes: state.notes,
      averageMinutes: state.averageMinutes,
      lastQuoteIndex: state.lastQuoteIndex,
      privacy: state.privacy,
      seededFromDate: state.seededFromDate
    }
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `energy-checkin-backup-${dateKey(new Date())}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showBackupResult("备份已导出", "请把这个 JSON 文件保存到 iCloud、微信文件或其他安全位置。");
}

function importBackup(event) {
  const file = event.target.files?.[0];
  event.target.value = "";
  if (!file) return;

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      const parsed = JSON.parse(String(reader.result));
      const data = parsed.data || parsed;
      const nextState = normalizeBackupData(data);
      if (!nextState) throw new Error("invalid backup");
      if (!window.confirm("导入备份会覆盖当前本地数据，确定继续吗？")) return;

      state.checkIns = nextState.checkIns;
      state.notes = nextState.notes;
      state.averageMinutes = nextState.averageMinutes;
      state.lastQuoteIndex = nextState.lastQuoteIndex;
      state.privacy = nextState.privacy;
      state.seededFromDate = nextState.seededFromDate;
      saveState();
      el.averageMinutes.value = state.averageMinutes;
      render();
      showBackupResult("备份已恢复", `已恢复 ${state.checkIns.length} 天签到记录和 ${state.notes.length} 条诱因记录。`);
    } catch {
      showBackupResult("导入失败", "这个文件不像有效备份，请确认选择的是导出的 JSON 文件。");
    }
  });
  reader.readAsText(file);
}

function showBackupResult(title, message) {
  openSheet(title, `
    <ul class="sheet-list">
      <li>${message}</li>
    </ul>
    <div class="sheet-actions">
      <button type="button" data-close-sheet>知道了</button>
    </div>
  `);
}

function startRescueTimer() {
  const timer = document.querySelector("#rescueTimer");
  const startButton = document.querySelector("#startRescue");
  startButton.disabled = true;
  timerId = setInterval(() => {
    rescueSeconds -= 1;
    const minutes = Math.floor(rescueSeconds / 60);
    const seconds = String(rescueSeconds % 60).padStart(2, "0");
    const progress = ((180 - rescueSeconds) / 180) * 360;
    timer.textContent = `${minutes}:${seconds}`;
    timer.style.setProperty("--timer-progress", `${progress}deg`);
    if (rescueSeconds <= 0) {
      clearInterval(timerId);
      timer.textContent = "完成";
      startButton.textContent = "已经稳住";
      startButton.disabled = false;
    }
  }, 1000);
}

function calculateStreak(days) {
  const set = new Set(days);
  const cursor = new Date();
  if (!set.has(dateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let count = 0;
  while (set.has(dateKey(cursor))) {
    count += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}

function backfillInitialCheckIns() {
  if (state.seededFromDate === BACKFILL_START_DATE) return;

  const start = parseDateKey(BACKFILL_START_DATE);
  const end = parseDateKey(BACKFILL_END_DATE);
  const dates = [];
  const cursor = new Date(start);

  while (cursor <= end) {
    dates.push(dateKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  state.checkIns = [...new Set([...state.checkIns, ...dates])].sort();
  state.seededFromDate = BACKFILL_START_DATE;
  state.lastQuoteIndex = getNextEncouragementIndex();
  saveState();
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return {
      checkIns: Array.isArray(saved?.checkIns) ? saved.checkIns : [],
      notes: Array.isArray(saved?.notes) ? saved.notes : [],
      averageMinutes: Number(saved?.averageMinutes) || 60,
      lastQuoteIndex: Number(saved?.lastQuoteIndex) || 0,
      privacy: Boolean(saved?.privacy),
      seededFromDate: saved?.seededFromDate || "",
      todayChecked: false
    };
  } catch {
    return {
      checkIns: [],
      notes: [],
      averageMinutes: 60,
      lastQuoteIndex: 0,
      privacy: false,
      seededFromDate: "",
      todayChecked: false
    };
  }
}

function normalizeBackupData(data) {
  if (!data || !Array.isArray(data.checkIns)) return null;
  const checkIns = [...new Set(data.checkIns.filter(isDateKey))].sort();
  const notes = Array.isArray(data.notes)
    ? data.notes
        .filter((note) => note && typeof note.text === "string")
        .map((note) => ({
          text: note.text.slice(0, 160),
          time: typeof note.time === "string" ? note.time : ""
        }))
    : [];
  const averageMinutes = Math.min(240, Math.max(10, Number(data.averageMinutes) || 60));

  return {
    checkIns,
    notes,
    averageMinutes,
    lastQuoteIndex: Number(data.lastQuoteIndex) || 0,
    privacy: Boolean(data.privacy),
    seededFromDate: typeof data.seededFromDate === "string" ? data.seededFromDate : ""
  };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function refreshForCurrentDay() {
  if (dateKey(new Date()) !== renderedDateKey) {
    render();
  }
}

function isDateKey(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateKey(key) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function getRecordCalendarDays() {
  const checked = new Set(state.checkIns);
  const start = state.checkIns.length ? parseDateKey(state.checkIns[0]) : new Date();
  const today = new Date();
  const days = [];
  const cursor = new Date(start);
  const labels = ["日", "一", "二", "三", "四", "五", "六"];

  while (cursor <= today) {
    const key = dateKey(cursor);
    days.push({
      key,
      day: cursor.getDate(),
      weekday: labels[cursor.getDay()],
      checked: checked.has(key),
      isToday: key === dateKey(today)
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}

function formatRecordDate(key) {
  const date = parseDateKey(key);
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short"
  }).format(date);
}

function formatToday() {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "long",
    day: "numeric",
    weekday: "long"
  }).format(new Date());
}

function formatDateTime(date) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function formatHours(hours) {
  return Number.isInteger(hours) ? String(hours) : hours.toFixed(1);
}

function getTimeEquivalent(minutes) {
  if (minutes <= 0) return "签到后会换算成具体收获";
  if (minutes < 60) return `约等于 ${minutes} 分钟专注阅读或学习`;

  const hours = minutes / 60;
  const roundedHours = Number.isInteger(hours) ? hours : Number(hours.toFixed(1));

  if (minutes < 120) return "约等于读完一本《小王子》";
  if (minutes < 180) return "约等于一次完整健身加拉伸";
  if (minutes < 300) return `约等于 ${Math.floor(hours)} 节技能课`;
  if (minutes < 600) return `约等于 ${Math.floor(hours / 2)} 次深度学习`;
  return `约等于 ${roundedHours} 小时投入长期目标`;
}

function getStreakMantra(streak) {
  const todayNumber = Number(dateKey(new Date()).replaceAll("-", ""));
  const index = (todayNumber + streak) % streakMantras.length;
  return streakMantras[index];
}

function getDailyEncouragement() {
  const todayNumber = Number(dateKey(new Date()).replaceAll("-", ""));
  return encouragements[todayNumber % encouragements.length];
}

function getNextEncouragementIndex() {
  const todayNumber = Number(dateKey(new Date()).replaceAll("-", ""));
  const currentIndex = Number(state.lastQuoteIndex) || 0;
  return (todayNumber + state.checkIns.length + currentIndex + 7) % encouragements.length;
}

function pickDaily(items) {
  const index = new Date().getDate() % items.length;
  return items[index];
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    navigator.serviceWorker.register("./service-worker.js").then((registration) => {
      registration.update().catch(() => {});
      if (registration.waiting) {
        registration.waiting.postMessage({ type: "SKIP_WAITING" });
      }
      registration.addEventListener("updatefound", () => {
        const worker = registration.installing;
        if (!worker) return;
        worker.addEventListener("statechange", () => {
          if (worker.state === "installed" && navigator.serviceWorker.controller) {
            worker.postMessage({ type: "SKIP_WAITING" });
          }
        });
      });
    }).catch(() => {});
  }
}
