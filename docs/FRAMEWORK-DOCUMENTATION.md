# BMAD V4 - Framework Documentation Guide

**Last Updated:** 2025-10-21  
**Version:** 1.0  
**Purpose:** Comprehensive framework documentation for all 17 AI agents

---

## 🚨 CRITICAL INSTRUCTION

**ALWAYS read the appropriate SKILL.md file BEFORE creating any documents!**

Location: `/mnt/skills/public/[skill-name]/SKILL.md`

Available Anthropic Skills:
- **docx** - Word document creation and editing
- **pdf** - PDF generation and form filling
- **pptx** - PowerPoint presentation creation
- **xlsx** - Excel spreadsheet creation with formulas

**Example workflow:**
1. Read `/mnt/skills/public/docx/SKILL.md`
2. Follow the documented best practices
3. Create your document using the learned patterns

---

## 🗄️ DATABASE ARCHITECTURE

### MongoDB (Ports 27017/27018)
**Purpose:** Primary CRM and operational data

**Connection Strings:**
- Local: `mongodb://localhost:27017/bmad_crm`
- Atlas: See `.env.example` for connection string

**Key Collections:**
- `leads` - Lead information, status, scores
- `calls` - Call history, recordings, transcripts
- `conversations` - AI conversation data
- `users` - System users and permissions
- `campaigns` - Call campaigns and settings
- `analytics` - Performance metrics

**Best Practices:**
- Use compound indexes for query optimization
- Implement proper data validation schemas
- Enable change streams for real-time updates
- Regular backups (automated via scripts)
- Use aggregation pipeline for complex analytics

### PostgreSQL (Neon Cloud - Port 5432)
**Purpose:** Structured relational data

**Key Tables:**
- `lead_scores` - Qualification scoring history
- `user_auth` - Authentication and sessions
- `audit_logs` - System audit trail
- `performance_metrics` - KPI tracking
- `call_queue` - Call scheduling and routing

**Best Practices:**
- Use connection pooling (pg-pool)
- Implement proper foreign keys
- Create indexes on JOIN columns
- Use transactions for data integrity
- Regular VACUUM and ANALYZE

### ChromaDB (Port 8000)
**Purpose:** Vector embeddings and semantic search

**Collections (64 total):**
1. `bmad_v4_lead_qualification` (58 docs) - Main project context
2. `framework_documentation` (147 docs) - Technical guides
3. `telnyx_documentation` (31 docs) - Voice platform docs
4. `docker_documentation` (24 docs) - Container guides
5. `claude_anthropic_documentation` (11 docs) - AI integration
6. Plus 59 more specialized collections

**Best Practices:**
- Batch embed documents for efficiency
- Use cosine similarity for semantic search
- Implement proper metadata filtering
- Regular collection optimization
- Monitor embedding dimensions

### Neo4j (Ports 7474 HTTP / 7687 Bolt)
**Purpose:** Knowledge graph for project structure

**Database:** `bmad-v4-lead-qualification`

**Node Types:**
- `ProjectContext` - Root project node
- `Agent` (17 nodes) - AI agents
- `Task` (216+ nodes) - Development tasks
- `Documentation` - Doc tracking
- `CurrentState` - Project status

**Key Relationships:**
- `DEPENDS_ON` - Task dependencies
- `HAS_TASK` - Agent task assignments
- `COLLABORATES_WITH` - Agent interactions

**Best Practices:**
- Use parameterized queries
- Create indexes on frequently queried properties
- Leverage APOC procedures
- Use graph algorithms for path finding
- Regular backups via neo4j-admin

---

## 🎯 PORT CONFIGURATION

### Application Ports
```
Frontend (React):       3000
Backend API (Express):  5000
WebSocket:              8080
Voice Agent (Telnyx):   4000
```

### Database Ports
```
MongoDB (BMAD CRM):     27017
MongoDB (Dashboard):    27018
PostgreSQL (Neon):      5432
Neo4j HTTP:             7474
Neo4j Bolt:             7687
ChromaDB:               8000
```

### Monitoring Ports
```
Grafana:                3001
Prometheus:             9090
```

### Port Ranges
- Frontend: 3000-3999
- Backend: 5000-5999
- Databases: 7000-8999
- Monitoring: 9000-9999
- Voice/Realtime: 4000-4999

