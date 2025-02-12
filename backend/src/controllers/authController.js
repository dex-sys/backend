const User = require('../models/User.js'); //Importamos el modelo user
const bcrypt = require('bcrypt'); //Importamos bcryptjs para encriptar las contraseña aumentando la seguridad
const jwt = require('jsonwebtoken'); //Importamos jsonwebtoken para generar el token y poder usar OAuth
const crypto = require('crypto'); //Importamos crypto para generar el token de recuperacion de contraseña
const transporter = require('../config/email.js'); //Importamos el transporter del correo electronico
const path = require("path"); //Importamos path para poder acceder a la ruta de la imagen del logo
const { Op } = require('sequelize');

/**
 * 
 * @description Función para enviar el correo de recuperación de contraseña
 * @param {string} email - Correo electronico del usuario al que se le enviará el correo de recuperación de contraseña
 * @param {string} token - Token de recuperación de contraseña, para poder generar el enlace personalizado 
 * @returns {Promise<Object>} - Devuelve una promesa con la información del correo electronico enviado
 * @throws {Error} - Lanza un error si hay un problema al enviar el correo electronico
 */
async function sendMail(email, token) {
    const resetLink = `http://localhost:3000/auth/reset-password/${token}`; //Creamos el link de recuperacion de contraseña
    try {
        const info = await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Recuperación de Contraseña',
        html: `
                <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Recuperación de Contraseña</title>
                </head>
                <body style="font-family: Arial, sans-serif; background-color: #1a1a2e; margin: 0; padding: 0; 
                            background-image: url('https://source.unsplash.com/600x400/?galaxy,stars'); 
                            background-size: cover; background-position: center;">

                    <div style="max-width: 600px; margin: 30px auto; background: rgba(40, 40, 80, 0.9); padding: 20px; 
                                border-radius: 8px; box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.3); text-align: center; 
                                color: #ddd;">

                        <!-- Logo -->
                        <img src="cid:logo" alt="Logo" style="max-width: 150px; margin-bottom: 20px; filter: drop-shadow(0px 0px 5px rgba(255, 255, 255, 0.8));">

                        <h1 style="color: #b19cd9; font-size: 24px;">¿Olvidaste tu contraseña?</h1>
                        <p style="color: #c0c0ff; font-size: 16px;">
                            No te preocupes, haz clic en el botón de abajo para restablecer tu contraseña.
                        </p>

                        <!-- Botón con efecto hover usando onmouseover y onmouseout -->
                        <a href="${resetLink}" 
                        style="display: inline-block; padding: 12px 20px; margin-top: 20px; background-color: #6a5acd; 
                                color: #ffffff !important; text-decoration: none; font-size: 18px; border-radius: 5px; 
                                transition: background 0.3s ease-in-out;"
                        onmouseover="this.style.backgroundColor='#5a4fcf'" 
                        onmouseout="this.style.backgroundColor='#6a5acd'">
                        Restablecer contraseña
                        </a>

                        <p style="margin-top: 20px; font-size: 14px; color: #b0a7e6;">
                            Si no solicitaste este cambio, puedes ignorar este mensaje.
                        </p>
                    </div>

                </body>
                </html>
                `,
        attachments: [
            {
                filename: 'logo.png',
                path: path.join(__dirname, '../assets/logo.png'),
                cid: 'logo',
            }
        ]
        });
        return info;
    } catch (error) {
        console.error(error);
    }
}

/**
 * 
 * @description Función para registrar un nuevo usuario
 * @param {Object} req - Objeto de solicitud de express que contiene el nombre de usuario, email y contraseña del usuario en `req.body`
 * @param {Object} res - Objeto de respuesta de express que contiene el mensaje de éxito o error
 * @returns {Promise<void>} - Devuelve una respuesta json indicando el estado de la solictud
 * @throws {Error} - Lanza un error si hay un problema al registrar el usuario
 */
const sign_up = async (req, res) => {
    try {
        const {username, email, password} = req.body; //Extraemos los datos del body de la petición recibida
        //Primero deberemos verificar si el usuario ya existe en la base de datos
        const user_exists = await User.findOne({where: {email}}); //Buscamos si el usuario ya existe en la base de datos 
        if (user_exists) {
            return res.status(400).json({message: `El usuario con email ${email} ya existe`}); //Si el usuario ya existe, retornamos un mensaje de error 
        }
        else{
            const user = await User.create({username, email, password}); //Si el usuario no existe, lo creamos en la base de datos
            return res.status(201).json({message: 'Usuario creado con éxito', user}); //Retornamos un mensaje de éxito
        }
    }
    catch (error) {
        res.status(500).json({message: 'Error al registrar el usuario', error});
    }
}

/**
 * 
 * @description Función para iniciar sesión
 * @param {Object} req - Objeto de solicitud de express que contiene el email y la contraseña del usuario en `req.body` 
 * @param {Object} res - Objeto de respuesta de express que contiene el mensaje de éxito o error 
 * @returns {Promise<void>} - Devuelve una respuesta json indicando el estado de la solictud
 * @throws {Error} - Lanza un error si hay un problema al iniciar sesión
 */
