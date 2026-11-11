Ergebnis der Karte [Benachrichtigungsdienst für Students](https://github.com/alsiesta/cohort-005-project/issues/1). Jede Entscheidung unten verweist auf das Ticket, das sie im Detail festhält. Begriffe nach `GLOSSARY.md` (Branch `alex_notification-service`): **Student**, **Platform Admin**, **Team Admin**, **Notification**, **Unread Notification**, **Announcement**, **Expired Announcement**, **Seat**, **Lapsed**.

## Problem Statement

Students erfahren heute nur zufällig, was auf Cadence passiert. Hat ein Platform Admin über ihren Refund Request entschieden, kommt eine E-Mail, aber in Cadence selbst sehen sie davon nichts. Antwortet jemand auf ihren Kommentar, kommt in einem ihrer Kurse eine neue Lektion dazu oder löst jemand einen Seat ihrer Team Licence ein, merken sie das nur, wenn sie zufällig an der richtigen Stelle nachsehen. Platform Admins haben keinen Weg, allen Students oder den Students bestimmter Kurse etwas mitzuteilen. Wer zusätzlich per E-Mail informiert werden möchte, kann das nirgends einstellen.

## Solution

Cadence bekommt eigene **Notifications**, selbst gebaut in der bestehenden SQLite-Datenbank. Postmark bleibt der einzige Drittanbieter und verschickt nur die E-Mails ([ADR 0013](https://github.com/alsiesta/cohort-005-project/blob/alex_notification-service/docs/adr/0013-build-notifications-in-house.md)).

- **Glocke mit Badge** oben rechts öffnet eine **Inbox-Seitenleiste** mit den Abschnitten *Angepinnt*, *Neu* und *Früher*.
- **Nach dem Login** erscheint ein Dialog „Willkommen zurück“ mit allen ungelesenen Notifications, die dort noch nie gezeigt wurden.
- **Während der Sitzung** kündigt ein Toast neue Notifications an.
- **Platform Admins** schreiben **Announcements** an alle Students oder an die Students gewählter Kurse, optional mit Ablaufdatum, und können sie zurückziehen.
- **E-Mail ist Opt-in pro Art**, standardmäßig aus, mit Double-Opt-in und einem Abmeldelink ohne Login. Nur die Refund-Entscheidung wird immer gemailt.

## User Stories

**Notifications empfangen**

1. Als Student möchte ich eine Notification bekommen, wenn ein Platform Admin über meinen Refund Request entscheidet, damit ich das Ergebnis auch in Cadence sehe.
2. Als Student möchte ich eine Notification bekommen, wenn jemand anderes (Student oder Instructor) auf meinen Kommentar antwortet, damit ich die Diskussion fortsetzen kann.
3. Als Student möchte ich keine Notification bekommen, wenn ich selbst auf meinen Kommentar antworte, damit meine Inbox nicht voller eigener Aktionen ist.
4. Als Student möchte ich bei einer Antwort im Thread nur dann benachrichtigt werden, wenn sie auf **meinen** Kommentar antwortet, damit ich nicht für fremde Unterhaltungen benachrichtigt werde.
5. Als Student möchte ich erfahren, wenn in einem Kurs, in dem ich eingeschrieben bin, neue Lektionen erscheinen, damit ich weiterlernen kann.
6. Als Student möchte ich neue Lektionen eines Kurses als **eine** Notification pro Tag sehen („3 neue Lektionen in X“), damit mich ein Instructor, der viel veröffentlicht, nicht mit Notifications überflutet.
7. Als Student möchte ich, dass eine gebündelte Lektions-Notification wieder ungelesen wird, wenn am selben Tag weitere Lektionen dazukommen, damit ich diese nicht übersehe.
8. Als Team Admin möchte ich eine Notification bekommen, wenn jemand einen Seat meiner Team Licence einlöst, damit ich weiß, wer die Licence nutzt.
9. Als Team Admin möchte ich keine „Seat eingelöst“-Notification bekommen, wenn ich selbst einen Seat einlöse.
10. Als Student möchte ich eine gelöschte Antwort als „Diese Antwort wurde gelöscht“ mit Link zur Lektion sehen, damit die Notification nicht ins Leere führt.

**Glocke, Inbox und Login-Dialog**

11. Als Student möchte ich oben rechts eine Glocke mit der Zahl meiner ungelesenen Notifications sehen, damit ich auf einen Blick weiß, ob es Neues gibt.
12. Als Student möchte ich mit einem Klick auf die Glocke eine Seitenleiste mit meinen Notifications öffnen, ohne die aktuelle Seite zu verlassen.
13. Als Student möchte ich aktive Announcements mit Ablaufdatum oben unter *Angepinnt* sehen, bis sie ablaufen, damit wichtige Hinweise nicht nach unten rutschen.
14. Als Student möchte ich ungelesene Notifications unter *Neu* und gelesene unter *Früher* sehen.
15. Als Student möchte ich unter *Früher* auch abgelaufene Announcements finden, damit ich sie später nachlesen kann.
16. Als Student möchte ich „Alle als gelesen markieren“ können, damit ich schnell aufräumen kann.
17. Als Student möchte ich, dass eine Notification erst durch einen Klick auf den Eintrag oder ihren Link gelesen wird und nicht schon durch das Öffnen der Seitenleiste, damit nichts unbemerkt als gelesen gilt.
18. Als Student möchte ich, dass der Gelesen-Status auf allen meinen Geräten gilt.
19. Als Student möchte ich nach dem Login einen Dialog „Willkommen zurück“ mit meinen ungelesenen Notifications sehen, damit ich nichts verpasse.
20. Als Student möchte ich im Login-Dialog *Verstanden* (alle gezeigten gelesen) oder *Später* (bleiben ungelesen) wählen können.
21. Als Student möchte ich jede Notification höchstens einmal im Login-Dialog sehen, damit mich der Dialog nicht bei jedem Login mit denselben Einträgen nervt.
22. Als Student möchte ich, dass abgelaufene Announcements weder im Badge zählen noch im Login-Dialog erscheinen.
23. Als Student möchte ich einen Toast sehen, wenn während meiner Sitzung eine neue Notification entsteht, damit ich sie sofort bemerke.
24. Als Student möchte ich für Notifications, die schon beim Laden der Seite da waren, keinen Toast sehen, damit sie nicht doppelt (Dialog **und** Toast) erscheinen.
25. Als Student mit mehreren offenen Tabs möchte ich, dass ein Tab, zu dem ich zurückkehre, Badge und Inbox still aktualisiert, ohne alte Toasts nachzuholen.
26. Als Student möchte ich unten in der Seitenleiste einen dezenten Hinweis „Auch per E-Mail benachrichtigt werden? → Einstellungen“ sehen.
27. Als Student möchte ich, dass die Seitenleiste unter *Früher* nur die letzten 50 Einträge zeigt, damit sie übersichtlich bleibt.

**Announcements (Platform Admin)**

28. Als Platform Admin möchte ich ein Announcement mit Titel, kurzem Markdown-Text und optionalem Link mit Button-Text schreiben können.
29. Als Platform Admin möchte ich ein Announcement an alle Students oder an die Students gewählter Kurse schicken können. Lapsed Students sind ausgeschlossen.
30. Als Platform Admin möchte ich ein optionales Ablaufdatum setzen können, nach dem das Announcement nicht mehr angepinnt wird.
31. Als Platform Admin möchte ich, dass das Absenden sofort zurückkehrt, auch wenn Tausende E-Mails folgen.
32. Als Platform Admin möchte ich, dass die Empfänger beim Absenden feststehen, damit klar ist, wer das Announcement bekommen hat.
33. Als Platform Admin möchte ich ein Announcement zurückziehen können, damit es bei allen Empfängern verschwindet und noch nicht verschickte E-Mails gestrichen werden.
34. Als Platform Admin möchte ich statt Bearbeiten zurückziehen und neu senden, damit niemand eine Fassung sieht, die es nicht mehr gibt.
35. Als Platform Admin möchte ich pro Announcement sehen, wie viele E-Mails versandt, fehlgeschlagen, ausstehend und gestrichen sind.
36. Als Platform Admin möchte ich sehen, an welche Kurse ein Announcement ging.

**E-Mail-Einstellungen**

37. Als Student möchte ich auf `/settings` unter „Profile“ einen Abschnitt „Notifications“ mit einem E-Mail-Schalter pro Art finden: Announcements, Antworten auf meine Kommentare, Neue Lektionen, Seat eingelöst (nur für Team Admins).
38. Als Student möchte ich, dass alle E-Mail-Schalter standardmäßig aus sind.
39. Als Student möchte ich, dass die Notifications in Cadence immer an sind, damit ich nichts Wichtiges verpasse.
40. Als Student möchte ich beim ersten Einschalten einer E-Mail-Art eine Bestätigungs-E-Mail bekommen und erst nach dem Klick E-Mails erhalten, damit niemand fremde Adressen eintragen kann.
41. Als Student möchte ich bis zur Bestätigung „Bestätigung ausstehend“ am Schalter sehen.
42. Als Student möchte ich nach der Bestätigung weitere Arten ohne erneute Bestätigung einschalten können.
43. Als Student möchte ich, dass ein abgelaufener Bestätigungslink (nach 7 Tagen) nichts mehr bewirkt, und ich den Schalter erneut einschalten kann.
44. Als Student möchte ich in jeder Opt-in-E-Mail „Diese E-Mails abbestellen“ anklicken können, ohne mich einzuloggen, und damit nur diese Art abschalten.
45. Als Student möchte ich, dass eine Abmeldung sofort gilt, auch für E-Mails, die schon in der Warteschlange stehen.
46. Als Student möchte ich, dass mein Mailprogramm die One-Click-Abmeldung (`List-Unsubscribe`) anbietet.
47. Als Student möchte ich die Refund-Entscheidung immer per E-Mail bekommen, ohne Abmeldelink und ohne Werbung.
48. Als Student möchte ich pro Kurs und Tag höchstens eine E-Mail zu neuen Lektionen bekommen, und zwar bei der ersten Lektion des Tages.
49. Als Student möchte ich in jeder E-Mail sehen, dass sie von Cadence kommt, mit Links zu Impressum und Datenschutzerklärung.
50. Als Student möchte ich, dass meine Öffnungen und Klicks in E-Mails nicht verfolgt werden.

**Betrieb und Recht**

51. Als Betreiber möchte ich jede Einwilligung und jeden Widerruf mit Zeitpunkt, Quelle und Textversion protokolliert haben, damit ich die Einwilligung nachweisen kann.
52. Als Betreiber möchte ich, dass Notifications nach 12 Monaten, Refund-E-Mails nach 6 Jahren und Einwilligungsnachweise 3 Jahre nach Widerruf automatisch gelöscht werden, damit die Speicherbegrenzung der DSGVO eingehalten wird.
53. Als Betreiber möchte ich, dass vorübergehende Postmark-Fehler automatisch erneut versucht werden und ein Neustart des Servers keine E-Mails verliert.
54. Als Betreiber möchte ich, dass eine doppelt ausgeführte Aktion keine doppelte Notification erzeugt.
55. Als Betreiber möchte ich, dass Announcement-E-Mails über einen eigenen Broadcast-Stream gehen, damit ihre Bounces die Zustellbarkeit der Refund-E-Mails nicht verschlechtern.

**Entwicklung**

56. Als Entwickler möchte ich nach `npm run db:seed` Beispiel-Notifications aller Arten sehen (aktives, abgelaufenes, zurückgezogenes Announcement, gelesen und ungelesen, Opt-ins), damit ich die Oberfläche sofort ausprobieren kann.
57. Als Entwickler möchte ich im DevUI-Panel „Test-Notification an mich“ klicken können, um Polling und Toast zu testen.
58. Als Entwickler möchte ich im DevUI-Panel „E-Mails jetzt verschicken“ klicken können, statt auf den Timer zu warten.
59. Als Entwickler möchte ich lokal jede E-Mail als Datei in `.outbox/` sehen, mit Stream, Headern und klickbarem Abmelde- bzw. Bestätigungslink.

## Implementation Decisions

**Architektur** ([Welchen Anbieter nehmen wir, und wie wird er angebunden?](https://github.com/alsiesta/cohort-005-project/issues/7))
- Eigenbau in der bestehenden SQLite-Datei über Drizzle. Keine Notification-Plattform. Postmark nur für E-Mail.
- Ein neues **Modul `notifications.server`** kapselt alles: Notifications erzeugen, Announcements senden und zurückziehen, Inbox, Badge und Login-Dialog abfragen, als gelesen markieren, Opt-in, Bestätigung, Abmelden, Zahlen für den Platform Admin. Jede Funktion bekommt `db` und `now` übergeben, wie `refunds.server`.
- Die bestehenden Stellen rufen dieses Modul auf, statt selbst E-Mails zu schicken: die Refund-Entscheidung (die heute direkt `sendEmail` aufruft), die Antwort auf einen Kommentar (in der Lektion und in den Instructor-Fragen), eine neue Lektion in einem veröffentlichten Kurs und das Einlösen eines Seats.

**Ereignisse** ([Welche System-Ereignisse lösen eine Benachrichtigung aus?](https://github.com/alsiesta/cohort-005-project/issues/3))

| Art (`kind`) | Empfänger | E-Mail |
|---|---|---|
| Refund-Entscheidung (genehmigt / abgelehnt) | Käufer | immer, Transaktions-Stream |
| Antwort auf Kommentar | Autor des Kommentars, auf den geantwortet wird (nicht bei eigener Antwort) | Opt-in |
| Neue Lektionen | Students mit Enrollment im veröffentlichten Kurs, gebündelt pro Kurs und Tag (Europe/Berlin) | Opt-in, nur bei der ersten Lektion des Tages |
| Seat eingelöst | Team Admin (nicht beim eigenen Seat) | Opt-in |
| Announcement | gewählte Zielgruppe | Opt-in, Broadcast-Stream |

**Datenmodell** ([Wie sieht das Datenmodell für Notifications aus?](https://github.com/alsiesta/cohort-005-project/issues/11), ergänzt durch [Wie setzen wir die rechtlichen Vorgaben für Notification-E-Mails um?](https://github.com/alsiesta/cohort-005-project/issues/13))

| Tabelle | Inhalt |
|---|---|
| `announcements` | Titel, Markdown-Text, optionaler Link plus Button-Text, Absender (Platform Admin), `expiresAt`, `withdrawnAt`, `createdAt` |
| `announcement_courses` | `(announcementId, courseId)`; leer = an alle Students. Nur zur Anzeige. |
| `notifications` | eine Zeile pro Student und Notification: `kind`, `userId`, Verweis (`announcementId` / `refundId` / `commentId` / `courseId` + `bundleDate` / `couponId`), `createdAt`, `lastActivityAt`, `readAt`, `welcomedAt` |
| `notification_lessons` | `(notificationId, lessonId)` für die gebündelten neuen Lektionen |
| `notification_email_preferences` | aktueller Stand: `(userId, kind, optedInAt)`, Zeile = Opt-in an |
| `notification_consent_events` | Protokoll, in das nur angehängt wird: `userId`, E-Mail-Adresse, `kind`, Ereignis (erteilt / widerrufen / Adresse bestätigt), Zeitpunkt, Quelle (Einstellungsseite / Abmeldelink / Bestätigungsmail), Version des Einwilligungstexts |
| `notification_emails` | `notificationId`, `stream` (broadcast / transactional), `status` (pending / sent / failed / cancelled), `attempts`, `nextAttemptAt`, `sentAt`, `lastError`; bei Refund-E-Mails zusätzlich verschickter Betreff und Text |
| `users` (neue Spalte) | `notificationEmailConfirmedAt` |

- **Eindeutige Indizes** pro Anlass: `refundId`, `commentId`, `couponId`, und für neue Lektionen `(userId, courseId, bundleDate)`.
- **System-Notifications** speichern nur Art und Verweis. Den Text baut Cadence beim Anzeigen aus den aktuellen Daten.
- **Announcements**: Text einmal gespeichert, eine `notifications`-Zeile pro Empfänger, alles in einer Transaktion. Lapsed Students sind ausgeschlossen.
- **Zurückziehen** setzt `withdrawnAt`. Alle Abfragen blenden das Announcement dann aus, und ausstehende E-Mails werden `cancelled`.
- **Abgeleitet statt gespeichert**: „Angepinnt“ heißt `expiresAt` in der Zukunft und nicht zurückgezogen. „Abgelaufen“ heißt `expiresAt` in der Vergangenheit.
- **Neue Lektion zu einem bestehenden Tagesbündel**: Zeile in `notification_lessons` einfügen, `readAt` und `welcomedAt` zurücksetzen und `lastActivityAt` neu setzen. Sortierung und Toasts richten sich nach `lastActivityAt`.
- Migration über den Skill `database-migrations`, Seed entsprechend erweitern.

**Gelesen-Status** ([Wann gilt eine Notification als gelesen?](https://github.com/alsiesta/cohort-005-project/issues/8))
- **Gelesen durch**: Klick auf den Eintrag oder seinen Link (Seitenleiste, Toast, Login-Dialog oder E-Mail-Link, der in Cadence landet), *Verstanden* im Login-Dialog, „Alle als gelesen markieren“.
- **Nicht gelesen durch**: Öffnen der Seitenleiste, Anzeigen eines Toasts, *Später*, Öffnen einer E-Mail.
- **Login-Dialog**: erscheint nur, wenn es ungelesene Notifications gibt, deren `welcomedAt` noch leer ist. Er setzt `welcomedAt` für die gezeigten.
- In v1 gibt es kein „als ungelesen markieren“.

**Darstellung** ([Wie sehen die Darstellungsformen aus?](https://github.com/alsiesta/cohort-005-project/issues/5); Prototyp auf dem Wegwerf-Branch `prototype/notification-display`)
- Glocke und Login-Dialog wie Variante A, Seitenleiste wie Variante C. Keine Banner.
- Toasts über das bereits eingebundene `sonner`.
- Den Markdown-Text eines Announcements sicher rendern (kein rohes HTML).

**Aktualisierung offener Seiten** ([Wie erfährt eine offene Seite von neuen Notifications?](https://github.com/alsiesta/cohort-005-project/issues/9))
- Eine Resource-Route (z. B. `/api/notifications`) liefert die Zahl der ungelesenen Notifications und neue Einträge.
- Abgefragt wird alle 60 s, sofort bei Rückkehr in den Tab und bei jeder Navigation. Nur der sichtbare Tab fragt ab.
- Toasts gibt es nur für Notifications, deren `lastActivityAt` nach dem Laden der Seite liegt.

**E-Mail-Versand** ([Wie gehen E-Mails an viele Students gleichzeitig raus?](https://github.com/alsiesta/cohort-005-project/issues/10))
- Actions verschicken nichts selbst, sondern legen `notification_emails`-Zeilen mit Status `pending` an.
- **`processPendingEmails({ db, transport, now })`** erledigt einen Durchgang und kehrt zurück. Im Server ruft ein Timer sie auf (z. B. alle 10 s). Nach einem Neustart arbeitet sie die übrigen E-Mails ab.
- **Direkt vor dem Senden** prüft sie: Gilt das Opt-in noch? Ist die Adresse bestätigt? Ist das Announcement nicht abgelaufen und nicht zurückgezogen? Andernfalls wird die E-Mail übersprungen bzw. auf `cancelled` gesetzt. Die Adresse wird erst jetzt aus `users` gelesen.
- **Postmark-Batch-Endpunkt**: bis zu 500 E-Mails pro Aufruf. Fehler kommen pro E-Mail im Ergebnis-Array zurück.
- **Fehler**: Bei vorübergehenden Fehlern (Netzwerk, 5xx, 429) bis zu 3 neue Versuche mit wachsendem Abstand, danach `failed`. Bei dauerhaften Fehlern (Postmark lehnt ab) sofort `failed`. Bounce-Webhooks verfolgen wir nicht.
- **Streams**: Announcements über einen Broadcast-Stream, alles andere über `outbound` (Transaktion).
- `MailTransport` bekommt einen Batch-Versand. Der lokale Transport schreibt eine Datei pro E-Mail nach `.outbox/`, mit `stream` und Headern.
- **Zahlen für den Platform Admin**: Join über `notifications.announcementId`, gruppiert nach `status`.

**Einstellungen, Bestätigung und Abmelden** ([Wie fein sind die Benachrichtigungs-Einstellungen?](https://github.com/alsiesta/cohort-005-project/issues/6), [Wie setzen wir die rechtlichen Vorgaben für Notification-E-Mails um?](https://github.com/alsiesta/cohort-005-project/issues/13))
- **Abschnitt „Notifications“ auf `/settings`** direkt unter „Profile“, ein Schalter pro Art. „Seat eingelöst“ sehen nur Team Admins.
- **Double-Opt-in**: Beim ersten Einschalten ohne bestätigte Adresse geht eine Bestätigungs-E-Mail (Transaktions-Stream) raus. Der Link ist ein signiertes Token ohne Login und 7 Tage gültig. Bis zur Bestätigung zeigt der Schalter „Bestätigung ausstehend“.
- **Abmeldelink**: ein signiertes HMAC-Token über `(userId, kind)` mit Server-Secret, nicht gespeichert. Er wirkt ohne Login und schaltet genau diese Art ab. Dazu kommen die Header `List-Unsubscribe` und `List-Unsubscribe-Post` (One-Click) auf denselben Endpunkt.
- **Protokoll**: Jede Änderung schreibt `notification_email_preferences` und `notification_consent_events` in einer Transaktion.

**Inhalt der E-Mails**
- Text-Footer: Absender „Cadence“, Links zu Impressum und Datenschutzerklärung, Pflichtangaben zur Firma aus der Konfiguration, bei Opt-in-Arten der Abmeldelink.
- Postmark-Tracking ist aus (`TrackOpens: false`, `TrackLinks: None`).
- Die Refund-E-Mail enthält keine Werbung und keinen Abmeldelink.

**Aufbewahrung**
- Täglicher Durchgang im selben Hintergrundprozess:
  - Notifications und ihre E-Mail-Zeilen 12 Monate nach `lastActivityAt` löschen, außer bei noch angepinnten Announcements.
  - Refund-E-Mail-Zeilen nach 6 Jahren löschen.
  - Einwilligungsprotokoll 3 Jahre nach dem Widerruf löschen.
- Die Fristen stehen unter dem Vorbehalt einer anwaltlichen Prüfung.

**DevUI-Panel** ([Wie werden Notifications lokal und in Tests ausprobiert?](https://github.com/alsiesta/cohort-005-project/issues/14))
- Neuer Abschnitt „Notifications“ mit „Test-Notification an mich“ und „E-Mails jetzt verschicken“. Letzterer ruft `processPendingEmails` auf.

## Testing Decisions

- **Gute Tests** prüfen nur von außen sichtbares Verhalten über die öffentlichen Funktionen: Was sieht ein Student in Inbox, Badge und Login-Dialog? Welche E-Mails gehen raus? Sie prüfen keine internen Tabellenzustände, wenn es eine Abfrage-Funktion dafür gibt.
- **Teststelle 1: `notifications.server`**: Integrationstests gegen `createTestDb()` und `seedBaseData()` mit festem `now`, wie `refunds.server.test.ts`. Abgedeckt werden:
  - Announcement an alle oder an Kurse senden (Lapsed Students ausgeschlossen); Empfänger, die erst danach dazukommen, bekommen es nicht.
  - Zurückziehen blendet aus und streicht ausstehende E-Mails; Ablaufen wirkt auf Anpinnen, Badge und Login-Dialog.
  - Neue Lektionen: Bündelung pro Kurs und Tag, wieder ungelesen, nur eine E-Mail.
  - Keine Notification an sich selbst, keine doppelten.
  - Gelesen-Regeln und höchstens einmal im Login-Dialog.
  - Opt-in, Double-Opt-in (inklusive abgelaufenem Token), Abmelden per Token, Einträge im Protokoll.
  - Zahlen für den Platform Admin.
- **Teststelle 2: `processPendingEmails`** mit einem Test-Transport, der vorübergehende und dauerhafte Fehler simulieren kann, wie `mailer.server.test.ts`. Abgedeckt werden:
  - Batch-Versand, Wahl des Streams.
  - Opt-in-, Bestätigungs- und Announcement-Prüfung direkt vor dem Senden.
  - Neue Versuche und Abbruch.
  - Löschfristen.
- **Bestehende Stellen** (Refund-Entscheidung, Kommentar-Antwort, Lektion anlegen, Seat einlösen): Die Tests prüfen nur, dass die erwartete Notification entsteht. Die bestehenden Refund-Tests bleiben grün.
- **Oberfläche** (Polling, Toasts, Seitenleiste): wird von Hand über das DevUI-Panel und die Seed-Daten getestet. Es kommen keine Browsertests dazu.
- Vor dem Abschluss: `npm run typecheck`, dann `npm run test`.

## Out of Scope

- Push-Benachrichtigungen (Browser/Mobile) und SMS.
- Benachrichtigungen als kostenpflichtiges Zusatzfeature.
- Erinnerungen und Marketing (Inaktivität, Kursabschluss, Preisaktionen).
- Announcement-Erweiterungen: geplanter Versand, Zielgruppe „Students mit Claimed Seat auf einer Team Licence“, Bearbeiten.
- Instructors als Absender, andere Rollen als Empfänger.
- Sammel-E-Mails (Digest), „als ungelesen markieren“, HTML-E-Mails mit Vorschauseite, Bounce-Webhooks, Liste der fehlgeschlagenen E-Mails pro Student, „Erneut senden“.

## Further Notes

**Voraussetzungen (nicht Teil dieses Features)**
- Seiten für Impressum und Datenschutzerklärung, mit Inhalten vom Betreiber. Die Datenschutzerklärung nennt die Löschfristen und Postmark als Auftragsverarbeiter (USA, SCCs).
- Ein Broadcast-Stream in Postmark und Server-Secrets für die Abmelde- und Bestätigungs-Tokens.

**Vor dem Livegang klären**
- Mit einem Anwalt (siehe [Was verlangt das Recht von Notification-E-Mails?](https://github.com/alsiesta/cohort-005-project/issues/12)):
  - Reichen Schalter plus Bestätigungs-E-Mail als Nachweis der Einwilligung?
  - Gelten Antwort- und Lektions-E-Mails als Werbung?
  - Welche Firmenangaben gehören je nach Rechtsform in jede E-Mail?
  - Welche Löschfristen gelten konkret?
- Beim Postmark-Support die Freischaltung „Manage unsubscribes on your own“ für den Broadcast-Stream beantragen. **Plan B**, falls Postmark ablehnt: Announcement-E-Mails nutzen Postmarks eigenen Abmeldelink, und ein Webhook übernimmt die Abmeldung in die Einstellung „Announcements“.

