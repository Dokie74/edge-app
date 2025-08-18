# General for All Projects

This document contains standardized tools, processes, and patterns that I deploy across multiple repositories. It serves as a portable baseline that can be copied to new projects to establish consistent development practices.

**For David**: This file provides you with battle-tested coordination systems and development patterns that have proven effective across projects. Copy this to new repositories to quickly establish professional development practices without reinventing solutions each time. The multi-terminal coordination system is particularly valuable when working with multiple AI agents or team members on complex projects.

---

## CLAUDE.md Reference Integration

**CRITICAL**: Add this reference section to your project's `CLAUDE.md` file to ensure every Claude Code instance knows about this strategic framework:

```markdown
## Strategic Development Framework

This project implements the **General for All Projects** framework for systematic development practices:

### **Reference Documentation**
- **Primary Framework**: `General_for_All_Projects.md` - Contains standardized tools, processes, and agent architecture patterns
- **Multi-Terminal Coordination**: Implements terminal coordination system for conflict-free parallel development
- **Strategic Agent Framework**: PRD-driven agent creation with technology stack-specific specializations
- **Implementation Checklist**: 5-phase process ensuring complete coverage of operational capabilities

### **Framework Components Available**
1. **Multi-Terminal Development Coordination System** - Real-time terminal coordination via MQTT
2. **Strategic Agent Architecture Framework** - Systematic agent ecosystem with PRD-driven creation
3. **Technology Stack-Specific Agents** - Pre-defined agents for Supabase, Vercel, React, Node.js, etc.
4. **Agent Selection Matrix** - Technology stack → required agents mapping
5. **Implementation Checklists** - Phase-by-phase project setup with validation steps

### **Quick Start Commands**
```bash
# Set up multi-terminal coordination
node scripts/terminal-coordinator.js <terminal_id>

# Follow PRD-driven agent creation process
# 1. Create PRD
# 2. Map PRD requirements to agents  
# 3. Create agents with /agent <name>
# 4. Document agents in this CLAUDE.md
# 5. Test and validate agent ecosystem
```

### **Agent Creation Reminder**
When creating new agents, always:
1. Use `/agent <agent-name>` command
2. Document the agent in this CLAUDE.md immediately
3. Follow the Strategic Agent Framework guidelines in `General_for_All_Projects.md`
4. Map agent purpose to specific PRD requirements

**For New Claude Code Instances**: Review `General_for_All_Projects.md` first to understand the complete framework, then proceed with project-specific tasks using the established patterns.
```

**Usage Instructions**: Copy the above markdown section and paste it into your project's `CLAUDE.md` file, preferably near the beginning after the project overview section.

---

## Multi-Terminal Development Coordination System

### Overview

This system enables multiple VS Code terminals (or developers/AI agents) to work on the same repository simultaneously without conflicts. It provides real-time awareness of who is working on what, prevents file boundary violations, and coordinates shared interface changes.

### Why We Implement This

- **Prevents Destructive Conflicts**: Multiple developers/agents can work in parallel without stepping on each other
- **Real-time Coordination**: Instant visibility into what each terminal/agent is working on
- **Boundary Enforcement**: Automatic detection of work area violations before they cause problems
- **Interface Validation**: Early warning when shared contracts change
- **Scalable**: Works with 2-10+ concurrent terminals/developers

### Prerequisites

- MQTT broker (Mosquitto recommended)
- Node.js environment
- Project with defined work boundaries

### Implementation

#### 1. Install Dependencies

```bash
npm install mqtt --save-dev
```

#### 2. Deploy Terminal Coordinator Script

Copy the following script to `scripts/terminal-coordinator.js` in your project root:

