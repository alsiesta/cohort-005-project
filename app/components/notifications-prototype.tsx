// PROTOTYPE — throwaway. Answers "Wie sehen die Darstellungsformen aus?"
// Three variants of how a Student sees Notifications, mounted in the app
// layout and switched via ?variant=A|B|C. All data is in-memory mock data
// from the agreed event catalogue; nothing is persisted.
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { toast } from "sonner";
import {
  Bell,
  Megaphone,
  X,
  RotateCcw,
  Zap,
  Receipt,
  MessageSquare,
  BookOpen,
  Users,
} from "lucide-react";
import { PrototypeSwitcher } from "~/components/prototype-switcher";

type Kind = "announcement" | "refund" | "reply" | "lessons" | "seat";

type Notification = {
  id: number;
  kind: Kind;
  title: string;
  body: string;
  when: string;
  link?: { label: string; href: string };
  expiresIn?: string;
  read: boolean;
};

const INITIAL: Notification[] = [
  {
    id: 1,
    kind: "announcement",
    title: "Wartung am Samstag",
    body: "Cadence ist am Samstag von 8–10 Uhr nicht erreichbar.",
    when: "vor 1 Std.",
    expiresIn: "läuft in 3 Tagen ab",
    read: false,
  },
  {
    id: 2,
    kind: "refund",
    title: "Refund Request genehmigt",
    body: "Dein Refund Request für „Introduction to TypeScript“ wurde genehmigt. 79 $ gehen zurück.",
    when: "vor 3 Std.",
    link: { label: "Details", href: "/settings" },
    read: false,
  },
  {
    id: 3,
    kind: "reply",
    title: "Neue Antwort auf deinen Kommentar",
    body: "Ein Instructor hat auf deine Frage in „Generics verstehen“ geantwortet.",
    when: "gestern",
    link: { label: "Zur Antwort", href: "/courses" },
    read: false,
  },
  {
    id: 4,
    kind: "lessons",
    title: "3 neue Lektionen in „Advanced React“",
    body: "Modul 5 ist jetzt verfügbar.",
    when: "vor 2 Tagen",
    link: { label: "Zum Kurs", href: "/courses" },
    read: true,
  },
  {
    id: 5,
    kind: "announcement",
    title: "Neuer Kurs: Node.js Streams",
    body: "Ab heute verfügbar – für alle Students.",
    when: "vor 5 Tagen",
    link: { label: "Ansehen", href: "/courses" },
    read: true,
  },
];

const LIVE_EVENTS: Omit<Notification, "id" | "read" | "when">[] = [
  {
    kind: "seat",
    title: "Seat eingelöst",
    body: "Anna hat einen Seat deiner Team Licence für „Advanced React“ eingelöst.",
    link: { label: "Team", href: "/team" },
  },
  {
    kind: "reply",
    title: "Neue Antwort auf deinen Kommentar",
    body: "Ein Student hat auf deinen Kommentar in „Hooks im Detail“ geantwortet.",
    link: { label: "Zur Antwort", href: "/courses" },
  },
  {
    kind: "announcement",
    title: "Neue AGB ab 1. Dezember",
    body: "Wir haben unsere Nutzungsbedingungen aktualisiert.",
    link: { label: "Lesen", href: "/" },
    expiresIn: "läuft in 14 Tagen ab",
  },
];

const ICON: Record<Kind, typeof Bell> = {
  announcement: Megaphone,
  refund: Receipt,
  reply: MessageSquare,
  lessons: BookOpen,
  seat: Users,
};

const VARIANTS = [
  { key: "A", name: "Login-Dialog + Glocke" },
  { key: "B", name: "Banner + Toasts" },
  { key: "C", name: "Inbox-Seitenleiste" },
];

// ─── Shared state (identical for every variant; only rendering differs) ───

