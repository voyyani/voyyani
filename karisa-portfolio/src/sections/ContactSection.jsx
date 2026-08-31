import React from 'react';
import Panel from '../components/Panel';
import { PanelHead } from '../components/Band';
import ContactForm from '../components/ContactForm';
import { SITE, mailto } from '../config/site';
import { PANELS } from '../config/panels';

/**
 * The closing kanga.
 *
 * What was here before: three blurred colour blobs behind a rounded "LET'S CONNECT"
 * pill, a heading with one word in the accent colour, and three identical icon cards
 * reading "Within 24 hours / Nairobi, Kenya / Open for projects". None of that told a
 * prospective client anything they could act on.
 *
 * What replaced it is the brief. The panel says what to send, what happens next, and
 * what Karisa does not do — because a client who reads the constraint before writing is
 * the client whose enquiry is worth answering. Every fact here is in PRODUCT.md or
 * src/config/site.js; nothing about rates, availability windows or a client roster is
 * invented.
 */

const WHAT_TO_INCLUDE = [
  'What the system has to do, and who uses it.',
  'What it has to survive — number of records, peak load, connection quality.',
  'Whether anything already exists, and what has to keep working.',
  'When you need it running, and what "running" means to you.',
];

const ContactSection = () => (
  <Panel id="contact" labelledBy="contact-heading">
    {(printed) => (
      <>
        <PanelHead
          id="contact-heading"
          heading={PANELS.contact.heading}
          jina={PANELS.contact.jina}
          lead={PANELS.contact.lead}
          printed={printed}
          reversed
        />

        <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            <ContactForm />
          </div>

          <aside className="lg:col-span-5">
            <h3 className="font-display text-title font-bold text-mark-900">
              What to put in the message
            </h3>
            <ol className="mt-4 list-none space-y-0 border-t border-cloth-300 p-0">
              {WHAT_TO_INCLUDE.map((line, i) => (
                <li key={line} className="flex gap-4 border-b border-cloth-300 py-3.5">
                  <span className="tabular shrink-0 font-semibold text-pindo">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-mark-700">{line}</span>
                </li>
              ))}
            </ol>

            <h3 className="mt-9 font-display text-title font-bold text-mark-900">
              Or write directly
            </h3>
            <dl className="mt-4 space-y-0 border-t border-cloth-300">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-cloth-300 py-3.5">
                <dt className="text-label uppercase text-mark-600">Email</dt>
                <dd className="m-0">
                  <a href={mailto('Project enquiry')} className="link break-all font-semibold">
                    {SITE.email}
                  </a>
                </dd>
              </div>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-cloth-300 py-3.5">
                <dt className="text-label uppercase text-mark-600">Based in</dt>
                <dd className="m-0 font-semibold text-mark-900">{SITE.location}</dd>
              </div>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-cloth-300 py-3.5">
                <dt className="text-label uppercase text-mark-600">LinkedIn</dt>
                <dd className="m-0">
                  <a
                    href={SITE.social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link font-semibold"
                  >
                    Ngowa Karisa
                  </a>
                </dd>
              </div>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-cloth-300 py-3.5">
                <dt className="text-label uppercase text-mark-600">Code</dt>
                <dd className="m-0">
                  <a
                    href={SITE.social.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link font-semibold"
                  >
                    github.com/voyyani
                  </a>
                </dd>
              </div>
            </dl>

            <p className="mt-6 bg-cloth-200 px-5 py-4 text-mark-700">
              I take on a small number of client builds at a time, through {SITE.brand}, and
              I&apos;m also open to a full-time engineering role. Say which one you have in
              mind and the reply will be more useful.
            </p>
          </aside>
        </div>
      </>
    )}
  </Panel>
);

export default ContactSection;