```javascript
#!/usr/bin/env node

/**
 * Multi-Terminal Development Coordination System
 * Enables multiple terminals/agents to work on same repo without conflicts
 * 
 * Usage:
 *   node scripts/terminal-coordinator.js <terminal_id>
 *   node scripts/terminal-coordinator.js <terminal_id> task "Description of current work"
 *   node scripts/terminal-coordinator.js <terminal_id> check <file_path>
 *   node scripts/terminal-coordinator.js <terminal_id> status
 */

const fs = require('fs');
const path = require('path');
const mqtt = require('mqtt');

const STATE_FILE = path.join(__dirname, '..', '.project-terminals.json');

// CUSTOMIZE THIS: Define your project's work boundaries
const TERMINAL_CONFIG = {
  1: {
    name: 'frontend-lead',
    agent: 'primary-dev',
    boundaries: [
      '/src/components/*',
      '/src/pages/*',
      '/public/*'
    ]
  },
  2: {
    name: 'backend-lead', 
    agent: 'api-dev',
    boundaries: [
      '/api/*',
      '/services/*',
      '/database/*'
    ]
  },
  3: {
    name: 'infrastructure',
    agent: 'devops',
    boundaries: [
      '/docker*',
      '/scripts/*',
      '/.github/*',
      '/config/*'
    ]
  },
  4: {
    name: 'testing',
    agent: 'qa-engineer',
    boundaries: [
      '/tests/*',
      '/cypress/*',
      '/__tests__/*',
      '/spec/*'
    ]
  }
  // Add more terminals as needed
};

class TerminalCoordinator {
  constructor(terminalId) {
    this.terminalId = terminalId;
    this.config = TERMINAL_CONFIG[terminalId];
    this.client = mqtt.connect(process.env.MQTT_URL || 'mqtt://localhost:1883');
    this.state = this.loadState();
    
    if (!this.config) {
      throw new Error(`Invalid terminal ID: ${terminalId}. Available: ${Object.keys(TERMINAL_CONFIG).join(', ')}`);
    }
    
    this.setupMQTTHandlers();
    this.registerTerminal();
    this.startHeartbeat();
  }

  loadState() {
    try {
      if (fs.existsSync(STATE_FILE)) {
        return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
      }
    } catch (error) {
      console.warn('Could not load terminal state:', error.message);
    }
    
    return {
      terminals: {},
      shared_interfaces: {},
      last_sync: new Date().toISOString(),
      project_name: path.basename(process.cwd())
    };
  }

  saveState() {
    try {
      fs.writeFileSync(STATE_FILE, JSON.stringify(this.state, null, 2));
    } catch (error) {
      console.error('Could not save terminal state:', error.message);
    }
  }

  registerTerminal() {
    const terminalInfo = {
      pid: process.pid,
      status: 'active',
      agent: this.config.agent,
      current_task: 'Initializing',
      last_heartbeat: new Date().toISOString(),
      work_boundaries: this.config.boundaries,
      started_at: new Date().toISOString(),
      node_version: process.version,
      cwd: process.cwd()
    };

    this.state.terminals[this.config.name] = terminalInfo;
    this.saveState();

    // Announce presence via MQTT
    this.client.publish(`terminal/${this.terminalId}/status`, JSON.stringify({
      event: 'terminal_registered',
      terminal: this.config.name,
      agent: this.config.agent,
      pid: process.pid,
      project: this.state.project_name
    }));

    console.log(`✅ Terminal ${this.terminalId} (${this.config.name}) registered successfully`);
    this.showActiveTerminals();
  }

  setupMQTTHandlers() {
    this.client.on('connect', () => {
      // Subscribe to coordination channels
      this.client.subscribe('terminal/+/status');
      this.client.subscribe('terminal/+/task');
      this.client.subscribe('coordination/interface-changes');
      this.client.subscribe('coordination/build-status');
      console.log(`📡 Connected to MQTT broker for terminal coordination`);
    });

    this.client.on('message', (topic, message) => {
      try {
        const data = JSON.parse(message.toString());
        this.handleMQTTMessage(topic, data);
      } catch (error) {
        console.warn('Invalid MQTT message:', error.message);
      }
    });
  }

  handleMQTTMessage(topic, data) {
    if (topic.startsWith('terminal/') && topic.endsWith('/status')) {
      const terminalId = topic.split('/')[1];
      if (terminalId !== this.terminalId.toString() && data.project === this.state.project_name) {
        console.log(`🔄 Terminal ${terminalId} (${data.terminal}) ${data.event}`);
      }
    }
    
    if (topic.startsWith('terminal/') && topic.endsWith('/task')) {
      const terminalId = topic.split('/')[1];
      if (terminalId !== this.terminalId.toString()) {
        console.log(`📝 Terminal ${terminalId} task: ${data.task}`);
      }
    }
    
    if (topic === 'coordination/interface-changes') {
      console.log('⚠️  Interface change detected:', data.interface);
      this.validateInterfaceConflicts(data);
    }

    if (topic === 'coordination/build-status') {
      if (data.status === 'failed') {
        console.log('🚨 Build failure reported by', data.terminal);
      }
    }
  }

  validateInterfaceConflicts(interfaceChange) {
    const affectsUs = this.config.boundaries.some(boundary => 
      interfaceChange.files?.some(file => file.includes(boundary.replace('*', '')))
    );

    if (affectsUs) {
      console.log('🚨 Interface change affects your work area!');
      console.log('   Files:', interfaceChange.files);
      console.log('   Changed by:', interfaceChange.terminal);
      console.log('   Recommended: Review changes before continuing');
      
      // Optionally pause until acknowledged
      if (process.env.COORDINATION_STRICT === 'true') {
        console.log('   Press Enter to acknowledge and continue...');
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.on('data', process.exit.bind(process, 0));
      }
    }
  }

  startHeartbeat() {
    setInterval(() => {
      if (this.state.terminals[this.config.name]) {
        this.state.terminals[this.config.name].last_heartbeat = new Date().toISOString();
        this.saveState();

        // Publish heartbeat
        this.client.publish(`terminal/${this.terminalId}/heartbeat`, JSON.stringify({
          terminal: this.config.name,
          status: 'active',
          timestamp: new Date().toISOString(),
          project: this.state.project_name
        }));
      }
    }, 30000); // Every 30 seconds
  }

  showActiveTerminals() {
    console.log(`\n📊 Active Terminals in ${this.state.project_name}:`);
    console.log('─'.repeat(70));
    
    const terminals = Object.entries(this.state.terminals);
    if (terminals.length === 0) {
      console.log('No active terminals detected.');
      return;
    }

    terminals.forEach(([name, info]) => {
      const isAlive = this.isTerminalAlive(info);
      const status = isAlive ? '🟢 Active' : '🔴 Inactive';
      const uptime = this.getUptime(info.started_at);
      
      console.log(`${status} ${name.padEnd(20)} | Agent: ${info.agent.padEnd(15)} | Uptime: ${uptime}`);
      console.log(`     PID: ${info.pid.toString().padEnd(6)} | Task: ${info.current_task}`);
      console.log(`     Boundaries: ${info.work_boundaries?.join(', ') || 'None defined'}`);
      console.log('');
    });
  }

  isTerminalAlive(terminalInfo) {
    const lastHeartbeat = new Date(terminalInfo.last_heartbeat);
    const now = new Date();
    return (now - lastHeartbeat) < 120000; // 2 minutes threshold
  }

  getUptime(startTime) {
    const start = new Date(startTime);
    const now = new Date();
    const diffMs = now - start;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffHours > 0) return `${diffHours}h ${diffMins % 60}m`;
    return `${diffMins}m`;
  }

  announceTask(taskDescription) {
    if (this.state.terminals[this.config.name]) {
      this.state.terminals[this.config.name].current_task = taskDescription;
      this.state.terminals[this.config.name].task_updated_at = new Date().toISOString();
      this.saveState();

      this.client.publish(`terminal/${this.terminalId}/task`, JSON.stringify({
        terminal: this.config.name,
        task: taskDescription,
        timestamp: new Date().toISOString(),
        project: this.state.project_name
      }));

      console.log(`📝 Task updated: ${taskDescription}`);
    }
  }

  checkConflicts(filePaths) {
    const conflicts = [];
    const fileArray = Array.isArray(filePaths) ? filePaths : [filePaths];
    
    fileArray.forEach(filePath => {
      Object.entries(this.state.terminals).forEach(([terminalName, terminalInfo]) => {
        if (terminalName === this.config.name) return; // Skip self
        if (!this.isTerminalAlive(terminalInfo)) return; // Skip inactive terminals
        
        const hasConflict = terminalInfo.work_boundaries?.some(boundary => {
          const pattern = boundary.replace(/\*/g, '.*').replace(/\//g, '\\/');
          return new RegExp(pattern).test(filePath);
        });

        if (hasConflict) {
          conflicts.push({
            file: filePath,
            conflictsWith: terminalName,
            agent: terminalInfo.agent,
            boundary: terminalInfo.work_boundaries.find(b => new RegExp(b.replace(/\*/g, '.*')).test(filePath))
          });
        }
      });
    });

    if (conflicts.length > 0) {
      console.log('🚨 BOUNDARY VIOLATION DETECTED:');
      console.log('─'.repeat(50));
      conflicts.forEach(conflict => {
        console.log(`📁 ${conflict.file}`);
        console.log(`   ⚠️  Conflicts with: ${conflict.conflictsWith} (${conflict.agent})`);
        console.log(`   📋 Boundary rule: ${conflict.boundary}`);
        console.log('');
      });
      console.log('💡 Recommendation: Coordinate with affected terminal before proceeding');
      console.log('   Consider moving work to your designated boundaries or getting approval');
      return false;
    }

    console.log('✅ No boundary conflicts detected for specified files');
    return true;
  }

  announceBuildResult(success, details = '') {
    this.client.publish('coordination/build-status', JSON.stringify({
      terminal: this.config.name,
      status: success ? 'success' : 'failed',
      details: details,
      timestamp: new Date().toISOString(),
      project: this.state.project_name
    }));

    const emoji = success ? '✅' : '❌';
    console.log(`${emoji} Build ${success ? 'succeeded' : 'failed'}: ${details}`);
  }

  announceInterfaceChange(interfaceName, files = []) {
    this.client.publish('coordination/interface-changes', JSON.stringify({
      interface: interfaceName,
      files: files,
      terminal: this.config.name,
      timestamp: new Date().toISOString(),
      project: this.state.project_name
    }));

    console.log(`📢 Interface change announced: ${interfaceName}`);
  }

  cleanup() {
    if (this.state.terminals[this.config.name]) {
      this.state.terminals[this.config.name].status = 'stopped';
      this.state.terminals[this.config.name].stopped_at = new Date().toISOString();
      this.saveState();
    }

    this.client.publish(`terminal/${this.terminalId}/status`, JSON.stringify({
      event: 'terminal_stopped',
      terminal: this.config.name,
      timestamp: new Date().toISOString(),
      project: this.state.project_name
    }));

    this.client.end();
    console.log(`👋 Terminal ${this.terminalId} (${this.config.name}) stopped cleanly`);
  }
}

// CLI Interface
if (require.main === module) {
  const terminalId = parseInt(process.argv[2]);
  
  if (!terminalId || !TERMINAL_CONFIG[terminalId]) {
    console.log('Usage: node scripts/terminal-coordinator.js <terminal_id> [command] [args...]');
    console.log('\nAvailable Terminal IDs:');
    Object.entries(TERMINAL_CONFIG).forEach(([id, config]) => {
      console.log(`  ${id}: ${config.name.padEnd(20)} (${config.agent})`);
      console.log(`      Boundaries: ${config.boundaries.join(', ')}`);
    });
    console.log('\nCommands:');
    console.log('  task "description"     - Update current task');
    console.log('  check <file_path>      - Check for boundary conflicts');
    console.log('  status                 - Show all active terminals');
    console.log('  build-ok "message"     - Announce successful build');
    console.log('  build-fail "message"   - Announce build failure');
    console.log('  interface "name" files - Announce interface change');
    process.exit(1);
  }

  const coordinator = new TerminalCoordinator(terminalId);

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down terminal coordination...');
    coordinator.cleanup();
    process.exit(0);
  });

  // CLI Commands
  if (process.argv[3]) {
    const command = process.argv[3];
    const args = process.argv.slice(4);

    switch (command) {
      case 'task':
        coordinator.announceTask(args.join(' '));
        break;
      case 'check':
        const result = coordinator.checkConflicts(args);
        process.exit(result ? 0 : 1);
        break;
      case 'status':
        coordinator.showActiveTerminals();
        break;
      case 'build-ok':
        coordinator.announceBuildResult(true, args.join(' '));
        break;
      case 'build-fail':
        coordinator.announceBuildResult(false, args.join(' '));
        break;
      case 'interface':
        const interfaceName = args[0];
        const files = args.slice(1);
        coordinator.announceInterfaceChange(interfaceName, files);
        break;
      default:
        console.log('Unknown command:', command);
        console.log('Available: task, check, status, build-ok, build-fail, interface');
    }
  } else {
    // Just run coordinator without commands
    console.log('Terminal coordinator running. Press Ctrl+C to stop.');
  }
}

module.exports = TerminalCoordinator;
```

