
import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "https://localhost:7018/api/Todos";

function App() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [category, setCategory] = useState("Personal");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadTodos() {
    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(`Unable to load todos (${response.status}).`);
      }

      setTodos(await response.json());
      setError("");
    } catch (err) {
      setError(err.message || "Cannot connect to the API.");
    }
  }

  useEffect(() => {
    loadTodos();
  }, []);

  function resetForm() {
    setTitle("");
    setDescription("");
    setPriority("Medium");
    setCategory("Personal");
    setEditingId(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    const existingTodo = todos.find(
      (todo) => todo.id === editingId
    );

    const todo = {
      id: editingId ?? 0,
      title: title.trim(),
      description: description.trim(),
      priority,
      category,
      isCompleted: existingTodo?.isCompleted ?? false,
    };

    try {
      const response = await fetch(
        editingId !== null
          ? `${API_URL}/${editingId}`
          : API_URL,
        {
          method: editingId !== null ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(todo),
        }
      );

      if (!response.ok) {
        const responseText = await response.text();
        let detail = responseText;

        try {
          const body = JSON.parse(responseText);
          detail =
            body.message ||
            body.title ||
            body.detail ||
            body.errors?.todo?.join(" ") ||
            responseText;
        } catch {
          // Keep the original response text.
        }

        throw new Error(
          detail || `Request failed (${response.status}).`
        );
      }

      const wasEditing = editingId !== null;

      resetForm();
      setMessage(
        wasEditing
          ? "Todo updated successfully."
          : "Todo added successfully."
      );

      await loadTodos();
    } catch (err) {
      console.error("Save error:", err);
      setError(err.message || "Unable to save todo.");
    }
  }

  function editTodo(todo) {
    setEditingId(todo.id);
    setTitle(todo.title);
    setDescription(todo.description || "");
    setPriority(todo.priority);
    setCategory(todo.category);
    setError("");
    setMessage("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteTodo(id) {
    if (!window.confirm("Are you sure you want to delete this todo?")) {
      return;
    }

    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const detail = await response.text();
        throw new Error(
          detail || `Unable to delete todo (${response.status}).`
        );
      }

      if (editingId === id) {
        resetForm();
      }

      setMessage("Todo deleted successfully.");
      await loadTodos();
    } catch (err) {
      setError(err.message || "Unable to delete todo.");
    }
  }

  async function toggleCompleted(todo) {
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/${todo.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...todo,
          isCompleted: !todo.isCompleted,
        }),
      });

      if (!response.ok) {
        const detail = await response.text();
        throw new Error(
          detail || `Unable to update todo (${response.status}).`
        );
      }

      await loadTodos();
    } catch (err) {
      setError(err.message || "Unable to update todo.");
    }
  }

  const filteredTodos = todos.filter((todo) => {
    const query = search.trim().toLowerCase();

    const matchesSearch =
      todo.title.toLowerCase().includes(query) ||
      (todo.description || "").toLowerCase().includes(query);

    const matchesCategory =
      filter === "All" || todo.category === filter;

    return matchesSearch && matchesCategory;
  });

  return (
    <main className="container">
      <header className="page-header">
        <h1>My Todo List</h1>
        <p>Organize your daily tasks simply.</p>
      </header>

      <section className="card">
        <h2>{editingId !== null ? "Edit Todo" : "Add a Todo"}</h2>

        <form onSubmit={handleSubmit}>
          <label htmlFor="title">Title *</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Enter todo title"
            maxLength={100}
            required
          />

          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Enter description"
            maxLength={500}
            rows={3}
          />

          <div className="form-row">
            <div>
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                value={priority}
                onChange={(event) => setPriority(event.target.value)}
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label htmlFor="category">Category</label>
              <select
                id="category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                <option value="Work">Work</option>
                <option value="Personal">Personal</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="primary-button">
              {editingId !== null ? "Update Todo" : "Add Todo"}
            </button>

            {editingId !== null && (
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  resetForm();
                  setError("");
                  setMessage("");
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}

      {message && (
        <p className="success-message" role="status">
          {message}
        </p>
      )}

      <section className="todo-section">
        <h2>My Tasks ({filteredTodos.length})</h2>

        <input
          className="search-input"
          type="search"
          aria-label="Search todos"
          placeholder="Search by title or description..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <div className="filter-buttons">
          {["All", "Work", "Personal"].map((item) => (
            <button
              key={item}
              type="button"
              className={
                filter === item
                  ? "filter-button active"
                  : "filter-button"
              }
              onClick={() => setFilter(item)}
            >
              {item === "All"
                ? "View All"
                : item === "Work"
                  ? "View Work"
                  : "View Personal Todo"}
            </button>
          ))}
        </div>

        {filteredTodos.length === 0 ? (
          <p className="empty-message">No todos found.</p>
        ) : (
          <div className="todo-list">
            {filteredTodos.map((todo) => (
              <article className="todo-card" key={todo.id}>
                <div className="todo-heading">
                  <input
                    type="checkbox"
                    aria-label={`Mark ${todo.title} completed`}
                    checked={todo.isCompleted}
                    onChange={() => toggleCompleted(todo)}
                  />

                  <h3 className={todo.isCompleted ? "completed" : ""}>
                    {todo.title}
                  </h3>

                  <span
                    className={`priority ${todo.priority.toLowerCase()}`}
                  >
                    {todo.priority}
                  </span>
                </div>

                {todo.description && <p>{todo.description}</p>}

                <div className="todo-footer">
                  <span className="category-label">
                    {todo.category}
                  </span>

                  <span>
                    {todo.isCompleted ? "Completed" : "Pending"}
                  </span>

                  <div className="todo-actions">
                    <button
                      type="button"
                      className="text-button"
                      onClick={() => editTodo(todo)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="text-button delete-button"
                      onClick={() => deleteTodo(todo.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default App;
