const mysql = require("mysql2");

const pool = mysql.createPool(
  // mysql://efzuvkvci51trqf7:zretpktvmne8vgbe@uzb4o9e2oe257glt.cbetxkdyhwsb.us-east-1.rds.amazonaws.com/tzoi81meqqhe5256?reconnect=true

  process.env.JAWSDB_URL ?? {
    Host: "uzb4o9e2oe257glt.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
    Username: "efzuvkvci51trqf7",
    Database: "tzoi81meqqhe5256",
    Password: "zretpktvmne8vgbe",
    Port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  }
);
const promisePool = pool.promise();

const sql = {
  getSections: async () => {
    const [rows] = await promisePool.query(`
      SELECT * FROM sections
    `);
    return rows;
  },

  getBusinessesJoined: async (query) => {
    const sqlQuery = `
      SELECT * FROM sections S
      LEFT JOIN businesses B
        ON S.section_id = B.fk_section_id
      WHERE TRUE
        ${query.section ? "AND section_id = " + query.section : ""}
        ${query.floor ? "AND floor = " + query.floor : ""}
        ${query.status ? "AND status = '" + query.status + "'" : ""}
      ORDER BY
         ${query.order ? query.order : "business_id"}
    `;
    console.log(sqlQuery);

    const [rows] = await promisePool.query(sqlQuery);
    return rows;
  },

  getSingleBusinessJoined: async (business_id) => {
    const [rows] = await promisePool.query(`
      SELECT * FROM sections S
      LEFT JOIN businesses B
        ON S.section_id = B.fk_section_id
      WHERE business_id = ${business_id}
    `);
    return rows[0];
  },

  getMenusOfBusiness: async (business_id) => {
    const [rows] = await promisePool.query(`
      SELECT * FROM menus
      WHERE fk_business_id = ${business_id}
    `);
    return rows;
  },

  getRatingsOfBusiness: async (business_id) => {
    const [rows] = await promisePool.query(`
      SELECT rating_id, stars, comment,
      DATE_FORMAT(
        created, '%y년 %m월 %d일 %p %h시 %i분 %s초'
      ) AS created_fmt
      FROM ratings
      WHERE fk_business_id = ${business_id}
    `);
    return rows;
  },

  updateMenuLikes: async (id, like) => {
    return await promisePool.query(`
      UPDATE menus
      SET likes = likes + ${like}
      WHERE menu_id = ${id}
    `);
  },

  addRating: async (business_id, stars, comment) => {
    return await promisePool.query(`
      INSERT INTO ratings
      (fk_business_id, stars, comment)
      VALUES
      (${business_id}, '${stars}', '${comment}')
    `);
  },

  removeRating: async (rating_id) => {
    return await promisePool.query(`
      DELETE FROM ratings
      WHERE rating_id = ${rating_id}
    `);
  },
};

module.exports = sql;