#### 3. Configure Work Boundaries

Edit the `TERMINAL_CONFIG` object in the script to match your project structure:

```javascript
const TERMINAL_CONFIG = {
  1: {
    name: 'frontend-lead',
    agent: 'primary-dev',
    boundaries: [
      '/src/components/*',
      '/src/pages/*', 
      '/public/*'
    ]
  },
  2: {
    name: 'backend-lead',
    agent: 'api-dev', 
    boundaries: [
      '/api/*',
      '/services/*',
      '/database/*'
    ]
  }
  // Add more terminals as needed
};
```

#### 4. Start MQTT Broker

```bash
# Using Docker (recommended)
docker run -it -p 1883:1883 eclipse-mosquitto

# Or using docker-compose (add to your docker-compose.yml)
services:
  mqtt:
    image: eclipse-mosquitto
    ports:
      - "1883:1883"
```

### Usage Instructions

#### Daily Workflow

**Starting coordinated work:**
```bash
# Terminal 1: Frontend work
node scripts/terminal-coordinator.js 1

# Terminal 2: Backend work  
node scripts/terminal-coordinator.js 2

# Terminal 3: Infrastructure
node scripts/terminal-coordinator.js 3
```

**Announcing tasks:**
```bash
# Update what you're working on
node scripts/terminal-coordinator.js 1 task "Implementing user authentication component"

# Check for conflicts before editing files
node scripts/terminal-coordinator.js 1 check src/components/Auth.tsx

# Show status of all terminals
node scripts/terminal-coordinator.js 1 status
```

