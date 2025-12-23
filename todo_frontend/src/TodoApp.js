import React, { useEffect, useState, useRef } from "react";
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
  patchTask,
} from "./api";
import "./TodoApp.css";

/**
 * Light theme color constants (matches style guide).
 */
const COLORS = {
  primary: "#3b82f6",  // Button and highlight color
  success: "#06b6d4",  // Save/notification color
  error: "#EF4444",    // Delete/error color
};

/**
 * A visually separated notification bar for success and error messages.
 * @param {object} props
 * @returns {JSX.Element|null}
 */
// PUBLIC_INTERFACE
function Notification({ type, message, onClose }) {
  if (!message) return null;
  return (
    <div
      className={`notification notification-${type}`}
      role="alert"
      tabIndex={0}
      aria-live="polite"
      style={{
        background: type === "error" ? COLORS.error : COLORS.success,
        color: "#fff",
      }}
    >
      <span>{message}</span>
      <button
        className="notification-close"
        onClick={onClose}
        aria-label="Close notification"
        tabIndex={0}
      >
        ×
      </button>
    </div>
  );
}

// PUBLIC_INTERFACE
/**
 * Main UI for the Todo App: provides add, edit, delete, list, and toggle complete.
 * Uses modern, light theme and responsive design with robust error/loading states.
 */
// PUBLIC_INTERFACE
export default function TodoApp() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [noti, setNoti] = useState("");
  const [editId, setEditId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const editInputRef = useRef(null);

  // Fetch tasks from backend on mount
  useEffect(() => {
    setLoading(true);
    fetchTasks()
      .then((data) => setTasks(data))
      .catch(() =>
        setError(
          "Failed to load tasks. Is the backend running on :3001? (Check REACT_APP_API_BASE for issues.)"
        )
      )
      .finally(() => setLoading(false));
  }, []);

  // Auto-focus input when entering edit mode
  useEffect(() => {
    if (editId && editInputRef.current) editInputRef.current.focus();
  }, [editId]);

  // PUBLIC_INTERFACE
  // Add a new task
  function handleAddTask(e) {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    createTask(input.trim())
      .then((newTask) => {
        setTasks((tasks) => [...tasks, newTask]);
        setInput("");
        setNoti("Task added!");
      })
      .catch(() => setError("Could not add task."))
      .finally(() => setLoading(false));
  }

  // PUBLIC_INTERFACE
  // Delete task
  function handleDeleteTask(id) {
    if (!window.confirm("Delete this task?")) return;
    setLoading(true);
    deleteTask(id)
      .then(() => {
        setTasks((tasks) => tasks.filter((t) => t.id !== id));
        setNoti("Task deleted.");
      })
      .catch(() => setError("Could not delete task."))
      .finally(() => setLoading(false));
  }

  // PUBLIC_INTERFACE
  // Toggle task completion
  function handleToggleComplete(task) {
    setLoading(true);
    patchTask(task.id, { completed: !task.completed })
      .then((updated) =>
        setTasks((tasks) =>
          tasks.map((t) => (t.id === task.id ? updated : t))
        )
      )
      .catch(() => setError("Could not update task status."))
      .finally(() => setLoading(false));
  }

  // PUBLIC_INTERFACE
  // Enter task editing
  function startEditing(task) {
    setEditId(task.id);
    setEditValue(task.title);
  }

  // PUBLIC_INTERFACE
  // Change handler for edit input
  function handleEditChange(e) {
    setEditValue(e.target.value);
  }

  // PUBLIC_INTERFACE
  // Save edits to a task
  function handleEditSave(task) {
    if (!editValue.trim()) {
      setError("Title cannot be empty.");
      return;
    }
    setLoading(true);
    updateTask(task.id, { ...task, title: editValue.trim() })
      .then((updated) =>
        setTasks((tasks) =>
          tasks.map((t) => (t.id === task.id ? updated : t))
        )
      )
      .then(() => {
        setNoti("Task updated!");
        setEditId(null);
      })
      .catch(() => setError("Could not update task."))
      .finally(() => setLoading(false));
  }

  // PUBLIC_INTERFACE
  // Handle key events on edit input (Enter/Escape)
  function handleEditKey(task, e) {
    if (e.key === "Enter") handleEditSave(task);
    if (e.key === "Escape") setEditId(null);
  }

  // Close the error notification
  function clearError() {
    setError("");
  }
  // Close the success notification
  function clearNoti() {
    setNoti("");
  }

  return (
    <div className="todo-app-root" data-testid="todo-app-root">
      {/* App Header */}
      <header className="todo-header">
        <h1>Todo List</h1>
      </header>

      <main>
        {/* Add Task Form */}
        <form className="todo-form" onSubmit={handleAddTask}>
          <input
            type="text"
            value={input}
            placeholder="Add a new task…"
            aria-label="Add a new task"
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            maxLength={100}
            className="todo-input"
            autoComplete="off"
          />
          <button
            className="btn-primary"
            type="submit"
            disabled={loading || !input.trim()}
            style={{
              background: COLORS.primary,
              color: "#fff",
            }}
          >
            Add
          </button>
        </form>

        {/* Notifications */}
        <Notification type="error" message={error} onClose={clearError} />
        <Notification type="success" message={noti} onClose={clearNoti} />

        {/* Task List */}
        <section className="todo-task-list-container" aria-label="Task list">
          {loading ? (
            <div className="loading-indicator" aria-live="polite">
              Loading…
            </div>
          ) : tasks.length === 0 ? (
            <div className="empty">No tasks. Add one!</div>
          ) : (
            <ul className="todo-task-list">
              {tasks.map((task) =>
                editId === task.id ? (
                  <li className="todo-task editing" key={task.id}>
                    <input
                      ref={editInputRef}
                      className="todo-input-edit"
                      value={editValue}
                      maxLength={100}
                      onChange={handleEditChange}
                      onKeyDown={(e) => handleEditKey(task, e)}
                      aria-label="Edit task"
                      autoFocus
                    />
                    <button
                      className="btn-save"
                      onClick={() => handleEditSave(task)}
                      style={{
                        background: COLORS.success,
                        color: "#fff",
                      }}
                      disabled={loading}
                    >
                      Save
                    </button>
                    <button
                      className="btn-cancel"
                      onClick={() => setEditId(null)}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </li>
                ) : (
                  <li
                    className={
                      "todo-task" + (task.completed ? " completed" : "")
                    }
                    key={task.id}
                  >
                    {/* Toggle complete */}
                    <button
                      onClick={() => handleToggleComplete(task)}
                      className="action-task-toggle"
                      aria-label={
                        task.completed ? "Mark incomplete" : "Mark complete"
                      }
                      style={{
                        borderColor: COLORS.primary,
                        background: task.completed
                          ? COLORS.primary
                          : "#fff",
                        color: task.completed ? "#fff" : COLORS.primary,
                      }}
                      disabled={loading}
                    >
                      {task.completed ? "✓" : ""}
                    </button>
                    {/* Task title */}
                    <span className="task-title">{task.title}</span>
                    {/* Edit */}
                    <button
                      className="btn-edit"
                      onClick={() => startEditing(task)}
                      aria-label="Edit task"
                      disabled={loading}
                      style={{ color: COLORS.primary }}
                    >
                      Edit
                    </button>
                    {/* Delete */}
                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteTask(task.id)}
                      style={{
                        background: COLORS.error,
                        color: "#fff",
                      }}
                      aria-label="Delete task"
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </li>
                )
              )}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
