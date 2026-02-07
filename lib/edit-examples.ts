/**
 * Modern example-based prompts for teaching AI best practices in React/Tailwind development
 * 
 * This module provides comprehensive examples demonstrating precise, targeted edits
 * following modern React patterns, responsive design principles, and Tailwind CSS best practices.
 */

export const EDIT_EXAMPLES = `
## 🎯 Modern Edit Strategy Examples

### Example 1: Update Header Color - Precision Styling
USER: "Make the header background black"

✅ CORRECT APPROACH:
1. Identify Header component (Header.jsx or Navigation.jsx)
2. Edit ONLY the specific background class
3. Preserve ALL other functionality and classes
4. Ensure responsive variants remain intact

❌ INCORRECT APPROACH:
- Regenerating entire App.jsx
- Creating new Header.jsx from scratch
- Modifying unrelated components
- Redesigning the entire header

EXPECTED OUTPUT:
<file path="src/components/Header.jsx">
import React from 'react';

export default function Header() {
  return (
    {/* Only bg-gray-800 changed to bg-black - everything else preserved */}
    <header className="w-full bg-black text-white py-4 shadow-md">
      <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
        <div className="flex items-center">
          <img src="/logo.svg" alt="Logo" className="h-8 w-auto" />
          <span className="ml-2 text-xl font-bold">Company</span>
        </div>
        <nav className="hidden md:flex space-x-6">
          <a href="#" className="hover:text-blue-300 transition-colors">Home</a>
          <a href="#about" className="hover:text-blue-300 transition-colors">About</a>
          <a href="#services" className="hover:text-blue-300 transition-colors">Services</a>
          <a href="#contact" className="hover:text-blue-300 transition-colors">Contact</a>
        </nav>
        <button className="md:hidden">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </header>
  );
}
</file>

### Example 2: Add New Page - Component Architecture
USER: "Add a videos page"

✅ CORRECT APPROACH:
1. Create Videos.jsx component with proper responsive design
2. Update ONLY routing in App.jsx or Router component
3. Add navigation link in Header.jsx
4. Use modern hooks and functional components

❌ INCORRECT APPROACH:
- Regenerating entire application
- Recreating all existing pages
- Creating class components instead of functional components
- Forgetting responsive design principles

EXPECTED OUTPUT:
<file path="src/components/Videos.jsx">
import React, { useState, useEffect } from 'react';

export default function Videos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setVideos([
        { id: 1, title: 'Getting Started', thumbnail: '/thumbnails/video1.jpg', duration: '3:45' },
        { id: 2, title: 'Advanced Techniques', thumbnail: '/thumbnails/video2.jpg', duration: '5:12' },
        { id: 3, title: 'Best Practices', thumbnail: '/thumbnails/video3.jpg', duration: '4:30' }
      ]);
      setLoading(false);
    }, 1000);
  }, []);
  
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">Video Library</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map(video => (
              <div key={video.id} className="bg-white rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300">
                <div className="relative pb-[56.25%]">
                  <img src={video.thumbnail} alt={video.title} className="absolute h-full w-full object-cover" />
                  <span className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
                    {video.duration}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{video.title}</h3>
                  <button className="mt-2 inline-flex items-center text-blue-600 hover:text-blue-800">
                    Watch Now
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
</file>

<file path="src/App.jsx">
import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Testimonials from './components/Testimonials';
import Videos from './components/Videos'; // Only this line added
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Hero />
      <Features />
      <Videos /> {/* Only this line added */}
      <Testimonials />
      <Footer />
    </div>
  );
}
</file>

### Example 3: Fix Styling Issue - Mobile-First Responsive Design
USER: "Fix the button styling on mobile"

✅ CORRECT APPROACH:
1. Identify which component has the button
2. Update ONLY that component's Tailwind responsive classes
3. Add appropriate mobile-first responsive modifiers (sm:, md:, etc)
4. Test across all breakpoints

❌ INCORRECT APPROACH:
- Regenerating all components
- Creating new CSS files
- Modifying global styles unnecessarily
- Using fixed pixel values instead of responsive classes

EXPECTED OUTPUT:
<file path="src/components/Hero.jsx">
import React from 'react';

export default function Hero() {
  return (
    <section className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 py-12 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
          Build Something Amazing
        </h1>
        <p className="text-lg text-blue-100 max-w-2xl mx-auto mb-8">
          Create stunning web applications with our powerful platform
        </p>
        {/* Button updated with proper responsive sizing & padding */}
        <button 
          className="w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-4 bg-white text-blue-600 
                     font-medium rounded-lg shadow-md hover:bg-blue-50 focus:outline-none 
                     focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all">
          Get Started Now
        </button>
      </div>
    </section>
  );
}
</file>

### Example 4: Add Feature to Component - Modern UI Patterns
USER: "Add a search bar to the header"

✅ CORRECT APPROACH:
1. Modify Header.jsx to add search functionality with proper accessibility
2. Preserve all existing header content and responsive behavior
3. Add appropriate responsive visibility and spacing
4. Include focus states and keyboard accessibility

❌ INCORRECT APPROACH:
- Creating Header.jsx from scratch
- Losing existing navigation/branding
- Using fixed width/position instead of responsive
- Forgetting proper accessibility attributes

EXPECTED OUTPUT:
<file path="src/components/Header.jsx">
import React, { useState } from 'react';

export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  return (
    <header className="w-full bg-white shadow-md py-4">
      <div className="container mx-auto px-4 md:px-6 flex flex-wrap items-center justify-between">
        {/* Logo and brand - preserved from original */}
        <div className="flex items-center">
          <img src="/logo.svg" alt="Logo" className="h-8 w-auto" />
          <span className="ml-2 text-xl font-bold text-gray-900">Company</span>
        </div>
        
        {/* New search component - mobile responsive */}
        <div className={\`order-3 md:order-2 w-full md:w-auto mt-4 md:mt-0 \${isSearchOpen ? 'block' : 'hidden md:block'}\`}>
          <form className="flex items-center" onSubmit={(e) => e.preventDefault()}>
            <label htmlFor="search-input" className="sr-only">Search</label>
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="search"
                id="search-input"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
                placeholder="Search..."
                aria-label="Search through site content"
              />
            </div>
            <button 
              type="submit" 
              className="p-2.5 ml-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300"
              aria-label="Submit search"
            >
              <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
        </div>
        
        {/* Navigation - preserved from original with updated order */}
        <nav className="hidden md:flex order-2 md:order-3 space-x-6">
          <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">Home</a>
          <a href="#about" className="text-gray-700 hover:text-blue-600 transition-colors">About</a>
          <a href="#services" className="text-gray-700 hover:text-blue-600 transition-colors">Services</a>
          <a href="#contact" className="text-gray-700 hover:text-blue-600 transition-colors">Contact</a>
        </nav>
        
        {/* Mobile buttons - updated with search toggle */}
        <div className="flex items-center order-2 md:order-4">
          <button 
            className="md:hidden mr-2 text-gray-700 hover:text-blue-600"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            aria-label="Toggle search"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <button className="md:hidden text-gray-700 hover:text-blue-600" aria-label="Toggle menu">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
</file>

### Example 5: Add New Component - Composable Design
USER: "Add a newsletter signup to the footer"

✅ CORRECT APPROACH:
1. Create Newsletter.jsx component with form validation
2. UPDATE Footer.jsx to import Newsletter
3. Add <Newsletter /> in the appropriate place in Footer
4. Implement responsive design and accessibility

❌ INCORRECT APPROACH:
- Creating a new Footer.jsx from scratch
- Not including form validation and error states
- Missing accessibility attributes
- Using outdated class components

EXPECTED OUTPUT:
<file path="src/components/Newsletter.jsx">
import React, { useState } from 'react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: null, message: '' });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic email validation
    if (!email || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      setStatus({
        type: 'error',
        message: 'Please enter a valid email address'
      });
      return;
    }
    
    // Simulate API call
    setStatus({ type: 'loading', message: 'Subscribing...' });
    
    // Mock successful subscription after delay
    setTimeout(() => {
      setStatus({
        type: 'success',
        message: 'Thanks for subscribing!'
      });
      setEmail('');
    }, 1500);
  };
  
  return (
    <div className="w-full max-w-md">
      <h3 className="text-lg font-semibold text-white mb-3">Subscribe to our newsletter</h3>
      <p className="text-gray-300 mb-4">Get the latest updates and news delivered to your inbox.</p>
      
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <div className="flex-grow">
          <label htmlFor="email-address" className="sr-only">Email address</label>
          <input
            id="email-address"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="w-full min-w-0 px-4 py-2 text-base text-gray-900 placeholder-gray-500 bg-white border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-describedby={status.message ? "newsletter-feedback" : undefined}
            aria-invalid={status.type === 'error'}
          />
        </div>
        <button
          type="submit"
          className={\`flex-none px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 \${
            status.type === 'loading' ? 'opacity-75 cursor-wait' : ''
          }\`}
          disabled={status.type === 'loading'}
        >
          {status.type === 'loading' ? 'Subscribing...' : 'Subscribe'}
        </button>
      </form>
      
      {status.message && (
        <p 
          id="newsletter-feedback" 
          className={\`mt-2 text-sm \${
            status.type === 'error' ? 'text-red-400' : 
            status.type === 'success' ? 'text-green-400' : 'text-gray-300'
          }\`}
        >
          {status.message}
        </p>
      )}
    </div>
  );
}
</file>

<file path="src/components/Footer.jsx">
import React from 'react';
import Newsletter from './Newsletter';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company info - preserved from original */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="#about" className="text-gray-300 hover:text-white transition-colors">About Us</a></li>
              <li><a href="#careers" className="text-gray-300 hover:text-white transition-colors">Careers</a></li>
              <li><a href="#blog" className="text-gray-300 hover:text-white transition-colors">Blog</a></li>
            </ul>
          </div>
          
          {/* Resources - preserved from original */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#docs" className="text-gray-300 hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#guides" className="text-gray-300 hover:text-white transition-colors">Guides</a></li>
              <li><a href="#support" className="text-gray-300 hover:text-white transition-colors">Support</a></li>
            </ul>
          </div>
          
          {/* Contact info - preserved from original */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <address className="not-italic text-gray-300">
              <p>123 Main Street</p>
              <p>New York, NY 10001</p>
              <p className="mt-2">
                <a href="mailto:info@example.com" className="hover:text-white transition-colors">info@example.com</a>
              </p>
            </address>
          </div>
          
          {/* Newsletter - newly added component */}
          <div>
            <Newsletter />
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400">&copy; {new Date().getFullYear()} Company, Inc. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Twitter">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="LinkedIn">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="GitHub">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
</file>

### Example 6: Add External Library - Modern Integration
USER: "Add animations with framer-motion to the hero"

✅ CORRECT APPROACH:
1. Import framer-motion in Hero.jsx with proper typing
2. Use motion components for staggered animations
3. Implement animation variants for coordinated sequences
4. Preserve existing structure and styling

❌ INCORRECT APPROACH:
- Installing unnecessary dependencies
- Creating custom animation CSS
- Using class components instead of hooks
- Overriding existing styles with inline styles

EXPECTED OUTPUT:
<file path="src/components/Hero.jsx">
import React from 'react';
import { motion } from 'framer-motion';

export default function Hero() {
  // Animation variants for coordinated sequences
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: [0.6, 0.05, -0.01, 0.9]
      }
    }
  };
  
  const buttonVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: {
        duration: 0.5,
        delay: 0.6
      }
    },
    hover: { 
      scale: 1.05,
      transition: {
        duration: 0.2,
        yoyo: Infinity,
        yoyoEase: true
      }
    }
  };
  
  return (
    <section className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 py-12 sm:py-20">
      <motion.div 
        className="container mx-auto px-4 sm:px-6 lg:px-8 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1 
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4"
          variants={itemVariants}
        >
          Build Something Amazing
        </motion.h1>
        <motion.p 
          className="text-lg text-blue-100 max-w-2xl mx-auto mb-8"
          variants={itemVariants}
        >
          Create stunning web applications with our powerful platform
        </motion.p>
        <motion.button 
          className="px-8 py-3 bg-white text-blue-600 font-medium rounded-lg shadow-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          variants={buttonVariants}
          whileHover="hover"
        >
          Get Started
        </motion.button>
      </motion.div>
    </section>
  );
}
</file>

### Example 7: Remove Element - Precise Deletion
USER: "Remove start deploying button"

✅ CORRECT APPROACH:
1. Search for "start deploying" in all component files
2. Find it in Hero.jsx
3. Edit ONLY Hero.jsx to remove that specific button
4. Preserve all other content and structure

❌ INCORRECT APPROACH:
- Creating a new file
- Editing multiple files
- Redesigning the entire Hero
- Removing other buttons or elements

EXPECTED OUTPUT:
<file path="src/components/Hero.jsx">
import React from 'react';

export default function Hero() {
  return (
    <section className="bg-gray-900 text-white py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-5xl font-bold mb-4">Welcome to Our Platform</h1>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Build, deploy, and scale your applications with our powerful cloud infrastructure.
        </p>
        {/* 'Start deploying' button removed, but other buttons preserved */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
            Learn More
          </button>
          <button className="px-8 py-3 bg-transparent border border-white text-white font-medium rounded-lg hover:bg-white hover:text-gray-900 transition-colors">
            Sign Up Free
          </button>
        </div>
      </div>
    </section>
  );
}
</file>

### Example 8: Delete Section - Targeted Removal
USER: "Delete the testimonials section"

CORRECT APPROACH:
1. Find which file contains testimonials
2. Remove only that section from the file
3. Keep all other content intact

INCORRECT APPROACH:
- Deleting the entire file
- Recreating the page without testimonials

### Example 9: Change a Single Style (CRITICAL EXAMPLE)
USER: "update the hero to bg blue"

CORRECT APPROACH:
1. Identify the Hero component file: 'src/components/Hero.jsx'.
2. Locate the outermost 'div' or container element.
3. Find the existing background color class (e.g., 'bg-gray-900').
4. Replace ONLY that class with 'bg-blue-500'.
5. Return the entire file, completely unchanged except for that single class modification.

**Original File Content (BEFORE):**
<file path="src/components/Hero.jsx">
import React from 'react';

export default function Hero() {
  return (
    <div className="w-full bg-gray-900 text-white py-20 px-4">
      <h1 className="text-5xl font-bold">Welcome to the App</h1>
      <p className="mt-4 text-lg">This is the original hero section.</p>
      <button className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg">
        Get Started
      </button>
    </div>
  );
}
</file>

**Expected Output (AFTER):**
<file path="src/components/Hero.jsx">
import React from 'react';

export default function Hero() {
  return (
    <div className="w-full bg-blue-500 text-white py-20 px-4">
      <h1 className="text-5xl font-bold">Welcome to the App</h1>
      <p className="mt-4 text-lg">This is the original hero section.</p>
      <button className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg">
        Get Started
      </button>
    </div>
  );
}
</file>

✅ CORRECT APPROACH:
1. Find which file contains testimonials (App.jsx and Testimonials.jsx)
2. Remove the Testimonials import and component usage from App.jsx
3. Keep all other components and structure intact
4. No need to modify Testimonials.jsx itself (it can be deleted later)

❌ INCORRECT APPROACH:
- Deleting the Testimonials.jsx file but leaving the import in App.jsx (causes error)
- Recreating the entire App.jsx without testimonials
- Removing other unrelated sections
- Redesigning the layout

EXPECTED OUTPUT:
<file path="src/App.jsx">
import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
// Testimonials import removed
import Pricing from './components/Pricing';
import Contact from './components/Contact';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Hero />
      <Features />
      {/* Testimonials component removed */}
      <Pricing />
      <Contact />
      <Footer />
    </div>
  );
}
</file>

### Example 9: Change a Single Style - Precision Editing
USER: "update the hero to bg blue"

✅ CORRECT APPROACH:
1. Identify the Hero component file: 'src/components/Hero.jsx'.
2. Locate the outermost 'div' or container element.
3. Find the existing background color class (e.g., 'bg-gray-900').
4. Replace ONLY that class with 'bg-blue-500'.
5. Return the entire file, completely unchanged except for that single class modification.

❌ INCORRECT APPROACH:
- Changing other classes not mentioned by the user
- Updating text color without being asked
- Redesigning the entire Hero component
- Adding new elements or changing structure
- "Improving" the component with unrelated changes

**Original File Content (BEFORE):**
<file path="src/components/Hero.jsx">
import React from 'react';

export default function Hero() {
  return (
    <div className="w-full bg-gray-900 text-white py-20 px-4">
      <h1 className="text-5xl font-bold">Welcome to the App</h1>
      <p className="mt-4 text-lg">This is the original hero section.</p>
      <button className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg">
        Get Started
      </button>
    </div>
  );
}
</file>

**Expected Output (AFTER):**
<file path="src/components/Hero.jsx">
import React from 'react';

export default function Hero() {
  return (
    <div className="w-full bg-blue-500 text-white py-20 px-4">
      <h1 className="text-5xl font-bold">Welcome to the App</h1>
      <p className="mt-4 text-lg">This is the original hero section.</p>
      <button className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg">
        Get Started
      </button>
    </div>
  );
}
</file>

**NOTICE: Everything remains EXACTLY the same except 'bg-gray-900' → 'bg-blue-500'.**
- The button still has bg-blue-600 (unchanged)
- All text, structure, imports are identical
- No reformatting, no "improvements", no cleanup

### Example 10: Update Responsive Design - Mobile-First Approach
USER: "Make the features section responsive"

✅ CORRECT APPROACH:
1. Identify the Features component file
2. Update the grid layout with responsive breakpoints
3. Adjust spacing and typography for different screen sizes
4. Preserve all existing content and functionality

❌ INCORRECT APPROACH:
- Using fixed pixel widths
- Creating media queries instead of Tailwind responsive classes
- Completely redesigning the section
- Changing the content or adding new features

EXPECTED OUTPUT:
<file path="src/components/Features.jsx">
import React from 'react';

export default function Features() {
  const features = [
    {
      title: "Cloud Storage",
      description: "Store your files securely in the cloud with unlimited space.",
      icon: (
        <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
      )
    },
    {
      title: "Secure Authentication",
      description: "Protect your application with our advanced authentication system.",
      icon: (
        <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    },
    {
      title: "API Integration",
      description: "Connect with thousands of services through our simple API.",
      icon: (
        <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    }
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-white">
      {/* Container with responsive padding */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header with responsive text sizes */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
            Powerful Features
          </h2>
          <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to build modern applications, all in one platform.
          </p>
        </div>
        
        {/* Responsive grid layout - 1 column on mobile, 3 columns on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-gray-50 p-6 sm:p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
</file>

## 🎯 Key Principles

1. **Minimal Changes**: Only modify what's necessary - surgical precision
2. **Preserve Functionality**: Keep all existing features working
3. **Respect Structure**: Follow existing patterns and architecture
4. **Target Precision**: Edit specific files, not everything
5. **Context Awareness**: Use imports/exports to understand relationships
6. **Mobile-First**: Always use responsive Tailwind classes (sm:, md:, lg:, xl:)
7. **Accessibility**: Include proper ARIA attributes and semantic HTML
8. **Performance**: Use React.memo, useCallback, and useMemo where appropriate

## 🔍 File Identification Patterns

- **Navigation**: Check Header.jsx first (navigation usually lives here)
- **Layout Components**: Layout.jsx, RootLayout.jsx, or App.jsx
- **Page Components**: Pages directory or src/pages/
- **UI Components**: Usually in components/ui/ directory
- **Styling**: Component files with Tailwind, rarely separate CSS
- **Routing**: App.jsx, Router.jsx, or pages directory
- **Data Fetching**: Page components or dedicated hooks/services

## 📐 Edit Intent Classification

**UPDATE_COMPONENT**: Modify existing component
- Keywords: update, change, modify, edit, fix
- Action: Edit single file with surgical precision

**ADD_FEATURE**: Add new functionality
- Keywords: add, create, implement, build
- Action: Create new files + minimal edits to parent components

**FIX_ISSUE**: Resolve problems
- Keywords: fix, resolve, debug, repair
- Action: Targeted fixes with minimal changes

**UPDATE_STYLE**: Change appearance
- Keywords: style, color, theme, design
- Action: Update specific Tailwind classes, preserve all other functionality

**REFACTOR**: Improve code quality
- Keywords: refactor, clean, optimize
- Action: Restructure without changing behavior, improve performance

## 🚨 Common Mistakes to Avoid

1. **Recreating Entire Files**: Never regenerate a whole file for a small change
2. **Over-Editing**: Don't touch what wasn't requested
3. **Navigation Duplication**: Navigation belongs in Header.jsx, not as separate Nav.jsx
4. **Missing Mobile Views**: Always test at all breakpoints
5. **Incomplete Accessibility**: Always include proper ARIA attributes
6. **Non-Tailwind Classes**: Use only standard Tailwind CSS classes
7. **Missing State Management**: Use React hooks for proper state handling
`;

