# BMAD V4 - Dependency-Driven Development Guide

**Last Updated:** 2025-10-21  
**Version:** 1.0  
**Purpose:** Guide for dependency-aware task execution and documentation

---

## 🎯 OVERVIEW

This guide provides a **dependency-first** approach to the BMAD V4 project. Instead of working tasks sequentially by agent, we organize work by **dependency waves** - executing tasks that have no blocking dependencies first, then progressively working through dependent tasks.

**Key Principle:** Complete foundational tasks before dependent tasks to avoid rework and ensure smooth integration.

---

## 📊 DEPENDENCY STATISTICS

### Task Dependency Analysis
- **Total Tasks:** 216+
- **Most Dependent Task:** User Authentication (288 dependencies)
- **Critical Path Tasks:** Database connection, Voice integration, Authentication
- **Dependency Depth:** Up to 4 levels deep

### High-Impact Dependencies
1. **TASK-DL-001** - User Authentication (288 dependencies)
2. **TASK-KB-001** - Testing Infrastructure (288 dependencies)
3. **TASK-RG-003** - Voice-Backend Integration (96 dependencies)
4. **TASK-RG-002** - Frontend-Backend Integration (48 dependencies)

---

## 🌊 EXECUTION WAVES

Tasks are organized into 10 execution waves based on dependencies. Each wave must be completed before the next can begin.

### Wave 1: Foundation (No Dependencies)
**Duration:** Sprint 1, Days 1-3  
**Agents:** Infrastructure team (Alex, Sarah, Marcus)

**Critical Tasks:**
- `TASK-DR-011` - Database Connection Layer
- `TASK-AM-001` - Docker Infrastructure Setup
- `TASK-SC-001` - MongoDB Schema Design
- `TASK-MT-001` - Security Infrastructure

**Success Criteria:**
- Docker containers running
- Databases accessible
- Security framework in place
- CI/CD pipeline operational

**Deliverables:**
- docker-compose.yml configured
- Database connections verified
- Security protocols established
- Infrastructure documentation

---

### Wave 2: Core Services (Depends on Wave 1)
**Duration:** Sprint 1, Days 4-7  
**Agents:** Backend team (David, Jennifer)

**Critical Tasks:**
- `TASK-DR-001` - Express.js Server Foundation
- `TASK-DR-002` - Socket.io Configuration
- `TASK-JK-001` - Telnyx MCP Server Integration
- `TASK-DR-010` - API Security & Rate Limiting

**Dependencies:**
- Requires completed database connections
- Requires security infrastructure
- Requires Docker setup

**Success Criteria:**
- Express server running on port 5000
- WebSocket connections working
- Telnyx webhooks configured
- API endpoints secured

**Deliverables:**
- Backend API server
- Real-time communication layer
- Telnyx voice integration
- API security implementation

---

### Wave 3: Conversation Engine (Depends on Wave 2)
**Duration:** Sprint 2, Days 1-5  
**Agents:** Robert, Lisa

**Critical Tasks:**
- `TASK-RW-001` - Paul Barrios 12-Phase Script Implementation
- `TASK-LC-001` - ChromaDB Vector Database Setup
- `TASK-LC-002` - Claude API Integration
- `TASK-RW-002` - Qualification Scoring Algorithm

**Dependencies:**
- Requires backend API foundation
- Requires database layer
- Requires Telnyx integration

**Success Criteria:**
- Conversation script implemented
- Vector database operational
- AI responses generating
- Qualification logic working

**Deliverables:**
- Complete conversation flow
- ChromaDB collections configured
- Claude API wrapper
- Scoring algorithm implementation

---

### Wave 4: Lead Management (Depends on Waves 2-3)
**Duration:** Sprint 2, Days 6-10  
**Agents:** David, Robert

**Critical Tasks:**
- `TASK-DR-003` - Lead Management API
- `TASK-DR-004` - Call Queue Management
- `TASK-DR-005` - Lead Qualification Scoring API
- `TASK-DR-006` - Call State Management

**Dependencies:**
- Requires backend foundation
- Requires conversation engine
- Requires qualification logic

**Success Criteria:**
- Lead CRUD operations working
- Call queue functional
- Scoring API responsive
- State management reliable

**Deliverables:**
- Lead management endpoints
- Queue management system
- Scoring API implementation
- State tracking system

---

### Wave 5: Voice Operations (Depends on Waves 2-4)
**Duration:** Sprint 3, Days 1-5  
**Agents:** Jennifer, David

**Critical Tasks:**
- `TASK-JK-002` - Outbound Call Initiation
- `TASK-JK-003` - Voice Event Webhooks
- `TASK-DR-007` - Hot Transfer API
- `TASK-DR-008` - Webhook Handler

**Dependencies:**
- Requires backend API
- Requires lead management
- Requires conversation engine
- Requires call state management

