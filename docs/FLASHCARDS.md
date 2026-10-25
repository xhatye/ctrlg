# Open-answer flashcards — 25 October 2026

The previous 4,325-card collection included mechanical course-heading prompts and arbitrary pairs of unrelated notions. All historical slots remain in the server bank for compatibility auditing, but are retired from delivery and return HTTP 410 if submitted for new reviews. Existing chapter activity totals and historical review records are not erased or relabelled as mastery of new content.

The new collection contains 5,000 question/answer cards across 225 chapters and 20 UE. It adapts the previously authored and reviewed SIMDCG quiz bank into open-answer recall. It does not claim 5,000 newly researched facts or 5,000 questions independent of the QCM collection. Prompts that already work without answer choices are retained; editorial overrides rewrite selection-style prompts as direct questions, small scenarios or language-production tasks. Explanations referring to unseen distractors are replaced. This is an editorial adaptation of the existing reviewed content, not independent validation by a teacher.

Answers are short (at most 200 characters), with a separate explanatory paragraph. Writing tasks that admit multiple valid phrasings show “Exemple de réponse”. Students self-assess the meaning, rather than matching exact wording. Questions retain their stated assumptions, dates, numerical inputs and chapter provenance. There is no runtime AI generation or additional provider call.

Recall and reasoning cards exclude cards classified as numerical calculations. The calculation series combines 787 authored short calculations with existing contextual numerical variants. Those variants remain separate from the advertised 5,000-card editorial count.

`cardIndices` controls delivery and catalogue counts; the underlying arrays preserve archived prefixes. New cards occupy new numeric slots. `resolveReviewItem` rejects retired slots, while `reviewQueue` archives obsolete reminders without deleting their history or carrying their learning state onto new cards. Current reviews return the same short answer and explanation as study sessions.

Verification includes full-bank provenance/length/duplicate/prompt checks, every card ID round-trip through the review resolver, several random seeds and all focus settings for every UE, numerical examples, unchanged legacy prefix hashes, archive history preservation, and browser checks of reveal/keyboard/self-assessment and responsive layouts. Automated checks are safeguards, not evidence that every pedagogical statement has been independently fact-checked anew.
