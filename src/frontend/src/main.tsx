import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Check,
  CheckCheck,
  ChevronDown,
  CircleHelp,
  Clock3,
  FileText,
  FolderLock,
  Heart,
  LayoutDashboard,
  Leaf,
  LockKeyhole,
  Menu,
  MoreHorizontal,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Upload,
  Users,
  X,
  AlertTriangle,
  Activity,
  Send,
  CalendarDays,
} from "lucide-react";
import {
  Capsule,
  Policy,
  cancelRelease,
  initialPolicy,
  policyErrors,
  seedCapsules,
} from "./domain";
import "./styles.css";
const phases = {
  draft: "Черновик",
  active: "Готова к передаче",
  waiting: "Период ожидания",
  paused: "Выдача приостановлена",
};
const nav = [
  { id: "overview", label: "Обзор", icon: LayoutDashboard },
  { id: "capsules", label: "Мои капсулы", icon: FolderLock },
  { id: "people", label: "Близкие люди", icon: Users },
  { id: "activity", label: "Активность", icon: Activity },
  { id: "settings", label: "Настройки", icon: Settings2 },
];
const people = [
  {
    name: "Алия Самат",
    initials: "АС",
    role: "Получатель · доверенное лицо",
    accepted: true,
  },
  {
    name: "Данияр Самат",
    initials: "ДС",
    role: "Получатель · доверенное лицо",
    accepted: true,
  },
  {
    name: "Марат Самат",
    initials: "МС",
    role: "Доверенное лицо",
    accepted: false,
  },
];
function Dialog({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement;
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    return () => {
      document.body.style.overflow = old;
      prev?.focus();
    };
  }, []);
  return (
    <div
      className="overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`dialog ${wide ? "wide" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        ref={ref}
        tabIndex={-1}
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
          if (e.key === "Tab") {
            const els = Array.from(
              ref.current!.querySelectorAll<HTMLElement>(
                'button:not(:disabled),input,textarea,select,[tabindex="0"]',
              ),
            );
            const first = els[0],
              last = els.at(-1);
            if (e.shiftKey && (document.activeElement === first || document.activeElement === ref.current)) {
              e.preventDefault();
              last?.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
              e.preventDefault();
              first?.focus();
            }
          }
        }}
      >
        <div className="dialog-head">
          <div>
            <span className="eyebrow">MURA / ЛИЧНОЕ ПРОСТРАНСТВО</span>
            <h2>{title}</h2>
          </div>
          <button
            className="icon-button"
            aria-label="Закрыть"
            onClick={onClose}
          >
            <X />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