**Success Criteria:**
- Outbound calls working
- Webhooks processing events
- Hot transfers functional
- Call recording operational

**Deliverables:**
- Call initiation system
- Webhook processing
- Transfer functionality
- Recording infrastructure

---

### Wave 6: Frontend Foundation (Depends on Waves 2-5)
**Duration:** Sprint 3, Days 6-10  
**Agents:** Michael, Emma, James

**Critical Tasks:**
- `TASK-MP-001` - React Dashboard Foundation
- `TASK-EJ-001` - Live Call Dashboard
- `TASK-JT-001` - Lead List Dashboard
- `TASK-MP-002` - Real-time Data Integration

**Dependencies:**
- Requires backend APIs
- Requires WebSocket layer
- Requires lead management
- Requires voice operations

**Success Criteria:**
- Dashboard rendering
- Real-time updates working
- Lead list displaying
- Call monitoring functional

**Deliverables:**
- React application structure
- Dashboard components
- Real-time integration
- Lead management UI

---

### Wave 7: Voice UI & Analytics (Depends on Wave 6)
**Duration:** Sprint 4, Days 1-7  
**Agents:** Priya, Angela

**Critical Tasks:**
- `TASK-PP-001` - Voice Control Interface
- `TASK-PP-002` - Call Monitoring UI
- `TASK-AW-001` - Analytics Data Pipeline
- `TASK-AW-002` - Call Metrics Dashboard

**Dependencies:**
- Requires frontend foundation
- Requires voice operations
- Requires lead management
- Requires call data

**Success Criteria:**
- Voice controls working
- Call monitoring real-time
- Analytics displaying
- Metrics accurate

**Deliverables:**
- Voice control panel
- Call monitoring interface
- Analytics pipeline
- Metrics dashboard

---

### Wave 8: Authentication & User Management (Depends on Waves 2-6)
**Duration:** Sprint 4, Days 8-14  
**Agents:** Daniel, Marcus

**Critical Tasks:**
- `TASK-DL-001` - User Authentication System
- `TASK-DL-002` - RBAC Implementation
- `TASK-DL-003` - User Profile Management
- `TASK-MT-002` - TCPA Compliance

**Dependencies:**
- Requires backend foundation
- Requires frontend structure
- Requires database layer
- Requires security infrastructure

**Success Criteria:**
- Login/logout working
- Role permissions enforced
- User profiles manageable
- Compliance checks active

**Deliverables:**
- Authentication system
- Authorization framework
- User management interface
- Compliance implementation

---

### Wave 9: Integration & Testing (Depends on All Previous Waves)
**Duration:** Sprint 5, Days 1-10  
**Agents:** Rachel, Kevin, Nicole

**Critical Tasks:**
- `TASK-RG-002` - Frontend-Backend Integration
- `TASK-RG-003` - Voice-Backend Integration
- `TASK-KB-001` - Testing Infrastructure
- `TASK-KB-002` - End-to-End Testing

**Dependencies:**
- Requires all components built
- Requires authentication working
- Requires voice operations functional
- Requires frontend complete

**Success Criteria:**
- All integrations working
- Test coverage >80%
- E2E tests passing
- Performance acceptable

**Deliverables:**
- Integration utilities
- Test suite implementation
- Performance benchmarks
- Integration documentation

---

### Wave 10: Optimization & Analytics (Depends on Wave 9)
**Duration:** Sprint 6, Ongoing  
**Agents:** Thomas, Daniel

**Critical Tasks:**
- `TASK-TG-001` - Performance Optimization
- `TASK-TG-002` - Caching Implementation
- `TASK-AW-006` - Revenue Forecasting
- `TASK-AW-010` - Advanced Analytics

**Dependencies:**
- Requires complete system
- Requires integration tested
- Requires real usage data
- Requires performance baseline

**Success Criteria:**
- Response times <200ms
- Cache hit ratio >70%
- Forecasts accurate
- Analytics actionable

**Deliverables:**
- Performance optimizations
- Caching layer
- Forecasting models
- Advanced analytics

---

## 🔑 NEO4J QUERIES FOR DEPENDENCY MANAGEMENT

### Find Tasks with No Dependencies (Wave 1)
```cypher
MATCH (t:Task)
WHERE NOT (t)-[:DEPENDS_ON]->()
  AND t.status = 'not_started'
RETURN t.id, t.title, t.priority
ORDER BY t.priority DESC, t.id
```

### Find Next Available Tasks for an Agent
```cypher
MATCH (a:Agent {name: 'Agent Name'})-[:HAS_TASK]->(t:Task)
WHERE t.status = 'not_started'
  AND NOT EXISTS {
    MATCH (t)-[:DEPENDS_ON]->(dep:Task)
    WHERE dep.status <> 'completed'
  }
RETURN t.id, t.title, t.priority
ORDER BY t.priority DESC
```

