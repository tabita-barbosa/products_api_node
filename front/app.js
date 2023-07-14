const apiUrl = 'http://localhost:3000'; // Replace with your API URL

// Function to show/hide sections based on authentication status
function showSections() {
  const token = localStorage.getItem('token');
  const loginContainer = document.getElementById('loginContainer');
  const registerContainer = document.getElementById('registerContainer');
  const appContainer = document.getElementById('appContainer');

  if (token) {
    loginContainer.style.display = 'none';
    registerContainer.style.display = 'none';
    appContainer.style.display = 'block';
    fetchProducts();
  } else {
    loginContainer.style.display = 'block';
    registerContainer.style.display = 'block';
    appContainer.style.display = 'none';
  }
}

// Function to handle login form submission
function handleLogin(event) {
  event.preventDefault();

  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;

  if (username && password) {
    const user = {
      username,
      password
    };

    fetch(`${apiUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(user)
    })
      .then(response => response.json())
      .then(data => {
        const { token } = data;

        if (token) {
          localStorage.setItem('token', token);
          document.getElementById('loginForm').reset();
          document.getElementById('loginMessage').textContent = '';
          showSections();
        } else {
          document.getElementById('loginMessage').textContent = 'Invalid username or password.';
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }
}

// Function to handle registration form submission
function handleRegister(event) {
  event.preventDefault();

  const username = document.getElementById('registerUsername').value;
  const password = document.getElementById('registerPassword').value;

  if (username && password) {
    const user = {
      username,
      password
    };

    fetch(`${apiUrl}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(user)
    })
      .then(response => response.json())
      .then(data => {
        console.log(data.message);
        document.getElementById('registerForm').reset();
        document.getElementById('registerMessage').textContent = '';
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }
}

// Function to handle product form submission
function handleAddProduct(event) {
  event.preventDefault();

  const name = document.getElementById('name').value;
  const price = parseFloat(document.getElementById('price').value);
  const quantity = parseInt(document.getElementById('quantity').value);

  if (name && price && quantity) {
    const product = {
      name,
      price,
      quantity
    };

    fetch(`${apiUrl}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(product)
    })
      .then(response => response.json())
      .then(data => {
        console.log(data.message);
        document.getElementById('addProductForm').reset();
        fetchProducts();
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }
}

// Function to delete a product
function deleteProduct(productId) {
  if (confirm("Are you sure you want to delete this product?")) {
    fetch(`${apiUrl}/products/${productId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(response => response.json())
      .then(data => {
        console.log(data.message);
        fetchProducts();
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }
}

// Function to populate the form with product details for editing
function populateEditForm(productId, name, price, quantity) {
  const editForm = document.getElementById('editProductForm');
  editForm.dataset.productId = productId;
  editForm.elements.name.value = name;
  editForm.elements.price.value = price;
  editForm.elements.quantity.value = quantity;
}

// Function to handle product edit form submission
function handleEditProduct(event) {
  event.preventDefault();

  const productId = event.target.dataset.productId;
  const name = document.getElementById('editName').value;
  const price = parseFloat(document.getElementById('editPrice').value);
  const quantity = parseInt(document.getElementById('editQuantity').value);

  if (name && price && quantity) {
    const product = {
      name,
      price,
      quantity
    };

    fetch(`${apiUrl}/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(product)
    })
      .then(response => response.json())
      .then(data => {
        console.log(data.message);
        document.getElementById('editProductForm').reset();
        fetchProducts();
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }
}

// Function to fetch and display products
function fetchProducts() {
  fetch(`${apiUrl}/products`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  })
    .then(response => response.json())
    .then(products => {
      const tableBody = document.querySelector('#productTable tbody');
      tableBody.innerHTML = '';

      products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${product.name}</td>
          <td>${product.price}</td>
          <td>${product.quantity}</td>
          <td>
            <button class="delete-button" onclick="deleteProduct(${product.id})">Delete</button>
            <button onclick="populateEditForm(${product.id}, '${product.name}', ${product.price}, ${product.quantity})">Edit</button>
          </td>
        `;
        tableBody.appendChild(row);
      });
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

// Event listeners
document.getElementById('loginForm').addEventListener('submit', handleLogin);
document.getElementById('registerForm').addEventListener('submit', handleRegister);
document.getElementById('addProductForm').addEventListener('submit', handleAddProduct);
document.getElementById('editProductForm').addEventListener('submit', handleEditProduct);

// Check if the user is already logged in
showSections();