const sign_in = async (req, res) => {
    try {
        const {email, password} = req.body; //Extraemos los datos del body de la petición recibida
        const user = await User.findOne({where: {email}}); //Buscamos el usuario en la base de datos

        if(!user) {
            return res.status(400).json({message: 'Usuario o contraseña incorrectos'}); //Si el usuario no existe, retornamos un mensaje de error
        }

        const is_match = await bcrypt.compare(password, user.password); //Comparamos la contraseña ingresada con la contraseña almacenada en la base de datos
        
        if(!is_match) {
            return res.status(401).json({message: 'Usuario o contraseña incorrectos'}); //Si la contraseña no coincide, retornamos un mensaje de error
        }

        const token = jwt.sign ({id: user.id, email: user.email}, process.env.JWT_SECRET, {expiresIn: '2h'}); //Generamos el token con el id y email del usuario y ponemos que tiempo de expiración 2 horas (una larga sesion de juego)

        res.json({message: 'Inicio de Sesión Correcto', token}); //Retornamos un mensaje de éxito y el token generado
    }
    catch (error) {
        return res.status(500).json({message: 'Error al iniciar sesión', error});
    }
}

/**
 * 
 * @description Función para solicitar recuperación de contraseña
 * @param {Object} req - Objeto de solicitud de express que contiene el email del usuario en `req.body` 
 * @param {Object} res - Objeto de respuesta de express que contiene el mensaje de éxito o error 
 * @returns {Promise<void>} - Devuelve una respuesta json indicando el estado de la solictud
 * @throws {Error} - Lanza un error si hay un problema al solicitar recuperación de contraseña
 */
const forgot_password = async (req, res) => {
    try {
        const {email} = req.body; //De la peticion recibida extraemos el correo electronico del usuario el cual quiere comenzar el proceso de recuperacion de contraseña
        const user = await User.findOne({where: {email}}); // Buscamos el usuario en la base de datos

        if(!user) {
            return res.status(404).json({message: 'El usuario solicitado no existe'}); //Si el usuario no existe, retornamos un mensaje de error
        }
        
        const reset_token = crypto.randomBytes(64).toString("hex"); //Generamos un token aleatorio de 32 bytes en hexa
        const reset_token_expires = new Date(Date.now() + 1800000); //Establecemos la fecha de expiracion del token en 30 minutos (Tiempo suficiente para que el usuario pueda cambiar su contraseña)
        
        user.resetToken = reset_token; //Guardamos el token en la base de datos
        user.resetTokenExpires = reset_token_expires; //Guardamos la fecha de expiracion del token en la base de datos
        
        await user.save(); //Guardamos los cambios en la base de datos

        const emailSent = await sendMail(email, reset_token); //Enviamos el correo electronico con el token de recuperacion de contraseña
        
        if(!emailSent) {
            return res.status(500).json({message: 'Error al enviar el correo de recuperación'}); //Si hay un error al enviar el correo, retornamos un mensaje de error
        }

        res.json({message: 'Correo de recuperación enviado con éxito'}); //Retornamos un mensaje de éxito
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Error al solicitar recuperación de contraseña', error});
    }
}

/**
 * 
 * @description Función para restablecer la contraseña
 * @param {Object} req - Objeto de solicitud de express que contiene el token de recuperación de contraseña en `req.params` y la nueva contraseña en `req.body`
 * @param {Object} res - Objeto de respuesta de express que contiene el mensaje de éxito o error
 * @returns {Promise<void>} - Devuelve una respuesta json indicando el estado de la solictud
 * @throws {Error} - Lanza un error si hay un problema al restablecer la contraseña
 */
const reset_password = async (req, res) => {
    try {
        const {token} = req.params; //Extraemos el token de la URL
        const {newPassword} = req.body; //Extraemos la nueva contraseña del body de la petición
        

        const user = await User.findOne({
            where: {
            resetToken: token, 
            resetTokenExpires: { [Op.gt]: Date.now()}
            }
        }); //Buscamos el usuario en la base de datos con el token y la fecha de expiracion correcta

        if(!user) {
            return res.status(400).json({message: 'Token inválido o expirado'}); //Si el usuario no existe, retornamos un mensaje de error (el token no es válido o a expirado)
        }

        const salt = await bcrypt.genSalt(10); //Generamos un salt para encriptar la contraseña
        user.password = await bcrypt.hash(newPassword, salt); //Encriptamos la nueva contraseña

        user.resetToken = null; //Eliminamos el token de recuperacion de contraseña
        user.resetTokenExpires = null; //Eliminamos la fecha de expiracion del token
        await user.save(); //Guardamos los cambios en la base de datos

        res.json({message: 'Contraseña actualizada con éxito'}); //Retornamos un mensaje de éxito
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Error al actualizar la contraseña', error});
    }
}

module.exports = {sign_in, sign_up, forgot_password, reset_password}; //Exportamos las funciones login y register para poder usarlas en otros archivos del proyecto