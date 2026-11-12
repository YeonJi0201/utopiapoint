---
version: 1
slug: "src-app-tsx"
primary_target: "src/App.tsx"
related_targets: ["src/components/HouseBannersView.tsx","src/components/HouseDetailView.tsx","src/components/RankingView.tsx","src/components/ScoringGuideView.tsx"]
---

# Surface

## Scope and visitor mode

The four main web views: house overview, activity details, hall of fame, and scoring guide. Operate: organizers maintain the competition while participants check standings and records.

## Audience, task, proof, and constraints

Organizers award and manage points during community events. Participants compare house scores, inspect character contributions, and understand the scoring rules. Use the existing records, house emblems, and scoring content as evidence. Keep Korean copy, current score semantics, local persistence, search and filters, rankings, and administrator workflows. Do not present example records as verified results.

## Direction contract

THESIS: A clear, live House Cup scoreboard belongs in the atmosphere of a Great Hall, not in a generic admin template.

OWN-WORLD: The user-pinned reference sets the identity: a shadowed stone hall, restrained candlelight, aged brass, and distinct red, green, blue, and ochre house cloth. Serif display lettering pairs with readable Korean text. Familiar web navigation, buttons, inputs, filters, and lists remain functional rather than becoming props.

STORY: Participants see who leads, how close the standings are, and what each house has recently earned. Organizers can reach the same records without losing the tools they use to maintain the competition.

FIRST VIEWPORT: Keep a slim shared navigation at the top. On the overview, place the House Status title and current ranking panel above four equal, clearly named house banners with their current totals and recent contribution; put competition statistics below. On activity details, lead with house filters, search and category/sort controls, a concise totals strip, and an attributable activity list. On the hall of fame, lead with house filters and the three highest contributors, followed by the full ranking. On the scoring guide, use a readable editorial hierarchy for award categories and deductions. Reflow these regions into a single readable column on narrow screens.

FORM: User-pinned visual reference; its precedence is explicit. No catalog direction is adopted. Impeccable concept-seed reference: seed:9b68440d49e0a3cc.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved decisions

No product or visual decision is required to begin. Preserve existing behavior and use the user's attached reference across the four views.
