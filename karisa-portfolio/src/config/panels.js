/**
 * The jina — the printed line along a kanga's hem.
 *
 * On a kanga the jina is the whole point of the cloth: one large printed line that
 * states the thing out loud. Here it is the largest type on each panel, and it is the
 * sentence a visitor is meant to leave with.
 *
 * Every line below is Karisa's own claim, in his own register — plain, measured,
 * checkable against something else on the page. None of them is a proverb and none is
 * presented as traditional; inventing a Swahili saying and printing it as inherited
 * would be exactly the kind of unfalsifiable decoration this site's own principles ban.
 *
 * Kanga are commonly printed with a Swahili jina. If Karisa wants his own Swahili
 * wording, this is the only file that changes: add `sw` beside `en` and the panels will
 * carry it. Nobody else should write those lines.
 */
export const PANELS = {
  hero: {
    // The h1. Carried verbatim from the previous build — Phase 1 fixed this claim and
    // the test suite asserts it.
    jina: 'I build software the way I was trained to build machines.',
  },
  work: {
    nav: 'Work',
    heading: 'Two platforms, both in daily use',
    jina: 'What I built is still running.',
    lead:
      'Real client work, not demos. Each one I built end to end — schema, permissions, ' +
      'API, frontend, deploy — and still maintain.',
  },
  activity: {
    nav: 'Activity',
    heading: 'The one set of numbers here you can check yourself',
    jina: 'The commits are public. Check them.',
    lead:
      'Public commit history, pulled straight from the GitHub API. Every repository ' +
      'below links to the source it counts — including the quiet months.',
  },
  about: {
    nav: 'About',
    heading: 'From load calculations to load balancing',
    jina: 'I design to a tolerance, then I verify.',
  },
  skills: {
    nav: 'Toolkit',
    heading: 'What I use, and where I used it',
    jina: 'Every tool listed shipped something.',
    lead:
      'No self-assigned percentages — every tool here is listed with the project it ' +
      'shipped in, so you can check the claim against the work above.',
  },
  philosophy: {
    nav: 'How I work',
    heading: 'Four habits that came from the workshop',
    jina: 'Measure first. Claim second.',
    lead:
      'Each of these shows up in a specific decision in the work above — not as a ' +
      'metaphor, as the reason something is built the way it is.',
  },
  contact: {
    nav: 'Contact',
    heading: 'Start a project',
    jina: 'Tell me what has to hold, and under what load.',
    lead:
      'Describe the system you need and what it has to survive. You get a reply from ' +
      'me, not a form letter — usually within a working day.',
  },
};

export default PANELS;
