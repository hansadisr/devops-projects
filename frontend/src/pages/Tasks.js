import { useState, useEffect } from 'react';
import { api } from '../api';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.getTasks()
      .then(setTasks)
      .catch(err => setError(err.message));
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    try {
      const payload = { title: newTitle, dueDate: dueDate || null };
      const createdTask = await api.createTask(payload);
      const sortedTasks = [...tasks, createdTask].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
      setTasks(sortedTasks);
      setNewTitle('');
      setDueDate('');
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleMarkAsDone(taskId) {
    try {
      const updatedTask = await api.updateTask(taskId, { completed: true });
      setTasks(tasks.map(task => task._id === taskId ? updatedTask : task));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(taskId) {
    try {
      await api.deleteTask(taskId);
      setTasks(tasks.filter(task => task._id !== taskId));
    } catch (err) {
      setError(err.message);
    }
  }

  // Group incomplete tasks by date
  const groupedIncompleteTasks = tasks
    .filter(task => !task.completed)
    .reduce((groups, task) => {
      const date = new Date(task.dueDate).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(task);
      return groups;
    }, {});

  const completedTasks = tasks.filter(task => task.completed);

  // Helper function to format date headings
  const formatDateHeading = (dateStr) => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    const date = new Date(dateStr);

    if (date.toDateString() === today.toDateString()) return 'Today 📅';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow 📆';

    return date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Calculate progress for each day
  const calculateProgress = (dateStr) => {
    const totalTasks = [...tasks.filter(task => new Date(task.dueDate).toLocaleDateString() === dateStr)];
    const completedCount = totalTasks.filter(task => task.completed).length;
    const incompleteCount = totalTasks.filter(task => !task.completed).length;
    const total = totalTasks.length;
    const percentage = total > 0 ? (completedCount / total) * 100 : 0;
    
    return { completedCount, incompleteCount, total, percentage };
  };

  // Progress Circle Component
  const ProgressCircle = ({ percentage, completed, total }) => {
    const circumference = 2 * Math.PI * 25;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="progress-container">
        <div className="progress-chart">
          <svg className="progress-circle" viewBox="0 0 60 60">
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#667eea" />
                <stop offset="100%" stopColor="#764ba2" />
              </linearGradient>
            </defs>
            <circle
              className="progress-bg"
              cx="30"
              cy="30"
              r="25"
            />
            <circle
              className="progress-bar"
              cx="30"
              cy="30"
              r="25"
              style={{
                strokeDasharray: `${circumference}`,
                strokeDashoffset: `${strokeDashoffset}`
              }}
            />
          </svg>
          <div className="progress-text">{Math.round(percentage)}%</div>
        </div>
        <div className="progress-info">
          <div>{completed}/{total} completed</div>
        </div>
      </div>
    );
  };

  return (
    <div className="page-container">
      <h2 className="section-title">My Tasks 📝</h2>
      
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleCreate} className="task-create-form">
        <input 
          placeholder="✨ What needs to be done?"
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          required
          className="task-input"
        />
        <input 
          type="date"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
          className="date-input"
          title="Due date (optional)"
        />
        <button type="submit" className="add-button">
          Add Task ➕
        </button>
      </form>

      {/* To-Do Section */}
      <section>
        <h3 className="section-title">📋 To-Do</h3>
        {Object.keys(groupedIncompleteTasks).length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px', 
            color: '#718096',
            background: 'linear-gradient(135deg, #f7fafc, #edf2f7)',
            borderRadius: '16px',
            border: '2px dashed #cbd5e0'
          }}>
            <div style={{ fontSize: '3em', marginBottom: '16px' }}>🎉</div>
            <div style={{ fontSize: '1.2em', fontWeight: '600' }}>All caught up!</div>
            <div>No pending tasks. Great job!</div>
          </div>
        ) : (
          Object.keys(groupedIncompleteTasks).map(date => {
            const progress = calculateProgress(date);
            return (
              <div key={date} className="date-group">
                <div className="date-header">
                  <h4 className="date-title">{formatDateHeading(date)}</h4>
                  <ProgressCircle 
                    percentage={progress.percentage}
                    completed={progress.completedCount}
                    total={progress.total}
                  />
                </div>
                <ul className="task-list">
                  {groupedIncompleteTasks[date].map(task => (
                    <li key={task._id} className="task-item">
                      <span className="task-content">{task.title}</span>
                      <div className="task-actions">
                        <button 
                          onClick={() => handleMarkAsDone(task._id)} 
                          className="task-button done-button"
                        >
                          ✓ Done
                        </button>
                        <button 
                          onClick={() => handleDelete(task._id)} 
                          className="task-button delete-button"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })
        )}
      </section>

      {/* Completed Section */}
      {completedTasks.length > 0 && (
        <section className="completed-section">
          <h3 className="section-title">✅ Completed</h3>
          <ul className="task-list">
            {completedTasks.map(task => (
              <li key={task._id} className="task-item completed-task">
                <span className="task-content completed-content">
                  {task.title}
                </span>
                <button 
                  onClick={() => handleDelete(task._id)} 
                  className="task-button delete-button"
                >
                  🗑️ Remove
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}