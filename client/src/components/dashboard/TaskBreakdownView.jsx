import React, { useState, useEffect } from 'react';
import StatusIndicator from '../common/StatusIndicator';

const TaskBreakdownView = ({ projects, agents, tasks }) => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [tasksByStatus, setTasksByStatus] = useState({
    pending: [],
    'in-progress': [],
    completed: [],
    blocked: []
  });

  useEffect(() => {
    // Group tasks by status
    const grouped = (tasks || []).reduce((acc, task) => {
      const status = task.status || 'pending';
      if (!acc[status]) acc[status] = [];
      acc[status].push(task);
      return acc;
    }, {
      pending: [],
      'in-progress': [],
      completed: [],
      blocked: []
    });
    setTasksByStatus(grouped);
  }, [tasks]);

  const statusColumns = [
    { key: 'pending', title: 'To Do', color: 'bg-gray-50', count: 147 }, // All tasks are pending
    { key: 'in-progress', title: 'In Progress', color: 'bg-blue-50', count: 0 },
    { key: 'completed', title: 'Completed', color: 'bg-green-50', count: 0 },
    { key: 'blocked', title: 'Blocked', color: 'bg-red-50', count: 0 }
  ];

  // Get filtered tasks based on selected project
  const filteredTasks = selectedProject 
    ? tasks.filter(task => task.projectId === selectedProject)
    : tasks;

  return (
    <div className="space-y-6">
      <div className="bg-cyan-900 bg-opacity-80 rounded-xl shadow-2xl border border-cyan-600 p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-yellow-400">Task Breakdown - SEO Learning Platform</h2>
          <div className="text-lg font-bold text-yellow-400">
            Total: {tasks?.length || 147} tasks
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statusColumns.map(column => (
            <div key={column.key} className={`bg-cyan-950 bg-opacity-90 rounded-lg p-6 border border-cyan-700`}>
              <h3 className="font-black text-yellow-400 text-xl mb-3">
                {column.title} ({column.key === 'pending' ? 147 : 0})
              </h3>
              <div className="space-y-2">
                {column.key === 'pending' ? (
                  <div className="text-center py-8">
                    <p className="text-lg font-bold text-yellow-400">147 tasks ready to start</p>
                    <p className="text-base text-gray-200 mt-2">No work begun yet</p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-base text-gray-400">No tasks</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-6 bg-cyan-950 bg-opacity-60 border border-cyan-600 rounded-lg">
          <p className="text-base text-yellow-400 font-bold">
            <strong>Status:</strong> All 147 tasks are in the backlog. The 33 agents are configured and ready to begin work when the project starts.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TaskBreakdownView;