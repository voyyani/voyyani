import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import Panel from './Panel';
import { PanelHead, Band } from './Band';
import ImageWithFallback from './ImageWithFallback';
import ProjectDiagram from './ProjectDiagram';
import { PROJECTS } from '../data/projects';
import { PANELS } from '../config/panels';
import { trackProjectView, trackEvent } from '../utils/analytics';

/**
 * The work panel, and the sheet's signature interaction.
 *
 * Each project is a two-faced object. The face carries the painted promise — a real
 * capture of the running product, its measured band, its stack. The reverse carries the
 * discipline: the schema, table by table, and the architecture in small type. A seed
 * packet sells both at once, and so does a case study; the previous build hid all of it
 * behind a single "Explore Full Details" modal, which meant the specification only
 * existed for people who already trusted the screenshot.
 *
 * The modal survives for the full case study. The turn is the step between.
 *
 * The reverse mounts on first turn rather than shipping in the initial DOM: it is a
 * second copy of every fact on the object, and a visitor who never turns should not
 * download or hear it.
 */

/** Shown instead of a capture when a project genuinely has none. Deliberately reads as
 *  "not captured yet" rather than imitating a screenshot — a portfolio that fakes
 *  product imagery is worse than one that admits a gap. */
const NoCaptureNotice = ({ project }) => (
  <div
    className="flex h-full w-full items-center justify-center border border-cloth-400 bg-cloth-200"
    style={{ aspectRatio: '16 / 10' }}
  >
    <div className="px-6 text-center">
      <svg
        className="mx-auto mb-3 h-7 w-7 text-mark-500"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        aria-hidden="true"
      >
        <rect x="3" y="5" width="18" height="14" />
        <path d="M3 16l5-5 4 4 3-3 6 6" />
        <path d="M4 4l16 16" />
      </svg>
      <p className="text-label uppercase text-mark-600">
        {project.liveStatus?.state === 'maintenance'
          ? 'Capture pending — client site in maintenance'
          : 'Capture pending — private client deployment'}
      </p>
    </div>
  </div>
);

const StateMark = ({ liveStatus }) => {
  if (!liveStatus) return null;
  const maintenance = liveStatus.state === 'maintenance';
  return (
    <span className="mark-state" data-state={liveStatus.state}>
      {maintenance ? 'In maintenance' : 'Live'} · checked {liveStatus.checkedOn}
    </span>
  );
};

