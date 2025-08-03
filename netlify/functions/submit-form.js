// netlify/functions/submit-form.js

const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');

// Variable para la clave de servicio
const { FIREBASE_SERVICE_ACCOUNT_KEY } = process.env;

// Inicialización de la base de datos de Firestore
let db;

// Inicializa Firebase Admin solo si no ha sido inicializado
if (!admin.apps.length) {
    try {
        const serviceAccount = JSON.parse(FIREBASE_SERVICE_ACCOUNT_KEY);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        db = getFirestore();
    } catch (error) {
        console.error('Error al inicializar Firebase Admin:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error de configuración del servidor.' })
        };
    }
} else {
    db = getFirestore();
}

// Handler de la función para procesar la solicitud
exports.handler = async (event) => {
    // Solo permite solicitudes POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: 'Método no permitido'
        };
    }

    try {
        const data = JSON.parse(event.body);

        // Valida que todos los campos obligatorios estén presentes
        if (!data.name || !data.email || !data.phone || !data.message) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Todos los campos son obligatorios.' })
            };
        }

        // Guarda el mensaje en la colección 'contact_forms'
        const docRef = db.collection('contact_forms').doc();
        await docRef.set({
            ...data,
            createdAt: new Date().toISOString()
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Mensaje enviado con éxito.' })
        };
    } catch (error) {
        console.error('Error al enviar el formulario:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error al procesar el formulario.' })
        };
    }
};