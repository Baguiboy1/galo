import { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, updateDoc, onSnapshot, deleteDoc as deleteFirestoreDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

// Carga de Tailwind CSS para un estilo adaptativo
const tailwindScript = document.createElement('script');
tailwindScript.src = "https://cdn.tailwindcss.com";
document.head.appendChild(tailwindScript);

// Configuración de Firebase (debes reemplazar esto con tus propias variables de entorno
// si no estás en el entorno de Canvas)
const firebaseConfig = {
    apiKey: "AIzaSyAN-JrvUckKPjGqcZhMXTQUK5LCkpDOffo",
    authDomain: "galo-2fb12.firebaseapp.com",
    projectId: "galo-2fb12",
    storageBucket: "galo-2fb12.firebasestorage.app",
    messagingSenderId: "874889715239",
    appId: "1:874889715239:web:f0f3354e508f2763127802",
    measurementId: "G-XM98P8MJLP"
};

// Variables globales para el entorno de Canvas.
const appId = typeof __app_id !== 'undefined' ? __app_id : firebaseConfig.projectId;
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Inicialización de Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

const postTypes = ['Sitios turísticos', 'Lugares para visitar', 'Lugares para comer', 'De shopping'];

// Íconos en línea como componentes de React para evitar la dependencia de lucide-react
// Se ha actualizado la URL de la imagen del logo
const YucaguiaIcon = () => (
    <img src="https://firebasestorage.googleapis.com/v0/b/galo-2fb12.firebasestorage.app/o/Gemini_Generated_Image_at9sytat9sytat9s.png?alt=media&token=52f4307b-cacf-469f-b9e5-b3736910a332" alt="Yucaguia Logo" className="h-8 w-auto" onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/100x32/1E293B/FFFFFF?text=Yucaguia"}}/>
);
const LockIcon = ({ size = 16, className = '' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
);
const XCircleIcon = ({ size = 24, className = '' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>
    </svg>
);
const CheckCircleIcon = ({ size = 20, className = '' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-8.6"/><path d="M9 11l3 3L22 4"/>
    </svg>
);
const ArrowLeftIcon = ({ size = 24, className = '' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
    </svg>
);
const PencilIcon = ({ size = 16, className = '' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
        <path d="m15 5 4 4"/>
    </svg>
);
const TrashIcon = ({ size = 16, className = '' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
    </svg>
);
const SearchIcon = ({ size = 16, className = '' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
    </svg>
);
const UploadIcon = ({ size = 24, className = '' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/>
    </svg>
);
const CarSideIcon = ({ size = 16, className = '' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M7 17l-2 2h14l-2-2m-8 0h4m-4-4h4m-12 0h12a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-12a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2z"/>
    </svg>
);
const WhatsappIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 448 512" fill="currentColor">
        <path d="M380.9 97.1C339.6 50.8 281.3 22.3 224 22.1c-124.9.4-224 103.5-224 231.7 0 42.5 12.4 82.5 35.8 117.8L0 512l132.8-34.6c34 18.2 72.8 27.9 111.2 27.9h.1c124.7 0 224.2-103.3 224.2-231.8 0-51.1-18.4-99.8-51.2-137.9zM224.1 448c-32.9 0-66.2-9.7-93.7-28.7L54.7 458.2l34.8-103c-23-35-35.3-75.1-35.3-117.8 0-99.3 80.7-179.9 180-179.9 49.3 0 95.8 19.3 130.4 54.4 34.6 35.1 53.9 81.7 53.9 130.4 0 99.4-80.7 180-180 180zm103-125c-5.7-2.9-33.8-16.7-39.1-18.6-5.4-1.9-9.3-2.9-13.3 2.9-4 5.7-15.3 18.6-18.8 22.4-3.6 3.8-7.1 4.3-13.1 1.4s-26.6-9.8-50.6-31.2c-18.9-17-31.7-42.5-35.4-48.9-3.6-6.3-4-9.8-4-1.4 0-1.4.3-2.6.7-3.8 2.2-6.5 4.3-12.7 6.4-15.3 1.9-2.9 1.9-5.7 1.2-10.7-1.3-4.7-13.3-31.8-18.2-43.6-4.9-11.8-9.8-10.3-13.3-10.5-3.5-.2-7.8-2.6-11.9-2.6-4.1 0-7.7 1.5-11.7 5.7-4 4.3-15.3 14.8-15.3 35.9 0 21.2 15.6 41.7 17.8 44.5 2.2 2.9 30.5 46.5 74.2 65.2 43.6 18.6 43.6 12.4 51.5 11.6 7.9-.8 25.5-10.4 29.1-20.4 3.7-10.1 3.7-18.8 2.6-20.4-1.2-1.5-4.3-2.4-9.1-4.8z"/>
    </svg>
);
const FacebookIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 320 512" fill="currentColor">
        <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 223.73 0c-73.25 0-121.08 44.38-121.08 124.72v70.62H22.89V288h80.72v224h101.44V288z"/>
    </svg>
);

const FilterIcon = ({ size = 24, className = '' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/>
    </svg>
);

const ChevronLeftIcon = ({ size = 24, className = '' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m15 18-6-6 6-6"/>
    </svg>
);

const ChevronRightIcon = ({ size = 24, className = '' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m9 18 6-6-6-6"/>
    </svg>
);

const ImageIcon = ({ size = 16, className = '' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5.5-5.5L9 18"/>
    </svg>
);

// Componente para manejar el código de Google AdSense
const AdSenseAd = () => {
    useEffect(() => {
        try {
            if (window.adsbygoogle) {
                window.adsbygoogle.push({});
            }
        } catch (e) {
            console.error("AdSense Error: ", e);
        }
    }, []);

    return (
        <ins
            className="adsbygoogle"
            style={{ display: "block", textAlign: "center" }}
            data-ad-client="ca-pub-9120340663465370" // Tu AdSense Publisher ID
            data-ad-slot="1234567890" // Reemplaza con tu AdSense Ad Slot ID
            data-ad-format="auto"
            data-full-width-responsive="true"
        ></ins>
    );
};

// Componente para el formulario de creación/edición de Posts
const PostForm = ({ initialData, onSave, onCancel, buttonText }) => {
    // Estado para manejar la carga de archivos de imagen principal y de galería
    const [formData, setFormData] = useState(initialData || { title: '', content: '', imageFile: null, imageUrl: '', galleryFiles: [], galleryUrls: [], type: postTypes[0] });
    
    // Validar el formulario al cambiar los datos
    const isFormValid = formData.title && formData.content && (formData.imageFile || formData.imageUrl || (formData.galleryFiles && formData.galleryFiles.length > 0) || (formData.galleryUrls && formData.galleryUrls.length > 0));

    useEffect(() => {
        setFormData(initialData || { title: '', content: '', imageFile: null, imageUrl: '', galleryFiles: [], galleryUrls: [], type: postTypes[0] });
    }, [initialData]);

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (name === 'imageFile') {
            setFormData(prev => ({ ...prev, imageFile: files[0] }));
        } else if (name === 'galleryFiles') {
            setFormData(prev => ({ ...prev, galleryFiles: Array.from(files) }));
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">{buttonText}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="post-title">Título</label>
                    <input
                        id="post-title"
                        name="title"
                        type="text"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Título del post"
                        className={`shadow-sm appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow ${!formData.title ? 'border-red-500' : 'border-gray-300'}`}
                    />
                </div>
                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="post-content">Contenido</label>
                    <textarea
                        id="post-content"
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        placeholder="Contenido de la entrada..."
                        rows="5"
                        className={`shadow-sm appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow ${!formData.content ? 'border-red-500' : 'border-gray-300'}`}
                    ></textarea>
                </div>
                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="post-image-file">Imagen de Portada Actual</label>
                    {formData.imageUrl && !formData.imageFile ? (
                        <img src={formData.imageUrl} alt="Post preview" className="w-full h-48 object-cover rounded-lg mb-2"/>
                    ) : (
                         <div className="w-full h-48 bg-gray-200 rounded-lg mb-2 flex items-center justify-center text-gray-500">Sin imagen de portada</div>
                    )}
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="post-image-file">Subir nueva Imagen de Portada</label>
                    <input
                        id="post-image-file"
                        name="imageFile"
                        type="file"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
                    />
                </div>
                <div>
                    {formData.galleryUrls && formData.galleryUrls.length > 0 && (
                        <>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Imágenes de Galería Actuales</label>
                            <div className="grid grid-cols-4 gap-2 mb-2">
                                {formData.galleryUrls.map((url, index) => (
                                    <img key={index} src={url} alt={`Galería preview ${index}`} className="w-full h-16 object-cover rounded-lg"/>
                                ))}
                            </div>
                        </>
                    )}
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="post-gallery-files">Subir Imágenes de Galería (múltiples)</label>
                    <input
                        id="post-gallery-files"
                        name="galleryFiles"
                        type="file"
                        onChange={handleFileChange}
                        multiple
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
                    />
                </div>
                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="post-type">Tipo de Post</label>
                    <select
                        id="post-type"
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    >
                        {postTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>
                <div className="flex space-x-2">
                    <button type="submit" disabled={!isFormValid} className={`flex-1 font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-150 ease-in-out ${!isFormValid ? 'bg-blue-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>{buttonText}</button>
                    {onCancel && <button type="button" onClick={onCancel} className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-150 ease-in-out">Cancelar</button>}
                </div>
            </form>
        </div>
    );
};

// Componente para el formulario de creación/edición de Productos
const ProductForm = ({ initialData, onSave, onCancel, buttonText }) => {
    const [formData, setFormData] = useState(initialData || { name: '', link: '', imageFile: null, imageUrl: '', description: '' });

    useEffect(() => {
        setFormData(initialData || { name: '', link: '', imageFile: null, imageUrl: '', description: '' });
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'imageFile') {
            setFormData(prev => ({ ...prev, imageFile: files[0] }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    // La condición de validación ahora es correcta, pero el campo 'link' faltaba en el JSX.
    const isFormValid = formData.name && formData.link && (formData.imageFile || formData.imageUrl) && formData.description;
    
    return (
        <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">{buttonText}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="product-name">Nombre del Producto</label>
                    <input
                        id="product-name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Nombre del producto"
                        className={`shadow-sm appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-red-500 transition-shadow ${!formData.name ? 'border-red-500' : 'border-gray-300'}`}
                    />
                </div>
                {/* INSERCIÓN: Campo de 'link' que faltaba en el formulario */}
                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="product-link">Enlace del Producto</label>
                    <input
                        id="product-link"
                        name="link"
                        type="url" // Usar tipo 'url' para una mejor validación en el navegador
                        value={formData.link}
                        onChange={handleChange}
                        placeholder="https://mercadolibre.com/producto..."
                        className={`shadow-sm appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-red-500 transition-shadow ${!formData.link ? 'border-red-500' : 'border-gray-300'}`}
                    />
                </div>
                <div>
                    {formData.imageUrl && !formData.imageFile && (
                        <>
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="product-image-file">Imagen Actual</label>
                            <img src={formData.imageUrl} alt="Producto preview" className="w-full h-48 object-cover rounded-lg mb-2"/>
                        </>
                    )}
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="product-image-file">Subir nueva Imagen</label>
                    <input
                        id="product-image-file"
                        name="imageFile"
                        type="file"
                        onChange={handleChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-100 file:text-red-700 hover:file:bg-red-200"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold mb-2" htmlFor="product-description">Descripción</label>
                    <textarea
                        id="product-description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Breve descripción del producto"
                        rows="3"
                        className={`shadow-sm appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-red-500 transition-shadow ${!formData.description ? 'border-red-500' : 'border-gray-300'}`}
                    ></textarea>
                </div>
                <div className="flex space-x-2">
                    <button type="submit" disabled={!isFormValid} className={`flex-1 font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-150 ease-in-out ${!isFormValid ? 'bg-red-300 text-gray-500 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 text-white'}`}>{buttonText}</button>
                    {onCancel && <button type="button" onClick={onCancel} className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-150 ease-in-out">Cancelar</button>}
                </div>
            </form>
        </div>
    );
};


// Componente Carrusel
const ImageCarouselModal = ({ images, initialIndex, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    const nextImage = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    };

    useEffect(() => {
        // Manejar eventos de teclado para el carrusel
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight') {
                nextImage();
            } else if (e.key === 'ArrowLeft') {
                prevImage();
            } else if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [nextImage, prevImage, onClose]);

    if (!images || images.length === 0) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[100] p-4">
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white text-3xl z-50 p-2 rounded-full hover:bg-gray-700 transition"
                title="Cerrar"
            >
                &times;
            </button>
            <div className="relative w-full h-full flex items-center justify-center">
                {images.length > 1 && (
                    <>
                        <button
                            onClick={prevImage}
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition z-40"
                        >
                            <ChevronLeftIcon />
                        </button>
                        <button
                            onClick={nextImage}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition z-40"
                        >
                            <ChevronRightIcon />
                        </button>
                    </>
                )}
                <img
                    src={images[currentIndex]}
                    alt={`Carrusel de imágenes ${currentIndex + 1}`}
                    className="max-w-full max-h-full object-contain rounded-lg"
                />
            </div>
        </div>
    );
};


const RentCarModal = ({ isOpen, onClose, showMessage }) => {
    // Estado para el formulario de contacto
    const [contactForm, setContactForm] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setContactForm(prev => ({ ...prev, [name]: value }));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/.netlify/functions/submit-form', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(contactForm),
            });
            const result = await response.json();
            if (response.ok) {
                showMessage('success', result.message);
                setContactForm({ name: '', email: '', phone: '', message: '' });
                onClose();
            } else {
                showMessage('error', result.message);
            }
        } catch (error) {
            console.error('Error al enviar el formulario:', error);
            showMessage('error', 'Hubo un error al enviar tu mensaje. Inténtalo de nuevo.');
        }
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-[70] p-4">
            <div className="relative p-8 bg-white w-full max-w-sm m-auto flex-col flex rounded-xl shadow-2xl overflow-y-auto max-h-full">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors"
                >
                    <XCircleIcon size={32} />
                </button>
                <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Renta un auto</h2>

                <div className="flex flex-col space-y-4">
                    {/* Botón de Facebook */}
                    <a
                        href="https://www.facebook.com/arrendadoraGALO"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-150 ease-in-out shadow-md"
                    >
                        Facebook
                    </a>

                    {/* Botón de Whatsapp */}
                    <a
                        href="https://wa.me/5219996458134"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition duration-150 ease-in-out shadow-md"
                    >
                        Whatsapp
                    </a>
                </div>
            </div>
        </div>
    );
};

// Componentes del panel de administración
const CreateContent = ({ onSavePost, onSaveProduct, editingItem, editingType, setEditingItem, setEditingType }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {editingItem && editingType === 'post' ? (
            <PostForm 
                initialData={editingItem}
                onSave={onSavePost}
                onCancel={() => { setEditingItem(null); setEditingType(null); }}
                buttonText="Actualizar Post"
            />
        ) : (
            <PostForm
                onSave={onSavePost}
                onCancel={null}
                buttonText="Publicar Post"
            />
        )}
        {editingItem && editingType === 'product' ? (
            <ProductForm
                initialData={editingItem}
                onSave={onSaveProduct}
                onCancel={() => { setEditingItem(null); setEditingType(null); }}
                buttonText="Actualizar Producto"
            />
        ) : (
            <ProductForm
                onSave={onSaveProduct}
                onCancel={null}
                buttonText="Agregar Producto"
            />
        )}
    </div>
);

const ManageContent = ({ posts, products, onEditPost, onEditProduct, onDeletePost, onDeleteProduct }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold mb-6 text-blue-500">Gestionar Posts</h2>
            <div className="space-y-4">
                {posts.length === 0 ? (
                    <p className="text-gray-500">No hay posts creados.</p>
                ) : (
                    posts.map(post => (
                        <div key={post.id} className="p-4 border-b border-gray-200 flex justify-between items-center hover:bg-blue-50 transition-colors duration-150 ease-in-out">
                            <span className="text-gray-700 font-semibold">{post.title}</span>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => onEditPost(post)}
                                    className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors"
                                    title="Editar"
                                >
                                    <PencilIcon />
                                </button>
                                <button
                                    onClick={() => onDeletePost(post.id)}
                                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                                    title="Eliminar"
                                >
                                    <TrashIcon />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold mb-6 text-red-500">Gestionar Productos</h2>
            <div className="space-y-4">
                {products.length === 0 ? (
                    <p className="text-gray-500">No hay productos creados.</p>
                ) : (
                    products.map(product => (
                        <div key={product.id} className="p-4 border-b border-gray-200 flex justify-between items-center hover:bg-red-50 transition-colors duration-150 ease-in-out">
                            <span className="text-gray-700 font-semibold">{product.name}</span>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => onEditProduct(product)}
                                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                                    title="Editar"
                                >
                                    <PencilIcon />
                                </button>
                                <button
                                    onClick={() => onDeleteProduct(product.id)}
                                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                                    title="Eliminar"
                                >
                                    <TrashIcon />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    </div>
);

const AdminPanel = ({ posts, products, handleAddPost, handleEditPost, handleDeletePost, handleAddProduct, handleEditProduct, handleDeleteProduct }) => {
    const hardcodedAdminPassword = '123456';
    const [adminPassword, setAdminPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [adminPanelPage, setAdminPanelPage] = useState('create');
    const [editingItem, setEditingItem] = useState(null);
    const [editingType, setEditingType] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    
    const handleLogin = (e) => {
        e.preventDefault();
        if (adminPassword === hardcodedAdminPassword) {
            setIsAdmin(true);
            setLoginError('');
        } else {
            setLoginError('Contraseña incorrecta');
        }
        setAdminPassword('');
    };
    
    const onSavePost = async (data) => {
        if (editingItem) {
            await handleEditPost(data, editingItem);
            setEditingItem(null);
            setEditingType(null);
        } else {
            await handleAddPost(data);
        }
    };

    const onEditPost = (post) => {
        setEditingItem(post);
        setEditingType('post');
        setAdminPanelPage('create');
    };
    
    const onSaveProduct = async (data) => {
        if (editingItem) {
            await handleEditProduct(data, editingItem);
            setEditingItem(null);
            setEditingType(null);
        } else {
            await handleAddProduct(data);
        }
    };
    
    const onEditProduct = (product) => {
        setEditingItem(product);
        setEditingType('product');
        setAdminPanelPage('create');
    };

    if (!isAdmin) {
        return (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
                <div className="bg-white p-8 rounded-lg shadow-2xl max-w-sm w-full relative">
                    <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Acceso de Administrador</h2>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="admin-password">
                                Contraseña
                            </label>
                            <input
                                id="admin-password"
                                type="password"
                                value={adminPassword}
                                onChange={(e) => setAdminPassword(e.target.value)}
                                className="shadow-sm appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                            />
                        </div>
                        {loginError && <p className="text-red-500 text-sm italic">{loginError}</p>}
                        <div className="flex items-center justify-center">
                            <button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
                            >
                                Entrar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
    
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-8">Panel de Administración</h1>
            <div className="flex justify-center mb-8 space-x-4">
                <button
                    onClick={() => {
                        setAdminPanelPage('create');
                        setEditingItem(null);
                        setEditingType(null);
                    }}
                    className={`font-semibold px-6 py-2 rounded-lg transition-colors ${adminPanelPage === 'create' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                    Crear Contenido
                </button>
                <button
                    onClick={() => {
                        setAdminPanelPage('manage');
                        setEditingItem(null);
                        setEditingType(null);
                    }}
                    className={`font-semibold px-6 py-2 rounded-lg transition-colors ${adminPanelPage === 'manage' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                    Gestionar Contenido
                </button>
            </div>
            {adminPanelPage === 'create' ? <CreateContent onSavePost={onSavePost} onSaveProduct={onSaveProduct} editingItem={editingItem} editingType={editingType} setEditingItem={setEditingItem} setEditingType={setEditingType} /> : <ManageContent posts={posts} products={products} onDeletePost={handleDeletePost} onDeleteProduct={handleDeleteProduct} onEditPost={onEditPost} onEditProduct={onEditProduct} />}
        </div>
    );
};

const PublicView = ({ posts, products, handleNavigation }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [postsToShow, setPostsToShow] = useState(12);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [showFloatingButton, setShowFloatingButton] = useState(true);

    const postSectionRef = useRef(null);
    const productSectionRef = useRef(null);

    // Posts filtrados basados en la búsqueda y el tipo
    const filteredPosts = posts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterType === 'all' || post.type === filterType;
        return matchesSearch && matchesFilter;
    });

    // Posts visibles en la página actual
    const visiblePosts = filteredPosts.slice(0, postsToShow);

    const handleLoadMore = () => {
        setPostsToShow(prev => prev + 12);
    };

    const handleFilterChange = (type) => {
        setFilterType(type);
        setShowFilterModal(false); // Cierra el modal al seleccionar un filtro
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        // Opcional: podrías cerrar el modal aquí si lo deseas, pero es mejor dejarlo abierto
        // para que el usuario pueda seguir escribiendo.
    };

    useEffect(() => {
        const handleScroll = () => {
            if (postSectionRef.current && productSectionRef.current) {
                const postSectionTop = postSectionRef.current.offsetTop;
                const productSectionTop = productSectionRef.current.offsetTop;
                const scrollPosition = window.scrollY + window.innerHeight;
                
                // El botón flotante se muestra si la posición de scroll está
                // dentro del rango de la sección de posts.
                const isBetweenPostsAndProducts = scrollPosition > postSectionTop && scrollPosition < productSectionTop;
                setShowFloatingButton(isBetweenPostsAndProducts);
            }
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Llama a la función al cargar la página para la posición inicial

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [posts, products]);

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Botón flotante para filtros en móviles, visible solo si se cumplen las condiciones */}
            {showFloatingButton && (
                <button
                    onClick={() => setShowFilterModal(true)}
                    className="fixed bottom-4 right-4 z-40 md:hidden bg-blue-600 text-white p-3 rounded-full shadow-lg transition-transform transform hover:scale-110"
                >
                    <FilterIcon />
                </button>
            )}

            {/* Banner de bienvenida con video de fondo */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-12 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                {/* Video de fondo */}
                <video
                    className="absolute inset-0 w-full h-full object-cover z-0"
                    autoPlay
                    loop
                    muted
                    playsInline
                    src="https://firebasestorage.googleapis.com/v0/b/galo-2fb12.firebasestorage.app/o/V%C3%ADdeo%20sin%20t%C3%ADtulo%20%E2%80%90%20Hecho%20con%20Clipchamp.mp4?alt=media&token=04c22559-9592-41c8-9e14-82f26cd33de6"
                ></video>
                {/* Capa de superposición para que el texto sea legible */}
                <div className="absolute inset-0 bg-black opacity-40 z-10"></div>
                
                {/* Contenido del banner */}
                <div className="w-full md:w-1/2 z-20">
                    <img src="https://firebasestorage.googleapis.com/v0/b/galo-2fb12.firebasestorage.app/o/que-hacer-en-yucatan.jpg?alt=media&token=3aa482d6-bee8-4e8b-b66e-7fb375623ad5" alt="Pirámide y avión en la península de Yucatán" className="w-full h-auto rounded-lg shadow-md" />
                </div>
                <div className="w-full md:w-1/2 text-center md:text-left z-20">
                    <h2 className="text-4xl font-extrabold text-white mb-4">Descubre Mérida con nosotros</h2>
                    <p className="text-white text-lg">
                        Yucaguia es tu compañero de viaje perfecto para explorar la belleza y la cultura de Mérida. Aquí encontrarás recomendaciones de lugares imperdibles, consejos para moverte por la ciudad y productos esenciales para tu aventura. ¡Conéctate con tu próximo destino de manera única!
                    </p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Barra lateral para búsqueda y filtros */}
                <aside className={`fixed md:relative top-0 left-0 h-full w-full md:w-1/4 p-6 bg-white shadow-lg md:rounded-xl z-50 transform md:transform-none transition-transform duration-300 ease-in-out ${showFilterModal ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
                    <div className="flex justify-between items-center mb-4 md:hidden">
                        <h3 className="text-2xl font-bold text-gray-800">Filtrar Posts</h3>
                        <button onClick={() => setShowFilterModal(false)}>
                            <XCircleIcon size={32} />
                        </button>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">Buscar por título</label>
                            <div className="relative">
                                <input
                                    id="search"
                                    type="text"
                                    placeholder="Escribe para buscar..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 pl-10"
                                />
                                <SearchIcon className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de lugar</label>
                            <div className="space-y-2">
                                <div className="flex items-center">
                                    <input type="radio" id="all" name="filter-type" value="all" checked={filterType === 'all'} onChange={(e) => handleFilterChange(e.target.value)} className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300" />
                                    <label htmlFor="all" className="ml-2 block text-sm text-gray-900">Todos</label>
                                </div>
                                {postTypes.map(type => (
                                    <div key={type} className="flex items-center">
                                        <input type="radio" id={type} name="filter-type" value={type} checked={filterType === type} onChange={(e) => handleFilterChange(e.target.value)} className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300" />
                                        <label htmlFor={type} className="ml-2 block text-sm text-gray-900">{type}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Posts del blog */}
                <div className="w-full md:w-3/4" ref={postSectionRef}>
                    {filteredPosts.length === 0 ? (
                        <div className="text-center p-10 bg-white rounded-xl shadow-lg">
                            <p className="text-gray-500 text-lg">No se encontraron posts con esos criterios de búsqueda.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {visiblePosts.map(post => (
                            <div
                                key={post.id}
                                className="bg-white rounded-xl shadow-xl overflow-hidden transition-transform transform hover:scale-105 duration-300 cursor-pointer"
                                onClick={() => handleNavigation('post', post)}
                            >
                                <div className="relative">
                                    <img
                                        src={(post.imageUrl) ? post.imageUrl : (post.galleryUrls && post.galleryUrls.length > 0) ? post.galleryUrls[0] : `https://placehold.co/600x400/FACC15/78350F?text=${encodeURIComponent(post.title)}`}
                                        alt={post.title}
                                        className="w-full h-36 object-cover"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = `https://placehold.co/600x400/FACC15/78350F?text=${encodeURIComponent(post.title)}`;
                                        }}
                                    />
                                    {((post.galleryUrls && post.galleryUrls.length > 0) || post.imageUrl) && (
                                        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded-full text-xs flex items-center">
                                            <ImageIcon className="mr-1" size={12} /> {((post.galleryUrls && post.galleryUrls.length > 0) ? post.galleryUrls.length : 0) + (post.imageUrl ? 1 : 0)}
                                        </div>
                                    )}
                                </div>
                                <div className="p-4">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h3>
                                    <p className="text-base text-gray-600">{post.content.substring(0, 100)}...</p>
                                </div>
                            </div>
                        ))}
                        </div>
                    )}
                    {filteredPosts.length > postsToShow && (
                        <div className="mt-8 text-center">
                            <button
                                onClick={handleLoadMore}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-150 ease-in-out"
                            >
                                Cargar más posts
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="my-12">
                <AdSenseAd />
            </div>

            <div ref={productSectionRef}>
                <h2 className="text-4xl font-extrabold mb-8 text-gray-800 text-center">Artículos Útiles para tu Viaje</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products.map(product => (
                        <a
                            key={product.id}
                            href={product.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform transform hover:scale-105 duration-300 flex flex-col justify-between p-4"
                        >
                            <img
                                src={product.imageUrl || `https://placehold.co/400x300/EF4444/FFFFFF?text=${encodeURIComponent(product.name)}`}
                                alt={product.name}
                                className="w-full h-40 object-contain mb-4"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = `https://placehold.co/400x300/EF4444/FFFFFF?text=${encodeURIComponent(product.name)}`;
                                }}
                            />
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                                <p className="text-sm text-gray-600 mb-4">{product.description}</p>
                            </div>
                            <button className="bg-red-500 text-white py-2 px-4 rounded-full font-bold text-sm hover:bg-red-600 transition duration-150 ease-in-out">
                                Comprar en Mercado Libre
                            </button>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
};

const PostDetailView = ({ handleNavigation, selectedPost, setCarouselImages, setCarouselIndex, setShowCarousel }) => {
    if (!selectedPost) {
        return (
            <div className="container mx-auto px-4 py-12 text-center text-gray-600">
                <p>Post no encontrado.</p>
                <button
                    onClick={() => handleNavigation('home')}
                    className="mt-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition duration-150 ease-in-out"
                >
                    Volver al Inicio
                </button>
            </div>
        );
    }

    const handleImageClick = (index) => {
        const allImages = [
            selectedPost.imageUrl,
            ...(selectedPost.galleryUrls || [])
        ].filter(Boolean); // Filtra valores nulos o indefinidos
        setCarouselImages(allImages);
        setCarouselIndex(index);
        setShowCarousel(true);
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <button
                onClick={() => handleNavigation('home')}
                className="flex items-center mb-6 text-red-600 hover:text-red-800 font-semibold transition duration-150 ease-in-out"
            >
                <ArrowLeftIcon size={24} className="mr-2" />
                Volver a todos los posts
            </button>
            <div className="bg-white rounded-xl shadow-xl p-8">
                {/* Imagen principal del post */}
                <img
                    src={(selectedPost.imageUrl) ? selectedPost.imageUrl : (selectedPost.galleryUrls && selectedPost.galleryUrls.length > 0) ? selectedPost.galleryUrls[0] : `https://placehold.co/800x600/FACC15/78350F?text=${encodeURIComponent(selectedPost.title)}`}
                    alt={selectedPost.title}
                    className="w-full h-96 object-cover rounded-lg mb-6 cursor-pointer"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://placehold.co/800x600/FACC15/78350F?text=${encodeURIComponent(selectedPost.title)}`;
                    }}
                    onClick={() => handleImageClick(0)}
                />

                {/* Galería de miniaturas */}
                {selectedPost.galleryUrls && selectedPost.galleryUrls.length > 0 && (
                    <div className="mb-6 grid grid-cols-4 gap-2">
                        {selectedPost.galleryUrls.map((url, index) => (
                            <img
                                key={index}
                                src={url}
                                alt={`Miniatura ${index + 1}`}
                                className="w-full h-20 object-cover rounded-lg cursor-pointer hover:opacity-75 transition-opacity"
                                onClick={() => handleImageClick(index + (selectedPost.imageUrl ? 1 : 0))}
                            />
                        ))}
                    </div>
                )}

                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">{selectedPost.title}</h1>
                {selectedPost.type && (
                    <span className="inline-flex items-center px-3 py-1 text-sm font-medium text-red-800 bg-red-100 rounded-full mb-4">
                        {selectedPost.type}
                    </span>
                )}
                {/* INSERCIÓN: Se ha añadido la clase 'whitespace-pre-wrap' para preservar los saltos de línea y espacios */}
                <p className="text-lg text-gray-600 mb-8 whitespace-pre-wrap">{selectedPost.content}</p>
            </div>
        </div>
    );
};

const ConfirmationModal = ({ isOpen, onConfirm, onCancel, message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
            <div className="relative p-8 bg-white w-full max-w-md m-auto flex-col flex rounded-lg shadow-2xl">
                <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">¿Estás seguro?</h3>
                    <p className="text-sm text-gray-500 mb-6">{message}</p>
                </div>
                <div className="flex justify-center space-x-4">
                    <button
                        onClick={onConfirm}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-150 ease-in-out"
                    >
                        Sí, eliminar
                    </button>
                    <button
                        onClick={onCancel}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition duration-150 ease-in-out"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};

const App = () => {
    const [currentPage, setCurrentPage] = useState('home');
    const [posts, setPosts] = useState([]);
    const [products, setProducts] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [selectedPost, setSelectedPost] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const [showRentModal, setShowRentModal] = useState(false);
    const [showCarousel, setShowCarousel] = useState(false);
    const [carouselImages, setCarouselImages] = useState([]);
    const [carouselIndex, setCarouselIndex] = useState(0);

    const handleNavigation = (page, post = null) => {
        setCurrentPage(page);
        setSelectedPost(post);
        window.history.pushState({ page, postId: post ? post.id : null }, '');
    };

    useEffect(() => {
        const handlePopState = (event) => {
            const { page, postId } = event.state || { page: 'home', postId: null };
            setCurrentPage(page);
            setSelectedPost(posts.find(p => p.id === postId));
        };
        window.addEventListener('popstate', handlePopState);
        
        if (window.location.hash) {
            // Manejar un caso en el que la página se cargue con un hash (por ejemplo, #post-id)
        } else {
            window.history.replaceState({ page: 'home', postId: null }, '');
        }

        const authenticate = async () => {
            try {
                if (initialAuthToken) {
                    await signInWithCustomToken(auth, initialAuthToken);
                } else {
                    await signInAnonymously(auth);
                }
            } catch (error) {
                console.error("Error de autenticación de Firebase:", error);
            } finally {
                setLoading(false);
            }
        };
        authenticate();
    
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            setUser(user);
        });
    
        const postsCollectionRef = collection(db, `/artifacts/${appId}/public/data/posts`);
        const unsubscribePosts = onSnapshot(postsCollectionRef, (snapshot) => {
            const fetchedPosts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setPosts(fetchedPosts);
        }, (error) => {
            console.error("Error al escuchar los posts:", error);
        });
    
        const productsCollectionRef = collection(db, `/artifacts/${appId}/public/data/products`);
        const unsubscribeProducts = onSnapshot(productsCollectionRef, (snapshot) => {
            const fetchedProducts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setProducts(fetchedProducts);
        }, (error) => {
            console.error("Error al escuchar los productos:", error);
        });
    
        return () => {
            unsubscribeAuth();
            unsubscribePosts();
            unsubscribeProducts();
            window.removeEventListener('popstate', handlePopState);
        };
    }, []);

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => {
            setMessage({ type: '', text: '' });
        }, 5000);
    };
    
    const uploadFiles = async (files, folderPath) => {
        const uploadPromises = files.map(file => {
            const fileId = uuidv4();
            const storageRef = ref(storage, `${folderPath}/${fileId}_${file.name}`);
            return uploadBytes(storageRef, file).then(() => getDownloadURL(storageRef));
        });
        return Promise.all(uploadPromises);
    };
    
    const handleAddPost = async (newPostData) => {
        const { title, content, imageFile, galleryFiles, type } = newPostData;
    
        if (!title || !content || (!imageFile && galleryFiles.length === 0)) {
            showMessage('error', 'Por favor, rellena todos los campos del post y sube al menos una imagen.');
            return;
        }
    
        try {
            if (!auth.currentUser) {
                throw new Error("Usuario no autenticado para agregar un post.");
            }
            const postId = uuidv4();
            const folderPath = `posts/${postId}`;
            
            let imageUrl = null;
            if (imageFile) {
                const imagePath = `${folderPath}/cover_${imageFile.name}`;
                await uploadBytes(ref(storage, imagePath), imageFile);
                imageUrl = await getDownloadURL(ref(storage, imagePath));
            }

            let galleryUrls = [];
            if (galleryFiles.length > 0) {
                galleryUrls = await uploadFiles(galleryFiles, `${folderPath}/gallery`);
            }
    
            const newPostRef = doc(db, `/artifacts/${appId}/public/data/posts`, postId);
            await setDoc(newPostRef, {
                title,
                content,
                imageUrl,
                galleryUrls,
                type,
                createdAt: new Date().toISOString()
            });
            showMessage('success', '¡Post agregado con éxito!');
        } catch (error) {
            console.error("Error al agregar el post:", error);
            showMessage('error', `Error al agregar el post: ${error.message}`);
        }
    };
    
    const handleEditPost = async (updatedPostData, editingItem) => {
        const { title, content, imageFile, imageUrl, galleryFiles, galleryUrls, type } = updatedPostData;
    
        if (!title || !content || (!imageUrl && (galleryUrls && galleryUrls.length === 0) && imageFile === null && galleryFiles.length === 0)) {
            showMessage('error', 'Por favor, rellena todos los campos del post.');
            return;
        }
    
        try {
            if (!auth.currentUser) {
                throw new Error("Usuario no autenticado para editar un post.");
            }

            let finalImageUrl = imageUrl;
            if (imageFile) {
                const imagePath = `posts/${editingItem.id}/cover_${imageFile.name}`;
                await uploadBytes(ref(storage, imagePath), imageFile);
                finalImageUrl = await getDownloadURL(ref(storage, imagePath));
            }

            let finalGalleryUrls = galleryUrls;
            if (galleryFiles.length > 0) {
                const newGalleryUrls = await uploadFiles(galleryFiles, `posts/${editingItem.id}/gallery`);
                finalGalleryUrls = [...(galleryUrls || []), ...newGalleryUrls];
            }
    
            const postRef = doc(db, `/artifacts/${appId}/public/data/posts`, editingItem.id);
            await updateDoc(postRef, {
                title,
                content,
                imageUrl: finalImageUrl,
                galleryUrls: finalGalleryUrls,
                type
            });
            showMessage('success', '¡Post actualizado con éxito!');
        } catch (error) {
            console.error("Error al editar el post:", error);
            showMessage('error', `Error al editar el post: ${error.message}`);
        }
    };
    
    const handleDeletePost = async (postId) => {
        setShowConfirmModal(true);
        setItemToDelete({ type: 'post', id: postId });
    };
    
    const handleAddProduct = async (newProductData) => {
        const { name, link, imageFile, description } = newProductData;
    
        if (!name || !link || !imageFile || !description) {
            showMessage('error', 'Por favor, rellena todos los campos del producto.');
            return;
        }
    
        try {
            if (!auth.currentUser) {
                throw new Error("Usuario no autenticado para agregar un producto.");
            }
            const productId = uuidv4();
            const imagePath = `products/${productId}/image_${imageFile.name}`;
            await uploadBytes(ref(storage, imagePath), imageFile);
            const imageUrl = await getDownloadURL(ref(storage, imagePath));
    
            const newProductRef = doc(db, `/artifacts/${appId}/public/data/products`, productId);
            await setDoc(newProductRef, {
                name,
                link,
                imageUrl,
                description
            });
            showMessage('success', '¡Producto agregado con éxito!');
        } catch (error) {
            console.error("Error al agregar el producto:", error);
            showMessage('error', `Error al agregar el producto: ${error.message}`);
        }
    };
    
    const handleEditProduct = async (updatedProductData, editingItem) => {
        const { name, link, imageFile, imageUrl, description } = updatedProductData;
    
        if (!name || !description || (!imageUrl && !imageFile)) {
            showMessage('error', 'Por favor, rellena todos los campos del producto.');
            return;
        }
    
        try {
            if (!auth.currentUser) {
                throw new Error("Usuario no autenticado para editar un producto.");
            }
            let finalImageUrl = imageUrl;
            if (imageFile) {
                const imagePath = `products/${editingItem.id}/image_${imageFile.name}`;
                await uploadBytes(ref(storage, imagePath), imageFile);
                finalImageUrl = await getDownloadURL(ref(storage, imagePath));
            }
    
            const productRef = doc(db, `/artifacts/${appId}/public/data/products`, editingItem.id);
            await updateDoc(productRef, {
                name,
                link,
                imageUrl: finalImageUrl,
                description
            });
            showMessage('success', '¡Producto actualizado con éxito!');
        } catch (error) {
            console.error("Error al editar el producto:", error);
            showMessage('error', `Error al editar el producto: ${error.message}`);
        }
    };
    
    const handleDeleteProduct = (productId) => {
        setShowConfirmModal(true);
        setItemToDelete({ type: 'product', id: productId });
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        
        try {
            if (itemToDelete.type === 'post') {
                const postRef = doc(db, `/artifacts/${appId}/public/data/posts`, itemToDelete.id);
                await deleteFirestoreDoc(postRef);
                showMessage('success', '¡Post eliminado con éxito!');
            } else if (itemToDelete.type === 'product') {
                const productRef = doc(db, `/artifacts/${appId}/public/data/products`, itemToDelete.id);
                await deleteFirestoreDoc(productRef);
                showMessage('success', '¡Producto eliminado con éxito!');
            }
        } catch (error) {
            console.error("Error al eliminar el elemento:", error);
            showMessage('error', `Error al eliminar el elemento: ${error.message}`);
        } finally {
            setShowConfirmModal(false);
            setItemToDelete(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-100">
                <p className="text-xl font-semibold text-slate-700">Cargando...</p>
            </div>
        );
    }

    const renderContent = () => {
        switch (currentPage) {
            case 'home':
                return <PublicView posts={posts} products={products} handleNavigation={handleNavigation} />;
            case 'admin':
                return <AdminPanel posts={posts} products={products} handleAddPost={handleAddPost} handleEditPost={handleEditPost} handleDeletePost={handleDeletePost} handleAddProduct={handleAddProduct} handleEditProduct={handleEditProduct} handleDeleteProduct={handleDeleteProduct} />;
            case 'post':
                return <PostDetailView selectedPost={selectedPost} handleNavigation={handleNavigation} setCarouselImages={setCarouselImages} setCarouselIndex={setCarouselIndex} setShowCarousel={setShowCarousel} />;
            default:
                return <PublicView posts={posts} products={products} handleNavigation={handleNavigation} />;
        }
    };
    
    return (
        <div className="min-h-screen bg-slate-100 font-sans text-gray-800 antialiased">
            {message.text && (
                <div className="fixed bottom-4 right-4 z-50">
                    <div className={`p-4 rounded-lg shadow-xl flex items-center space-x-2 transition-transform transform duration-300 ${message.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                        {message.type === 'success' ? <CheckCircleIcon size={20} /> : <XCircleIcon size={20} />}
                        <span>{message.text}</span>
                    </div>
                </div>
            )}
    
            <nav className="bg-gradient-to-r from-yellow-800 to-yellow-500 shadow-md sticky top-0 z-[60]">
                <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleNavigation('home')}>
                        <div>
                            <YucaguiaIcon />
                        </div>
                        <span className="text-2xl font-bold" style={{ color: '#2363EB' }}>Yucaguia</span>
                    </div>
                    <div className="flex items-center space-x-4 mt-2 md:mt-0">
                        <button
                            onClick={() => handleNavigation('home')}
                            className={`font-semibold px-4 py-2 rounded-lg transition duration-150 ease-in-out ${currentPage === 'home' && !selectedPost ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-300 hover:text-white hover:bg-blue-700'}`}
                        >
                            Inicio
                        </button>
                        <button
                            onClick={() => setShowRentModal(true)}
                            className="font-semibold px-4 py-2 rounded-lg transition duration-150 ease-in-out text-white bg-blue-600 shadow-lg"
                        >
                            <CarSideIcon className="inline-block mr-2" />
                            Renta un auto
                        </button>
                        <button
                            onClick={() => handleNavigation('admin')}
                            className={`font-semibold px-4 py-2 rounded-lg transition duration-150 ease-in-out ${currentPage === 'admin' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-300 hover:text-white hover:bg-blue-700'}`}
                        >
                            <LockIcon size={16} className="inline-block mr-2" />
                            Admin
                        </button>
                    </div>
                </div>
            </nav>
    
            <main>
                {renderContent()}
            </main>
    
            {showConfirmModal && (
                <ConfirmationModal
                    isOpen={showConfirmModal}
                    onConfirm={handleConfirmDelete}
                    onCancel={() => { setShowConfirmModal(false); setItemToDelete(null); }}
                    message={`¿Estás seguro de que quieres eliminar este ${itemToDelete?.type === 'post' ? 'post' : 'producto'}?`}
                />
            )}

            {showRentModal && (
                <RentCarModal
                    isOpen={showRentModal}
                    onClose={() => setShowRentModal(false)}
                    showMessage={showMessage} // Pasamos la función como prop
                />
            )}

            {showCarousel && (
                <ImageCarouselModal
                    images={carouselImages}
                    initialIndex={carouselIndex}
                    onClose={() => setShowCarousel(false)}
                />
            )}
    
            <footer className="bg-blue-600 text-white py-8 mt-12">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-sm">© {new Date().getFullYear()} Yucaguia. Todos los derechos reservados.</p>
                    <p className="text-sm mt-2">Promocionando los mejores lugares y los mejores vehículos para tu viaje.</p>
                </div>
            </footer>
        </div>
    );
};
    
export default App;
