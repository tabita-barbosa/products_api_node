// Import required packages
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const knex = require('knex');

require('dotenv').config();

// Create the Express app
const app = express();
app.use(express.json());
app.use(cors());

// Create the SQLite3 database connection
const db = knex({
  client: 'sqlite3',
  connection: {
    filename: './supermarket.db',
  },
  useNullAsDefault: true,
});

// Create the products table if it doesn't exist
db.schema
  .hasTable('products')
  .then((exists) => {
    if (!exists) {
      return db.schema.createTable('products', (table) => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.decimal('price').notNullable();
        table.integer('quantity').notNullable();
      });
    }
  })
  .then(() => {
    console.log('Products table created');
  })
  .catch((error) => {
    console.error('Error creating products table:', error);
  });

// Define JWT secret
const jwtSecret = process.env.JWT_SECRET;

// Authenticate middleware
function authenticate(req, res, next) {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'Access denied. Missing token.' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid token.' });
  }
}

// Login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: 'Missing username or password.' });
  }

  // Simulating user retrieval from the database
  const user = { id: 1, username: 'admin', password: 'admin' };

  // Compare password hash
  bcrypt.compare(password, user.password, (err, result) => {
    if (result) {
      const token = jwt.sign({ id: user.id, username: user.username }, jwtSecret, { expiresIn: '1h' });
      res.json({ token });
    } else {
      res.status(401).json({ message: 'Authentication failed. Invalid username or password.' });
    }
  });
});

// Products routes
app.get('/products', authenticate, (req, res) => {
  // Retrieve all products from the database
  db.select('*')
    .from('products')
    .then((products) => {
      res.json(products);
    })
    .catch((error) => {
      res.status(500).json({ message: 'Error retrieving products.' });
    });
});

app.get('/products/:id', authenticate, (req, res) => {
  const { id } = req.params;

  // Retrieve a product by ID from the database
  db.select('*')
    .from('products')
    .where({ id })
    .first()
    .then((product) => {
      if (product) {
        res.json(product);
      } else {
        res.status(404).json({ message: 'Product not found.' });
      }
    })
    .catch((error) => {
      res.status(500).json({ message: 'Error retrieving product.' });
    });
});

app.post('/products', authenticate, (req, res) => {
  const { name, price, quantity } = req.body;

  // Insert a new product into the database
  db('products')
    .insert({ name, price, quantity })
    .then(() => {
      res.status(201).json({ message: 'Product created successfully.' });
    })
    .catch((error) => {
      res.status(500).json({ message: 'Error creating product.' });
    });
});

app.put('/products/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const { name, price, quantity } = req.body;

  // Update a product in the database
  db('products')
    .where({ id })
    .update({ name, price, quantity })
    .then((count) => {
      if (count > 0) {
        res.json({ message: 'Product updated successfully.' });
      } else {
        res.status(404).json({ message: 'Product not found.' });
      }
    })
    .catch((error) => {
      res.status(500).json({ message: 'Error updating product.' });
    });
});

app.delete('/products/:id', authenticate, (req, res) => {
  const { id } = req.params;

  // Delete a product from the database
  db('products')
    .where({ id })
    .del()
    .then((count) => {
      if (count > 0) {
        res.json({ message: 'Product deleted successfully.' });
      } else {
        res.status(404).json({ message: 'Product not found.' });
      }
    })
    .catch((error) => {
      res.status(500).json({ message: 'Error deleting product.' });
    });
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
