const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');

const { FIREBASE_SERVICE_ACCOUNT_KEY } = process.env;

let db;

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

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: 'Método no permitido'
        };
    }

    try {
        const data = JSON.parse(event.body);

        if (!data.name || !data.email || !data.phone || !data.message) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Todos los campos son obligatorios.' })
            };
        }

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