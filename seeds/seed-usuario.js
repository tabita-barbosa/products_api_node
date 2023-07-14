/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
    // Deletes ALL existing entries
    await knex("users").del();
    await knex("users").insert([
      {
        id: 1,
        username: "admin",
        password: "$2a$10$mdQBYCE7ERswaD4qB3cPWuXsSMwA9g/5wx0aHVGuXMyGwkEl.VS4m"
      },
      {
        id: 2,
        username: "user",
        password: "$2a$10$mdQBYCE7ERswaD4qB3cPWuXsSMwA9g/5wx0aHVGuXMyGwkEl.VS4m"
      },
    ]);
  };