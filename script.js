// Add task to the list
function addTask(listNumber) {
    const inputId = `input${listNumber}`;
    const todoListId = `todoList${listNumber}`;
    const input = document.getElementById(inputId);
    const todoList = document.getElementById(todoListId);
    
    const taskText = input.value.trim();
    if (taskText === '') {
        alert('Please enter a task!');
        return;
    }

    // Create new todo item
    const newItem = document.createElement('div');
    newItem.className = 'todo-item';
    newItem.dataset.id = Date.now();
    newItem.innerHTML = `
        <input type="checkbox" class="checkbox">
        <span class="todo-text">${escapeHtml(taskText)}</span>
        <button class="btn-delete" onclick="deleteItem(this)">Delete</button>
    `;

    // Add event listener to checkbox
    const checkbox = newItem.querySelector('.checkbox');
    checkbox.addEventListener('change', function() {
        toggleComplete(newItem);
    });

    todoList.appendChild(newItem);
    input.value = '';
    input.focus();

    // Save to localStorage
    saveState(listNumber);
}

// Delete item from list
function deleteItem(button) {
    const item = button.parentElement;
    const listNumber = item.closest('.todo-card').querySelector('h2').textContent;
    item.style.opacity = '0';
    item.style.transform = 'translateX(100px)';
    
    setTimeout(() => {
        item.remove();
        const listNum = item.closest('.todo-card').querySelector('input').closest('div').closest('div').id.replace('todoList', '');
        saveState(parseInt(listNum) || 1);
    }, 300);
}

// Toggle item completion
function toggleComplete(item) {
    item.classList.toggle('completed');
    const listNum = item.closest('.todo-card').querySelector('input').closest('div').closest('div').id.replace('todoList', '');
    saveState(parseInt(listNum) || 1);
}

// Escape HTML special characters
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Save state to localStorage
function saveState(listNumber) {
    const todoList = document.getElementById(`todoList${listNumber}`);
    const items = [];
    
    todoList.querySelectorAll('.todo-item').forEach(item => {
        items.push({
            text: item.querySelector('.todo-text').textContent,
            completed: item.querySelector('.checkbox').checked,
            indented: item.classList.contains('indented')
        });
    });

    localStorage.setItem(`todoList${listNumber}`, JSON.stringify(items));
}

// Load state from localStorage
function loadState(listNumber) {
    const saved = localStorage.getItem(`todoList${listNumber}`);
    if (!saved) return;

    const items = JSON.parse(saved);
    const todoList = document.getElementById(`todoList${listNumber}`);
    
    // Clear existing items
    todoList.innerHTML = '';

    items.forEach(item => {
        const newItem = document.createElement('div');
        newItem.className = `todo-item ${item.indented ? 'indented' : ''} ${item.completed ? 'completed' : ''}`;
        newItem.dataset.id = Date.now();
        newItem.innerHTML = `
            <input type="checkbox" class="checkbox" ${item.completed ? 'checked' : ''}>
            <span class="todo-text">${escapeHtml(item.text)}</span>
            <button class="btn-delete" onclick="deleteItem(this)">Delete</button>
        `;

        const checkbox = newItem.querySelector('.checkbox');
        checkbox.addEventListener('change', function() {
            toggleComplete(newItem);
        });

        todoList.appendChild(newItem);
    });
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('input1').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addTask(1);
    });

    document.getElementById('input2').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addTask(2);
    });

    // Setup checkbox listeners
    document.querySelectorAll('.checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            toggleComplete(this.parentElement);
        });
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    loadState(1);
    loadState(2);
});