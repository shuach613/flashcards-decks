export type Locale = "en" | "de";

const en = {
  "nav.myDecks": "My Decks",
  "nav.allDecks": "All Decks",
  "nav.admin": "Admin",
  "nav.logOut": "Log out",
  "nav.logIn": "Log in",
  "nav.signUp": "Sign up",

  "home.title": "Flashcard Decks",
  "home.loggedOutBody":
    "Log in or sign up to start studying. If someone sent you a link to a specific deck, open that link directly.",
  "home.yourDecks": "Your decks",
  "home.empty":
    "You haven't opened any decks yet. Open a deck link someone shared with you to get started.",
  "home.lastStudied_one": "Last studied {date} · {count} session",
  "home.lastStudied_other": "Last studied {date} · {count} sessions",
  "home.continue": "Continue",
  "home.restart": "Restart",
  "home.progress": "{good} of {total} cards good",
  "home.done": "Done",

  "common.uncategorized": "Uncategorized",
  "common.titleLabel": "Title",
  "common.descriptionLabel": "Description",
  "common.certificateLabel": "Certificate",
  "common.languageLabel": "Language",
  "common.nameLabel": "Name",
  "common.slugLabel": "Slug (used in the shareable link)",
  "common.selectPlaceholder": "Select…",
  "common.edit": "Edit",
  "common.delete": "Delete",
  "common.save": "Save",
  "common.savePending": "Saving…",
  "common.create": "Create",
  "common.createPending": "Creating…",
  "common.add": "Add",
  "common.addPending": "Adding…",
  "common.import": "Import",
  "common.importPending": "Importing…",
  "common.copyLink": "Copy link",
  "common.copied": "Copied!",
  "common.copyFailed": "Couldn't copy",

  "language.EN": "English",
  "language.DE": "German",

  "auth.emailLabel": "Email",
  "auth.passwordLabel": "Password",
  "auth.passwordHint": "At least 8 characters.",
  "auth.loginTitle": "Log in",
  "auth.loginButton": "Log in",
  "auth.loginButtonPending": "Logging in…",
  "auth.noAccount": "No account?",
  "auth.signupTitle": "Sign up",
  "auth.signupButton": "Sign up",
  "auth.signupButtonPending": "Signing up…",
  "auth.haveAccount": "Already have an account?",
  "auth.invalidCredentials": "Invalid email or password.",
  "auth.emailPasswordRequired": "Email and password are required.",
  "auth.passwordTooShort": "Password must be at least 8 characters.",
  "auth.emailExists": "An account with that email already exists.",
  "auth.accountCreatedPleaseLogin": "Account created — please log in.",

  "deck.cardCount_one": "{count} card",
  "deck.cardCount_other": "{count} cards",
  "deck.noCards": "This deck has no cards yet.",
  "deck.startStudying": "Start studying",
  "deck.continueStudying": "Continue studying",
  "deck.review": "Review deck",
  "deck.restart": "Restart",
  "deck.progress": "{good} of {total} cards marked good",
  "deck.done": "Done",

  "study.cardsLeft_one": "{count} card left · {title}",
  "study.cardsLeft_other": "{count} cards left · {title}",
  "study.tapToReveal": "Tap to reveal",
  "study.again": "Again",
  "study.good": "Good",
  "study.sessionComplete": "Session complete",
  "study.reviewed_one": 'You reviewed {count} card in "{title}".',
  "study.reviewed_other": 'You reviewed {count} cards in "{title}".',
  "study.backToDeck": "Back to deck",
  "study.myDecks": "My decks",
  "study.progress": "{good}/{total} good",
  "study.progressLabel": "Saved deck progress",
  "study.saving": "Saving…",
  "study.saveFailed": "Progress could not be saved. Please try again.",
  "study.alreadyComplete": 'Every card in "{title}" is marked good.',
  "study.studyAgain": "Study again",
  "study.restarting": "Restarting…",
  "study.previouslyGood": "Previously marked good",

  "admin.title": "Admin · Decks",
  "admin.manageCertificates": "Manage certificates",
  "admin.newDeck": "New deck",
  "admin.noDecks": "No decks yet.",
  "admin.titleRequired": "Title is required.",
  "admin.certificateRequired": "Certificate is required.",
  "admin.languageRequired": "Language is required.",
  "admin.slugInvalid": "Slug must contain letters or numbers.",
  "admin.slugConflict": "That slug is already used by another deck.",
  "admin.deleteDeck": "Delete deck",
  "admin.deckDetails": "Deck details",
  "admin.importTitle": "Import cards (TSV)",
  "admin.importHint": "One card per line: front, then a tab, then back.",
  "admin.importSuccess_one": "Imported {count} card.",
  "admin.importSuccess_other": "Imported {count} cards.",
  "admin.importError": "No valid rows found. Each line needs front<TAB>back.",
  "admin.cardsHeading": "Cards ({count})",
  "admin.noCardsYet": "No cards yet — import some above.",
  "admin.deleteCard": "Delete card",

  "cert.title": "Certificates",
  "cert.backToDecks": "Back to decks",
  "cert.addCertificate": "Add certificate",
  "cert.addHint":
    "New certificates are added at the end of the display order on the All Decks page.",
  "cert.nameRequired": "Name is required.",
  "cert.nameExists": "A certificate with that name already exists.",
  "cert.deckCount_one": "{count} deck",
  "cert.deckCount_other": "{count} decks",

  "allDecks.title": "All Decks",
  "allDecks.empty": "No decks yet.",
} as const;

