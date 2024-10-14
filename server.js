const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");

const app = express();
const PORT = 3000;

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

// Load existing todos from the JSON file
let todos = require("./todos.json");

// Route: GET /todos - Get all todos
app.get("/todos", (req, res) => {
  res.json(todos);
});

// Route: POST /todos - Create a new todo
app.post("/todos", (req, res) => {
  const { title, description } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  const newTodo = {
    id: todos.length + 1,
    title,
    description: description || "No description provided",
    completed: false,
  };

  todos.push(newTodo);

  fs.writeFile("./todos.json", JSON.stringify(todos, null, 2), (err) => {
    if (err) {
      return res.status(500).json({ error: "Failed to save the todo" });
    }
    res.status(201).json(newTodo);
  });
});

// Route: PATCH /todos/:id - Update a todo (complete or modify)
app.patch("/todos/:id", (req, res) => {
  const todoId = parseInt(req.params.id);
  const { title, description, completed } = req.body;

  const todo = todos.find((t) => t.id === todoId);

  if (!todo) {
    return res.status(404).json({ error: "Todo not found" });
  }

  if (title) todo.title = title;
  if (description) todo.description = description;
  if (completed !== undefined) todo.completed = completed;

  fs.writeFile("./todos.json", JSON.stringify(todos, null, 2), (err) => {
    if (err) {
      return res.status(500).json({ error: "Failed to update the todo" });
    }
    res.json(todo);
  });
});

// Route: DELETE /todos/:id - Delete a todo
app.delete("/todos/:id", (req, res) => {
  const todoId = parseInt(req.params.id);

  const todoIndex = todos.findIndex((t) => t.id === todoId);

  if (todoIndex === -1) {
    return res.status(404).json({ error: "Todo not found" });
  }

  todos.splice(todoIndex, 1);

  fs.writeFile("./todos.json", JSON.stringify(todos, null, 2), (err) => {
    if (err) {
      return res.status(500).json({ error: "Failed to delete the todo" });
    }
    res.json({ message: "Todo deleted successfully" });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
