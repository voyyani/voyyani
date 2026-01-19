import React from 'react';
import { motion } from 'framer-motion';
import ContactForm from '../components/ContactForm';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const ContactSection = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });

  // African-inspired pattern
  const africanPattern = "data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4A017' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E";

  return (
    <section
      ref={ref}
      id="contact"
      className="relative py-20 px-4 overflow-hidden"
      style={{ backgroundImage: `url("${africanPattern}")` }}
    >
      {/* Background decorations */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#005792] rounded-full blur-3xl opacity-10"></div>
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-[#61DAFB] rounded-full blur-3xl opacity-10"></div>
        <div className="absolute top-10 right-10 w-32 h-32 bg-[#D4A017] rounded-full mix-blend-multiply blur-xl opacity-10"></div>
      </div>

      <div className="container mx-auto max-w-4xl relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="inline-block mb-4"
          >
            <span className="px-4 py-2 rounded-full border-2 border-[#D4A017]/60 text-[#D4A017] text-sm font-medium tracking-widest">
              LET'S CONNECT
            </span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Get In <span className="text-[#61DAFB]">Touch</span>
          </h2>
          
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Have a project in mind? Let's work together to bring your ideas to life with engineering precision.
          </p>
        </motion.div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-[#0a1929]/50 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-[#005792]/30 shadow-2xl"
        >
          <ContactForm />
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center"
        >
          <div className="p-6 rounded-xl bg-[#0a1929]/30 border border-[#005792]/20">
            <div className="text-[#61DAFB] mb-3 flex justify-center">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-2">Email Response</h3>
            <p className="text-gray-400 text-sm">Within 24 hours</p>
          </div>

          <div className="p-6 rounded-xl bg-[#0a1929]/30 border border-[#005792]/20">
            <div className="text-[#61DAFB] mb-3 flex justify-center">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-2">Based In</h3>
            <p className="text-gray-400 text-sm">Nairobi, Kenya</p>
          </div>

          <div className="p-6 rounded-xl bg-[#0a1929]/30 border border-[#005792]/20">
            <div className="text-[#61DAFB] mb-3 flex justify-center">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-2">Availability</h3>
            <p className="text-gray-400 text-sm">Open for projects</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactSection;