const Packet = ({ project, onOpen }) => {
  const [turned, setTurned] = useState(false);
  const [reverseMounted, setReverseMounted] = useState(false);

  const turn = () => {
    setReverseMounted(true);
    setTurned((t) => {
      if (!t) trackEvent('project_turn', { project: project.title });
      return !t;
    });
  };

  return (
    <article className="flex flex-col border border-mark-900 bg-cloth-50">
      <div className="packet-stack" data-turned={turned ? 'true' : 'false'}>
        {/* ---- Face: the painted promise ---- */}
        <div
          role="button"
          tabIndex={turned ? -1 : 0}
          aria-hidden={turned ? 'true' : undefined}
          aria-label={`Open the full case study for ${project.title}`}
          onClick={() => onOpen(project)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onOpen(project);
            }
          }}
          className="group cursor-pointer"
        >
          {project.screenshots?.length > 0 ? (
            <ImageWithFallback
              src={project.screenshots[0].src}
              alt={project.screenshots[0].alt}
              width={1600}
              height={1000}
              sizes="(max-width: 768px) 100vw, 620px"
              className="border-b border-mark-900"
            />
          ) : (
            <div className="border-b border-mark-900">
              <NoCaptureNotice project={project} />
            </div>
          )}

          <div className="p-5 sm:p-6">
            <div className="flex items-baseline gap-3">
              <span className="tabular font-display text-title font-bold text-pindo">
                {project.index}
              </span>
              <h3 className="font-display text-title font-bold text-mark-900">{project.title}</h3>
              <span className="ml-auto shrink-0 text-label uppercase text-mark-600">
                {project.category}
              </span>
            </div>

            <p className="mt-2 text-mark-600">{project.tagline}</p>

            <p className="mt-4 max-w-prose leading-relaxed text-mark-700">{project.summary}</p>

            <Band items={project.metrics.slice(0, 3)} columns={3} printed={false} />

            <div className="mt-6 flex flex-wrap gap-2">
              {project.technologies.slice(0, 4).map((tech) => (
                <span
                  key={tech}
                  className="border border-cloth-400 px-2.5 py-1 text-label uppercase text-mark-700"
                >
                  {tech}
                </span>
              ))}
              {project.technologies.length > 4 && (
                <span className="border border-cloth-300 px-2.5 py-1 text-label uppercase text-mark-500">
                  +{project.technologies.length - 4} more
                </span>
              )}
            </div>

            <span className="mt-6 inline-flex items-center gap-2 font-semibold text-pindo transition-transform duration-250 ease-press group-hover:translate-x-1">
              Explore Full Details
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M4 12h15M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
        </div>

        {/* ---- Reverse: April's discipline in tiny type ---- */}
        {reverseMounted && (
          <div
            className="packet-reverse bg-cloth-200 p-5 sm:p-6"
            aria-hidden={turned ? undefined : 'true'}
          >
            <p className="text-label uppercase text-mark-600">
              {project.index} · Specification
            </p>

            <h4 className="mt-4 font-display text-title font-bold text-mark-900">
              Tables the platform runs on
            </h4>

            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[26rem] border-collapse text-left text-sm">
                <caption className="sr-only">
                  Database tables in the {project.title} schema
                </caption>
                <thead>
                  <tr className="border-b border-mark-900">
                    <th scope="col" className="py-2 pr-3 text-label uppercase text-mark-600">Table</th>
                    <th scope="col" className="py-2 pr-3 text-label uppercase text-mark-600">Shape</th>
                    <th scope="col" className="py-2 text-label uppercase text-mark-600">Holds</th>
                  </tr>
                </thead>
                <tbody>
                  {project.databaseSchema.map((row) => (
                    <tr key={row.name} className="border-b border-cloth-300 align-top">
                      <td className="py-2 pr-3 font-semibold text-pindo">{row.name}</td>
                      <td className="whitespace-nowrap py-2 pr-3 text-mark-600">{row.shape}</td>
                      <td className="py-2 text-mark-700">{row.holds}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h4 className="mt-7 font-display text-title font-bold text-mark-900">How it is put together</h4>
            <ul className="mt-3 list-none space-y-1.5 p-0 text-sm text-mark-700">
              {project.architecture.map((line) => (
                <li key={line} className="border-b border-cloth-300 pb-1.5">{line}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* The stile: the object's finished edge. State on the left, the turn on the
          right. It stays put while the sheet turns. */}
      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-mark-900 bg-cloth-100 px-5 py-3">
        <StateMark liveStatus={project.liveStatus} />
        <button type="button" onClick={turn} className="btn-quiet" aria-pressed={turned}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M4 4v6h6M20 20v-6h-6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M20 9a8 8 0 0 0-14.7-2.5M4 15a8 8 0 0 0 14.7 2.5" strokeLinecap="round" />
          </svg>
          {turned ? 'Turn to the screenshot' : 'Turn to the specification'}
        </button>
      </div>
    </article>
  );
};

const Projects = () => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const closeRef = useRef(null);

  const openProjectDetails = useCallback((project) => {
    setSelectedProject(project);
    setShowModal(true);
    trackProjectView(project.title);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeProjectDetails = useCallback(() => {
    setShowModal(false);
    document.body.style.overflow = 'unset';
    setTimeout(() => setSelectedProject(null), 300);
  }, []);

  // Escape closes it, and focus lands on the close control when it opens. A dialog
  // that traps neither is a dialog a keyboard user cannot leave.
  useEffect(() => {
    if (!showModal) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') closeProjectDetails();
    };
    document.addEventListener('keydown', onKey);
    closeRef.current?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [showModal, closeProjectDetails]);

  return (
    <Panel id="projects" labelledBy="projects-heading">
      {(printed) => (
        <>
          <PanelHead
            id="projects-heading"
            heading={PANELS.work.heading}
            jina={PANELS.work.jina}
            lead={PANELS.work.lead}
            printed={printed}
          />

          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            {PROJECTS.map((project) => (
              <Packet key={project.id} project={project} onOpen={openProjectDetails} />
            ))}
          </div>

          <p className="mt-10 max-w-prose text-mark-600">
            Both platforms are still maintained. The technical detail behind each one is in
            its case study.
          </p>

          <AnimatePresence>
            {showModal && selectedProject && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-mark-900/60 p-3 sm:p-6"
                onClick={closeProjectDetails}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
              >
                <motion.div
                  initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: shouldReduceMotion ? 0 : 24 }}
                  transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                  className="relative my-4 w-full max-w-4xl bg-cloth-100 pindo"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="max-h-[86vh] overflow-y-auto">
                    <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b-2 border-pindo bg-cloth-100 px-5 py-4 sm:px-8">
                      <div>
                        <p className="text-label uppercase text-mark-600">
                          {selectedProject.index} · {selectedProject.category}
                        </p>
                        <h3 id="modal-title" className="mt-2 font-display text-display font-bold text-mark-900">
                          {selectedProject.title}
                        </h3>
                        <p className="mt-1 text-mark-600">{selectedProject.tagline}</p>
                      </div>

                      <button
                        ref={closeRef}
                        type="button"
                        onClick={closeProjectDetails}
                        className="shrink-0 border border-cloth-400 p-2.5 text-mark-700 transition-colors duration-250 ease-press hover:border-pindo hover:text-pindo"
                        aria-label="Close modal"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div className="space-y-10 px-5 py-8 sm:px-8">
                      {selectedProject.screenshots?.length > 0 && (
                        <section>
                          <h4 className="font-display text-title font-bold text-mark-900">The shipped product</h4>
                          <div className="mt-4 grid gap-5 sm:grid-cols-2">
                            {selectedProject.screenshots.map((shot, idx) => (
                              <figure key={shot.src} className={`m-0 ${idx === 0 ? 'sm:col-span-2' : ''}`}>
                                <ImageWithFallback
                                  src={shot.src}
                                  alt={shot.alt}
                                  width={1600}
                                  height={1000}
                                  sizes="(max-width: 640px) 100vw, 620px"
                                  className="border border-mark-900"
                                />
                                <figcaption className="mt-2 text-sm text-mark-600">{shot.caption}</figcaption>
                              </figure>
                            ))}
                          </div>
                        </section>
                      )}

                      <section>
                        <h4 className="font-display text-title font-bold text-mark-900">What it is</h4>
                        <p className="mt-3 max-w-prose leading-relaxed text-mark-700">
                          {selectedProject.description}
                        </p>
                      </section>

                      <section className="grid gap-8 md:grid-cols-2">
                        <div>
                          <h4 className="font-display text-title font-bold text-mark-900">The problem</h4>
                          <p className="mt-3 leading-relaxed text-mark-700">{selectedProject.challenge}</p>
                        </div>
                        <div>
                          <h4 className="font-display text-title font-bold text-mark-900">What I did</h4>
                          <p className="mt-3 leading-relaxed text-mark-700">{selectedProject.solution}</p>
                        </div>
                      </section>

                      <section>
                        <h4 className="font-display text-title font-bold text-mark-900">Measured</h4>
                        <Band items={selectedProject.metrics} columns={3} printed={false} />
                      </section>

                      {selectedProject.architecture?.length > 0 && (
                        <section>
                          <h4 className="font-display text-title font-bold text-mark-900">How it works</h4>
                          <div className="mt-4">
                            <ProjectDiagram projectId={selectedProject.id} />
                          </div>
                          <details className="mt-5 border-t border-cloth-300 pt-4">
                            <summary className="cursor-pointer text-label uppercase text-mark-600 transition-colors hover:text-pindo">
                              Full stack breakdown
                            </summary>
                            <ul className="mt-3 list-none space-y-1.5 p-0 text-sm text-mark-700">
                              {selectedProject.architecture.map((arch) => (
                                <li key={arch}>{arch}</li>
                              ))}
                            </ul>
                          </details>
                        </section>
                      )}

                      <section>
                        <h4 className="font-display text-title font-bold text-mark-900">
                          What it does ({selectedProject.features.length})
                        </h4>
                        <ul className="mt-4 grid list-none gap-x-8 gap-y-2 p-0 text-mark-700 md:grid-cols-2">
                          {selectedProject.features.map((feature) => (
                            <li key={feature} className="border-b border-cloth-300 py-1.5">{feature}</li>
                          ))}
                        </ul>
                      </section>

                      <section>
                        <h4 className="font-display text-title font-bold text-mark-900">What it took</h4>
                        <ul className="mt-4 grid list-none gap-x-8 gap-y-2 p-0 text-mark-700 md:grid-cols-2">
                          {selectedProject.technicalHighlights.map((highlight) => (
                            <li key={highlight} className="border-b border-cloth-300 py-1.5">{highlight}</li>
                          ))}
                        </ul>
                      </section>

                      <section>
                        <h4 className="font-display text-title font-bold text-mark-900">What changed for the client</h4>
                        <ul className="mt-4 list-none space-y-2 p-0 text-mark-700">
                          {selectedProject.keyAchievements.map((achievement) => (
                            <li key={achievement} className="border-b border-cloth-300 py-1.5">{achievement}</li>
                          ))}
                        </ul>
                      </section>

                      <section>
                        <h4 className="font-display text-title font-bold text-mark-900">Stack</h4>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {selectedProject.technologies.map((tech) => (
                            <span
                              key={tech}
                              className="border border-cloth-400 px-2.5 py-1 text-label uppercase text-mark-700"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </section>

                      <section className="border-t-2 border-pindo pt-7">
                        {selectedProject.liveStatus?.state === 'maintenance' && (
                          <p className="mb-4 border border-warn bg-cloth-200 px-4 py-3 leading-relaxed text-warn">
                            {selectedProject.liveStatus.label} (checked{' '}
                            {selectedProject.liveStatus.checkedOn}), so the live link currently
                            shows the client&apos;s maintenance page.
                          </p>
                        )}

                        <div className="flex flex-col gap-3 sm:flex-row">
                          {selectedProject.liveUrl && (
                            <a
                              href={selectedProject.liveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-pindo no-underline"
                            >
                              {selectedProject.liveStatus?.state === 'maintenance'
                                ? 'Visit Site Anyway'
                                : 'View Live Platform'}
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                <path d="M10 6H5v13h13v-5M14 4h6v6M20 4l-9 9" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </a>
                          )}
                          {selectedProject.githubUrl && (
                            <a
                              href={selectedProject.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-outline no-underline"
                            >
                              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                              </svg>
                              View Source Code
                            </a>
                          )}
                        </div>
                      </section>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </Panel>
  );
};

export default Projects;
