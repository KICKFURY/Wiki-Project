// seed_with_comments.js
require('dotenv').config();
const mongoose = require('mongoose');
const Usuario = require('./models/usuario');
const Category = require('./models/category');
const Recurso = require('./models/recurso');
const Comment = require('./models/comment');

async function run() {
    await mongoose.connect(process.env.MONGO_URI);

    // Clear existing data
    await Usuario.deleteMany({});
    await Category.deleteMany({});
    await Recurso.deleteMany({});
    await Comment.deleteMany({});

    // Seed users
    const users = await Usuario.insertMany([
        { dni: 'H001', username: 'KICKFURY', email: 'bj.cuber.developer@mail.com', password: 'securepassword', role: 'admin' },
        { dni: 'H002', username: 'BJ_CUBER', email: 'bj_cuber@mail.com', password: 'securepassword', role: 'user' }
    ]);

    // Seed categories
    const categories = await Category.insertMany([
        { name: 'Tecnologia', slug: 'tecnologia', description: 'Artículos sobre tecnología' },
        { name: 'Educacion', slug: 'educacion', description: 'Contenido educativo' },
        { name: 'Ciencia', slug: 'ciencia', description: 'Artículos científicos' },
        { name: 'Arte', slug: 'arte', description: 'Contenido artístico y creativo' },
        { name: 'Historia', slug: 'historia', description: 'Artículos históricos' },
        { name: 'Deportes', slug: 'deportes', description: 'Contenido deportivo' },
        { name: 'Otro', slug: 'otro', description: 'Categoría general' }
    ]);

    // Seed recursos
    const recursos = await Recurso.insertMany([
        {
            title: 'Introducción a React Native',
            content: 'React Native es un framework para desarrollar aplicaciones móviles usando React y JavaScript...',
            category: categories.find(c => c.name === 'Tecnologia')._id,
            author: users[0]._id,
            tags: ['react', 'mobile', 'javascript'],
            image: 'https://static.vecteezy.com/system/resources/previews/016/916/479/non_2x/placeholder-icon-design-free-vector.jpg'
        },
        {
            title: 'La Revolución Industrial',
            content: 'La Revolución Industrial fue un período de transformación económica y social...',
            category: categories.find(c => c.name === 'Historia')._id,
            author: users[0]._id,
            tags: ['historia', 'industrial', 'economia'],
            image: 'https://static.vecteezy.com/system/resources/previews/016/916/479/non_2x/placeholder-icon-design-free-vector.jpg'
        },
        {
            title: 'Algoritmos de Machine Learning',
            content: 'Los algoritmos de machine learning permiten a las computadoras aprender patrones...',
            category: categories.find(c => c.name === 'Ciencia')._id,
            author: users[1]._id,
            tags: ['machine learning', 'algoritmos', 'ia'],
            image: 'https://static.vecteezy.com/system/resources/previews/016/916/479/non_2x/placeholder-icon-design-free-vector.jpg'
        },
        {
            title: 'Métodos de Estudio Efectivos',
            content: 'Existen diversas técnicas para mejorar el aprendizaje y retención de información...',
            category: categories.find(c => c.name === 'Educacion')._id,
            author: users[1]._id,
            tags: ['estudio', 'aprendizaje', 'tecnicas'],
            image: 'https://static.vecteezy.com/system/resources/previews/016/916/479/non_2x/placeholder-icon-design-free-vector.jpg'
        },
        {
            title: 'El Renacimiento Artístico',
            content: 'El Renacimiento fue un período de gran florecimiento artístico en Europa...',
            category: categories.find(c => c.name === 'Arte')._id,
            author: users[0]._id,
            tags: ['renacimiento', 'arte', 'europea'],
            image: 'https://static.vecteezy.com/system/resources/previews/016/916/479/non_2x/placeholder-icon-design-free-vector.jpg'
        },
        {
            title: 'Fútbol: Historia y Reglas',
            content: 'El fútbol es el deporte más popular del mundo con millones de seguidores...',
            category: categories.find(c => c.name === 'Deportes')._id,
            author: users[1]._id,
            tags: ['futbol', 'deporte', 'reglas'],
            image: 'https://static.vecteezy.com/system/resources/previews/016/916/479/non_2x/placeholder-icon-design-free-vector.jpg'
        }
    ]);

    // Seed comments
    await Comment.insertMany([
        {
            recurso: recursos[0]._id, // React Native article
            author: users[1]._id,
            content: 'Excelente artículo sobre React Native. Me ayudó mucho a entender los conceptos básicos.',
            likes: [users[0]._id] // Liked by admin user
        },
        {
            recurso: recursos[0]._id, // React Native article
            author: users[0]._id,
            content: 'Gracias por el comentario. ¿Te gustaría que haga un artículo sobre hooks avanzados?',
            likes: []
        },
        {
            recurso: recursos[1]._id, // Industrial Revolution article
            author: users[1]._id,
            content: 'Muy interesante la explicación sobre la Revolución Industrial. Podrías agregar más detalles sobre las invenciones clave.',
            likes: [users[0]._id]
        },
        {
            recurso: recursos[2]._id, // Machine Learning article
            author: users[0]._id,
            content: 'Buen resumen de algoritmos de ML. Recomiendo agregar ejemplos de código.',
            likes: []
        }
    ]);

    console.log('Seed completado con comentarios');
    process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
