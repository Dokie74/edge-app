# EDGE Application - Claude Subagents

This directory contains persistent configuration files for specialized Claude Code subagents created for the EDGE application.

## Available Subagents

### 🔵 Supabase Backend Manager
**File:** `supabase-backend-manager.md`
- **Specialty:** Database operations, schema management, SQL execution, data cleanup
- **Text Color:** Blue (#3B82F6)
- **Use Cases:** Database maintenance, test data creation, schema optimization, performance tuning

### 🟢 Cypress Testing Expert  
**File:** `cypress-testing-expert.md`
- **Specialty:** E2E testing, test debugging, CI/CD optimization
- **Text Color:** Green (#22C55E) 
- **Use Cases:** Test creation, debugging failing tests, test suite optimization, automation setup

## How to Use These Subagents

1. **Through Claude Code:** Ask Claude to invoke a subagent using the Task tool
2. **Example:** "Have the Cypress Testing Expert debug the failing authentication tests"
3. **Configuration:** Each subagent file contains the complete prompt template needed

## Creating New Subagents

1. Create a new `.md` file in this directory
2. Use the existing files as templates
3. Include the specialized role, formatting requirements, and context
4. Update this README with the new subagent information

## Subagent Architecture

- **Temporary Instances:** Subagents are created on-demand via Task tool calls
- **Specialized Knowledge:** Each has deep context about specific aspects of the EDGE application
- **Consistent Formatting:** Visual distinction through colored text output
- **Context Aware:** Full access to the EDGE application codebase and configuration