export function getEditExamplesPrompt(): string {
  return EDIT_EXAMPLES;
}

export function getComponentPatternPrompt(fileStructure: string): string {
  return `
## 🏗️ Current Project Architecture

${fileStructure}

## 📋 Component Naming & Organization

Based on your file structure, follow these architectural patterns:

### 📁 Directory Structure
1. **Components**: \`src/components/\` - Reusable UI building blocks
2. **Pages**: \`src/pages/\` or \`app/\` - Route-specific components
3. **Layouts**: \`src/components/layouts/\` - Page structure components
4. **UI**: \`src/components/ui/\` - Primitive UI components (buttons, inputs)
5. **Utilities**: \`src/utils/\` or \`src/lib/\` - Helper functions & hooks

### 🧩 Component Naming Conventions
- Use **PascalCase** for component files (Header.jsx, Button.tsx)
- Use **camelCase** for utility files (formatDate.js, useAuth.ts)
- Follow semantic naming patterns:
  - Layout components: Layout, Header, Footer, Sidebar
  - Page components: Home, About, Products, Contact
  - Feature components: ProductList, UserProfile, SearchBar
  - UI components: Button, Card, Modal, Input

### 🔍 Component Resolution Strategy
When the user mentions a component by name:
1. Check for **exact matches** first (Header → Header.jsx)
2. Check **semantic equivalents** (navbar → Header.jsx, Nav.jsx)
3. Check **parent components** (search → Header.jsx might contain search)
4. Check **layout components** (top bar → Header.jsx, Navbar.jsx)

### 📱 Responsive Component Structure
- All components should use Tailwind's responsive classes
- Mobile-first approach: default styles for mobile, then sm:, md:, lg: modifiers
- Containers use \`container mx-auto px-4 sm:px-6 lg:px-8\` pattern
- Grids use \`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x\` pattern
- Typography uses responsive sizes: \`text-base sm:text-lg lg:text-xl\`

### ♿ Accessibility Patterns
- Forms use proper labels and ARIA attributes
- Interactive elements have focus states
- Images have descriptive alt text
- Color contrast meets WCAG standards
`;
}