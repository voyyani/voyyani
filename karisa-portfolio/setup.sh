#!/bin/bash

# Create directory structure
mkdir -p src/components
mkdir -p src/sections
mkdir -p src/hooks
mkdir -p src/assets/diagrams

# Create component files
touch src/components/Hero.jsx
touch src/components/Navigation.jsx
touch src/components/SkillsOrb.jsx
touch src/components/ProjectCard.jsx
touch src/components/EngineeringDiagram.jsx
touch src/components/ContactForm.jsx

# Create section files
touch src/sections/AboutSection.jsx
touch src/sections/ProjectsSection.jsx
touch src/sections/SkillsSection.jsx
touch src/sections/PhilosophySection.jsx
touch src/sections/ContactSection.jsx

# Create hooks
touch src/hooks/useScrollAnimation.js

# Create root files
touch src/App.jsx
touch src/main.jsx

echo "✅ Portfolio JSX file structure created successfully."
