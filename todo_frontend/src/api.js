//
// API utility functions for the todo app.
// Handles CRUD operations and completion toggle for tasks.
//

const BASE_URL =
  process.env.REACT_APP_API_BASE && process.env.REACT_APP_API_BASE !== ""
    ? process.env.REACT_APP_API_BASE
    : "http://localhost:3001";

// PUBLIC_INTERFACE
export async function fetchTasks() {
  /** Fetch all tasks from the backend */
  const res = await fetch(`${BASE_URL}/tasks`);
  if (!res.ok) throw new Error('Failed to fetch tasks');
  return await res.json();
}

// PUBLIC_INTERFACE
export async function createTask(title) {
  /** Create a new task with the given title. */
  const res = await fetch(`${BASE_URL}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error('Failed to add task');
  return await res.json();
}

// PUBLIC_INTERFACE
export async function updateTask(id, updates) {
  /**
   * Update a task's fields.
   * `updates` is an object, e.g. { title: 'new title' }.
   */
  const res = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update task');
  return await res.json();
}

// PUBLIC_INTERFACE
export async function deleteTask(id) {
  /** Delete a task by id. */
  const res = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete task');
  return true;
}

// PUBLIC_INTERFACE
export async function patchTask(id, patch) {
  /**
   * Partially update a task (PATCH).
   * `patch` is an object, e.g. { completed: true }.
   */
  const res = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error('Failed to patch task');
  return await res.json();
}
