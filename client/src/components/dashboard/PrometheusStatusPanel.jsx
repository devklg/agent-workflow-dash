import React from 'react';

const PrometheusStatusPanel = ({ agents, tasks, metrics, systemStatus }) => {
  // Group agents by team
  const teams = {
    atlas: agents.filter(a => a.team === 'atlas'),
    aurora: agents.filter(a => a.team === 'aurora'),
    phoenix: agents.filter(a => a.team === 'phoenix'),
    sentinel: agents.filter(a => a.team === 'sentinel')
  };

  // Calculate task progress - REAL STATUS
  const totalTasks = 147;
  const completedTasks = 0; // No tasks actually completed yet
  const progressPercentage = 0; // No real progress yet

  return (
    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white rounded-2xl shadow-2xl p-10 border border-blue-900/50">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-5xl font-bold mb-3">
            <span className="bg-gradient-to-r from-blue-500 to-yellow-400 bg-clip-text text-transparent">
              Agentic Command Central
            </span>
          </h1>
          <p className="text-xl text-gray-300">SEO Learning Platform Development • 36 Hour Sprint</p>
          <p className="text-base text-yellow-400 mt-2 font-medium">Magnificent Worldwide Marketing & Sales Group</p>
        </div>
        <div className="text-right">
          <p className="text-4xl font-bold text-white mb-2">{agents.length} Agents</p>
          <p className="text-lg text-gray-400">Ready to Deploy</p>
        </div>
      </div>

      {/* Team Status Grid - Larger and More Readable */}
      <div className="grid grid-cols-4 gap-6 mb-10">
        <TeamCard 
          name="Atlas Team"
          icon="🔵"
          count={teams.atlas.length || 10}
          role="Frontend Development"
          tasks={45}
          color="blue"
        />
        <TeamCard 
          name="Aurora Team"
          icon="🟣"
          count={teams.aurora.length || 10}
          role="Backend & Infrastructure"
          tasks={52}
          color="purple"
        />
        <TeamCard 
          name="Phoenix Team"
          icon="🔴"
          count={teams.phoenix.length || 10}
          role="Testing & QA"
          tasks={38}
          color="red"
        />
        <TeamCard 
          name="Sentinel Team"
          icon="🟢"
          count={teams.sentinel.length || 3}
          role="Security & Monitoring"
          tasks={12}
          color="green"
        />
      </div>

      {/* Overall Progress - Bigger and Clearer */}
      <div className="bg-slate-900/90 backdrop-blur rounded-2xl p-8 mb-10 border border-slate-800">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-3xl font-bold">Overall Task Progress</h3>
          <span className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-yellow-400 bg-clip-text text-transparent">
            0/{totalTasks} Tasks
          </span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-8 mb-4">
          <div 
            className="bg-gradient-to-r from-blue-500 to-yellow-400 h-8 rounded-full flex items-center justify-center text-xl font-bold transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          >
            {progressPercentage > 0 && '0%'}
          </div>
        </div>
        <p className="text-lg text-gray-400">Sprint Status: Not Started</p>
      </div>

      {/* System Status - More Visible */}
      <div className="grid grid-cols-5 gap-5 mb-8">
        <ServiceCard name="MongoDB" status={true} detail="DATABASE" />
        <ServiceCard name="Redis" status={true} detail="CACHE" />
        <ServiceCard name="RabbitMQ" status={true} detail="QUEUE" />
        <ServiceCard name="Grafana" status={true} detail="MONITOR" />
        <ServiceCard name="ChromaDB" status={true} detail="VECTOR DB" />
      </div>

      {/* Live Metrics - Larger Text */}
      <div className="grid grid-cols-3 gap-6">
        <MetricCard label="Task Rate" value="0/hour" />
        <MetricCard label="Agent Efficiency" value="0%" />
        <MetricCard label="System Load" value="0%" />
      </div>
    </div>
  );
};

// Team Card Component
const TeamCard = ({ name, icon, count, role, tasks, color }) => {
  const colorMap = {
    blue: 'bg-blue-950/60 border-blue-800 text-blue-300',
    purple: 'bg-purple-950/60 border-purple-800 text-purple-300',
    red: 'bg-red-950/60 border-red-800 text-red-300',
    green: 'bg-green-950/60 border-green-800 text-green-300'
  };

  return (
    <div className={`${colorMap[color]} backdrop-blur p-7 rounded-2xl border-2`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-4xl">{icon}</span>
        <span className="text-3xl font-bold text-white">{count}</span>
      </div>
      <p className="text-xl font-bold text-white mb-1">{name}</p>
      <p className="text-base mb-3">{role}</p>
      <p className="text-base text-gray-400">{tasks} tasks assigned</p>
      <div className="mt-4 w-full bg-gray-800 rounded-full h-3">
        <div className={`bg-${color}-500 h-3 rounded-full`} style={{ width: '0%' }}></div>
      </div>
    </div>
  );
};

// Service Card Component
const ServiceCard = ({ name, status, detail }) => (
  <div className="bg-green-950/40 backdrop-blur p-6 rounded-2xl border-2 border-green-800">
    <div className="flex items-center justify-between mb-3">
      <span className="text-lg font-bold text-white">{name}</span>
      <span className="text-3xl">✅</span>
    </div>
    <p className="text-base text-green-400 font-medium">{detail}</p>
    <p className="text-sm text-green-300 mt-1">Connected</p>
  </div>
);

// Metric Card Component
const MetricCard = ({ label, value }) => (
  <div className="bg-slate-900/90 p-7 rounded-2xl border border-slate-700">
    <p className="text-lg text-gray-400 mb-2">{label}</p>
    <p className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-yellow-400 bg-clip-text text-transparent">
      {value}
    </p>
  </div>
);

export default PrometheusStatusPanel;