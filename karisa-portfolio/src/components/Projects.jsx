import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Projects = () => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const projects = [
    {
      id: 1,
      title: "The Bike Collector 254",
      description: "Modern motorcycle dealership dashboard with inventory, bookings, and payments",
      technologies: ["React", "TypeScript", "Supabase", "Tailwind CSS", "Clerk"],
      metrics: [
        { icon: "cogs", value: "Admin Dashboard" },
        { icon: "robot", value: "Automated Workflow" }
      ],
      category: "Full-Stack",
      impact: "Streamlined dealership operations with integrated payments",
      features: [
        "Secure Auth with Clerk (email, Google)",
        "Bike Inventory management with Supabase",
        "Image uploads to Cloudinary",
        "Stripe and M-Pesa checkout integration",
        "Admin analytics and role-based dashboard",
        "Email confirmations using Mailgun or Resend"
      ],
      liveUrl: "https://thebikecollector.info",
      screenshots: [
        { alt: "Dashboard", description: "Admin analytics dashboard" },
        { alt: "Inventory", description: "Bike inventory management" },
        { alt: "Booking", description: "Appointment scheduling" }
      ]
    },
    {
      id: 2,
      title: "Raslipwani Properties",
      description: "Real estate management platform with booking engine and admin dashboard",
      technologies: ["React (Vite)", "Supabase", "Tailwind CSS", "PostgreSQL"],
      metrics: [
        { icon: "users", value: "5,000+ Users" },
        { icon: "bolt", value: "40% Faster" }
      ],
      category: "Real Estate",
      impact: "Solved complex state management for real-time bookings",
      features: [
        "Property listings with images and descriptions",
        "Viewing appointment scheduling",
        "Automated email reminders",
        "Favorites system for users",
        "Admin dashboard for analytics",
        "Role-based access control"
      ],
      liveUrl: "https://raslipwani.co.ke",
      screenshots: [
        { alt: "Listings", description: "Property listings view" },
        { alt: "Booking", description: "Appointment scheduling" },
        { alt: "Dashboard", description: "Admin analytics dashboard" }
      ]
    }
  ];

  const openProjectDetails = (project) => {
    setSelectedProject(project);
    setShowModal(true);
  };

  const closeProjectDetails = () => {
    setShowModal(false);
    setTimeout(() => setSelectedProject(null), 300);
  };

  const ProjectModal = () => {
    if (!selectedProject) return null;
    
    return (
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg"
            onClick={closeProjectDetails}
          >
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="relative bg-gradient-to-br from-[#0a1929] to-[#061220] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-[#005792]/30"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={closeProjectDetails}
                className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 rounded-full"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <div className="p-8">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="md:w-2/5">
                    <div className="bg-gradient-to-br from-[#005792] to-[#003056] rounded-xl p-4 mb-6">
                      <div className="bg-gray-800/50 rounded-lg aspect-video flex items-center justify-center">
                        <div className="text-center">
                          <div className="inline-block p-4 rounded-full bg-[#61DAFB]/10 mb-4">
                            {selectedProject.category === 'Full-Stack' ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#61DAFB]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#61DAFB]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                            )}
                          </div>
                          <h3 className="text-xl font-bold text-white">{selectedProject.title}</h3>
                          <p className="text-[#61DAFB]">{selectedProject.category}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold mb-3 text-white">Key Metrics</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {selectedProject.metrics.map(metric => (
                          <div key={metric.value} className="bg-[#061220]/70 border border-[#005792]/30 rounded-lg p-3">
                            <div className="flex items-center gap-2">
                              {metric.icon === 'users' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#3ECF8E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                              ) : metric.icon === 'bolt' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#3ECF8E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                              ) : metric.icon === 'cogs' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#3ECF8E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#3ECF8E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                              )}
                              <span className="text-sm font-medium text-white">{metric.value}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      
                      <a 
                        href={selectedProject.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 text-center bg-gradient-to-r from-[#3ECF8E] to-[#2AA876] text-white py-3 rounded-lg transition-all font-medium hover:opacity-90"
                      >
                        Live Demo
                      </a>
                    </div>
                  </div>
                  
                  <div className="md:w-3/5">
                    <h3 className="text-2xl font-bold mb-4 text-white">Project Details</h3>
                    <p className="text-gray-300 mb-6">{selectedProject.description}</p>
                    
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold mb-3 text-white">Key Features</h4>
                      <ul className="space-y-2">
                        {selectedProject.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <div className="mt-1.5 text-[#61DAFB]">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <span className="text-gray-300">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold mb-3 text-white">Technologies</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedProject.technologies.map(tech => (
                          <span key={tech} className="text-sm bg-[#61DAFB]/10 text-[#61DAFB] px-3 py-1.5 rounded-lg">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <h4 className="text-lg font-semibold mb-4 text-white">Project Impact</h4>
                  <div className="bg-[#0a1929]/70 border border-[#005792]/30 rounded-xl p-5">
                    <p className="text-gray-300">
                      <span className="text-[#61DAFB] font-medium">Solution:</span> {selectedProject.impact}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  return (
    <section id="projects" className="py-20 px-4 md:px-8 bg-gradient-to-b from-[#061220] to-[#0a1929]">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.h2 
            className="text-3xl md:text-5xl font-bold mb-4 relative inline-block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Skills Showcase
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-[#61DAFB] to-[#3ECF8E] rounded-full"></div>
          </motion.h2>
          <motion.p 
            className="text-gray-400 max-w-2xl mx-auto text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Engineering-driven solutions to complex business challenges
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-[#0a1929] to-[#061220] backdrop-blur-sm border border-[#005792]/30 rounded-2xl overflow-hidden hover:border-[#61DAFB]/50 transition-all group"
            >
              <div className="h-60 relative bg-gradient-to-br from-[#0a1929] to-[#005792]">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                
                <div className="absolute top-4 right-4 bg-gradient-to-r from-[#3ECF8E] to-[#2AA876] text-[#061220] px-4 py-1 rounded-full text-sm font-bold z-10">
                  {project.category}
                </div>
                
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-3">
                    {project.category === 'Full-Stack' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#61DAFB]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#61DAFB]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    )}
                    {project.title}
                  </h3>
                  
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.slice(0, 3).map(tech => (
                      <span key={tech} className="text-xs bg-[#61DAFB]/10 text-[#61DAFB] px-2 py-1 rounded-full">
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 3 && (
                      <span className="text-xs bg-[#005792]/30 text-gray-400 px-2 py-1 rounded-full">
                        +{project.technologies.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <p className="text-gray-400 mb-4">{project.description}</p>
                <p className="text-sm text-[#61DAFB] mb-4">Solved: {project.impact}</p>
                
                <div className="flex flex-wrap gap-3 mb-6">
                  {project.metrics.map(metric => (
                    <div key={metric.value} className="flex items-center gap-2 text-sm bg-[#061220]/50 px-3 py-1.5 rounded-lg">
                      {metric.icon === 'users' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#3ECF8E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      ) : metric.icon === 'bolt' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#3ECF8E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      ) : metric.icon === 'cogs' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#3ECF8E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#3ECF8E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      )}
                      <span className="text-gray-300">{metric.value}</span>
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-3">
                  <a 
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center bg-gradient-to-r from-[#005792] to-[#004274] text-white py-3 rounded-lg font-medium transition-all hover:opacity-90"
                  >
                    Live Demo
                  </a>
                  <button 
                    onClick={() => openProjectDetails(project)}
                    className="flex-1 text-center border border-[#005792] text-gray-300 hover:border-[#61DAFB] hover:text-white py-3 rounded-lg font-medium transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          viewport={{ once: true }}
        >
          <p className="text-gray-500 max-w-2xl mx-auto mb-6">
            Interested in seeing more projects or discussing how I can help with your next initiative?
          </p>
          <a 
            href="#contact" 
            className="inline-block bg-gradient-to-r from-[#61DAFB] to-[#3ECF8E] text-[#061220] font-bold px-8 py-3 rounded-full transition-all hover:opacity-90"
          >
            Let's Connect
          </a>
        </motion.div>
      </div>
      
      <ProjectModal />
    </section>
  );
};

export default Projects;