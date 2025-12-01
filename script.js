let todos = [];
let isDarkMode = localStorage.getItem('darkMode') === 'true';

// Toggle Theme
function toggleTheme() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
    updateThemeButton();
}

function updateThemeButton() {
    const btn = document.querySelector('.theme-toggle');
    btn.textContent = isDarkMode ? '☀️' : '🌙';
}

// Add task to the list
function addTask() {
    const taskInput = document.getElementById('taskInput');
    const dueDate = document.getElementById('dueDate');
    const priority = document.getElementById('prioritySelect');

    const taskText = taskInput.value.trim();
    if (taskText === '') {
        alert('Please enter a task!');
        return;
    }

    const task = {
        id: Date.now(),
        text: taskText,
        completed: false,
        priority: priority.value,
        dueDate: dueDate.value,
        dateAdded: new Date().toISOString()
    };

    todos.push(task);
    taskInput.value = '';
    dueDate.value = '';
    priority.value = 'medium';
    taskInput.focus();

    saveTodos();
    renderTodos();
}

// Delete task
function deleteTask(id) {
    todos = todos.filter(task => task.id !== id);
    saveTodos();
    renderTodos();
}

// Toggle task completion
function toggleTask(id) {
    const task = todos.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTodos();
        renderTodos();
    }
}

// Edit task (inline)
function editTask(id) {
    const task = todos.find(t => t.id === id);
    if (!task) return;

    const newText = prompt('Edit task:', task.text);
    if (newText && newText.trim()) {
        task.text = newText.trim();
        saveTodos();
        renderTodos();
    }
}

// Get priority badge
function getPriorityBadge(priority) {
    const badges = {
        high: '🔴 High',
        medium: '🟡 Medium',
        low: '🟢 Low'
    };
    return badges[priority] || 'Medium';
}

// Render all todos
function renderTodos() {
    const todoList = document.getElementById('todoList');
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const priorityFilter = document.getElementById('priorityFilter').value;
    const sortBy = document.getElementById('sortSelect').value;

    let filteredTodos = todos.filter(task => {
        const matchesSearch = task.text.toLowerCase().includes(searchTerm);
        const matchesPriority = !priorityFilter || task.priority === priorityFilter;
        return matchesSearch && matchesPriority;
    });

    // Sort todos
    filteredTodos.sort((a, b) => {
        if (sortBy === 'priority') {
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        } else if (sortBy === 'due-date') {
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate) - new Date(b.dueDate);
        }
        return new Date(a.dateAdded) - new Date(b.dateAdded);
    });

    todoList.innerHTML = '';

    if (filteredTodos.length === 0) {
        todoList.innerHTML = '<div class="empty-state">No tasks. Add one to get started! 🚀</div>';
    } else {
        filteredTodos.forEach(task => {
            const taskEl = document.createElement('div');
            taskEl.className = `todo-item ${task.completed ? 'completed' : ''} priority-${task.priority}`;

            const dueInfo = task.dueDate ? `<span class="due-date">📅 ${formatDate(task.dueDate)}</span>` : '';

            taskEl.innerHTML = `
                <input type="checkbox" class="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${task.id})">
                <div class="task-content">
                    <span class="todo-text">${escapeHtml(task.text)}</span>
                    <div class="task-meta">
                        <span class="priority-badge">${getPriorityBadge(task.priority)}</span>
                        ${dueInfo}
                    </div>
                </div>
                <button class="btn-edit" onclick="editTask(${task.id})">✏️</button>
                <button class="btn-delete" onclick="deleteTask(${task.id})">🗑️</button>
            `;
            todoList.appendChild(taskEl);
        });
    }

    updateStats();
}

// Update task stats
function updateStats() {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    document.getElementById('totalCount').textContent = total;
    document.getElementById('completedCount').textContent = completed;
}

// Clear completed tasks
function clearCompleted() {
    if (confirm('Delete all completed tasks?')) {
        todos = todos.filter(t => !t.completed);
        saveTodos();
        renderTodos();
    }
}

// Clear all tasks
function clearAll() {
    if (confirm('Delete ALL tasks? This cannot be undone!')) {
        todos = [];
        saveTodos();
        renderTodos();
    }
}

// Export todos as JSON
function exportTodos() {
    const dataStr = JSON.stringify(todos, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `todos_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
}

// Format date
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Save to localStorage
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// Load from localStorage
function loadTodos() {
    const saved = localStorage.getItem('todos');
    todos = saved ? JSON.parse(saved) : [];
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('taskInput').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') addTask();
    });

    document.getElementById('searchInput').addEventListener('input', renderTodos);
    document.getElementById('priorityFilter').addEventListener('change', renderTodos);
    document.getElementById('sortSelect').addEventListener('change', renderTodos);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
    loadTodos();
    setupEventListeners();

    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    }
    updateThemeButton();
    renderTodos();
});