**Build coordination:**
```bash
# Announce successful build
node scripts/terminal-coordinator.js 1 build-ok "All tests passing"

# Announce build failure
node scripts/terminal-coordinator.js 1 build-fail "TypeScript errors in auth module"
```

**Interface changes:**
```bash
# Warn others about interface changes
node scripts/terminal-coordinator.js 1 interface "AuthProvider" src/types/auth.ts src/components/AuthProvider.tsx
```

### Environment Variables

```bash
# Optional: Custom MQTT broker
export MQTT_URL="mqtt://your-mqtt-broker:1883"

# Optional: Strict mode (pauses on conflicts)
export COORDINATION_STRICT=true
```

### Integration with AI Development

When working with Claude Code, ChatGPT, or other AI assistants:

1. **Start coordination first**: `node scripts/terminal-coordinator.js 1`
2. **Announce AI tasks**: `node scripts/terminal-coordinator.js 1 task "AI implementing OAuth integration"`
3. **Check boundaries**: `node scripts/terminal-coordinator.js 1 check src/auth/oauth.ts`
4. **Announce completion**: `node scripts/terminal-coordinator.js 1 build-ok "OAuth implementation complete"`

### File Structure

```
your-project/
├── scripts/
│   └── terminal-coordinator.js        # Main coordination script
├── .project-terminals.json           # Auto-generated state file
├── docker-compose.yml                 # Include MQTT broker
└── package.json                       # Add mqtt dependency
```

