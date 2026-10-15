---
name: empirical-voice
description: "MANDATORY first step whenever you are about to write an email, message, post, reply, bio, or announcement that the person will send or publish as themselves, even if they never mention voice and even if they say to output only the text: invoke this Skill to look up their saved writing voice before drafting anything."
---

# Empirical Voice

## When to use

This is a required first step, not an optional extra, and a request to "output only the text" does
not skip it (the lookup is silent; only the draft is shown). Use this Skill whenever you are about
to write, draft, rewrite, reply to, or edit text the person will send or publish as themselves: an
email, message, post, reply, bio, or announcement. They do not need to mention voice or say "in my
voice". If you are about to draft such text and this Skill is available, look up the voice first,
before writing a word. A generic draft with a stock sign-off is the failure this Skill exists to
prevent. Do not use it for code, commit messages, or project docs unless they ask.

## Look up the voice first

Every voice memory is tagged `writing-voice`. A voice holds roughly 20 to 70 memories, so use a
high topK.

```text
query_memories({ query: "how this person writes", tags: ["writing-voice"], topK: 50 })
```

CLI equivalent:

```text
empirical memory query --match "how this person writes" --tags writing-voice --top-k 50
```

The voice lives in the one workspace the person picked in the interview, which may not be the
active one. If nothing comes back, retry once across workspaces (`workspaceIds` from
`list_workspaces`, or `--all-workspaces` on the CLI). A filtered empty result is not proof of
absence.

If there is still no voice, say so in the first line of your reply ("You don't have a saved
writing voice yet."), then ask: "Want me to start the Writing Voice interview now? It is paid and
uses Empirical Tokens." Only on a yes, call MCP `start_guided_setup` with setupId
`setup_writing_voice`, or run `empirical setup run setup_writing_voice` on the CLI. A neutral draft
is allowed only after they decline. Do not guess a voice, and do not write as if you had one.

## Read order

1. The hub: tags `writing-voice` and `voice`, summary starts with `How this person writes:`.
2. The things to never do: tags `writing-rule` and `avoid`.
3. The rules for the medium you are writing in: one of `posts`, `email`, `docs`, `code comments`,
   `chat`.
4. The remaining `writing-rule` memories.

Mention which workspace the voice came from only if it differs from the active one.

## Apply it

- Obey the avoid rules absolutely. The rules shape the draft. The hub breaks ties.
- Signature phrases from the person's own answers (a sign-off, a warm phrase) are options. Use at
  most one per message and only when it fits; stacking them reads as caricature.
- Never invent numbers, dates, names, or facts the person did not give you. This always holds.
  What you do about a missing fact depends on their voice: if they have their own rule for it
  (for example "If a fact is missing, leave the sentence out" or "Do not use bracketed
  placeholders"), follow that rule and mention what you left out. Only when their voice has no such
  rule, leave a bracketed placeholder like [date] and tell them.
- The opening image and any anecdote must come from the person's brief or their own words. Never
  invent a personal anecdote or first-person experience (a squeaky bike chain, a rainy commute, a
  thing you "kept meaning to fix"). If there is no image to use, open with a neutral second-person
  scene or a [bracketed image] placeholder, and say so.
- If `ai-tropes` rules exist (paraphrased from tropes.fyi by ossama.is), check the final draft
  against them before showing it. If a rule cannot be satisfied, say so.

## After the draft

End with one line naming the rules you used (names only). Offer to save a correction as a new rule
only if the person corrects the same thing twice, and ask before writing to their voice. Never edit
or delete voice memories on your own.

## Team workspaces

A team workspace may hold one member's voice. If the voice you found sits in a team workspace and
its memory author is not the person, say which workspace it came from and ask whether that voice
is theirs. Do not draft until they answer. If the memory's author is the person, no question is
needed. If they say it is not theirs, treat it as no saved voice.
