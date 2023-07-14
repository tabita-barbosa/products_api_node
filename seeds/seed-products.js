/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
    // Deletes ALL existing entries
    await knex('products').del()
    await knex('produtos').insert([
        { id: 1, name: "Arroz parboilizado 5Kg", price: 25.00, quantity: 1  },
        { id: 2, name: "Maionese 250gr", price: 7.20, quantity: 2 },
        { id: 3, name: "Iogurte Natural 200ml", price: 2.50, quantity: 3 },
        { id: 4, name: "Batata Maior Palha 300gr", price: 15.20, quantity: 3 },
        { id: 5, name: "Nescau 400gr", price: 8.00, quantity: 5 }
    ]);
  };