function usePrototypeState() {
  const [items, setItems] = useState(INITIAL);
  const [loginCount, setLoginCount] = useState(1);
  const [loginNoticeDone, setLoginNoticeDone] = useState(false);
  const [dismissedBanners, setDismissedBanners] = useState<number[]>([]);
  const nextEvent = useRef(0);

  return {
    items,
    loginCount,
    loginNoticeDone,
    dismissedBanners,
    unread: items.filter((n) => !n.read),
    markRead: (id: number) =>
      setItems((xs) => xs.map((n) => (n.id === id ? { ...n, read: true } : n))),
    markAllRead: () => setItems((xs) => xs.map((n) => ({ ...n, read: true }))),
    finishLoginNotice: () => setLoginNoticeDone(true),
    dismissBanner: (id: number) => setDismissedBanners((xs) => [...xs, id]),
    simulateLogin: () => {
      setLoginCount((c) => c + 1);
      setLoginNoticeDone(false);
    },
    fireEvent: () => {
      const e = LIVE_EVENTS[nextEvent.current % LIVE_EVENTS.length];
      nextEvent.current++;
      const n: Notification = {
        ...e,
        id: Date.now(),
        when: "gerade eben",
        read: false,
      };
      setItems((xs) => [n, ...xs]);
      return n;
    },
  };
}

type State = ReturnType<typeof usePrototypeState>;

// ─── Root: mounts the chosen variant plus the switcher ───

export function NotificationsPrototype() {
  const [searchParams] = useSearchParams();
  const variant = searchParams.get("variant") ?? "A";
  const s = usePrototypeState();
  const [showState, setShowState] = useState(false);

  function fire() {
    const n = s.fireEvent();
    if (variant !== "C") {
      toast(n.title, {
        description: n.body,
        icon: <Icon kind={n.kind} />,
        action: n.link
          ? { label: n.link.label, onClick: () => s.markRead(n.id) }
          : undefined,
      });
    }
  }

  return (
    <>
      {variant === "A" && <VariantA s={s} />}
      {variant === "B" && <VariantB s={s} />}
      {variant === "C" && <VariantC s={s} />}

      {showState && (
        <pre className="fixed bottom-20 left-1/2 z-[60] max-h-72 w-[28rem] -translate-x-1/2 overflow-auto rounded-lg bg-black/90 p-3 text-xs text-green-300 shadow-2xl">
          {JSON.stringify(
            {
              variant,
              loginCount: s.loginCount,
              loginNoticeDone: s.loginNoticeDone,
              unread: s.unread.map((n) => n.title),
              dismissedBanners: s.dismissedBanners,
            },
            null,
            2
          )}
        </pre>
      )}

      <PrototypeSwitcher variants={VARIANTS}>
        <span className="mx-1 h-5 w-px bg-white/30" />
        <button
          onClick={s.simulateLogin}
          className="flex items-center gap-1 rounded-full px-2 py-1 hover:bg-white/20"
          title="Neuer Login simulieren"
        >
          <RotateCcw className="size-3.5" /> Login
        </button>
        <button
          onClick={fire}
          className="flex items-center gap-1 rounded-full px-2 py-1 hover:bg-white/20"
          title="Neues Ereignis während der Sitzung"
        >
          <Zap className="size-3.5" /> Ereignis
        </button>
        <button
          onClick={() => setShowState((v) => !v)}
          className="rounded-full px-2 py-1 font-mono hover:bg-white/20"
        >
          {"{}"}
        </button>
      </PrototypeSwitcher>
    </>
  );
}

function Icon({ kind, className = "size-4" }: { kind: Kind; className?: string }) {
  const I = ICON[kind];
  return <I className={className} />;
}

function Badge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
      {count}
    </span>
  );
}

// ─── Variant A: one-time dialog after login + bell with dropdown inbox ───

