import { Browser } from './Browser';
import { Company } from './Company';
import { Contact } from './Contact';
import { CutResult, EightCards, Principles, RuleCallouts, StageTab } from './Story';
import { Dateline, Heads, Statement } from './Titles';
import { C, SERIF } from './tokens';

/** The whole film: every layer is always mounted and drawn from authored time T. */
export function Film() {
  return <div style={{ position: 'absolute', inset: 0, background: C.paper, fontFamily: SERIF, color: C.ink, overflow: 'hidden' }}>
    <Dateline /><Heads /><Principles /><EightCards /><CutResult /><RuleCallouts /><Company /><Browser /><StageTab /><Statement /><Contact />
  </div>;
}
