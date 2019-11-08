const express = require('express');
const router = express.Router();

// Example: Establishing a connection and query to db   nyhet!
const pool = require('../../connect');

router.get('/', (request, response) => {
    let reference_number = request.query.reference_number;
    let material_number = request.query.material_number;
    let location = request.query.location;
    let shelf = request.query.shelf;



    let sql_query = "select Article.id as id, Article.material_number as 'material number', Article.description as description, Article.case as 'case', Case.reference_number as 'reference number', StorageRoom.name as 'storage room', StorageEvent.shelf as 'shelf'";
    sql_query += "from StorageRoom inner join StorageEvent on StorageRoom.id = StorageEvent.storage_room inner join Article on StorageEvent.article = Article.id inner join `Case` on Case.id = Article.case";
    
    
    
    let has_where_condition = false;
    let parameters = [];

    if(reference_number || material_number || location || shelf) sql_query = sql_query + " where ";

    if(reference_number) {
        sql_query += "Article.case = (select id from `Case` where reference_number = ?) ";
        has_where_condition = true;
        parameters.push(reference_number);
    }

    if(material_number){
        if(has_where_condition) sql_query += "and ";
        sql_query += "Article.material_number = ? ";
        has_where_condition = true;
        parameters.push(material_number);
    } 


    // storageroom
    if(location){
        if(has_where_condition) sql_query += "and ";
        sql_query += "Article.id in (select article from StorageEvent where storage_room = (select id from StorageRoom where name = ?)) ";
        has_where_condition = true;
        parameters.push(location);
    } 

    // Shelf
    if(shelf){
        if(has_where_condition) sql_query += "and ";
        sql_query += "Article.id in (select article from StorageEvent where shelf = ? )";
        has_where_condition = true;
        parameters.push(shelf);
    } 

    sql_query += " Order by Article.id asc";


    sql_query = "select Article.id, Article.material_number, Case.reference_number, StorageRoom.name as 'storage room', CASE WHEN EXISTS (select package_number from Package where id  = (select container from StorageMap where article = Article.id)) THEN (select package_number from Package where id  = (select container from StorageMap where article = Article.id)) ELSE ' - ' END as package, Shelf.shelf_name, se2.action as 'status',se1.timestamp as 'timestamp', se2.timestamp as 'last modified', Article.description FROM Article, `Case`, StorageRoom, Shelf, StorageEvent as se1, StorageEvent as se2 WHERE Article.case = Case.id and (StorageRoom.id = (select current_storage_room from Container where id = (select container from StorageMap where article = Article.id))) and (Shelf.id = (select container from StorageMap where article = Article.id) OR Shelf.id = (select shelf from Package where id = (select container from StorageMap where article = Article.id))) AND se1.id = (SELECT id from StorageEvent WHERE article = Article.id ORDER BY timestamp ASC LIMIT 1) AND se2.id = (SELECT id from StorageEvent WHERE article = Article.id ORDER BY timestamp DESC LIMIT 1)";
    sql_query += " order by Article.id";



    pool.getConnection(function(err, connection) {
        if (err) console.log(err);

            //sql_query = "select Article.id, Case.reference_number from Article, `Case` where Article.case = Case.id";
            //sql_query = "select * from Article where id in (select article from StorageMap where storage_room = (select id from StorageRoom where name='Vapen 1'))"
            console.log(sql_query);
            console.log(parameters);
            connection.query(sql_query, parameters, (err,rows) => {
                connection.release();
                console.log('Data received from Db:\n');
                response.send(rows);
            });




    });
});


module.exports = router;