# Bridge-iT Bouncer

Protects human attention. It verifies and consolidates AI-generated work, sends anything an agent can fix back to that agent, and only then shows the person the smallest decision that genuinely needs them.

Two skills:

- **hygiene-gate** — inspects agent output: removes duplicates and unneeded personal data, separates facts from claims, quantifies material changes, checks permissions, and routes each item to pass, consolidate, return, block, or hand off.
- **closure-gate** — turns what's left into the fewest human decisions, in one compact card (*Decision required · What materially changed · Why your judgment is required · Choose · After your decision*), and marks work closed only once the decision has been carried through and checked.

## Install

**Claude Code**, from this repository's marketplace:

```sh
/plugin marketplace add <owner>/<this-repo>
/plugin install bridge-it-bouncer@bridge-it
```

**OpenAI / Codex** read the same skills through `plugin.json` and each skill's `agents/openai.yaml`. Both manifests describe the same two skills; keep their name, version and description in step.

By Danya Dotan — Bridge-iT · https://tab-at-work.com
