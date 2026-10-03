# References (APA 7)

Apache Software Foundation. (n.d.). *Apache JMeter user’s manual: Getting started*. https://jmeter.apache.org/usermanual/get-started.html

Google. (n.d.). *Lighthouse accessibility score*. Chrome for Developers. https://developer.chrome.com/docs/lighthouse/accessibility/scoring

Microsoft. (n.d.). *Installation*. Playwright. https://playwright.dev/docs/intro

Prisma. (n.d.). *SQLite*. Prisma documentation. https://www.prisma.io/docs/orm/v7/core-concepts/supported-databases/sqlite

Vercel. (n.d.). *Getting started: Route handlers*. Next.js. https://nextjs.org/docs/app/getting-started/route-handlers

GitHub. (2026, September 30). *Next.js: Remote code execution in next/og ImageResponse (GHSA-vcvr-r3jv-pc5j)*. GitHub Advisory Database. https://github.com/advisories/GHSA-vcvr-r3jv-pc5j

Sources checked on 2 October 2026. The project deliberately retains Prisma 6.12; the current Prisma reference documents v7 and is used for general SQLite concepts, not copied v7 setup instructions. The repository schema and lockfile are the authority for reproduction.

## Where these sources informed the implementation

- Next.js route handlers: thin API routes connecting browser requests to server services.
- Prisma: relational word/configuration storage and SQLite persistence.
- Playwright: browser assertions, downloaded files, frame gameplay, HTML reports and traces.
- JMeter: non-GUI finite stages with raw results and dashboard reports.
- Lighthouse: automated accessibility audits; a score of 100 does not prove complete accessibility, so keyboard gameplay is also tested.
- GitHub advisory: upgrade Next.js to 16.3.8 while preserving the production audit gate.
