const express = require('express');

const router = express.Router();

// Example: Establishing a connection and query to db   nyhet!
const pool = require('../util/connect');

router.get('/', (request, response) => {
  const { reference_number } = request.query;
  const { material_number } = request.query;
  const { location } = request.query;
  const { shelf } = request.query;
  const { package_number } = request.query;
  const { status } = request.query;

  sql_query =    "select Article.material_number, Case.reference_number, Branch.name as 'branch', StorageRoom.name as 'storage_room', Shelf.shelf_name as 'shelf',";
  sql_query
    += ' CASE WHEN EXISTS (select package_number from Package where id  = (select container from StorageMap where article = Article.id))';
  sql_query
    += " THEN (select package_number from Package where id  = (select container from StorageMap where article = Article.id)) ELSE ' - ' END as package,";
  sql_query
    += " se2.action as 'status',se1.timestamp as 'timestamp', se2.timestamp as 'last modified', Article.description, Article.id";
  sql_query
    += ' FROM Article, `Case`, StorageRoom, Branch, Shelf, StorageEvent as se1, StorageEvent as se2';
  sql_query += ' WHERE Article.case = Case.id';
  sql_query
    += ' and (StorageRoom.id = (select current_storage_room from Container where id = (select container from StorageMap where article = Article.id)))';
  sql_query += ' and Branch.id = StorageRoom.branch';
  sql_query
    += ' and (Shelf.id = (select container from StorageMap where article = Article.id) OR Shelf.id = (select shelf from Package where id = (select container from StorageMap where article = Article.id)))';
  sql_query
    += ' AND se1.id = (SELECT id from StorageEvent WHERE article = Article.id ORDER BY timestamp ASC LIMIT 1)';
  sql_query
    += ' AND se2.id = (SELECT id from StorageEvent WHERE article = Article.id ORDER BY timestamp DESC LIMIT 1)';

  let has_where_condition = false;
  const parameters = [];

  if (
    reference_number
    || material_number
    || location
    || shelf
    || package_number
    || status
  ) {
    sql_query += ' and';
  }

  if (reference_number) {
    sql_query += ' Case.reference_number = ?';
    has_where_condition = true;
    parameters.push(reference_number);
  }

  if (material_number) {
    if (has_where_condition) sql_query += ' and';
    sql_query += ' Article.material_number = ?';
    has_where_condition = true;
    parameters.push(material_number);
  }

  if (package_number) {
    if (has_where_condition) sql_query += ' and';
    sql_query
      += ' Article.id in (select article from StorageMap where container=(select id from Package where package_number=?))';
    has_where_condition = true;
    parameters.push(package_number);
  }

  // Storageroom
  if (location) {
    if (has_where_condition) sql_query += ' and';
    sql_query += ' StorageRoom.name = ?';
    has_where_condition = true;
    parameters.push(location);
  }

  // Shelf
  if (shelf) {
    if (has_where_condition) sql_query += ' and';
    sql_query += ' Shelf.shelf_name = ?';
    has_where_condition = true;
    parameters.push(shelf);
  }

  if (status) {
    if (has_where_condition) sql_query += ' and';
    sql_query += ' se2.action = ?';
    has_where_condition = true;
    parameters.push(status);
  }

  sql_query += ' Order by Article.material_number asc';

  pool.getConnection((err, connection) => {
    if (err) console.log(err);
    console.log(sql_query);
    console.log(parameters);
    connection.query(sql_query, parameters, (err, rows) => {
      connection.release();
      console.log('Data received from Db:\n');
      response.send(rows);
    });
  });
});
module.exports = router;