function VariantA({ s }: { s: State }) {
  const [open, setOpen] = useState(false);
  const showDialog = !s.loginNoticeDone && s.unread.length > 0;

  return (
    <>
      <div className="fixed right-6 top-4 z-40">
        <button
          onClick={() => setOpen((o) => !o)}
          className="relative rounded-full border bg-background p-2 shadow-sm hover:bg-muted"
        >
          <Bell className="size-5" />
          <Badge count={s.unread.length} />
        </button>
        {open && (
          <div className="absolute right-0 mt-2 w-96 rounded-lg border bg-popover shadow-xl">
            <div className="flex items-center justify-between border-b px-4 py-2">
              <span className="font-semibold">Notifications</span>
              <button onClick={s.markAllRead} className="text-xs text-muted-foreground hover:underline">
                Alle als gelesen markieren
              </button>
            </div>
            <ul className="max-h-96 divide-y overflow-y-auto">
              {s.items.map((n) => (
                <li
                  key={n.id}
                  onClick={() => s.markRead(n.id)}
                  className={`flex cursor-pointer gap-3 px-4 py-3 hover:bg-muted ${n.read ? "opacity-60" : ""}`}
                >
                  <Icon kind={n.kind} className="mt-0.5 size-4 shrink-0" />
                  <div className="flex-1 text-sm">
                    <div className="font-medium">{n.title}</div>
                    <div className="text-muted-foreground">{n.body}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{n.when}</div>
                  </div>
                  {!n.read && <span className="mt-1.5 size-2 rounded-full bg-blue-500" />}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-[32rem] rounded-xl bg-background p-6 shadow-2xl">
            <h2 className="text-xl font-bold">Willkommen zurück!</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Seit deinem letzten Besuch ist {s.unread.length === 1 ? "eine Sache" : `${s.unread.length} Dinge`} passiert:
            </p>
            <ul className="mb-6 space-y-3">
              {s.unread.map((n) => (
                <li key={n.id} className="flex gap-3 rounded-lg border p-3">
                  <Icon kind={n.kind} className="mt-0.5 size-5 shrink-0" />
                  <div className="text-sm">
                    <div className="font-medium">{n.title}</div>
                    <div className="text-muted-foreground">{n.body}</div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex justify-end gap-2">
              <button onClick={s.finishLoginNotice} className="rounded-md px-4 py-2 text-sm hover:bg-muted">
                Später
              </button>
              <button
                onClick={() => {
                  s.markAllRead();
                  s.finishLoginNotice();
                }}
                className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
              >
                Verstanden
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Variant B: sticky banners for Announcements, toasts for the rest ───

function VariantB({ s }: { s: State }) {
  const [listOpen, setListOpen] = useState(false);
  const banners = s.items.filter(
    (n) => n.kind === "announcement" && n.expiresIn && !s.dismissedBanners.includes(n.id)
  );

  // On each login, the unread non-Announcement Notifications pop as toasts.
  useEffect(() => {
    if (s.loginNoticeDone) return;
    s.unread
      .filter((n) => n.kind !== "announcement")
      .forEach((n, i) =>
        setTimeout(
          () => toast(n.title, { description: n.body, icon: <Icon kind={n.kind} /> }),
          300 * i
        )
      );
    s.finishLoginNotice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.loginCount]);

  return (
    <div className="pointer-events-none fixed left-56 right-0 top-0 z-40">
      {banners.map((n) => (
        <div
          key={n.id}
          className="pointer-events-auto flex items-center gap-3 bg-amber-400 px-6 py-2 text-sm text-amber-950 shadow"
        >
          <Megaphone className="size-4 shrink-0" />
          <span className="font-semibold">{n.title}</span>
          <span className="flex-1">{n.body}</span>
          {n.link && <a href={n.link.href} className="underline">{n.link.label}</a>}
          <button onClick={() => s.dismissBanner(n.id)} className="rounded p-1 hover:bg-amber-500">
            <X className="size-4" />
          </button>
        </div>
      ))}
      <div className="pointer-events-auto flex justify-end px-6 py-1">
        <button
          onClick={() => setListOpen((o) => !o)}
          className="rounded-full border bg-background px-3 py-1 text-xs shadow-sm hover:bg-muted"
        >
          {s.unread.length} ungelesen · {listOpen ? "Schließen" : "Alle Notifications"}
        </button>
      </div>
      {listOpen && (
        <div className="pointer-events-auto mx-6 rounded-lg border bg-background shadow-xl">
          <table className="w-full text-sm">
            <tbody>
              {s.items.map((n) => (
                <tr key={n.id} className={`border-b last:border-0 ${n.read ? "text-muted-foreground" : ""}`}>
                  <td className="w-8 px-3 py-2"><Icon kind={n.kind} /></td>
                  <td className="py-2 font-medium">{n.title}</td>
                  <td className="py-2">{n.body}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-xs">{n.when}</td>
                  <td className="px-3 py-2">
                    {!n.read && (
                      <button onClick={() => s.markRead(n.id)} className="text-xs underline">
                        gelesen
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Variant C: right-hand inbox drawer, opens itself on login, no toasts ───

function VariantC({ s }: { s: State }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!s.loginNoticeDone && s.unread.length > 0) setOpen(true);
    s.finishLoginNotice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.loginCount]);

  const pinned = s.items.filter((n) => n.kind === "announcement" && n.expiresIn);
  const fresh = s.items.filter((n) => !n.read && !pinned.includes(n));
  const earlier = s.items.filter((n) => n.read && !pinned.includes(n));

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed right-0 top-1/3 z-40 flex flex-col items-center gap-1 rounded-l-lg border border-r-0 bg-background px-2 py-3 shadow-md hover:bg-muted"
      >
        <span className="relative">
          <Bell className="size-5" />
          <Badge count={s.unread.length} />
        </span>
        <span className="text-[10px] [writing-mode:vertical-rl]">Inbox</span>
      </button>

      <aside
        className={`fixed right-0 top-0 z-50 flex h-screen w-[26rem] flex-col border-l bg-background shadow-2xl transition-transform ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <header className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="text-lg font-bold">Inbox</h2>
          <button onClick={() => setOpen(false)} className="rounded p-1 hover:bg-muted">
            <X className="size-5" />
          </button>
        </header>
        <div className="flex-1 space-y-6 overflow-y-auto p-5">
          {pinned.length > 0 && (
            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Angepinnt</h3>
              {pinned.map((n) => (
                <div key={n.id} className="mb-2 rounded-lg border-2 border-amber-400 bg-amber-50 p-3 text-sm dark:bg-amber-950">
                  <div className="flex items-center gap-2 font-semibold"><Megaphone className="size-4" />{n.title}</div>
                  <p className="mt-1">{n.body}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{n.expiresIn}</p>
                </div>
              ))}
            </section>
          )}
          <Group title="Neu" items={fresh} s={s} />
          <Group title="Früher" items={earlier} s={s} />
        </div>
        <footer className="border-t p-3 text-right">
          <button onClick={s.markAllRead} className="text-xs underline">Alle als gelesen markieren</button>
        </footer>
      </aside>
    </>
  );
}

function Group({ title, items, s }: { title: string; items: Notification[]; s: State }) {
  if (items.length === 0) return null;
  return (
    <section>
      <h3 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">{title}</h3>
      <ul className="space-y-1">
        {items.map((n) => (
          <li
            key={n.id}
            onClick={() => s.markRead(n.id)}
            className={`flex cursor-pointer gap-3 rounded-md p-2 hover:bg-muted ${n.read ? "opacity-60" : ""}`}
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
              <Icon kind={n.kind} />
            </span>
            <div className="text-sm">
              <div className="font-medium">{n.title}</div>
              <div className="text-muted-foreground">{n.body}</div>
              <div className="mt-0.5 flex gap-3 text-xs text-muted-foreground">
                <span>{n.when}</span>
                {n.link && <a href={n.link.href} className="underline">{n.link.label}</a>}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