### Troubleshooting

**MQTT Connection Issues:**
```bash
# Test MQTT broker connectivity
npx mqtt pub -h localhost -t test -m "hello world"
npx mqtt sub -h localhost -t test
```

**State File Corruption:**
```bash
# Reset terminal state
rm .project-terminals.json
```

**Port Conflicts:**
```bash
# Use different MQTT port
export MQTT_URL="mqtt://localhost:1884"
```

---

## Strategic Agent Architecture Framework

### Overview

This framework defines the core **Claude Code subagent ecosystem** that should be implemented in every project to ensure consistency, maintainability, and operational excellence. The agents are categorized by function and automatically selected based on your technology stack.

**IMPORTANT**: These are **Claude Code subagents**, not standalone scripts. Each agent is created using `/agent <agent_name>` within Claude Code and must be documented in `CLAUDE.md` so that new Claude Code instances can discover and use existing agents.

**For David**: This systematic approach ensures you never miss critical operational capabilities across projects. The framework automatically suggests which agents to implement based on your tech stack (e.g., Supabase + Vercel = specific required agents). Use this as a checklist when starting new projects or auditing existing ones.

### Claude Code Agent Implementation Process

1. **Create Agent**: Use `/agent <agent_name>` in Claude Code
2. **Document in CLAUDE.md**: Add agent to the available agents list
3. **Test Agent**: Verify agent responds to commands
4. **Update Documentation**: Include usage examples and capabilities

### Core Universal Agents (Required in Every Project)

These agents should be present in every repository regardless of technology stack:

#### 1. **Terminal Coordination Agent** (Already Implemented Above)
- **Purpose**: Multi-terminal development coordination
- **Files**: `scripts/terminal-coordinator.js`
- **Usage**: Prevents conflicts between multiple developers/AI agents

#### 2. **Security Compliance Agent**
- **Purpose**: Security auditing, vulnerability scanning, and compliance validation
- **Responsibilities**:
  - Automated security scans of dependencies
  - Code analysis for security anti-patterns
  - Environment variable validation (no secrets in code)
  - Authentication/authorization implementation
  - GDPR/CCPA compliance checks
  - Audit trail generation
- **Implementation**: Use `/agent security-compliance-auditor` in Claude Code
- **Usage**: Call the agent when security validation is needed
- **CLAUDE.md Entry**: Document as available security auditing specialist

#### 3. **Compliance Monitor Agent**
- **Purpose**: Regulatory compliance, licensing, and policy enforcement
- **Responsibilities**:
  - Open source license compatibility checks
  - Data retention policy enforcement
  - API usage compliance monitoring
  - Documentation requirement validation
  - Quality gate enforcement
- **Implementation**: Use `/agent compliance-monitor` in Claude Code
- **Usage**: Call the agent for compliance validation tasks
- **CLAUDE.md Entry**: Document as available compliance specialist

#### 4. **Repository Scaffold Agent**
- **Purpose**: Project structure initialization and maintenance
- **Responsibilities**:
  - Standardized folder structure creation
  - Development environment setup
  - CI/CD pipeline template deployment
  - Documentation template generation
  - Package.json standardization
