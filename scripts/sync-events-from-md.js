#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const eventsMdPath = path.join(root, 'EVENTS.md');
const memberEventsMdPath = path.join(root, 'MEMBER_EVENTS.md');
const preAddedTsPath = path.join(root, 'src', 'utils', 'preAddedEvents.ts');
const memberTsPath = path.join(root, 'src', 'utils', 'memberEvents.ts');

function parseMarkdownEvents(markdownText) {
  const withoutComments = markdownText.replace(/<!--[\s\S]*?-->/g, '');
  const normalized = withoutComments.replace(/\r\n/g, '\n');
  const chunks = normalized.split(/\n---\n/g).map((chunk) => chunk.trim()).filter(Boolean);
  const events = [];

  for (const chunk of chunks) {
    const titleMatch = chunk.match(/^Title:\s*(.+)$/m);
    const dateMatch = chunk.match(/^Date:\s*(.+)$/m);
    const toDateMatch = chunk.match(/^ToDate:\s*(.+)$/m);
    const imageMatch = chunk.match(/^Image:\s*(.+)$/m);
    const descriptionMatch = chunk.match(/^Description:\s*(.+)$/m);

    if (!titleMatch || !dateMatch || !descriptionMatch) {
      continue;
    }

    const title = titleMatch[1].trim();
    const dateField = dateMatch[1].trim();
    const toDateField = toDateMatch ? toDateMatch[1].trim() : undefined;
    const image = imageMatch ? imageMatch[1].trim() : undefined;
    const description = descriptionMatch[1].trim();

    const rangeMatch = dateField.match(/(\d{4}-\d{2}-\d{2})\s+to\s+(\d{4}-\d{2}-\d{2})/);
    const singleMatch = dateField.match(/(\d{4}-\d{2}-\d{2})/);
    if (!singleMatch) {
      continue;
    }

    const date = rangeMatch ? rangeMatch[1] : singleMatch[1];
    let toDate = rangeMatch ? rangeMatch[2] : undefined;

    if (toDateField) {
      const toDateMatchValue = toDateField.match(/(\d{4}-\d{2}-\d{2})/);
      if (toDateMatchValue) {
        toDate = toDateMatchValue[1];
      }
    }

    events.push({
      title,
      date,
      toDate,
      description,
      image,
    });
  }

  return events;
}

function renderObject(event) {
  const lines = [
    '  {',
    `    title: ${JSON.stringify(event.title)},`,
    `    date: ${JSON.stringify(event.date)},`,
  ];

  if (event.toDate) {
    lines.push(`    toDate: ${JSON.stringify(event.toDate)},`);
  }

  lines.push(`    description: ${JSON.stringify(event.description)},`);

  if (event.image) {
    lines.push(`    image: ${JSON.stringify(event.image)},`);
  }

  lines.push('  },');
  return lines.join('\n');
}

function renderPreAddedTs(events) {
  const objects = events.map(renderObject).join('\n');
  return `// Pre-added events for the calendar app
// AUTO-GENERATED from EVENTS.md by scripts/sync-events-from-md.js

import { CalendarEvent } from '../types';

const eventData: { title: string; date: string; toDate?: string; description: string; image?: string }[] = [
${objects}
];

export const getPreAddedEvents = (): CalendarEvent[] => {
  return eventData.map((event, index) => {
    const [year, month, day] = event.date.split('-').map(Number);
    const eventDate = new Date(year, month - 1, day);

    let toDate: Date | undefined;
    if (event.toDate) {
      const [toYear, toMonth, toDay] = event.toDate.split('-').map(Number);
      toDate = new Date(toYear, toMonth - 1, toDay);
    }

    return {
      id: \`pre-added-\${index}\`,
      title: event.title,
      fromDate: eventDate,
      toDate,
      fromTime: '',
      description: event.description,
      isAllDay: true,
      image: event.image,
      // Legacy fields for compatibility
      date: eventDate,
      startTime: '',
    };
  });
};
`;
}

function renderMemberTs(events) {
  const objects = events.map(renderObject).join('\n');
  return `// Member-only events — visible only to signed-in users
// AUTO-GENERATED from MEMBER_EVENTS.md by scripts/sync-events-from-md.js

import { CalendarEvent } from '../types';

const memberEventData: { title: string; date: string; toDate?: string; description: string; image?: string }[] = [
${objects}
];

export function getMemberEvents(): CalendarEvent[] {
  return memberEventData.map((event, index) => {
    const [year, month, day] = event.date.split('-').map(Number);
    const fromDate = new Date(year, month - 1, day);

    let toDate: Date | undefined;
    if (event.toDate) {
      const [ty, tm, td] = event.toDate.split('-').map(Number);
      toDate = new Date(ty, tm - 1, td);
    }

    return {
      id: \`pre-member-\${index}\`,
      title: event.title,
      description: event.description,
      fromDate,
      toDate,
      isAllDay: true,
      isMembersOnly: true,
      ...(event.image ? { image: event.image } : {}),
    } as CalendarEvent;
  });
}
`;
}

function main() {
  const eventsMd = fs.readFileSync(eventsMdPath, 'utf8');
  const memberEventsMd = fs.readFileSync(memberEventsMdPath, 'utf8');

  const events = parseMarkdownEvents(eventsMd);
  const memberEvents = parseMarkdownEvents(memberEventsMd);

  fs.writeFileSync(preAddedTsPath, renderPreAddedTs(events));
  fs.writeFileSync(memberTsPath, renderMemberTs(memberEvents));

  console.log(
    `Synced ${events.length} public events and ${memberEvents.length} member events from markdown files.`
  );
}

main();
