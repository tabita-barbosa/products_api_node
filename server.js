// Import required packages
const express = require('express');
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
    filename: './mydatabase.db', // Replace with the path to your SQLite database file
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

// Products routes
app.get('/products', (req, res) => {
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

app.get('/products/:id', (req, res) => {
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

app.post('/products', (req, res) => {
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

app.put('/products/:id', (req, res) => {
  const { id } = req.params;
  const { name, price, quantity } = req.body;

  // Update a product in the database
  db('products')
    .where({ id })
    .update({ name, price, quantity })
    .then((count) => {
      if (count) {
        res.json({ message: 'Product updated successfully.' });
      } else {
        res.status(404).json({ message: 'Product not found.' });
      }
    })
    .catch((error) => {
      res.status(500).json({ message: 'Error updating product.' });
    });
});

app.delete('/products/:id', (req, res) => {
  const { id } = req.params;

  // Delete a product from the database
  db('products')
    .where({ id })
    .del()
    .then((count) => {
      if (count) {
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
  console.log(`Server listening on port ${port}`);
});
