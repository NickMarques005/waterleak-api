//---database.js---//

//Middleware Mongoose
const mongoose = require('mongoose');

//Database WaterLeak URI:
const dbURI = process.env.MONGO_URI;

//Database MongoDB App Connection 
const db_WaterLeak_App = async () => {
    try{
        await mongoose.connect(dbURI, {useNewUrlParser: true});
        console.log('Connected successfully to DB!');

        const dbName = mongoose.connection.db.namespace;
        console.log("DB: ", dbName);

    }
    catch (err)
    {
        console.log("Error: ", err);
    }
}

//Export the Database Connection
module.exports = db_WaterLeak_App;