- **Implementation**: Use `/agent repo-scaffold` in Claude Code
- **Usage**: Call the agent for project initialization and structure setup
- **CLAUDE.md Entry**: Document as available repository scaffolding specialist

### Technology Stack-Specific Agents

Based on your technology choices, implement these specialized agents:

#### **Supabase Stack Agents** (When using Supabase)

##### **Supabase Operations Agent**
- **Purpose**: Database operations, migrations, and Edge Functions management
- **Responsibilities**:
  - Local Supabase development environment setup
  - Database migration creation and execution
  - TypeScript type generation from schema
  - Edge Functions scaffolding and deployment
  - Row Level Security (RLS) policy management
  - Backup and restore operations
- **Implementation**: Use `/agent supabase-ops` in Claude Code
- **Usage**: Call the agent for Supabase-related operations
- **CLAUDE.md Entry**: Document as Supabase operations specialist with database migration expertise

##### **Database Schema Agent**
- **Purpose**: Schema validation, optimization, and documentation
- **Responsibilities**:
  - Schema drift detection
  - Performance optimization recommendations
  - Relationship validation
  - Index optimization
  - Documentation generation
- **Implementation**: Use `/agent database-schema-manager` in Claude Code
- **Usage**: Call the agent for database schema optimization tasks
- **CLAUDE.md Entry**: Document as database schema validation and optimization specialist

#### **Vercel Stack Agents** (When using Vercel)

##### **Vercel Deployment Agent**
- **Purpose**: Application deployment and environment management
- **Responsibilities**:
  - Preview deployment creation
  - Production deployment coordination
  - Environment variable management
  - Build optimization
  - Performance monitoring
  - Domain configuration
- **Implementation**: Use `/agent vercel-deploy` in Claude Code
- **Usage**: Call the agent for Vercel deployment tasks
- **CLAUDE.md Entry**: Document as Vercel deployment specialist with environment management expertise

#### **React/Next.js Stack Agents** (When using React ecosystem)

##### **Component Architecture Agent**
- **Purpose**: Component system maintenance and optimization
- **Responsibilities**:
  - Component dependency analysis
  - Props interface validation
  - Performance optimization detection
  - Accessibility compliance checking
  - Style system consistency
- **Implementation**: Use `/agent component-architecture-manager` in Claude Code
- **Usage**: Call the agent for React/Next.js component optimization
- **CLAUDE.md Entry**: Document as React component architecture and optimization specialist

#### **Node.js/API Stack Agents** (When building APIs)

##### **API Gateway Agent**
- **Purpose**: API design, documentation, and monitoring
- **Responsibilities**:
  - OpenAPI specification generation
  - Rate limiting configuration
  - Authentication middleware setup
  - Request/response validation
  - Performance monitoring
  - Error handling standardization
- **Implementation**: Use `/agent api-gateway-manager` in Claude Code
- **Usage**: Call the agent for API design and documentation tasks
- **CLAUDE.md Entry**: Document as API gateway specialist with OpenAPI documentation expertise

### Claude Code Agent Creation Process

#### Step 1: Create the Agent in Claude Code

```bash
# Create a new agent using Claude Code's agent system
/agent <agent-name>

# Examples:
/agent supabase-ops
/agent vercel-deploy
/agent security-compliance-auditor
```

#### Step 2: Document the Agent in CLAUDE.md

Add the agent to your project's `CLAUDE.md` file so future Claude Code instances can discover it:

```markdown
## Available Agents

### Infrastructure Agents
- **supabase-ops** - Supabase operations specialist for database migrations, type generation, and Edge Functions deployment
- **vercel-deploy** - Vercel deployment specialist for preview/production deployments and environment management
- **security-compliance-auditor** - Security auditing specialist for vulnerability scanning and compliance validation

### Usage Examples
```bash
# Use Supabase agent for database operations
Use the supabase-ops agent to create a new migration for user preferences

# Use Vercel agent for deployment
Use the vercel-deploy agent to create a preview deployment for the feature branch

# Use security agent for compliance
Use the security-compliance-auditor agent to perform a full security audit
```

#### Step 3: Agent Documentation Template

For each agent, document in CLAUDE.md using this template:

```markdown
- **agent-name** - Brief description of agent's primary purpose
  - **Specializes in**: Primary domain expertise
  - **Key capabilities**: 
    - Capability 1
    - Capability 2  
    - Capability 3
  - **When to use**: Specific scenarios where this agent should be called
  - **Example usage**: "Use the agent-name agent to [specific task]"