---

## 🛠️ TECHNOLOGY STACK

### Frontend
- **Framework:** React 18+ with Hooks
- **State Management:** Context API + Redux Toolkit
- **UI Library:** Material-UI v5 or Tailwind CSS
- **Real-time:** Socket.io-client
- **Routing:** React Router v6
- **Forms:** React Hook Form
- **Charts:** Recharts or Chart.js
- **HTTP:** Axios

### Backend
- **Runtime:** Node.js 18+ LTS
- **Framework:** Express.js 4.x
- **Real-time:** Socket.io
- **Authentication:** JWT + bcrypt
- **Validation:** Joi or Zod
- **API Docs:** Swagger/OpenAPI
- **Logging:** Winston or Pino
- **Testing:** Jest + Supertest

### Voice Platform
- **Provider:** Telnyx Voice API
- **Integration:** Telnyx MCP Server
- **Webhooks:** ngrok (dev) / direct (prod)
- **Recording:** Telnyx native storage
- **Transcription:** Telnyx + Claude API

### AI & ML
- **Primary:** Claude 4 Sonnet (Anthropic)
- **Vector DB:** ChromaDB
- **Embeddings:** Voyage AI or OpenAI
- **NLP:** Natural language processing via Claude
- **Sentiment:** Real-time analysis during calls

### DevOps
- **Containers:** Docker + Docker Compose
- **CI/CD:** GitHub Actions
- **Monitoring:** Grafana + Prometheus
- **Logging:** ELK Stack or Grafana Loki
- **SSL:** Let's Encrypt
- **Deployment:** DigitalOcean or AWS

---

## 📝 GIT WORKFLOW

### Branch Strategy
All agents use feature branches:
```
agent/[firstname-lastname-role]
```

**Examples:**
- `agent/alex-martinez-devops`
- `agent/sarah-chen-database`
- `agent/david-rodriguez-backend`

### Commit Convention (Conventional Commits)
```
<type>(<scope>): <subject>

<optional body>

<optional footer>
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Code style (formatting)
- `refactor` - Code refactoring
- `test` - Tests
- `chore` - Maintenance
- `perf` - Performance
- `ci` - CI/CD changes

**Examples:**
```
feat(backend): implement hot transfer API for Kevin availability
fix(database): resolve MongoDB connection pool exhaustion
docs(framework): add ChromaDB collection catalog
```

### Pull Request Process
1. Create feature branch from `main`
2. Make changes with proper commits
3. Push to GitHub
4. Create PR with description
5. Wait for CI/CD checks
6. Request review if needed
7. Merge to `main`

**See:** `GIT-WORKFLOW.md` for complete details

---

## 📚 KEY DOCUMENTATION FILES

### Essential Reading (in order)
1. `PROJECT-SUMMARY.md` - Project overview
2. `AGENT'S-ASSIGNMENTS.md` - Agent roles and responsibilities
3. `GIT-WORKFLOW.md` - Git branching and commits
4. `AGENT-ONBOARDING-CHECKLIST.md` - Agent activation process
5. `INFRASTRUCTURE-SETUP.md` - System setup guide
6. `FRAMEWORK-DOCUMENTATION.md` - This file
7. Your agent's `*_STORY.md` file

### Documentation in `/docs`
- `BMAD-V4-EXECUTION-PLAN-V3.md` - Latest execution plan
- `CLAUDE-CODE-HOOK-CONFIGS.md` - Claude Code integration
- `PORT-CONFIGURATION.md` - Detailed port configuration

### Agent Story Files
Each agent has a dedicated story file:
- `ALEX_MARTINEZ_DEVOPS_STORY.md`
- `SARAH_CHEN_DATABASE_STORY.md`
- `DAVID_RODRIGUEZ_BACKEND_STORY.md`
- etc. (17 total)

---

## 📊 NEO4J QUERIES FOR AGENTS

### Get Your Tasks
```cypher
MATCH (a:Agent {name: 'Your Name'})-[:HAS_TASK]->(t:Task)
RETURN t.id, t.title, t.priority, t.status
ORDER BY t.priority DESC, t.id
```

### Get Task Dependencies
```cypher
MATCH (t:Task {id: 'TASK-XX-001'})-[d:DEPENDS_ON]->(dep:Task)
RETURN dep.id, dep.title, dep.status, d.reason
```