type TranslationKey = keyof typeof en;

const de: Record<TranslationKey, string> = {
  "nav.myDecks": "Meine Decks",
  "nav.allDecks": "Alle Decks",
  "nav.admin": "Admin",
  "nav.logOut": "Abmelden",
  "nav.logIn": "Anmelden",
  "nav.signUp": "Registrieren",

  "home.title": "Flashcard Decks",
  "home.loggedOutBody":
    "Melde dich an oder registriere dich, um mit dem Lernen zu beginnen. Wenn dir jemand einen Link zu einem bestimmten Deck geschickt hat, öffne diesen Link direkt.",
  "home.yourDecks": "Deine Decks",
  "home.empty":
    "Du hast noch keine Decks geöffnet. Öffne einen Deck-Link, den dir jemand geschickt hat, um loszulegen.",
  "home.lastStudied_one": "Zuletzt gelernt am {date} · {count} Sitzung",
  "home.lastStudied_other": "Zuletzt gelernt am {date} · {count} Sitzungen",
  "home.continue": "Weiter",
  "home.restart": "Neu starten",
  "home.progress": "{good} von {total} Karten gut",
  "home.done": "Erledigt",

  "common.uncategorized": "Unkategorisiert",
  "common.titleLabel": "Titel",
  "common.descriptionLabel": "Beschreibung",
  "common.certificateLabel": "Zertifikat",
  "common.languageLabel": "Sprache",
  "common.nameLabel": "Name",
  "common.slugLabel": "Slug (für den teilbaren Link)",
  "common.selectPlaceholder": "Auswählen…",
  "common.edit": "Bearbeiten",
  "common.delete": "Löschen",
  "common.save": "Speichern",
  "common.savePending": "Speichert…",
  "common.create": "Erstellen",
  "common.createPending": "Wird erstellt…",
  "common.add": "Hinzufügen",
  "common.addPending": "Wird hinzugefügt…",
  "common.import": "Importieren",
  "common.importPending": "Importiert…",
  "common.copyLink": "Link kopieren",
  "common.copied": "Kopiert!",
  "common.copyFailed": "Kopieren fehlgeschlagen",

  "language.EN": "Englisch",
  "language.DE": "Deutsch",

  "auth.emailLabel": "E-Mail",
  "auth.passwordLabel": "Passwort",
  "auth.passwordHint": "Mindestens 8 Zeichen.",
  "auth.loginTitle": "Anmelden",
  "auth.loginButton": "Anmelden",
  "auth.loginButtonPending": "Meldet an…",
  "auth.noAccount": "Kein Konto?",
  "auth.signupTitle": "Registrieren",
  "auth.signupButton": "Registrieren",
  "auth.signupButtonPending": "Registriert…",
  "auth.haveAccount": "Schon ein Konto?",
  "auth.invalidCredentials": "Ungültige E-Mail oder Passwort.",
  "auth.emailPasswordRequired": "E-Mail und Passwort sind erforderlich.",
  "auth.passwordTooShort": "Das Passwort muss mindestens 8 Zeichen lang sein.",
  "auth.emailExists": "Ein Konto mit dieser E-Mail existiert bereits.",
  "auth.accountCreatedPleaseLogin":
    "Konto erstellt — bitte melde dich an.",

  "deck.cardCount_one": "{count} Karte",
  "deck.cardCount_other": "{count} Karten",
  "deck.noCards": "Dieses Deck hat noch keine Karten.",
  "deck.startStudying": "Lernen starten",
  "deck.continueStudying": "Weiterlernen",
  "deck.review": "Deck wiederholen",
  "deck.restart": "Neu starten",
  "deck.progress": "{good} von {total} Karten als gut markiert",
  "deck.done": "Erledigt",

  "study.cardsLeft_one": "{count} Karte übrig · {title}",
  "study.cardsLeft_other": "{count} Karten übrig · {title}",
  "study.tapToReveal": "Tippen zum Aufdecken",
  "study.again": "Nochmal",
  "study.good": "Gut",
  "study.sessionComplete": "Sitzung abgeschlossen",
  "study.reviewed_one": 'Du hast {count} Karte in „{title}" wiederholt.',
  "study.reviewed_other": 'Du hast {count} Karten in „{title}" wiederholt.',
  "study.backToDeck": "Zurück zum Deck",
  "study.myDecks": "Meine Decks",
  "study.progress": "{good}/{total} gut",
  "study.progressLabel": "Gespeicherter Deck-Fortschritt",
  "study.saving": "Speichert…",
  "study.saveFailed": "Der Fortschritt konnte nicht gespeichert werden. Bitte versuche es erneut.",
  "study.alreadyComplete": 'Alle Karten in "{title}" sind als gut markiert.',
  "study.studyAgain": "Erneut lernen",
  "study.restarting": "Startet neu…",
  "study.previouslyGood": "Früher als gut markiert",

  "admin.title": "Admin · Decks",
  "admin.manageCertificates": "Zertifikate verwalten",
  "admin.newDeck": "Neues Deck",
  "admin.noDecks": "Noch keine Decks.",
  "admin.titleRequired": "Titel ist erforderlich.",
  "admin.certificateRequired": "Zertifikat ist erforderlich.",
  "admin.languageRequired": "Sprache ist erforderlich.",
  "admin.slugInvalid": "Der Slug muss Buchstaben oder Zahlen enthalten.",
  "admin.slugConflict": "Dieser Slug wird bereits von einem anderen Deck verwendet.",
  "admin.deleteDeck": "Deck löschen",
  "admin.deckDetails": "Deck-Details",
  "admin.importTitle": "Karten importieren (TSV)",
  "admin.importHint":
    "Eine Karte pro Zeile: Vorderseite, dann ein Tab, dann Rückseite.",
  "admin.importSuccess_one": "{count} Karte importiert.",
  "admin.importSuccess_other": "{count} Karten importiert.",
  "admin.importError":
    "Keine gültigen Zeilen gefunden. Jede Zeile braucht Vorderseite<TAB>Rückseite.",
  "admin.cardsHeading": "Karten ({count})",
  "admin.noCardsYet": "Noch keine Karten — importiere oben welche.",
  "admin.deleteCard": "Karte löschen",

  "cert.title": "Zertifikate",
  "cert.backToDecks": "Zurück zu den Decks",
  "cert.addCertificate": "Zertifikat hinzufügen",
  "cert.addHint":
    "Neue Zertifikate werden ans Ende der Anzeigereihenfolge auf der Seite „Alle Decks“ gesetzt.",
  "cert.nameRequired": "Name ist erforderlich.",
  "cert.nameExists": "Ein Zertifikat mit diesem Namen existiert bereits.",
  "cert.deckCount_one": "{count} Deck",
  "cert.deckCount_other": "{count} Decks",

  "allDecks.title": "Alle Decks",
  "allDecks.empty": "Noch keine Decks.",
};

export const translations: Record<Locale, Record<TranslationKey, string>> = {
  en,
  de,
};

export function t(
  locale: Locale,
  key: TranslationKey,
  vars?: Record<string, string | number>
): string {
  let str = translations[locale][key] ?? translations.en[key];
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replaceAll(`{${k}}`, String(v));
    }
  }
  return str;
}

export function tc(
  locale: Locale,
  base: string,
  count: number,
  vars?: Record<string, string | number>
): string {
  const key = `${base}_${count === 1 ? "one" : "other"}` as TranslationKey;
  return t(locale, key, { count, ...vars });
}
