const express = require('express');
const cors = require('cors');
const knex = require('knex');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const db = knex({
  client: 'sqlite3',
  connection: {
    filename: './mydatabase.db',
  },
  useNullAsDefault: true,
});

db.schema
  .hasTable('users')
  .then((exists) => {
    if (!exists) {
      return db.schema.createTable('users', (table) => {
        table.increments('id').primary();
        table.string('username').notNullable();
        table.string('password').notNullable();
      });
    }
  })
  .then(() => {
    console.log('Users table created');
  })
  .catch((error) => {
    console.error('Error creating users table:', error);
  });

app.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  db('users')
    .insert({ username, password: hashedPassword })
    .then(() => {
      res.status(201).json({ message: 'User registered successfully.' });
    })
    .catch((error) => {
      res.status(500).json({ message: 'Error registering user.' });
    });
});

// User login
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  db.select('*')
    .from('users')
    .where({ username })
    .first()
    .then((user) => {
      if (!user) {
        return res.status(401).json({ message: 'Invalid username or password.' });
      }

      const isPasswordValid = bcrypt.compareSync(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid username or password.' });
      }

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

      res.json({ token });
    })
    .catch((error) => {
      res.status(500).json({ message: 'Error logging in.' });
    });
});

function authenticateToken(req, res, next) {
  const token = req.headers.authorization.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token not found.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token.' });
    }

    req.user = user;
    next();
  });
}

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

app.get('/products', authenticateToken, (req, res) => {
  db.select('*')
    .from('products')
    .then((products) => {
      res.json(products);
    })
    .catch((error) => {
      res.status(500).json({ message: 'Error retrieving products.' });
    });
});

app.get('/products/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

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

app.post('/products', authenticateToken, (req, res) => {
  const { name, price, quantity } = req.body;

  db('products')
    .insert({ name, price, quantity })
    .then(() => {
      res.status(201).json({ message: 'Product created successfully.' });
    })
    .catch((error) => {
      res.status(500).json({ message: 'Error creating product.' });
    });
});

app.put('/products/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { name, price, quantity } = req.body;

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

app.delete('/products/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

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

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
