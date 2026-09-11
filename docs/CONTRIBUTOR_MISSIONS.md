# Afterimage Contributor Missions

Afterimage is easier to contribute to when the next useful experiment is obvious. Pick one mission, keep the change focused, and leave the project better than you found it.

## 🟢 First contribution

Best for someone opening their first Afterimage PR.

- keyboard focus states
- accessibility labels
- responsive polish
- empty-state improvements
- documentation examples
- browser compatibility checks

Good starting issues: **#2, #5, #6, #9**.

## 🧠 Context Engineer

Explore the core product problem: when should an old memory return?

- improve deterministic relevance scoring
- test return-condition weighting
- reduce repeated resurfacing
- document false positives and missed matches
- build synthetic context scenarios

Good starting issues: **#4, #7, #11**.

## 🔐 Privacy Engineer

Make personal context safer without making Afterimage less useful.

- import/export validation
- deletion guarantees
- permission boundaries
- local storage hardening
- threat-model documentation
- privacy regression tests

Good starting issue: **#10**.

## 🌐 Browser Builder

Make contextual browser memory useful while keeping the permission boundary obvious.

- Chrome/Edge compatibility
- extension UX
- bridge reliability
- context extraction quality
- release packaging
- explicit permission design

Start with `extension/` and `docs/EXTENSION_RELEASES.md`.

## 📱 Mobile Builder

Explore an offline-first mobile experience without turning Afterimage into a notification machine.

- local memory storage
- capture flow
- contextual review
- Android export/import
- accessibility

## 🎨 Experience Designer

Make resurfacing feel calm, useful and understandable.

- improve “Why now?” explanations
- design confidence language
- reduce visual noise
- improve memory review flows
- test mobile layouts

## 🧪 Reality Tester

The product is only good if it works in real situations.

Try synthetic scenarios such as:

1. comparing hosting providers
2. choosing a framework
3. revisiting a purchase decision
4. troubleshooting a recurring production problem
5. preparing for a recurring meeting
6. planning a trip

Record:

- should have resurfaced
- should not have resurfaced
- resurfaced too often
- missing context
- explanation was unclear

Never submit private memories or personal data.

## 📝 Documentation Builder

Help a new contributor understand the product without reading the whole repository.

- improve setup instructions
- add architecture diagrams
- document memory schema changes
- add extension release notes
- improve examples
- keep README claims accurate

## Contribution rule

A good Afterimage contribution makes the product **more useful without making it louder**.

Prefer changes that are:

- explainable
- local-first where practical
- reversible
- accessible
- measurable
- small enough to review

Before a large architectural change, open an issue and explain the experiment you want to validate.
