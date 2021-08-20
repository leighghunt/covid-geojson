/**
 * Module handles database management
 *
 * Server API calls the methods in here to query and update the SQLite database
 */

// Utilities we need
const fs = require("fs");
const axios = require('axios');


// Initialize the database
const dbFile = "./.data/123.db";
const exists = fs.existsSync(dbFile);
const sqlite3 = require("sqlite3").verbose();
const dbWrapper = require("sqlite");
let db;

/* 
We're using the sqlite wrapper so that we can make async / await connections
- https://www.npmjs.com/package/sqlite
*/
dbWrapper
  .open({
    filename: dbFile,
    driver: sqlite3.Database
  })
  .then(async dBase => {
    db = dBase;

    // We use try and catch blocks throughout to handle any database errors
    try {
      // The async / await syntax lets us write the db operations in a way that won't block the app
      if (!exists) {
        // Database doesn't exist yet - create Choices and Log tables
        await db.run(
          "CREATE TABLE Choices (id INTEGER PRIMARY KEY AUTOINCREMENT, language TEXT, picks INTEGER)"
        );


        await db.run(
          "CREATE TABLE LOIs (id INTEGER PRIMARY KEY AUTOINCREMENT, LocationName TEXT, Address TEXT, Day TEXT, Times Text, DateAdded TEXT, DateFrom DATETIME, DateTo DATETIME, x REAL, y REAL)"
        );



        // Add default choices to table
        await db.run(
          "INSERT INTO Choices (language, picks) VALUES ('HTML', 0), ('JavaScript', 0), ('CSS', 0)"
        );

        // Log can start empty - we'll insert a new record whenever the user chooses a poll option
        await db.run(
          "CREATE TABLE Log (id INTEGER PRIMARY KEY AUTOINCREMENT, json TEXT, time STRING)"
        );
      } else {
        // We have a database already - write Choices records to log for info
        // console.log(await db.all("SELECT * from LOIs"));

        //If you need to remove a table from the database use this syntax
        //db.run("DROP TABLE Logs"); //will fail if the table doesn't exist
      }
    } catch (dbError) {
      console.error(dbError);
    }
  });

// Our server script will call these methods to connect to the db
module.exports = {
  
  /**
   * Get the options in the database
   *
   * Return everything in the Choices table
   * Throw an error in case of db connection issues
   */
  getLOIs: async () => {
    // We use a try catch block in case of db errors
    try {
      return await db.all("SELECT * from LOIs");
    } catch (dbError) {
      // Database connection error
      console.error(dbError);
    }
  },

  /**
   * Process a user vote
   *
   * Receive the user vote string from server
   * Add a log entry
   * Find and update the chosen option
   * Return the updated list of votes
   */
  processLOI: async LOI => {
    // Insert new Log table entry indicating the user choice and timestamp
    try {
      // Check the vote is valid
      const loi = await db.all(
        "SELECT * from LOIs WHERE LocationName = ? AND Day = ? AND Times = ?",
        [LOI.LocationName, LOI.Day, LOI.Times]
      );
      
      const geocodeURL = `https://maps.googleapis.com/maps/api/geocode/json?address=${LOI.Address.replace(/ /g, '+')}&key=${process.env.GOOGLE_API_KEY}`
      // console.log(geocodeURL)


      
      if (loi.length == 0) {

        console.log("NOT FOUND")


        await db.run("INSERT INTO Log (json, time) VALUES (?, ?)", [
          JSON.stringify(LOI),
          new Date().toISOString()
        ]);

        
//         seo.url = `https://${process.env.PROJECT_DOMAIN}.glitch.me`;
        const geocodeURL = `https://maps.googleapis.com/maps/api/geocode/json?address=${LOI.Address}&key=${process.env.GOOGLE_API_KEY}`
        console.log(geocodeURL)
   
        axios.get(geocodeURL, {}
        )
        .then(async function (apiResponse) {
          if(apiResponse.data.status == 'OK' && apiResponse.data.results.length==1){
            // console.log(apiResponse.data)
            // console.log(apiResponse.data.results.length)
            // console.log(apiResponse.data.results[0])

            // console.log(apiResponse.data.results[0].geometry)
            console.log(apiResponse.data.results[0].geometry.location.lat)
            console.log(apiResponse.data.results[0].geometry.location.lng)

            //LocationName TEXT, Address TEXT, Day TEXT, Times Text, DateAdded TEXT, DateFrom DATETIME, DateTo DATETIME)"
            await db.run("INSERT INTO LOIs (LocationName, Address, Day, Times, DateAdded, DateFrom, DateTo, x, y) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [
              LOI.LocationName,
              LOI.Address,
              LOI.Day,
              LOI.Times,
              LOI.DateAdded,
              LOI.DateFrom,
              LOI.DateTo,
              apiResponse.data.results[0].geometry.location.lat,
              apiResponse.data.results[0].geometry.location.lng
            ]);

          } else {
            console.log("Couldn't geocode address: " + LOI.Address)
            console.log("STATUS: " + apiResponse.data.status)
            console.log("Results: " + apiResponse.data.results)

          }

      });

      return await db.all("SELECT * from LOIs");
    } catch (dbError) {
      console.error(dbError);
    }
  },

  /**
   * Get logs
   *
   * Return choice and time fields from all records in the Log table
   */
  getLogs: async () => {
    // Return most recent 20
    try {
      // Return the array of log entries to admin page
      return await db.all("SELECT * from Log ORDER BY time DESC LIMIT 20");
    } catch (dbError) {
      console.error(dbError);
    }
  },

  /**
   * Clear logs and reset votes
   *
   * Destroy everything in Log table
   * Reset votes in Choices table to zero
   */
//   clearHistory: async () => {
//     try {
//       // Delete the logs
//       await db.run("DELETE from Log");

//       // Reset the vote numbers
//       await db.run("UPDATE Choices SET picks = 0");

//       // Return empty array
//       return [];
//     } catch (dbError) {
//       console.error(dbError);
//     }
//   }
};
