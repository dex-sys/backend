const express = require("express");
const { connectDB, sequelize_users } = require("./config/db");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

const sync_database = async () => {
  try {
    await sequelize_users.sync({ alter: true });
    console.log("[ + ] Base de datos sincronizada correctamente");
  } catch (error) {
    console.error("[ - ] Error sincronizando la base de datos:", error);
    process.exit(1);
  }
};

connectDB().then(sync_database);

// Middleware para leer JSON
app.use(express.json());

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("¡Servidor funcionando! 🚀");
});

const authRoutes = require("./routes/authRoutes");
app.use("/auth", authRoutes);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

