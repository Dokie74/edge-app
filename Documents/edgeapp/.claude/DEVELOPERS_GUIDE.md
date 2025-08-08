# EDGE (Employee Development & Growth Engine) - Developer's Guide

**Document Version:** 4.0  
**Date:** July 18, 2025  
**Status:** MVP Stable, Vision Defined

## 1.0 Introduction & The EDGE Philosophy

This document outlines the comprehensive technical and philosophical specification for the Employee Development & Growth Engine (EDGE), a web application designed to revolutionize Lucerne International's quarterly employee review process. It serves as the single source of truth for our architecture, features, and the long-term vision that guides our development.

### 1.1 The Core Philosophy

Traditional performance reviews are a fundamentally flawed concept in the modern workplace. Research and real-world experience have shown them to be backward-looking, anxiety-inducing, and largely ineffective at inspiring genuine growth. They often feel like a judgment, not a conversation, which is why they are almost universally dreaded. Our approach with EDGE is to discard this outdated model entirely and build a tool grounded in modern organizational psychology, behavioral science, and the principles of servant leadership.

EDGE is engineered to directly counteract the "4Ps" of employee disengagement:

- **Purpose**: A disconnect between daily tasks and the company's mission. EDGE combats this by constantly tying feedback and goals back to our Core Values and strategic objectives (Rocks).
- **People**: A breakdown in trust and communication. EDGE fosters connection by creating a platform for continuous, constructive dialogue, moving feedback from a high-stakes annual event to a low-stakes daily habit.
- **Process**: Frustration with opaque and inefficient workflows. EDGE streamlines the entire feedback and growth process into a simple, intuitive, and transparent digital experience.
- **Power**: A feeling of helplessness or inability to influence one's own career. EDGE flips the script by making the employee the driver of their own "Guided Reflection," giving them agency over their growth narrative.

By digitally embedding the Entrepreneurial Operating System (EOS), we are creating more than just software. We are building a tool that empowers employees to own their development and equips managers with a clear, objective framework (like the GWC) to become better coaches. We are transforming a dreaded corporate ritual into a catalyst for meaningful, forward-looking development.

### 1.2 The Destination: What 'Done' Looks Like

The MVP we have built is the foundation. The true destination for EDGE is to evolve from a quarterly review tool into the central, "always-on" nervous system for Lucerne's growth culture. "Done" means we have created a system that achieves the following four pillars:

#### A. From Quarterly Event to Continuous Dialogue:
The formal quarterly review becomes a simple summary of an ongoing conversation that happens inside EDGE, not the start of one.

- **Real-Time Feedback Module**: Any employee will be able to give or request feedback from anyone else in the organization at any time.
- **"Kudos Wall" Feature**: A dedicated, public-facing section within the EDGE dashboard where employees can give "Kudos" to peers for living the Core Values.
- **Gamification Elements**: To make engagement fun, employees will earn points and unlock digital badges for key growth activities.

#### B. From Subjective Opinion to Data-Enabled Coaching:
Managers are empowered with data and insights to evolve from evaluators into world-class coaches.

- **Manager's Playbook**: A private, continuously accessible digital notebook within EDGE for each direct report.

#### C. From a Static Form to a Dynamic Growth Plan:
The "review" is no longer a static snapshot but a living document that tracks an employee's journey over time.

- **Individual Development Plan (IDP)**: A dynamic module where employees and managers can collaboratively set and track SMART goals at any time.
- **Historical Trend Analysis**: The system will visualize an employee's progress over multiple quarters.

#### D. From an HR Tool to a Business Intelligence Engine:
The aggregated, anonymized data from EDGE becomes a powerful tool for the leadership team to understand the health of the organization.

- **Leadership Dashboard**: A high-level, real-time view showing trends in Core Value alignment, common skill gaps, and overall engagement.

## 2.0 System Architecture & Technology Stack

- **Frontend**: React SPA
- **Backend**: Supabase (BaaS)
- **Database**: PostgreSQL
- **Deployment**: Vercel
- **Styling & UI**: Tailwind CSS, lucide-react

## 3.0 Current State (As of this Chat)

The application is now a stable, multi-faceted platform incorporating the initial MVP vision plus significant enhancements.

### 3.1 Implemented Features

- **Secure Authentication**: Users can log in with email and password.
- **Role-Based Access Control (RBAC)**: The application recognizes employee, manager, and admin roles, showing and hiding UI elements (like sidebar links) based on the logged-in user's permissions.
- **Personalized Dashboard**: Greets the user by name and provides a summary of active reviews and the public "Kudos Wall."
- **"Give a Kudo" Feature**: A fully functional modal allows any employee to give public recognition to another, tied to a Core Value.
- **My Reviews (History)**: A dedicated page for employees to view all their past and present assessments.
- **My Team Page**: A dashboard for managers to view their direct reports and the status of their reviews.
- **Admin Page**: A panel for administrators to view all employees and their manager relationships, with a functional "Add New Employee" modal.
- **Unified Assessment View**: A single, intelligent page for conducting and viewing reviews, featuring a continuous feedback/chat module.

### 3.2 Database Schema & Functions

- **Tables**: employees, review_cycles, assessments, assessment_rocks, assessment_scorecard_metrics, assessment_feedback, kudos.
- **Security**: Row Level Security is enabled on all critical tables.
- **Functions**: A suite of security-definer functions (get_my_role, get_my_name, get_kudos_wall, etc.) handle all secure data operations.

## 4.0 Next Steps & Development Roadmap

With the core application stable, the next phase will focus on building out the interactive features that drive our "always-on" dialogue philosophy.

1. **Activate Self-Assessment**: Implement the logic for the "Submit Self-Assessment" button.
2. **Full Admin CRUD**: Build out the "Edit" and "Add" functionality on the Admin page to fully manage employee data and relationships directly from the UI.
3. **Manager's Playbook**: Create the private notes section for managers within the Assessment view.
4. **Acumax Integration**: Begin research and development for integrating Acumax profiles and AI-powered coaching tips.