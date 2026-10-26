// The desk is always "today": every date on screen is derived from the viewer's clock.
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const shift = (days: number) => { const d = new Date(); d.setDate(d.getDate() + days); return d; };
const now = new Date(), tomorrow = shift(1), start = shift(21), lastCall = shift(-42), since = shift(-63);

/** "Mon 5 Oct" */
export const SHORT = `${DAYS[now.getDay()].slice(0, 3)} ${now.getDate()} ${MONTHS[now.getMonth()].slice(0, 3)}`;
/** "MONDAY 5 OCTOBER" */
export const LONG = `${DAYS[now.getDay()]} ${now.getDate()} ${MONTHS[now.getMonth()]}`.toUpperCase();
/** "5 Oct" */
export const DAY_MONTH = `${now.getDate()} ${MONTHS[now.getMonth()].slice(0, 3)}`;
/** Tomorrow's weekday, "Tuesday" */
export const TOMORROW = DAYS[tomorrow.getDay()];
/** The rollout start date agreed on the call, three weeks out: "Nov 3" */
export const START = `${MONTHS[start.getMonth()].slice(0, 3)} ${start.getDate()}`;
/** The previous call with Northwind, six weeks back: "AUG 28" */
export const LAST_CALL_DATE = `${MONTHS[lastCall.getMonth()].slice(0, 3)} ${lastCall.getDate()}`.toUpperCase();
/** When TAB and this person started working together: "September" */
export const SINCE = MONTHS[since.getMonth()];
