# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- Community organizers manage house points and activity records during original-character community events.
- Participants check house standings and the activity records behind them.

## Product Purpose

The Hogwarts House Cup board tracks points earned or lost by community characters and shows how those records contribute to each house's standing. Success means organizers can manage scores and participants can understand current rankings and their underlying activity.

## Positioning

The board connects each community character's house score to an attributable activity record, category, and awarding authority, while also presenting house and character rankings.

## Operating Context

- The application runs in a web browser on the local machine.
- Organizers use the administrator area to award, edit, delete, import, and export records.
- Participants use the house overview, activity log, hall of fame, and scoring guide to follow the competition.
- Records and some settings are stored in the browser's local storage.

## Capabilities and Constraints

- Preserve the four house sections, score aggregation, character rankings, activity search and filters, scoring guidance, and administrator workflows.
- Keep Korean interface copy and the existing house names and character data.
- The application has no confirmed shared or server-side record store; local browser storage is the observed persistence mechanism.
- The initial records are example data and must not be presented as verified community results.
- Do not change score values, record semantics, or administrator behavior as part of a visual redesign.

## Brand Commitments

- The user selected the attached Great Hall / House Cup reference image as the design direction across the four main pages.
- Retain the Hogwarts house names and existing house crest assets.

## Evidence on Hand

- Existing application behavior and example records in `src/`.
- House crest images in `src/assets/images/`.
- User-provided visual reference: a Great Hall setting with four house banners, current rankings, and competition statistics.
- No verified event results, participant testimonials, or organizer metrics were provided.

## Product Principles

- Make each score explainable through its activity record.
- Keep house standings and individual contributions easy to compare.
- Preserve the organizer's record-management capabilities.
- Distinguish example content from real community results.
