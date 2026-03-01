// Simulated roles at Xobin for the "Explore Other Roles" feature

export interface XobinRole {
  id: string;
  title: string;
  level: string;
  location: string;
  roleType: 'tech' | 'data' | 'design';
  jdFull: string;
  keySkills: string[];
  createdAt: string;
}

export const xobinRoles: XobinRole[] = [
  {
    id: 'xobin-sde',
    title: 'Software Development Engineer',
    level: 'Intern',
    location: 'Remote',
    roleType: 'tech',
    keySkills: ['React', 'TypeScript', 'Node.js'],
    createdAt: '2026-01-15T00:00:00Z',
    jdFull: `About the Role
We're looking for a Software Development Engineer to join our engineering team at Xobin. You'll build and enhance our AI-powered talent assessment platform used by 800+ companies worldwide.

Responsibilities
• Design and implement scalable backend services and APIs for the assessment platform
• Build interactive, accessible front-end interfaces for candidates and recruiters
• Collaborate with product and data science teams to deliver end-to-end features
• Write clean, testable code with comprehensive unit and integration tests
• Participate in architecture reviews, code reviews, and technical planning
• Optimize platform performance for high-concurrency assessment sessions

Requirements
• 2+ years of professional software development experience
• Strong proficiency in JavaScript/TypeScript, React, and Node.js
• Experience with relational databases (PostgreSQL preferred)
• Solid understanding of RESTful API design and microservices architecture
• Familiarity with cloud platforms (AWS/GCP) and CI/CD pipelines
• Excellent problem-solving skills and attention to detail

Nice to Have
• Experience with assessment/EdTech platforms
• Familiarity with AI/ML pipelines and natural language processing
• Contributions to open-source projects
• Experience with real-time systems (WebSocket, server-sent events)`,
  },
  {
    id: 'xobin-frontend',
    title: 'Frontend Engineer Intern',
    level: 'Intern',
    location: 'Remote',
    roleType: 'tech',
    keySkills: ['React', 'Next.js', 'Tailwind CSS'],
    createdAt: '2026-02-01T00:00:00Z',
    jdFull: `About the Role
Join Xobin's frontend team to build beautiful, accessible, and high-performance interfaces for our AI-powered assessment platform. You'll work closely with designers and backend engineers to ship pixel-perfect features.

Responsibilities
• Build responsive, accessible UI components using React and Next.js
• Implement design system components with Tailwind CSS and Radix primitives
• Optimize Core Web Vitals and page load performance
• Write unit and integration tests with Vitest and Playwright
• Collaborate on UX research insights to iterate on candidate-facing flows
• Contribute to internal component libraries and design tokens

Requirements
• Proficiency in React, TypeScript, and modern CSS (Tailwind preferred)
• Experience with Next.js App Router or similar SSR/SSG frameworks
• Understanding of accessibility standards (WCAG 2.1 AA)
• Familiarity with Git, CI/CD, and agile workflows
• Strong eye for design detail and layout precision

Nice to Have
• Experience with animation libraries (Framer Motion, GSAP)
• Contributions to open-source UI libraries
• Familiarity with Figma and design handoff workflows`,
  },
  {
    id: 'xobin-data-analyst',
    title: 'Data Analyst Intern',
    level: 'Intern',
    location: 'Chennai',
    roleType: 'data',
    keySkills: ['SQL', 'Python', 'Tableau'],
    createdAt: '2026-02-10T00:00:00Z',
    jdFull: `About the Role
We're looking for a Data Analyst Intern to help Xobin's product and customer success teams make data-driven decisions. You'll analyze assessment data, build dashboards, and surface insights that shape the product roadmap.

Responsibilities
• Write complex SQL queries to extract and transform assessment & hiring data
• Build and maintain dashboards in Tableau / Metabase for product KPIs
• Perform cohort analysis to understand candidate drop-off and completion rates
• Support A/B test analysis and statistical significance testing
• Document data definitions, pipelines, and reporting methodologies
• Present findings to stakeholders with clear visualizations and recommendations

Requirements
• Strong SQL skills (joins, CTEs, window functions)
• Proficiency in Python (pandas, numpy) or R for data manipulation
• Experience building dashboards (Tableau, Metabase, or Power BI)
• Understanding of basic statistics (hypothesis testing, regression)
• Excellent communication and data storytelling skills

Nice to Have
• Experience with ETL tools (dbt, Airflow)
• Familiarity with product analytics platforms (Mixpanel, Amplitude)
• Knowledge of machine learning concepts`,
  },
  {
    id: 'xobin-product-designer',
    title: 'Product Designer Intern',
    level: 'Intern',
    location: 'Remote',
    roleType: 'design',
    keySkills: ['Figma', 'User Research', 'Prototyping'],
    createdAt: '2026-02-15T00:00:00Z',
    jdFull: `About the Role
Join Xobin as a Product Designer Intern and shape the experience of thousands of candidates and recruiters who use our platform daily. You'll own end-to-end design for key product flows.

Responsibilities
• Design end-to-end user flows for candidate assessment experiences
• Conduct user research (interviews, usability tests, surveys) and synthesize findings
• Create high-fidelity prototypes and design specs in Figma
• Build and maintain a design system with reusable components and tokens
• Collaborate with engineering to ensure design intent is preserved in code
• Present design decisions to stakeholders with rationale and evidence

Requirements
• Proficiency in Figma (auto-layout, components, variants, prototyping)
• Portfolio demonstrating end-to-end product design process
• Understanding of UX research methods and usability heuristics
• Knowledge of accessibility best practices
• Strong visual design skills (typography, color, layout, spacing)

Nice to Have
• Experience with design systems at scale
• Familiarity with frontend code (HTML/CSS/React)
• Motion design skills (Principle, After Effects, Framer Motion)
• Experience in B2B SaaS or EdTech`,
  },
];

export function getRoleById(id: string): XobinRole | undefined {
  return xobinRoles.find(r => r.id === id);
}
