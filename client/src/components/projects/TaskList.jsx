import React, { useState } from 'react';
  import StatusIndicator from '../common/StatusIndicator';
  import Button from '../common/Button';

  const TaskList = ({ tasks, agents, projectId }) => {
    const [showAddTask, setShowAddTask] = useState(false);
    const [newTask, setNewTask] = useState({
      title: '',
      description: '',
      assignedTo: '',
      priority: 'medium',
      dueDate: ''
    });

    const handleAddTask = () => {
      // Task creation logic here
      console.log('Adding task:', newTask);
      setShowAddTask(false);
      setNewTask({
        title: '',
        description: '',
        assignedTo: '',
        priority: 'medium',
        dueDate: ''
      });
    };

    const getAgentName = (agentId) => {
      const agent = agents.find(a => a.id === agentId);
      return agent ? agent.name : 'Unassigned';
    };

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-slate-900">Tasks ({tasks.length})</h3>
          <Button size="small" onClick={() => setShowAddTask(true)}>
            Add Task
          </Button>
        </div>

        {showAddTask && (
          <div className="bg-slate-50 rounded-lg p-4 space-y-3">
            <input
              type="text"
              placeholder="Task title"
              value={newTask.title}
              onChange={(e) => setNewTask({...newTask, title: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
            <textarea
              placeholder="Task description"
              value={newTask.description}
              onChange={(e) => setNewTask({...newTask, description: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
              rows={2}
            />
            <div className="grid grid-cols-3 gap-3">
              <select
                value={newTask.assignedTo}
                onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                <option value="">Assign to...</option>
                {agents.map(agent => (
                  <option key={agent.id} value={agent.id}>{agent.name}</option>
                ))}
              </select>
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
              <input
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button size="small" variant="secondary" onClick={() => setShowAddTask(false)}>
                Cancel
              </Button>
              <Button size="small" onClick={handleAddTask}>
                Add Task
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {tasks.length > 0 ? (
            tasks.map((task, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-slate-900">{task.title}</h4>
                  {task.description && (
                    <p className="text-sm text-slate-600 mt-1">{task.description}</p>
                  )}
                  <div className="flex items-center space-x-4 mt-2 text-sm">
                    <span className="text-slate-600">
                      Assigned to: <span className="font-medium">{getAgentName(task.assignedTo)}</span>
                    </span>
                    {task.dueDate && (
                      <span className="text-slate-600">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <StatusIndicator status={task.status} />
              </div>
            ))
          ) : (
            <p className="text-center text-slate-600 py-8">No tasks yet. Add your first task to get started!</p>
          )}
        </div>
      </div>
    );
  };

  export default TaskList;