function App() {
  const [page, setPage] = useState("overview"),
    [mobile, setMobile] = useState(false),
    [capsules, setCapsules] = useState(seedCapsules),
    [policy, setPolicy] = useState(initialPolicy),
    [query, setQuery] = useState(""),
    [filter, setFilter] = useState("all"),
    [wizard, setWizard] = useState(false),
    [detail, setDetail] = useState<string | null>(null),
    [cancel, setCancel] = useState(false),
    [cancelText, setCancelText] = useState(""),
    [notice, setNotice] = useState(""),
    [help, setHelp] = useState(false),
    [checked, setChecked] = useState(false),
    [notifications, setNotifications] = useState(false);
  const [events, setEvents] = useState([
    {
      title: "Капсула «Самое важное для семьи» обновлена",
      date: "Сегодня, 10:42",
      icon: "capsule",
    },
    {
      title: "Алия приняла ваше приглашение",
      date: "5 ноября, 16:20",
      icon: "person",
    },
    {
      title: "Проверка активности пройдена",
      date: "4 ноября, 09:00",
      icon: "check",
    },
  ]);
  const flash = (s: string) => setNotice(s);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 4500);
    return () => clearTimeout(timer);
  }, [notice]);
  const addEvent = (title: string) =>
    setEvents((old) => [
      { title, date: "Только что · демо", icon: "check" },
      ...old,
    ]);
  const navigate = (id: string) => {
    setPage(id);
    setMobile(false);
    setQuery("");
    setFilter("all");
  };
  const selected = capsules.find((c) => c.id === detail);
  const visible = capsules.filter(
    (c) =>
      (filter === "all" || c.phase === filter) &&
      `${c.title} ${c.recipient}`.toLowerCase().includes(query.toLowerCase()),
  );
  const checkin = () => {
    if (checked) return;
    setChecked(true);
    addEvent("Демонстрационная проверка активности пройдена");
    flash(
      "Вы отметились. Следующая проверка — через " + policy.interval + " дней.",
    );
  };
  return (
    <div className="shell">
      <aside className={`sidebar ${mobile ? "open" : ""}`}>
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate("overview");
          }}
        >
          <span className="brand-symbol">
            <Leaf size={27} />
          </span>
          MURA<span className="brand-dot">®</span>
        </a>
        <div className="workspace">
          <span className="avatar small">АС</span>
          <div>
            Личное пространство<small>Демо-аккаунт</small>
          </div>
          <ChevronDown size={15} />
        </div>
        <div className="nav-caption">ВАШЕ НАСЛЕДИЕ</div>
        <nav>
          {nav.map((n) => (
            <button
              key={n.id}
              className={page === n.id ? "selected" : ""}
              aria-current={page === n.id ? "page" : undefined}
              onClick={() => navigate(n.id)}
            >
              <n.icon size={19} />
              <span>{n.label}</span>
              {n.id === "capsules" && (
                <span className="nav-count">{capsules.length}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="private-note">
            <ShieldCheck size={21} />
            <strong>Личное остаётся личным</strong>
            <p>Вы решаете, кому и когда передать самое важное.</p>
          </div>
          <button className="help-link" onClick={() => setHelp(true)}>
            <CircleHelp size={18} />
            Как работает MURA
            <ArrowRight size={16} />
          </button>
          <div className="profile">
            <span className="avatar">АС</span>
            <div>
              Айбын Самат<small>Владелец пространства</small>
            </div>
            <span className="online-dot" />
          </div>
        </div>
      </aside>
      {mobile && <div className="nav-scrim" onClick={() => setMobile(false)} />}
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button menu-toggle"
              aria-label="Открыть меню"
              onClick={() => setMobile(true)}
            >
              <Menu />
            </button>
            <span>Моё пространство</span>
            <span className="slash">/</span>
            <strong>{nav.find((n) => n.id === page)?.label}</strong>
          </div>
          <div className="top-actions">
            <span className="demo-pill">
              <span />
              Демо-версия
            </span>
            <button
              className="icon-button notification-button"
              aria-label="Уведомления"
              onClick={() => setNotifications(true)}
            >
              <Bell size={20} />
              <i />
            </button>
            <span className="avatar small">АС</span>
          </div>
        </header>
        <main>
          <div className="demo-banner">
            <Sparkles size={15} />
            <span>
              Интерактивный прототип · данные хранятся только до перезагрузки.
              Сервер и шифрование пока не подключены.
            </span>
          </div>
          <div className="page-heading">
            <div>
              <div className="eyebrow">ПРОСТРАНСТВО ЗАБОТЫ</div>
              <h1>
                {page === "overview"
                  ? "Важное — в надёжных руках."
                  : page === "capsules"
                    ? "Ваши капсулы."
                    : page === "people"
                      ? "Люди, которым вы доверяете."
                      : page === "activity"
                        ? "Каждое действие на виду."
                        : "Всё под вашим контролем."}
              </h1>
              <p>
                {page === "overview"
                  ? "Сохраните то, что имеет значение. Для тех, кто имеет значение."
                  : page === "capsules"
                    ? "Истории, инструкции и сообщения, которые однажды помогут вашим близким."
                    : page === "people"
                      ? "Получатели наследия и доверенные лица — разные роли в одном круге заботы."
                      : page === "activity"
                        ? "История изменений, проверок и приглашений в вашем пространстве."
                        : "Настройте ритм проверок и условия передачи цифрового наследия."}
              </p>
            </div>
            {(page === "overview" || page === "capsules") && (
              <button
                className="button primary"
                onClick={() => setWizard(true)}
              >
                <Plus size={18} />
                Создать капсулу
              </button>
            )}
          </div>
          {page === "overview" && (
            <>
              <section className="hero">
                <div className="hero-copy">
                  <div className="hero-label">
                    <span /> ВЫ НА СВЯЗИ. ВСЁ В ПОРЯДКЕ.
                  </div>
                  <h2>
                    Забота о будущем.
                    <br />
                    <em>Спокойствие сегодня.</em>
                  </h2>
                  <p>
                    Ваши капсулы ждут своего времени.
                    <br />
                    Пока вы рядом, всё остаётся под вашим контролем.
                  </p>
                  <button
                    className="button light"
                    onClick={checkin}
                    disabled={checked}
                  >
                    {checked ? <CheckCheck size={18} /> : <Check size={18} />}
                    {checked ? "Вы отметились" : "Со мной всё хорошо"}
                    {!checked && <ArrowRight size={17} />}
                  </button>
                  <span className="hero-footnote">
                    {checked
                      ? "Проверка пройдена в этой демо-сессии"
                      : `Следующая проверка через ${policy.interval} дней · демонстрация`}
                  </span>
                </div>
                <div className="hero-art" aria-hidden="true">
                  <div className="orbit orbit-one" />
                  <div className="orbit orbit-two" />
                  <div className="orbit orbit-three" />
                  <div className="capsule-object">
                    <div className="capsule-top">
                      <Leaf size={39} strokeWidth={1} />
                    </div>
                    <div className="capsule-bottom">
                      <span>M</span>
                    </div>
                  </div>
                  <div className="art-caption">
                    <span>СОХРАНИТЬ.</span>
                    <span>ПОЗАБОТИТЬСЯ.</span>
                    <span>ПЕРЕДАТЬ.</span>
                  </div>
                </div>
                <span className="hero-number">
                  01 / ВАША ИСТОРИЯ ПРОДОЛЖАЕТСЯ
                </span>
              </section>
              <div className="stats">
                <div>
                  <span className="stat-icon">
                    <FolderLock />
                  </span>
                  <div>
                    <small>Капсулы</small>
                    <strong>
                      {String(capsules.length).padStart(2, "0")}
                      <span>
                        {capsules.filter((c) => c.phase === "draft").length} в
                        черновиках
                      </span>
                    </strong>
                  </div>
                </div>
                <div>
                  <span className="stat-icon">
                    <Users />
                  </span>
                  <div>
                    <small>Доверенные лица</small>
                    <strong>
                      02<span>из 3 приняли приглашение</span>
                    </strong>
                  </div>
                </div>
                <div>
                  <span className="stat-icon">
                    <ShieldCheck />
                  </span>
                  <div>
                    <small>Условия передачи</small>
                    <strong>
                      {policy.threshold} из 3
                      <span>+ {policy.waiting} дней ожидания</span>
                    </strong>
                  </div>
                </div>
              </div>
            </>
          )}
          {(page === "overview" || page === "capsules") && (
            <>
              <div className="section-heading">
                <div>
                  <h2>
                    {page === "overview" ? "Ваши капсулы" : "Коллекция капсул"}{" "}
                    <span>{capsules.length}</span>
                  </h2>
                  <p>Маленькие проявления большой заботы.</p>
                </div>
                {page === "overview" ? (
                  <button
                    className="text-button"
                    onClick={() => navigate("capsules")}
                  >
                    Все капсулы <ArrowRight size={16} />
                  </button>
                ) : (
                  <div className="tools">
                    <label className="search">
                      <Search size={16} />
                      <input
                        aria-label="Поиск капсул"
                        placeholder="Найти капсулу"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                      />
                    </label>
                    <select
                      aria-label="Статус капсул"
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                    >
                      <option value="all">Все статусы</option>
                      <option value="active">Готовые</option>
                      <option value="draft">Черновики</option>
                      <option value="waiting">Ожидание</option>
                      <option value="paused">Приостановленные</option>
                    </select>
                  </div>
                )}
              </div>
              <div className="capsule-grid">
                {(page === "overview" ? capsules.slice(0, 3) : visible).map(
                  (c) => (
                    <button
                      className={`capsule-card ${c.color}`}
                      key={c.id}
                      onClick={() => setDetail(c.id)}
                    >
                      <div className="card-top">
                        <span className="card-icon">
                          {c.category === "Личное сообщение" ? (
                            <Heart size={22} />
                          ) : c.category === "Деловые доступы" ? (
                            <FolderLock size={22} />
                          ) : (
                            <FileText size={22} />
                          )}
                        </span>
                        <MoreHorizontal size={20} />
                      </div>
                      <span className={`status ${c.phase}`}>
                        <span />
                        {phases[c.phase]}
                      </span>
                      <h3>{c.title}</h3>
                      <p>{c.category}</p>
                      <div className="card-rule" />
                      <div className="card-recipient">
                        <span className="avatar tiny">{c.initials}</span>
                        <div>
                          <small>Для получателя</small>
                          <strong>{c.recipient}</strong>
                        </div>
                        <ArrowRight size={18} />
                      </div>
                    </button>
                  ),
                )}
              </div>
              {page === "capsules" && visible.length === 0 && (
                <div className="empty">
                  <Search />
                  <h3>Капсул пока не найдено</h3>
                  <p>Попробуйте другое название или измените фильтр.</p>
                  <button
                    className="button secondary"
                    onClick={() => {
                      setQuery("");
                      setFilter("all");
                    }}
                  >
                    Сбросить поиск
                  </button>
                </div>
              )}
            </>
          )}
          {page === "overview" && (
            <div className="lower-grid">
              <section className="activity-panel">
                <div className="section-heading compact">
                  <h2>Последние события</h2>
                  <button
                    className="text-button"
                    onClick={() => navigate("activity")}
                  >
                    История <ArrowRight size={15} />
                  </button>
                </div>
                {events.slice(0, 3).map((e, i) => (
                  <div className="event" key={i}>
                    <span className="event-icon">
                      {e.icon === "person" ? (
                        <Users size={17} />
                      ) : e.icon === "capsule" ? (
                        <FolderLock size={17} />
                      ) : (
                        <Check size={17} />
                      )}
                    </span>
                    <div>
                      <strong>{e.title}</strong>
                      <small>{e.date}</small>
                    </div>
                  </div>
                ))}
              </section>
              <section className="how-panel">
                <span className="eyebrow">ПРОСТО О ВАЖНОМ</span>
                <h2>
                  Передача без
                  <br />
                  случайностей.
                </h2>
                <p>
                  Проверка активности, подтверждение близких и время на отмену —
                  три этапа перед передачей.
                </p>
                <button className="text-button" onClick={() => setHelp(true)}>
                  Как это устроено <ArrowRight size={16} />
                </button>
                <ShieldCheck
                  className="watermark"
                  size={110}
                  strokeWidth={0.7}
                />
              </section>
            </div>
          )}
          {page === "people" && (
            <>
              <section className="info-strip">
                <ShieldCheck />
                <div>
                  <strong>
                    Доверенное лицо подтверждает событие. Получатель получает
                    капсулу.
                  </strong>
                  <p>
                    Совмещать роли можно. Для готовности нужны минимум{" "}
                    {policy.threshold} согласившихся доверенных лица.
                  </p>
                </div>
              </section>
              <div className="people-grid">
                {people.map((p) => (
                  <article className="person-card" key={p.name}>
                    <span className="avatar large">{p.initials}</span>
                    <h3>{p.name}</h3>
                    <p>{p.role}</p>
                    <span
                      className={`status ${p.accepted ? "active" : "draft"}`}
                    >
                      <span />
                      {p.accepted ? "Приглашение принято" : "Ожидает ответа"}
                    </span>
                    {!p.accepted && (
                      <button
                        className="text-button"
                        onClick={() =>
                          flash(
                            "Демо: отправка приглашений будет доступна после подключения сервера.",
                          )
                        }
                      >
                        <Send size={15} />
                        Напомнить о приглашении
                      </button>
                    )}
                  </article>
                ))}
              </div>
              <p className="muted legal-note">
                Показаны вымышленные люди. Ввод и отправка реальных контактов
                будут доступны после подключения согласий и серверного протокола
                приглашений.
              </p>
            </>
          )}
          {page === "activity" && (
            <section className="activity-panel full">
              <div className="section-heading compact">
                <h2>Журнал пространства</h2>
                <span className="muted">Демонстрационная сессия</span>
              </div>
              {events.map((e, i) => (
                <div className="event" key={i}>
                  <span className="event-icon">
                    <Check size={17} />
                  </span>
                  <div>
                    <strong>{e.title}</strong>
                    <small>{e.date}</small>
                  </div>
                </div>
              ))}
            </section>
          )}
          {page === "settings" && (
            <Settings
              policy={policy}
              onSave={(p) => {
                setPolicy(p);
                flash("Настройки применены в демо-сессии.");
                addEvent("Условия передачи обновлены");
              }}
            />
          )}
          <footer>
            <span>
              <Leaf size={14} />
              MURA · С заботой о том, что останется.
            </span>
            <button onClick={() => setHelp(true)}>
              О безопасности <ArrowRight size={13} />
            </button>
            <span>© 2026 MURA</span>
          </footer>
        </main>
      </div>
      {wizard && (
        <Wizard
          policy={policy}
          onClose={() => setWizard(false)}
          onCreate={(c) => {
            setCapsules((old) => [c, ...old]);
            setWizard(false);
            addEvent("Создана демонстрационная капсула «" + c.title + "»");
            flash("Капсула добавлена в демо-сессию.");
            navigate("capsules");
          }}
        />
      )}
      {selected && (
        <Dialog
          title={selected.title}
          onClose={() => {
            setDetail(null);
            setCancel(false);
            setCancelText("");
          }}
        >
          <span className={`status ${selected.phase}`}>
            <span />
            {phases[selected.phase]}
          </span>
          <div className="detail-body">
            <p className="muted">
              {selected.category} · {selected.date}
            </p>
            <p>{selected.note}</p>
            <div className="detail-row">
              <span>Получатель</span>
              <strong>{selected.recipient}</strong>
            </div>
            <div className="detail-row">
              <span>Подтверждения</span>
              <strong>
                {(selected.policy ?? policy).threshold} из 3 доверенных лиц
              </strong>
            </div>
            <div className="detail-row">
              <span>Ожидание до выдачи</span>
              <strong>{(selected.policy ?? policy).waiting} дней</strong>
            </div>
            {selected.files.map((f, i) => (
              <div className="file-row" key={i}>
                <FileText size={18} />
                {f}
                <span>Демо</span>
              </div>
            ))}
          </div>
          <div className="info-strip small-info">
            <LockKeyhole size={18} />
            <p>
              Содержимое показано как демо. Криптографическая защита и реальная
              выдача ещё не реализованы.
            </p>
          </div>
          {selected.phase === "waiting" || selected.phase === "paused" ? (
            <>
              <div className="warning">
                <AlertTriangle size={18} />
                <p>
                  {selected.phase === "paused"
                    ? "Все каналы недоступны. Выдача приостановлена."
                    : "Начался период ожидания. Владелец может отменить процесс до окончательной выдачи."}
                </p>
              </div>
              {cancel ? (
                <div className="cancel-form">
                  <label>
                    Введите ОТМЕНИТЬ для подтверждения демо-действия
                    <input
                      autoFocus
                      value={cancelText}
                      onChange={(e) => setCancelText(e.target.value)}
                    />
                  </label>
                  <button
                    className="button danger"
                    disabled={cancelText !== "ОТМЕНИТЬ"}
                    onClick={() => {
                      setCapsules((old) =>
                        old.map((c) =>
                          c.id === selected.id ? cancelRelease(c) : c,
                        ),
                      );
                      setCancel(false);
                      setCancelText("");
                      addEvent("Демонстрационный процесс выдачи отменён");
                      flash(
                        "Демо-процесс отменён. Реальный сервер не вызывался.",
                      );
                    }}
                  >
                    Подтвердить отмену
                  </button>
                </div>
              ) : (
                <button
                  className="button danger"
                  onClick={() => setCancel(true)}
                >
                  Отменить процесс передачи
                </button>
              )}
            </>
          ) : (
            <div className="demo-controls">
              <span>Посмотреть состояния интерфейса</span>
              <button
                className="button secondary"
                onClick={() =>
                  setCapsules((old) =>
                    old.map((c) =>
                      c.id === selected.id ? { ...c, phase: "waiting" } : c,
                    ),
                  )
                }
              >
                Демо: период ожидания
              </button>
              <button
                className="text-button"
                onClick={() =>
                  setCapsules((old) =>
                    old.map((c) =>
                      c.id === selected.id ? { ...c, phase: "paused" } : c,
                    ),
                  )
                }
              >
                Демо: сбой уведомлений
              </button>
            </div>
          )}
        </Dialog>
      )}
      {help && (
        <Dialog title="Три этапа спокойствия" onClose={() => setHelp(false)}>
          <div className="help-steps">
            {[
              [
                "01",
                "Вы остаётесь на связи",
                `MURA регулярно спрашивает, всё ли хорошо. Интервал — ${policy.interval} дней.`,
              ],
              [
                "02",
                "Близкие подтверждают событие",
                `Если ответа нет, нужны подтверждения от ${policy.threshold} доверенных лиц. Одного пропущенного сообщения недостаточно.`,
              ],
              [
                "03",
                "У вас есть время отменить",
                `Перед передачей предусмотрено ${policy.waiting} дней ожидания. При полном сбое каналов процесс приостанавливается.`,
              ],
            ].map(([n, t, d]) => (
              <div key={n}>
                <span>{n}</span>
                <section>
                  <h3>{t}</h3>
                  <p>{d}</p>
                </section>
              </div>
            ))}
          </div>
          <p className="warning plain">
            Эти правила описывают проектируемую систему. Сейчас доступна только
            демонстрация интерфейса; она не доказывает безопасность механизма.
          </p>
        </Dialog>
      )}
      {notifications && (
        <Dialog title="Уведомления" onClose={() => setNotifications(false)}>
          <div className="event">
            <span className="event-icon">
              <CalendarDays size={18} />
            </span>
            <div>
              <strong>Следующая проверка через {policy.interval} дней</strong>
              <small>Пример уведомления · отправка не подключена</small>
            </div>
          </div>
          <div className="event">
            <span className="event-icon">
              <Users size={18} />
            </span>
            <div>
              <strong>Марат ещё не принял приглашение</strong>
              <small>Демонстрационный статус</small>
            </div>
          </div>
        </Dialog>
      )}
      {notice && (
        <div role="status" className="toast">
          <Check size={18} />
          {notice}
          <button aria-label="Скрыть уведомление" onClick={() => setNotice("")}>
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
function PolicyFields({
  value,
  onChange,
}: {
  value: Policy;
  onChange: (p: Policy) => void;
}) {
  return (
    <>
      <div className="form-grid">
        <label>
          Проверять активность раз в
          <input
            type="number"
            min="1"
            max="180"
            value={value.interval}
            onChange={(e) =>
              onChange({ ...value, interval: Number(e.target.value) })
            }
          />
          <small>От 1 до 180 дней</small>
        </label>
        <label>
          Период ожидания, дней
          <input
            type="number"
            min="1"
            max="60"
            value={value.waiting}
            onChange={(e) =>
              onChange({ ...value, waiting: Number(e.target.value) })
            }
          />
          <small>От 1 до 60 дней</small>
        </label>
      </div>
      <label>
        Сколько доверенных лиц должны подтвердить событие
        <select
          value={value.threshold}
          onChange={(e) =>
            onChange({ ...value, threshold: Number(e.target.value) })
          }
        >
          <option value="2">2 из 3 доверенных лиц</option>
          <option value="3">3 из 3 доверенных лиц</option>
        </select>
        <small>Сейчас 2 человека приняли приглашение.</small>
      </label>
      <fieldset>
        <legend>Каналы проверки активности</legend>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={value.telegram}
            onChange={(e) => onChange({ ...value, telegram: e.target.checked })}
          />
          Telegram
        </label>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={value.sms}
            onChange={(e) => onChange({ ...value, sms: e.target.checked })}
          />
          SMS
        </label>
      </fieldset>
      <div className="info-strip small-info">
        <Clock3 size={18} />
        <p>
          При успешной доставке запросы идут в день проверки, через 2 дня и ещё
          через день. До эскалации — около {value.interval + 3} дней и час на
          последний ответ. Недоставленное уведомление не считается пропуском.
        </p>
      </div>
    </>
  );
}
function Settings({
  policy,
  onSave,
}: {
  policy: Policy;
  onSave: (p: Policy) => void;
}) {
  const [value, setValue] = useState(policy),
    [errors, setErrors] = useState<string[]>([]);
  return (
    <form
      className="settings-panel"
      onSubmit={(e) => {
        e.preventDefault();
        const errs = policyErrors(value, 2);
        setErrors(errs);
        if (!errs.length) onSave(value);
      }}
    >
      <span className="eyebrow">МЕХАНИЗМ ПЕРЕДАЧИ</span>
      <h2>Ваш ритм. Ваши условия.</h2>
      <p className="muted">Изменения действуют только в этой демо-сессии.</p>
      <PolicyFields value={value} onChange={setValue} />
      {errors.length > 0 && (
        <div role="alert" className="form-errors">
          {errors.map((x) => (
            <p key={x}>{x}</p>
          ))}
        </div>
      )}
      <button className="button primary" type="submit">
        Сохранить настройки <Check size={17} />
      </button>
    </form>
  );
}
function Wizard({
  policy,
  onClose,
  onCreate,
}: {
  policy: Policy;
  onClose: () => void;
  onCreate: (c: Capsule) => void;
}) {
  const [step, setStep] = useState(0),
    [title, setTitle] = useState(""),
    [category, setCategory] = useState("Инструкции"),
    [note, setNote] = useState(""),
    [recipient, setRecipient] = useState("Алия Самат"),
    [files, setFiles] = useState<string[]>([]),
    [value, setValue] = useState(policy),
    [errors, setErrors] = useState<string[]>([]);
  const next = () => {
    let es =
      step === 0
        ? !title.trim()
          ? ["Дайте капсуле название."]
          : []
        : step === 2
          ? policyErrors(value, 2)
          : [];
    setErrors(es);
    if (!es.length) setStep((s) => s + 1);
  };
  return (
    <Dialog title="Сохранить важное" onClose={onClose} wide>
      <div className="wizard-progress">
        {["Содержимое", "Получатель", "Условия", "Проверка"].map((s, i) => (
          <div className={i <= step ? "current" : ""} key={s}>
            <span>{i < step ? <Check size={13} /> : i + 1}</span>
            {s}
          </div>
        ))}
      </div>
      <div className="wizard-content">
        <p className="prototype-warning">
          Демо: не вводите пароли, личные документы или другие чувствительные
          данные. Шифрование пока не подключено.
        </p>
        {step === 0 && (
          <>
            <label>
              Название капсулы
              <input
                autoFocus
                maxLength={80}
                placeholder="Например, инструкции для семьи"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>
            <label>
              Что вы хотите сохранить?
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {[
                  "Инструкции",
                  "Личное сообщение",
                  "Файлы и фотографии",
                  "Учётные данные",
                  "Деловые доступы",
                ].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
            <label>
              Сообщение или инструкция
              <textarea
                rows={4}
                maxLength={5000}
                placeholder="Напишите несколько слов для близких…"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </label>
            <label className="upload">
              <Upload size={22} />
              <strong>Добавить пример файла</strong>
              <span>До 50 МБ · только имя файла, без загрузки содержимого</span>
              <input
                type="file"
                multiple
                onChange={(e) => {
                  const fs = Array.from(e.target.files || []);
                  if (fs.some((f) => f.size > 50 * 1024 * 1024)) {
                    setErrors([
                      "Размер каждого файла не должен превышать 50 МБ.",
                    ]);
                    e.target.value = "";
                    return;
                  }
                  setErrors([]);
                  setFiles(fs.map((f) => f.name));
                }}
              />
            </label>
            {files.map((f, i) => (
              <div className="file-row" key={i}>
                <FileText size={16} />
                {f}
                <button
                  className="icon-button"
                  aria-label={"Убрать " + f}
                  onClick={() => setFiles(files.filter((_, n) => n !== i))}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </>
        )}
        {step === 1 && (
          <>
            <h3>Кому адресована эта капсула?</h3>
            <p className="muted">
              Выберите получателя из демонстрационного круга близких.
            </p>
            {people
              .filter((p) => p.accepted)
              .map((p) => (
                <label
                  key={p.name}
                  className={`recipient-option ${recipient === p.name ? "chosen" : ""}`}
                >
                  <input
                    type="radio"
                    name="recipient"
                    checked={recipient === p.name}
                    onChange={() => setRecipient(p.name)}
                  />
                  <span className="avatar">{p.initials}</span>
                  <strong>{p.name}</strong>
                  <span>Получатель</span>
                </label>
              ))}
            <div className="info-strip small-info">
              <Users size={18} />
              <p>
                Получатель сможет открыть капсулу после завершения всех этапов
                передачи. Доверенные лица только подтверждают событие.
              </p>
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <h3>Условия передачи</h3>
            <p className="muted">
              Выберите условия для этой капсулы. Они сохранятся вместе с
              демонстрационным черновиком.
            </p>
            <PolicyFields value={value} onChange={setValue} />
          </>
        )}
        {step === 3 && (
          <>
            <div className="review-icon">
              <FolderLock size={30} />
            </div>
            <h3 className="review-title">Всё важное на своём месте.</h3>
            <div className="detail-row">
              <span>Капсула</span>
              <strong>{title}</strong>
            </div>
            <div className="detail-row">
              <span>Получатель</span>
              <strong>{recipient}</strong>
            </div>
            <div className="detail-row">
              <span>Содержимое</span>
              <strong>
                {category} · {files.length} файлов
              </strong>
            </div>
            <div className="detail-row">
              <span>Проверка / ожидание</span>
              <strong>
                {value.interval} / {value.waiting} дней
              </strong>
            </div>
            <div className="info-strip small-info">
              <LockKeyhole size={18} />
              <p>
                Будет создан демонстрационный черновик. Для реальной готовности
                нужны сервер, криптографическое ядро и подтверждённые
                приглашения.
              </p>
            </div>
          </>
        )}
        {errors.length > 0 && (
          <div className="form-errors" role="alert">
            {errors.map((e) => (
              <p key={e}>{e}</p>
            ))}
          </div>
        )}
      </div>
      <div className="wizard-footer">
        <button
          className="text-button"
          onClick={() => {
            if (step === 0) onClose();
            else {
              setStep((s) => s - 1);
              setErrors([]);
            }
          }}
        >
          <ArrowLeft size={16} />
          {step === 0 ? "Отмена" : "Назад"}
        </button>
        <span>Шаг {step + 1} из 4</span>
        {step < 3 ? (
          <button className="button primary" onClick={next}>
            Продолжить
            <ArrowRight size={16} />
          </button>
        ) : (
          <button
            className="button primary"
            onClick={() =>
              onCreate({
                id: crypto.randomUUID(),
                title: title.trim(),
                category,
                recipient,
                initials: people.find((p) => p.name === recipient)!.initials,
                color: "sage",
                phase: "draft",
                date: new Date().toLocaleDateString("ru-RU"),
                note,
                files,
                policy: value,
              })
            }
          >
            Создать демо-черновик
            <Check size={16} />
          </button>
        )}
      </div>
    </Dialog>
  );
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