```

### PRD-to-Agent Mapping Guide

Use this guide to systematically identify which agents to create based on your PRD:

#### PRD Analysis Questions → Agent Decisions

**1. What is the core business domain?**
- **E-commerce**: Create `inventory-manager`, `payment-processor`, `order-fulfillment` agents
- **Healthcare**: Create `hipaa-compliance`, `patient-data-manager`, `medical-workflow` agents  
- **Finance**: Create `regulatory-compliance`, `transaction-monitor`, `audit-trail` agents
- **Automotive**: Create `vehicle-data-manager`, `diagnostic-expert`, `service-workflow` agents

**2. What are the technical complexity areas?**
- **Real-time features**: Create `realtime-coordinator`, `websocket-manager` agents
- **AI/ML integration**: Create `llm-orchestration-manager`, `model-performance-monitor` agents
- **Complex workflows**: Create `workflow-orchestrator`, `state-machine-manager` agents
- **Data processing**: Create `data-pipeline-manager`, `etl-coordinator` agents

**3. What are the integration requirements?**
- **Multiple APIs**: Create `api-integration-manager`, `external-service-coordinator` agents
- **Legacy systems**: Create `legacy-adapter`, `migration-coordinator` agents
- **Third-party services**: Create specific agents per service (e.g., `stripe-integration`, `twilio-manager`)

**4. What are the performance/scale requirements?**
- **High performance**: Create `performance-monitor`, `optimization-specialist` agents
- **Scalability**: Create `load-balancer-manager`, `scaling-coordinator` agents
- **Caching**: Create `cache-strategy-manager`, `redis-coordinator` agents

**5. What are the compliance/security requirements?**
- **Data privacy**: Create `gdpr-compliance`, `data-anonymization` agents
- **Security**: Create `penetration-tester`, `vulnerability-scanner` agents
- **Audit**: Create `audit-trail-manager`, `compliance-reporter` agents

#### Example PRD → Agent Breakdown

**Sample PRD: "Dealership Service Lane Application"**
```
PRD Requirements → Recommended Agents:
├── Real-time customer tracking → /agent lpr-arrival-handler
├── Voice interaction system → /agent voice-io-architect  
├── 3D avatar interface → /agent avatar-3d-specialist
├── IoT device coordination → /agent iot-mqtt-broker
├── Compliance RAG system → /agent compliant-rag-orchestrator
├── Database operations → /agent supabase-ops
├── Deployment management → /agent vercel-deploy
└── Security validation → /agent security-compliance-auditor
```

### Agent Selection Matrix

Use this matrix to determine which agents to implement based on your project:

| Technology Stack | Required Agents |
|------------------|----------------|
| **Basic Project** | Terminal Coordination, Security Compliance, Compliance Monitor, Repository Scaffold |
| **+ Supabase** | Add: Supabase Operations, Database Schema |
| **+ Vercel** | Add: Vercel Deployment |
| **+ React/Next.js** | Add: Component Architecture |
| **+ API/Backend** | Add: API Gateway |
| **+ IoT/MQTT** | Add: IoT MQTT Broker |
| **+ AI/ML** | Add: LLM Orchestration Manager |
| **+ 3D/Graphics** | Add: Avatar 3D Specialist |
| **+ Voice/Audio** | Add: Voice IO Architect |

### Implementation Checklist

**CRITICAL: Complete this checklist in order for every new project**

#### Phase 1: Project Definition & Agent Planning
- [ ] **Have you created a PRD (Product Requirements Document)?**
  - Define project goals, features, technical requirements, and success criteria
  - Include technology stack, performance requirements, and constraints
  - Document user stories and acceptance criteria
  
- [ ] **Have you requested subagents be created based on the needs of the project as defined in the PRD?**
  - Review PRD requirements and identify specialized domains needed
  - Map technical requirements to potential subagent specializations
  - Consider project complexity and team coordination needs

- [ ] **Have you deconstructed the PRD into subagent-specific tasks?**
  - Break down each major feature/requirement into agent-specific work streams
  - Define clear boundaries and responsibilities for each agent
  - Identify dependencies and integration points between agents

- [ ] **Have you asked the developer to review the plan and then prompt you to deconstruct the subagent tasks into baby steps so that context doesn't get too large?**
  - Present the agent plan to the developer for validation
  - Request feedback on agent boundaries and task allocation
  - Get approval to break down tasks into manageable, context-appropriate steps
  - Ensure each agent's scope stays within reasonable context limits

#### Phase 2: Infrastructure Setup
- [ ] Copy `General_for_All_Projects.md` to project root
- [ ] Set up terminal coordination script (standalone Node.js script)

#### Phase 3: Core Agent Creation
Create Claude Code agents using `/agent <name>` based on PRD analysis:

**Universal Agents (Required):**
- [ ] `/agent security-compliance-auditor`
- [ ] `/agent compliance-monitor`  
- [ ] `/agent repo-scaffold`

**Technology Stack Agents (Based on PRD tech requirements):**
- [ ] **If using Supabase**: `/agent supabase-ops`
- [ ] **If using Vercel**: `/agent vercel-deploy`
- [ ] **If using React**: `/agent component-architecture-manager`
- [ ] **If building APIs**: `/agent api-gateway-manager`

**PRD-Specific Agents (Based on project requirements):**
- [ ] **Custom agents identified during PRD analysis**
- [ ] **Domain-specific agents for unique project needs**
- [ ] **Integration agents for complex system coordination**

#### Phase 4: Documentation & Testing
- [ ] Document all agents in `CLAUDE.md` using the template above
- [ ] Test each agent by calling it in Claude Code
- [ ] Update project README with agent usage instructions
- [ ] Create agent task breakdown documentation for future reference

#### Phase 5: Validation & Refinement
- [ ] Verify agent boundaries align with PRD requirements
- [ ] Test agent coordination patterns with sample workflows
- [ ] Adjust agent responsibilities based on initial testing
- [ ] Document lessons learned for future projects

### Agent Coordination Patterns

**Sequential Pattern** (for dependencies):
```bash
# Coordinate using terminal-coordinator.js, then call Claude Code agents in sequence
node scripts/terminal-coordinator.js 1 task "Starting deployment workflow"

