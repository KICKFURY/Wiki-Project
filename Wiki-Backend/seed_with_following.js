// seed_with_following.js
import 'dotenv/config';
import mongoose from 'mongoose';
import Usuario from './models/usuario.js';
import Category from './models/category.js';
import Recurso from './models/recurso.js';

async function run() {
    await mongoose.connect(process.env.MONGO_URI);

    // Clear existing data
    await Usuario.deleteMany({});
    await Category.deleteMany({});
    await Recurso.deleteMany({});

    // Seed users
    const users = await Usuario.insertMany([
        { dni: 'H001', username: 'KICKFURY', email: 'bj.cuber.developer@gmail.com', password: 'securepassword', role: 'admin' },
        { dni: 'H002', username: 'BJ_CUBER', email: 'bj_cuber@gmail.com', password: 'securepassword', role: 'user' },
        { dni: 'H003', username: 'TEST_USER', email: 'test@example.com', password: 'securepassword', role: 'user' },
        { dni: 'H004', username: 'DEMO_USER', email: 'demo@example.com', password: 'securepassword', role: 'user' }
    ]);

    // Establish following relationships
    // KICKFURY follows BJ_CUBER and TEST_USER
    users[0].following.push(users[1]._id, users[2]._id);
    users[1].followers.push(users[0]._id);
    users[2].followers.push(users[0]._id);

    // BJ_CUBER follows KICKFURY and DEMO_USER
    users[1].following.push(users[0]._id, users[3]._id);
    users[0].followers.push(users[1]._id);
    users[3].followers.push(users[1]._id);

    // TEST_USER follows DEMO_USER
    users[2].following.push(users[3]._id);
    users[3].followers.push(users[2]._id);

    // Save the updated users with following relationships
    await users[0].save();
    await users[1].save();
    await users[2].save();
    await users[3].save();

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
    await Recurso.insertMany([
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

    console.log('Seed completado con relaciones de seguimiento');
    console.log('Usuarios creados:');
    users.forEach(user => {
        console.log(`${user.username} sigue a: ${user.following.length} usuarios`);
    });
    process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
