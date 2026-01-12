const { DataSource } = require('typeorm');

const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5433,
    username: "postgres",
    password: "postgres",
    database: "bancocred",
});

AppDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!");
        process.exit(0);
    })
    .catch((err) => {
        console.error("Error during Data Source initialization", err);
        process.exit(1);
    });
