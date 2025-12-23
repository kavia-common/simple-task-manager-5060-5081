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
  primary: "#3b82f6",
  success: "#06b6d4",
  error: "#EF4444",
};

/**
 * A visually separated notification bar for success and error messages.
 */
function Notification({ type, message, onClose }) {
  if (!message) return null;
  return (
    <div
      className={`notification notification-${type}`}
      role="alert"
      tabIndex="0"
      aria-live="polite"
      style={{
        background: type === "error" ? COLORS.error : COLORS.success,
        color: "#fff",
      }}
    >
      {message}
      <button
        className="notification-close"
        onClick={onClose}
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
}

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

  // Load tasks on mount
  useEffect(() => {
    setLoading(true);
    fetchTasks()
      .then((data) => setTasks(data))
      .catch((err) =>
        setError("Failed to load tasks. Is the backend running on :3001?")
      )
      .finally(() => setLoading(false));
  }, []);

  // Focus input when editing
  useEffect(() => {
    if (editId && editInputRef.current) editInputRef.current.focus();
  }, [editId]);

  // PUBLIC_INTERFACE
  function handleAddTask(e) {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    createTask(input.trim())
      .then((newTask) => {
        setTasks((tasks) => [...tasks, newTask]);
        setNoti("Task added!");
        setInput("");
      })
      .catch(() => setError("Could not add task."))
      .finally(() => setLoading(false));
  }

  // PUBLIC_INTERFACE
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
  function startEditing(task) {
    setEditId(task.id);
    setEditValue(task.title);
  }

  // PUBLIC_INTERFACE
  function handleEditChange(e) {
    setEditValue(e.target.value);
  }

  // PUBLIC_INTERFACE
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
  function handleEditKey(task, e) {
    if (e.key === "Enter") handleEditSave(task);
    if (e.key === "Escape") setEditId(null);
  }

  function clearError() {
    setError("");
  }

  function clearNoti() {
    setNoti("");
  }

  return (
    <div className="todo-app-root">
      <header className="todo-header">
        <h1>Todo List</h1>
      </header>
      <main>
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
        <Notification
          type="error"
          message={error}
          onClose={clearError}
        />
        <Notification
          type="success"
          message={noti}
          onClose={clearNoti}
        />
        <section className="todo-task-list-container">
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
                    />
                    <button
                      className="btn-save"
                      onClick={() => handleEditSave(task)}
                      style={{
                        background: COLORS.success,
                        color: "#fff",
                      }}
                    >
                      Save
                    </button>
                    <button
                      className="btn-cancel"
                      onClick={() => setEditId(null)}
                    >
                      Cancel
                    </button>
                  </li>
                ) : (
                  <li
                    className={
                      "todo-task" +
                      (task.completed ? " completed" : "")
                    }
                    key={task.id}
                  >
                    <button
                      onClick={() => handleToggleComplete(task)}
                      className="action-task-toggle"
                      aria-label={
                        task.completed
                          ? "Mark incomplete"
                          : "Mark complete"
                      }
                      style={{
                        borderColor: COLORS.primary,
                        background: task.completed
                          ? COLORS.primary
                          : "#fff",
                        color: task.completed ? "#fff" : COLORS.primary,
                      }}
                    >
                      {task.completed ? "✓" : ""}
                    </button>
                    <span className="task-title">{task.title}</span>
                    <button
                      className="btn-edit"
                      onClick={() => startEditing(task)}
                      aria-label="Edit task"
                    >
                      Edit
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteTask(task.id)}
                      style={{
                        background: COLORS.error,
                        color: "#fff",
                      }}
                      aria-label="Delete task"
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
