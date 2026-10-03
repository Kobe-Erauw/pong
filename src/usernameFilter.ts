// Controle van gebruikersnamen: toegelaten tekens, lengte en geen slurs.
// Slurs worden ook herkend met hoofdletters, accenten, scheidingstekens (n_i-g),
// leetspeak (n1gg3r) en herhaalde letters (niiigger).

const MIN_LENGTH = 2;
const MAX_LENGTH = 20;
const ALLOWED_CHARACTERS = /^[A-Za-z0-9À-ÖØ-öø-ÿ _-]+$/;

// Mogen nergens in de naam voorkomen (ook niet als deel van een woord)
const BLOCKED_ANYWHERE = [
    // Engels
    "nigg", "chink", "wetback", "beaner", "towelhead", "raghead", "jigaboo", "porchmonkey", "zipperhead",
    "kaffir", "faggot", "trann", "shemale", "retard", "mongoloid",
    "hitler", "siegheil", "whitepower", "kukluxklan", "1488",
    // Nederlands
    "neger", "nikker", "flikker", "mongool", "spleeto", "poepchine", "geitenneuker", "kutmarokk", "makak",
    // Frans
    "negre", "bougnoul", "youpin",
];

// Korte slurs die ook in onschuldige woorden zitten (spicy, raccoon, Pakistan): alleen als los woord
const BLOCKED_WORDS = ["spic", "coon", "paki", "kike", "kyke", "gook", "dyke", "fag", "nazi", "kkk", "spast", "spaz"];

// Onschuldige woorden die toevallig een slur bevatten
const INNOCENT_WORDS = ["schwarzenegger", "negeer", "negeren"];

// Tekens die vaak gebruikt worden om een letter te vervangen
const LOOKALIKES: Record<string, string> = {
    a: "a4@", b: "b8", e: "e3", g: "g9", i: "i1!|", l: "l1|", o: "o0", s: "s5$", t: "t7+",
};

// Elke reeks van dezelfde letter mag langer zijn (niiigger), maar niet korter (niger blijft toegelaten)
function termPattern(term: string): string {
    return (term.match(/(.)\1*/g) as string[])
        .map((run) => `[${LOOKALIKES[run[0]] ?? run[0]}]{${run.length},}`)
        .join("");
}

const blockedAnywhere = new RegExp(BLOCKED_ANYWHERE.map(termPattern).join("|"));
const blockedWord = new RegExp(`^(?:${BLOCKED_WORDS.map(termPattern).join("|")})[s5$]*$`);
const innocentWords = new RegExp(INNOCENT_WORDS.join("|"), "g");

export function containsBlockedTerm(name: string): boolean {
    const simple = name
        .replace(/([a-z])([A-Z])/g, "$1 $2") // camelCase in losse woorden
        .toLowerCase()
        .normalize("NFD").replace(/[̀-ͯ]/g, ""); // accenten weg
    const words = simple.split(/[\s_.-]+/).filter(Boolean);
    const joined = words.join("");

    if (blockedAnywhere.test(joined.replace(innocentWords, ""))) return true;
    return [...words, joined].some((word) => blockedWord.test(word) || blockedWord.test(word.replace(/\d+$/, "")));
}

// Geeft een foutmelding terug, of null als de naam in orde is
export function validateUsername(name: string): string | null {
    if (name.length < MIN_LENGTH || name.length > MAX_LENGTH) {
        return `Your username must be ${MIN_LENGTH} to ${MAX_LENGTH} characters long`;
    }
    if (!ALLOWED_CHARACTERS.test(name)) {
        return "Only letters, numbers, spaces, - and _ are allowed";
    }
    if (containsBlockedTerm(name)) {
        return "This username is not allowed";
    }
    return null;
}
