const {
  parseMarkdownEvents,
  renderPreAddedTs,
  renderMemberTs,
} = require('../../../scripts/sync-events-from-md.js');

describe('sync-events-from-md script', () => {
  it('parses markdown events and ignores template comments', () => {
    const md = `# Events
<!--
Title: Event title
Date: YYYY-MM-DD
Description: Event description
-->

---

Title: Full Moon
Date: 2027-01-22 (lunar day 15)
Description: Full moon day.

---

Title: Weekend
Date: 2027-02-01 to 2027-02-02
Description: Weekend event.
`;

    const parsed = parseMarkdownEvents(md);
    expect(parsed).toEqual([
      {
        title: 'Full Moon',
        date: '2027-01-22',
        toDate: undefined,
        description: 'Full moon day.',
        image: undefined,
      },
      {
        title: 'Weekend',
        date: '2027-02-01',
        toDate: '2027-02-02',
        description: 'Weekend event.',
        image: undefined,
      },
    ]);
  });

  it('prefers explicit ToDate and captures image field', () => {
    const md = `---
Title: Retreat
Date: 2027-03-01
ToDate: 2027-03-05
Image: retreat.jpg
Description: Retreat description.
`;
    const parsed = parseMarkdownEvents(md);
    expect(parsed[0]).toMatchObject({
      date: '2027-03-01',
      toDate: '2027-03-05',
      image: 'retreat.jpg',
    });
  });

  it('renders typed event files', () => {
    const events = [
      { title: 'A', date: '2027-01-01', description: 'd', image: undefined, toDate: undefined },
    ];

    const preAdded = renderPreAddedTs(events);
    const member = renderMemberTs(events);

    expect(preAdded).toContain('getPreAddedEvents');
    expect(preAdded).toContain('id: `pre-added-${index}`');
    expect(member).toContain('getMemberEvents');
    expect(member).toContain('id: `pre-member-${index}`');
  });
});