### Get Tasks You're Blocking
```cypher
MATCH (t:Task)-[:DEPENDS_ON]->(myTask:Task)
WHERE myTask.id STARTS WITH 'TASK-XX'
RETURN t.id, t.title, t.priority
```

### Get Collaboration Partners
```cypher
MATCH (a:Agent {name: 'Your Name'})-[:COLLABORATES_WITH]->(partner:Agent)
RETURN partner.name, partner.role, partner.specialty
```

---

## ⚡ QUICK START CHECKLIST

### For Every Agent
- [ ] Read `PROJECT-SUMMARY.MD`
- [ ] Read your agent story file
- [ ] Read `AGENT-ONBOARDING-CHECKLIST.md`
- [ ] Query Neo4j for your tasks
- [ ] Check task dependencies
- [ ] Read relevant ChromaDB collections
- [ ] Create your feature branch
- [ ] Set up local environment

### Before Creating Documents
- [ ] Read appropriate `/mnt/skills/public/[type]/SKILL.md`
- [ ] Follow documented patterns
- [ ] Use chunking for large files

### Before Writing Code
- [ ] Check framework_documentation in Chroma
- [ ] Review relevant technology docs
- [ ] Check existing code patterns
- [ ] Verify port availability

---

## 📖 EXTERNAL RESOURCES

### Telnyx Documentation
- Voice API: https://developers.telnyx.com/docs/voice
- Webhooks: https://developers.telnyx.com/docs/v2/call-control/webhooks
- MCP Server: https://github.com/team-telnyx/telnyx-mcp-server

### Database Documentation
- MongoDB: https://docs.mongodb.com/
- PostgreSQL: https://www.postgresql.org/docs/
- Neo4j: https://neo4j.com/docs/
- ChromaDB: https://docs.trychroma.com/

### Framework Documentation
- React: https://react.dev/
- Express: https://expressjs.com/
- Socket.io: https://socket.io/docs/
- Docker: https://docs.docker.com/

### Claude/Anthropic
- API Docs: https://docs.anthropic.com/
- Prompt Engineering: https://docs.anthropic.com/prompt-library
- Skills: `/mnt/skills/public/*/SKILL.md`

---

## 🎯 AGENT-SPECIFIC PRIORITIES

### Infrastructure Agents (Alex, Sarah, Marcus)
**Priority Collections:**
- docker_documentation (24 docs)
- neo4j_chroma_integration_docs
- mongodb best practices
- Security patterns

### Backend Agents (David, Jennifer, Robert, Lisa)
**Priority Collections:**
- framework_documentation (147 docs)
- telnyx_documentation (31 docs)
- claude_anthropic_documentation (11 docs)
- API design patterns

### Frontend Agents (Michael, Emma, James, Priya, Angela)
**Priority Collections:**
- React documentation
- UI/UX patterns
- Real-time updates (Socket.io)
- Dashboard design

### Quality Agents (Rachel, Kevin, Nicole)
**Priority Collections:**
- Testing best practices
- Integration patterns
- Quality metrics
- CI/CD workflows

### Performance Agents (Thomas, Daniel)
**Priority Collections:**
- Performance optimization
- Caching strategies
- Database optimization
- Monitoring patterns

---

## 💬 COMMUNICATION PROTOCOL

### Status Updates
- Daily standups (async via messages)
- Update Neo4j task status
- Document blockers immediately
- Share progress in context

### Collaboration Triggers
- Cross-agent dependencies
- Shared code interfaces
- Integration points
- System-wide changes

### Emergency Escalation
- Production issues: Immediate
- Critical bugs: < 1 hour
- Blockers: < 4 hours
- Questions: < 24 hours

---

## ✅ SUCCESS CRITERIA

### Code Quality
- Follows established patterns
- Properly documented
- Tests included
- No linting errors
- Proper error handling

### Documentation
- Clear and concise
- Examples provided
- Updated in Git
- Neo4j updated
- Chroma updated

### Integration
- Works with dependent systems
- API contracts followed
- Real-time updates working
- No breaking changes

---

**END OF FRAMEWORK DOCUMENTATION**

For questions or clarifications, query Neo4j for related documentation or check the relevant ChromaDB collections.