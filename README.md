# Afterimage

> **The memory layer for your future self.**

Afterimage explores a different relationship between software and memory.

Most software asks **when** to remind you.
Afterimage asks **when this becomes relevant again**.

You leave a small piece of knowledge today. Instead of attaching it only to a date, you attach it to a return condition. When similar context appears later, Afterimage can bring the thought back.

## The primitive

```text
memory → return condition → context match → resurfacing
```

### A simple example

**Today**

> I chose this hosting plan because migrating later would be more painful than paying a little extra.

**Months later**

You're comparing hosting again.

**Afterimage**

> You considered this before. You chose the other option because switching costs mattered more. Still true?

That's the experiment.

## Why it is different

A reminder is attached to a **time**.

A note is attached to **storage**.

A task is attached to **action**.

Afterimage is designed around **relevance**.

The project does not claim that no adjacent product exists. The intended differentiation is the product primitive: **a memory is attached to a return condition rather than only a scheduled date.**

## Current MVP

- Premium responsive dark interface
- Context signal and pattern trigger capture
- Local browser persistence
- Local memory wall with explicit deletion
- Context timeline demonstration
- No account, ads, feed, streaks, or notification spam
- GitHub Actions build workflow

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Build

```bash
npm run build
```

## Open-source project

Afterimage is being built in public. We want contributors who are interested in the intersection of context, memory, privacy, human-computer interaction, and calm software.

Start with [`CONTRIBUTING.md`](CONTRIBUTING.md), [`GOOD_FIRST_ISSUES.md`](GOOD_FIRST_ISSUES.md), and [`ROADMAP.md`](ROADMAP.md).

### Contributor missions

- 🧠 **Memory Engineer** — memory model and storage
- 🧭 **Context Explorer** — relevance and matching experiments
- 🔐 **Privacy Engineer** — local-first security and user control
- 📱 **Android Builder** — offline-first mobile client
- 🌐 **Browser Builder** — permission-aware browser capture
- 🎨 **Experience Designer** — calm resurfacing interactions
- 🧪 **Reality Tester** — real-world scenario testing

You don't need to be an expert. Documentation, research, UX, testing, and small fixes are valuable contributions.

## Public experiments

We are especially interested in experiments around questions like:

- What should a computer remember for you?
- What should it deliberately forget?
- When does old knowledge become relevant again?
- How can relevance be detected without surveillance?
- Can context matching happen entirely on-device?

If you have an idea, open a **Context experiment** issue.

## Roadmap

See [`ROADMAP.md`](ROADMAP.md) for the public roadmap and research questions.

1. Local encrypted memory store
2. Semantic return-condition engine
3. Android client
4. Browser capture extension
5. Calendar/topic/context signals
6. Personal pattern graph
7. Optional encrypted sync
8. Privacy controls, export/import, and complete deletion

## Privacy direction

The MVP is local-first: captured memories are stored in browser `localStorage` and are not sent to a server. Future integrations should be permission-based, transparent, and designed to keep sensitive context on-device wherever practical.

See [`ARCHITECTURE.md`](ARCHITECTURE.md) and [`SECURITY.md`](SECURITY.md).

## Community standards

Please read [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md) before participating.

## License

Apache-2.0
