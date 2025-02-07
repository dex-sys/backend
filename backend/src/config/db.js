const { Sequelize } = require("sequelize");
require("dotenv").config(); // Cargar variables de entorno

// Crear instancia de Sequelize con los datos de conexión
const sequelize_users = new Sequelize(
  process.env.DB_NAME_USERS, // Nombre de la base de datos
  process.env.DB_USER, // Usuario de la base de datos
  process.env.DB_PASSWORD, // Contraseña
  {
    host: process.env.DB_HOST, // Servidor donde está la BD
    dialect: "postgres", // Tipo de base de datos
    logging: false, // Desactiva logs de Sequelize en consola (opcional)
  }
);

// Función para conectar a la base de datos
const connectDB = async () => {
  try {
    await sequelize_users.authenticate();
    console.log("[ + ] Conectado a PostgreSQL");
  } catch (error) {
    console.error(" [ - ] Error conectando a PostgreSQL:", error);
    process.exit(1); // Detiene el servidor si la conexión falla
  }
};

module.exports = { sequelize_users, connectDB };
