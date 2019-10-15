const express = require('express');
const router = express.Router();

//Example: Establishing a connection and query to db
const pool = require('../../connect');

router.get('/', (request, response) => {
    let reference_number = request.query.reference_number;
    let material_number = request.query.material_number;
    let location = request.query.location;
    let shelf = request.query.shelf;
    let sql_query = "select * from Article";
    let has_where_condition = false;
    let parameters = [];

    if(reference_number || material_number || location || shelf) sql_query = sql_query + " where ";
    else sql_query = "select * from StorageRoom inner join StorageMap on StorageRoom.id = StorageMap.storage_room inner join Article on StorageMap.article = Article.id inner join `Case` on Case.id = Article.case";

    if(reference_number) {
        sql_query = sql_query + "`case` = (select id from `Case` where reference_number = ?) ";
        has_where_condition = true;
        parameters.push(reference_number);
    }

    if(material_number){
        if(has_where_condition) sql_query += "and ";
        sql_query += "material_number = ? ";
        has_where_condition = true;
        parameters.push(material_number);
    } 


    // Location är storageroom
    if(location){
        if(has_where_condition) sql_query += "and ";
        sql_query += "id in (select article from StorageMap where storage_room = (select id from StorageRoom where name = ?)) "
        has_where_condition = true;
        parameters.push(location);
    } 

    // Shelf är placement
    if(shelf){
        if(has_where_condition) sql_query += "and ";
        sql_query += "id in (select article from StorageMap where placement = ?) "
        has_where_condition = true;
        parameters.push(shelf);
    } 



    pool.getConnection(function(err, connection) {
        if (err) console.log(err);

            //sql_query = "select * from Article where `case`=6"
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