### Find Blocking Tasks
```cypher
MATCH (t:Task {id: 'TASK-XX-001'})-[:DEPENDS_ON]->(dep:Task)
WHERE dep.status <> 'completed'
RETURN dep.id, dep.title, dep.status, dep.priority
```

### Find What You're Blocking
```cypher
MATCH (blocked:Task)-[:DEPENDS_ON]->(t:Task)
WHERE t.id STARTS WITH 'TASK-XX'
  AND t.status <> 'completed'
RETURN blocked.id, blocked.title, blocked.priority,
       blocked.agent as blocked_agent
ORDER BY blocked.priority DESC
```

### Get Dependency Chain
```cypher
MATCH path = (t:Task {id: 'TASK-XX-001'})-[:DEPENDS_ON*]->(dep:Task)
RETURN [node in nodes(path) | node.id] as dependency_chain,
       length(path) as depth
ORDER BY depth DESC
```

### Find Critical Path (Longest Dependency Chain)
```cypher
MATCH path = (t:Task)-[:DEPENDS_ON*]->(dep:Task)
WHERE NOT (dep)-[:DEPENDS_ON]->()
WITH path, length(path) as depth
ORDER BY depth DESC
LIMIT 1
RETURN [node in nodes(path) | {
  id: node.id,
  title: node.title,
  status: node.status
}] as critical_path
```

---

## 📋 DEPENDENCY CHECKLIST

### Before Starting a Task
- [ ] Query Neo4j for task dependencies
- [ ] Verify all dependencies are completed
- [ ] Review dependency task deliverables
- [ ] Check for API contracts/interfaces
- [ ] Verify database schemas exist
- [ ] Confirm required services are running

### While Working on a Task
- [ ] Document your work in real-time
- [ ] Update task status in Neo4j
- [ ] Commit code with proper messages
- [ ] Create PRs for review
- [ ] Test integration points
- [ ] Update API documentation

### After Completing a Task
- [ ] Mark task as completed in Neo4j
- [ ] Update Chroma with learnings
- [ ] Notify dependent agents
- [ ] Document any API changes
- [ ] Push all code to GitHub
- [ ] Update project documentation

---

## ⚠️ COMMON DEPENDENCY PITFALLS

### 1. Assuming Dependencies Are Complete
**Problem:** Starting work without verifying dependencies  
**Solution:** Always query Neo4j for dependency status first

### 2. Breaking API Contracts
**Problem:** Changing interfaces without notifying dependents  
**Solution:** Document all interface changes and notify affected agents

### 3. Skipping Integration Testing
**Problem:** Assuming your work integrates without testing  
**Solution:** Test integration points before marking complete

### 4. Ignoring Downstream Impact
**Problem:** Not considering who depends on your work  
**Solution:** Query "what am I blocking" regularly

### 5. Working in Isolation
**Problem:** Not collaborating with related agents  
**Solution:** Use COLLABORATES_WITH relationships in Neo4j

---

## 🚀 BEST PRACTICES

### 1. Wave-Based Planning
- Plan work by dependency waves, not by agent
- Complete entire waves before moving forward
- Hold wave retrospectives

### 2. Early Integration
- Integrate continuously, not at the end
- Test integration points immediately
- Use feature flags for incomplete work

### 3. Clear Contracts
- Document all APIs and interfaces
- Use OpenAPI/Swagger specifications
- Version your APIs properly

### 4. Proactive Communication
- Notify dependents of progress
- Report blockers immediately
- Share learnings in Chroma

### 5. Incremental Delivery
- Deliver smallest functional units
- Enable dependent work ASAP
- Don't wait for perfection

---

## 📊 TRACKING PROGRESS

### Neo4j Task Status Values
```
not_started -> in_progress -> testing -> completed -> deployed
```

### Update Task Status
```cypher
MATCH (t:Task {id: 'TASK-XX-001'})
SET t.status = 'completed',
    t.completed_date = datetime()
RETURN t
```

### Get Wave Progress
```cypher
MATCH (t:Task)
WHERE NOT (t)-[:DEPENDS_ON]->(:Task)
WITH count(t) as wave1_total
MATCH (t:Task)
WHERE NOT (t)-[:DEPENDS_ON]->(:Task)
  AND t.status = 'completed'
RETURN count(t) as completed,
       wave1_total as total,
       (count(t) * 100.0 / wave1_total) as progress_pct
```

---

## 📚 RELATED DOCUMENTATION

- `FRAMEWORK-DOCUMENTATION.md` - Technical framework guide
- `AGENT-ONBOARDING-CHECKLIST.md` - Agent activation steps
- `GIT-WORKFLOW.md` - Git and PR process
- `BMAD-V4-EXECUTION-PLAN-V3.md` - Overall execution plan
- Individual agent `*_STORY.md` files

---

**Remember:** Dependencies exist to ensure quality and smooth integration. Working dependency-aware prevents rework and enables parallel execution where possible.