# In Claude Code:
Use the supabase-ops agent to run database migrations
Use the vercel-deploy agent to create preview deployment  
Use the security-compliance-auditor agent to validate deployment
```

**Parallel Pattern** (using multiple Claude Code terminals):
```bash
# Terminal 1:
node scripts/terminal-coordinator.js 1 task "Database operations"
# Then use supabase-ops agent

# Terminal 2:  
node scripts/terminal-coordinator.js 2 task "Frontend optimization"
# Then use component-architecture-manager agent

# Terminal 3:
node scripts/terminal-coordinator.js 3 task "Security validation"
# Then use security-compliance-auditor agent
```

**Orchestrated Pattern** (complex multi-agent workflows):
```bash
# Set up coordination
node scripts/terminal-coordinator.js 1 task "Complete deployment workflow"

# In Claude Code - orchestrate multiple agents:
Use the security-compliance-auditor agent to perform pre-deployment security scan
Use the supabase-ops agent to backup database before deployment
Use the vercel-deploy agent to deploy to production
Use the compliance-monitor agent to validate post-deployment compliance

# Update terminal status
node scripts/terminal-coordinator.js 1 task "Deployment workflow complete"
```

### Critical Documentation Requirements

**ALWAYS update CLAUDE.md when creating agents** - This is essential for agent continuity across Claude Code sessions. Without proper documentation in CLAUDE.md, future Claude Code instances won't know what agents exist or how to use them.

**Example CLAUDE.md Agent Section**:
```markdown
## Available Claude Code Agents

### Infrastructure & Operations
- **supabase-ops** - Supabase database operations, migrations, and Edge Functions specialist
- **vercel-deploy** - Vercel deployment and environment management specialist  
- **security-compliance-auditor** - Security scanning and compliance validation specialist
- **compliance-monitor** - Regulatory compliance and licensing enforcement specialist

### Development & Architecture  
- **repo-scaffold** - Repository structure and development environment setup specialist
- **component-architecture-manager** - React component architecture and optimization specialist
- **api-gateway-manager** - API design, documentation, and monitoring specialist

### Usage Examples
When you need database operations: "Use the supabase-ops agent to create a migration for the new user preferences table"
When you need deployment: "Use the vercel-deploy agent to create a preview deployment for the feature branch"
When you need security validation: "Use the security-compliance-auditor agent to perform a full security audit before production deployment"
```

---

## Future Additions

*This section is for additional tools and processes to be added as they are developed and tested across projects.*

### Planned Agent Expansions
- **Performance Monitor Agent**: Real-time performance tracking and optimization
- **Documentation Agent**: Automated API docs and code documentation
- **Testing Orchestrator Agent**: Cross-platform testing coordination
- **Backup Manager Agent**: Automated backup and disaster recovery
- **Environment Manager Agent**: Configuration and secret management

### Planned Tools
- Cross-repository dependency management
- Standardized testing patterns
- Environment configuration templates
- CI/CD pipeline templates

---

**Version**: 1.0  
**Last Updated**: August 18, 2025  
**Tested On**: Node.js 16+, VS Code, Windows/macOS/Linux