# Public discovery and subscription entry

SIMDCG keeps its existing prices, subscription backend, protected content and approved landing design. This change adds original public descriptions and useful method guides, rather than copying a competitor's claims or material.

## Delivered

- 20 subject pages, two diploma indexes, six original guides, and sources/annals/resource indexes.
- 39 indexable URLs including existing public pages. Build-time HTML renders the same React content as the browser, with distinct titles, descriptions, canonical URLs and accurate structured data.
- Actual crawlable links from the home page, diploma indexes, subject pages and guides. Public subject pages load without the Firebase client.
- A generated sitemap, crawler rules, noindex shells for account/study routes and a real 404 for unknown routes. API routes and payment return addresses remain separate.
- Visible links to Légifrance, BOFiP, ANC, SIEC and CRCF. These are external references, not official endorsements or automatic data connections. Annal links leave documents at their publisher; restricted corrigés are identified.
- Clear counts from the public catalogue, partial-coverage statements, existing product screenshots and price/registration links. No fabricated student counts, reviews, pass rates or expert certification.
- Vercel Web Analytics integration for public pages and account-entry pages. The project already has Web Analytics enabled. The filter drops private paths, all custom events, query strings, fragments and unexpected event fields. No student answers, account identifiers or Stripe session IDs are sent by this integration. Policy text describes the measure.

## Measurement

Use Vercel Web Analytics to compare public page visits and referral sources over time. Synthetic browser QA intercepts analytics reporting to avoid polluting real traffic. The owner's Google Search Console property is not accessible through the currently available connectors, so search impressions, search queries and Google position changes are not verified or claimed. The sitemap is available at https://www.simdcg.com/sitemap.xml for that property once access is available.

No first-place ranking or conversion increase is promised. Google controls crawling, indexing and result presentation.

## Sources inspected

- https://reviser-dscg.fr/ (feature presentation only; no copied texts, question bank or proof figures)
- https://siec.education.fr/candidats/docutheque/examens/DCG
- https://siec.education.fr/candidats/docutheque/examens/DSCG
- https://www.anc.gouv.fr/
- https://bofip.impots.gouv.fr/
- https://www.crcf-edu.fr/dcg/ and six linked session pages
- https://developers.google.com/search/docs/appearance/ai-features
- https://developers.openai.com/api/docs/bots
- https://vercel.com/docs/analytics/package and https://vercel.com/docs/analytics/privacy-policy

## Validation

Automated checks cover unique metadata/routes, actual initial HTML, protected catalogue boundaries, noindex shells, payment-return routing and analytics filtering. Browser QA checks public HTML without JavaScript, desktop/mobile light/dark rendering, native menu/FAQ use, login entry from pricing, crawler files and unknown-route status. Existing auth/billing/learning tests are retained.
