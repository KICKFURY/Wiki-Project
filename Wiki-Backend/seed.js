// seed_comprehensive.js - Comprehensive seed with 100+ records per collection
import 'dotenv/config';
import mongoose from 'mongoose';
import Usuario from './models/usuario.js';
import Category from './models/category.js';
import Recurso from './models/recurso.js';
import Comment from './models/comment.js';

// Sample data generators
const generateUsers = (count) => {
    const users = [];
    const roles = ['user', 'admin'];
    const firstNames = ['Juan', 'María', 'Carlos', 'Ana', 'Luis', 'Carmen', 'José', 'Isabel', 'Francisco', 'Pilar', 'Antonio', 'Dolores', 'Manuel', 'Rosa', 'David', 'Cristina', 'Alejandro', 'Mónica', 'Miguel', 'Laura'];
    const lastNames = ['García', 'Rodríguez', 'González', 'Fernández', 'López', 'Martínez', 'Sánchez', 'Pérez', 'Martín', 'Ruiz', 'Hernández', 'Jiménez', 'Díaz', 'Moreno', 'Álvarez', 'Romero', 'Navarro', 'Torres', 'Ramírez', 'Flores'];

    for (let i = 0; i < count; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const username = `${firstName.toLowerCase()}_${lastName.toLowerCase()}_${i + 1}`;
        const email = `${username}@example.com`;
        const role = i < 5 ? 'admin' : 'user'; // First 5 are admins

        users.push({
            dni: `DNI${String(i + 1).padStart(3, '0')}`,
            username: username.toUpperCase(),
            email,
            password: 'securepassword',
            role,
            followers: [],
            following: [],
            likes: [],
            lastActivity: new Date()
        });
    }
    return users;
};

const generateCategories = () => {
    return [
        { name: 'Tecnologia', slug: 'tecnologia', description: 'Artículos sobre tecnología y desarrollo' },
        { name: 'Educacion', slug: 'educacion', description: 'Contenido educativo y pedagógico' },
        { name: 'Ciencia', slug: 'ciencia', description: 'Artículos científicos y de investigación' },
        { name: 'Arte', slug: 'arte', description: 'Contenido artístico y creativo' },
        { name: 'Historia', slug: 'historia', description: 'Artículos históricos y culturales' },
        { name: 'Deportes', slug: 'deportes', description: 'Contenido deportivo y recreativo' },
        { name: 'Medicina', slug: 'medicina', description: 'Artículos sobre salud y medicina' },
        { name: 'Economia', slug: 'economia', description: 'Contenido económico y financiero' },
        { name: 'Literatura', slug: 'literatura', description: 'Obras literarias y análisis' },
        { name: 'Musica', slug: 'musica', description: 'Contenido musical y artístico' },
        { name: 'Cine', slug: 'cine', description: 'Análisis cinematográfico y reseñas' },
        { name: 'Filosofia', slug: 'filosofia', description: 'Pensamiento filosófico y ético' },
        { name: 'Psicologia', slug: 'psicologia', description: 'Estudios psicológicos y mentales' },
        { name: 'Medio Ambiente', slug: 'medio-ambiente', description: 'Ecología y sostenibilidad' },
        { name: 'Viajes', slug: 'viajes', description: 'Guías de viaje y turismo' },
        { name: 'Gastronomia', slug: 'gastronomia', description: 'Cocina y cultura culinaria' },
        { name: 'Otro', slug: 'otro', description: 'Categoría general y miscelánea' }
    ];
};

const generateRecursos = (users, categories, count) => {
    const recursos = [];
    const techTitles = [
        'Introducción a React Native', 'Desarrollo Web con Node.js', 'Machine Learning Básico',
        'Bases de Datos NoSQL', 'Arquitectura de Microservicios', 'DevOps Essentials',
        'Programación Funcional', 'Inteligencia Artificial Moderna', 'Blockchain Fundamentals',
        'Desarrollo Móvil Híbrido', 'Testing Automatizado', 'Cloud Computing AWS',
        'Kubernetes para Principiantes', 'API RESTful Design', 'GraphQL vs REST',
        'Desarrollo con TypeScript', 'React Hooks Avanzados', 'Vue.js Framework',
        'Angular Moderno', 'Python para Data Science', 'JavaScript ES6+',
        'CSS Grid y Flexbox', 'Responsive Design', 'Progressive Web Apps',
        'WebAssembly Basics', 'Docker Containers', 'Git Workflow Avanzado'
    ];

    const educationTitles = [
        'Métodos de Estudio Efectivos', 'Aprendizaje Basado en Proyectos', 'Pedagogía Moderna',
        'Evaluación Educativa', 'Tecnología en la Educación', 'Aprendizaje Online',
        'Desarrollo Cognitivo', 'Motivación Estudiantil', 'Inclusión Educativa',
        'Educación Especial', 'Gamificación Educativa', 'Aprendizaje Cooperativo',
        'Metodologías Activas', 'Evaluación Formativa', 'Competencias Digitales',
        'Educación Emocional', 'Pensamiento Crítico', 'Creatividad en la Educación',
        'Educación para la Sostenibilidad', 'Multiculturalidad', 'Educación a Distancia',
        'Aprendizaje por Competencias', 'Educación Personalizada', 'Mentoría Educativa'
    ];

    const scienceTitles = [
        'Teoría de la Relatividad', 'Evolución Biológica', 'Química Orgánica',
        'Física Cuántica', 'Genética Moderna', 'Ecología Urbana',
        'Astronomía Contemporánea', 'Neurociencia Básica', 'Climatología',
        'Microbiología', 'Geología Planetaria', 'Matemáticas Aplicadas',
        'Estadística Avanzada', 'Investigación Científica', 'Método Científico',
        'Biotecnología', 'Nanotecnología', 'Energías Renovables',
        'Inteligencia Artificial en Ciencia', 'Big Data Analytics', 'Computación Científica',
        'Bioinformática', 'Química Computacional', 'Física de Partículas'
    ];

    const artTitles = [
        'El Renacimiento Artístico', 'Arte Contemporáneo', 'Historia del Arte',
        'Técnicas de Pintura', 'Escultura Moderna', 'Fotografía Digital',
        'Diseño Gráfico', 'Arquitectura Sostenible', 'Arte Urbano',
        'Arte Digital', 'Museología', 'Conservación de Arte',
        'Estética Visual', 'Arte Conceptual', 'Performance Art',
        'Arte Textil', 'Cerámica Artística', 'Grabado y Estampación',
        'Arte Sonoro', 'Videoarte', 'Instalaciones Artísticas',
        'Arte Público', 'Arte Terapéutico', 'Historia del Diseño'
    ];

    const historyTitles = [
        'La Revolución Industrial', 'Historia Antigua', 'Edad Media',
        'Renacimiento Europeo', 'Revolución Francesa', 'Historia Contemporánea',
        'Historia de América', 'Civilizaciones Antiguas', 'Imperios Mundiales',
        'Guerras Mundiales', 'Historia Colonial', 'Independencias Americanas',
        'Historia del Siglo XX', 'Historia Económica', 'Historia Social',
        'Historia Cultural', 'Arqueología Moderna', 'Historia Política',
        'Historia Militar', 'Historia de la Ciencia', 'Historia de la Tecnología',
        'Historia de las Religiones', 'Historia de la Filosofía', 'Historia Global'
    ];

    const sportTitles = [
        'Fútbol: Historia y Reglas', 'Baloncesto Profesional', 'Tenis de Competición',
        'Atletismo Olímpico', 'Natación Deportiva', 'Ciclismo Profesional',
        'Deportes de Invierno', 'Golf Profesional', 'Boxeo y Artes Marciales',
        'Deportes Electrónicos', 'Fútbol Americano', 'Rugby Internacional',
        'Voleibol Competitivo', 'Hockey sobre Hielo', 'Béisbol Profesional',
        'Deportes Acuáticos', 'Atletismo Paralímpico', 'Deportes Extremos',
        'Fútbol Sala', 'Balonmano', 'Deportes de Motor', 'Equitación',
        'Deportes de Aventura', 'Fitness y Salud Deportiva'
    ];

    const allTitles = [...techTitles, ...educationTitles, ...scienceTitles, ...artTitles, ...historyTitles, ...sportTitles];
    const tagsPool = [
        'tecnologia', 'educacion', 'ciencia', 'arte', 'historia', 'deportes',
        'aprendizaje', 'investigacion', 'cultura', 'desarrollo', 'innovacion',
        'conocimiento', 'creatividad', 'analisis', 'practica', 'teoria',
        'moderno', 'clasico', 'contemporaneo', 'tradicional', 'avanzado',
        'basico', 'profesional', 'academico', 'practico', 'teorico'
    ];

    for (let i = 0; i < count; i++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        const randomTitle = allTitles[Math.floor(Math.random() * allTitles.length)];

        // Generate random tags (2-5 tags per resource)
        const numTags = Math.floor(Math.random() * 4) + 2;
        const tags = [];
        for (let j = 0; j < numTags; j++) {
            const randomTag = tagsPool[Math.floor(Math.random() * tagsPool.length)];
            if (!tags.includes(randomTag)) {
                tags.push(randomTag);
            }
        }

        // Generate extensive content based on category
        let content = '';
        switch (randomCategory.name) {
            case 'Tecnologia':
                content = `Este artículo proporciona una exploración exhaustiva de los fundamentos y aplicaciones avanzadas de ${randomTitle.toLowerCase()}. Comenzamos con una introducción detallada a los conceptos básicos, incluyendo definiciones precisas, contexto histórico y evolución tecnológica. Se cubren principios fundamentales, arquitecturas de referencia y mejores prácticas implementadas por líderes de la industria.

                En la sección técnica principal, analizamos en profundidad las características clave, incluyendo especificaciones técnicas, protocolos de comunicación, estándares de interoperabilidad y consideraciones de rendimiento. Se incluyen diagramas conceptuales, algoritmos detallados y ejemplos de implementación práctica con código fuente comentado.

                El artículo continúa con casos de estudio reales de implementación en entornos empresariales, incluyendo métricas de rendimiento, análisis de escalabilidad y estrategias de optimización. Se discuten patrones de diseño emergentes, tendencias actuales del mercado y proyecciones futuras basadas en investigaciones actuales y roadmaps tecnológicos.

                Finalmente, se aborda la integración con tecnologías complementarias, consideraciones de seguridad, estrategias de migración y recomendaciones para la adopción en diferentes contextos organizacionales. El contenido incluye referencias bibliográficas actualizadas, enlaces a recursos adicionales y un glosario técnico comprehensivo.`;
                break;
            case 'Educacion':
                content = `Este análisis pedagógico exhaustivo examina ${randomTitle.toLowerCase()} desde múltiples perspectivas teóricas y prácticas. Comenzamos con una revisión histórica del desarrollo de estas metodologías, contextualizando su evolución dentro del marco de las teorías educativas contemporáneas.

                Se presentan marcos teóricos fundamentales, incluyendo teorías del aprendizaje, modelos cognitivos y enfoques constructivistas. El artículo analiza en detalle las estrategias de implementación práctica, incluyendo planificación curricular, diseño de actividades, evaluación formativa y retroalimentación efectiva.

                La investigación incluye estudios de caso detallados de instituciones educativas que han implementado exitosamente estas metodologías, con análisis cuantitativo de resultados académicos, niveles de engagement estudiantil y desarrollo de competencias transversales. Se discuten desafíos comunes, estrategias de superación y factores críticos de éxito.

                Se aborda la integración con tecnologías educativas emergentes, incluyendo plataformas de aprendizaje digital, herramientas de colaboración y sistemas de evaluación automatizada. El contenido incluye consideraciones éticas, equidad educativa y adaptación cultural para diferentes contextos socioeducativos.

                Finalmente, se presentan recomendaciones prácticas para educadores, directivos y policymakers, respaldadas por evidencia empírica y mejores prácticas internacionalmente reconocidas.`;
                break;
            case 'Ciencia':
                content = `Esta investigación científica comprehensiva sobre ${randomTitle.toLowerCase()} representa un análisis exhaustivo de los principios fundamentales, aplicaciones prácticas y desarrollos más recientes en el campo. El artículo comienza con una revisión histórica detallada, contextualizando el desarrollo científico dentro del marco de la evolución del conocimiento humano.

                Se presentan los fundamentos teóricos con rigor matemático, incluyendo ecuaciones diferenciales, modelos estadísticos y simulaciones computacionales. El análisis incluye revisiones sistemáticas de literatura científica, meta-análisis de estudios empíricos y síntesis de evidencia experimental.

                La investigación cubre aplicaciones prácticas en diversos sectores, incluyendo medicina, ingeniería, agricultura y medio ambiente. Se discuten protocolos experimentales detallados, metodologías de investigación y técnicas analíticas avanzadas.

                Se aborda el impacto social y ético de estos desarrollos científicos, incluyendo consideraciones de responsabilidad científica, implicaciones para la sociedad y debates éticos contemporáneos. El artículo incluye proyecciones futuras basadas en tendencias actuales y desafíos emergentes.

                Finalmente, se presentan recomendaciones para la investigación futura, incluyendo prioridades de investigación, necesidades de financiación y estrategias de colaboración internacional. El contenido está respaldado por referencias bibliográficas extensas y datos empíricos robustos.`;
                break;
            case 'Arte':
                content = `Esta exploración artística comprehensiva de ${randomTitle.toLowerCase()} representa un análisis profundo de las expresiones creativas, contextos culturales y significados simbólicos. Comenzamos con un estudio histórico detallado, examinando la evolución de las técnicas, estilos y movimientos artísticos a través de diferentes períodos culturales.

                Se analizan las técnicas artísticas tradicionales y contemporáneas, incluyendo materiales, herramientas, procesos creativos y innovaciones técnicas. El artículo incluye análisis formal de obras representativas, estudios de composición, teoría del color y principios estéticos.

                La investigación explora el contexto socio-cultural, examinando cómo estas expresiones artísticas reflejan, influyen y transforman las sociedades. Se discuten movimientos artísticos, manifiestos creativos y debates estéticos que han definido períodos históricos.

                Se aborda la dimensión psicológica del arte, incluyendo procesos creativos, percepción estética y impacto emocional. El contenido incluye análisis semióticos, interpretaciones simbólicas y estudios de recepción artística.

                Finalmente, se examina el rol del arte en la sociedad contemporánea, incluyendo su función en la educación, terapia, activismo social y economía creativa. El artículo incluye referencias a obras clave, artistas representativos y teorías estéticas fundamentales.`;
                break;
            case 'Historia':
                content = `Este estudio histórico comprehensivo sobre ${randomTitle.toLowerCase()} representa una investigación exhaustiva de los eventos, procesos y figuras que han moldeado el desarrollo humano. Comenzamos con una contextualización cronológica detallada, estableciendo líneas temporales precisas y marcos históricos amplios.

                Se analizan las causas profundas y consecuencias de los eventos históricos, incluyendo factores económicos, sociales, políticos y culturales. El artículo incluye análisis de fuentes primarias, documentos históricos y testimonios contemporáneos.

                La investigación examina las figuras clave que protagonizaron estos procesos históricos, incluyendo sus motivaciones, decisiones y legado. Se discuten movimientos sociales, revoluciones políticas y transformaciones culturales que definieron épocas.

                Se aborda el impacto a largo plazo de estos eventos en el desarrollo de instituciones, sistemas políticos y estructuras sociales. El contenido incluye análisis comparativos con otros períodos históricos y contextos culturales.

                Finalmente, se reflexiona sobre las lecciones históricas aplicables al presente, incluyendo patrones recurrentes, ciclos históricos y perspectivas para el futuro. El artículo está respaldado por fuentes históricas primarias, bibliografía especializada y evidencia arqueológica cuando corresponde.`;
                break;
            case 'Deportes':
                content = `Este análisis deportivo comprehensivo de ${randomTitle.toLowerCase()} examina todos los aspectos del rendimiento atlético, desde fundamentos técnicos hasta consideraciones estratégicas avanzadas. Comenzamos con una revisión histórica del desarrollo del deporte, incluyendo su evolución desde prácticas tradicionales hasta modalidades profesionales contemporáneas.

                Se analizan detalladamente las técnicas fundamentales, incluyendo biomecánica del movimiento, estrategias de entrenamiento y desarrollo de habilidades específicas. El artículo incluye análisis de rendimiento deportivo, métricas de evaluación y protocolos de entrenamiento científico.

                La investigación cubre aspectos tácticos y estratégicos, incluyendo sistemas de juego, formaciones, estrategias competitivas y toma de decisiones bajo presión. Se discuten preparaciones físicas, mentales y nutricionales para el alto rendimiento.

                Se aborda la dimensión institucional del deporte, incluyendo organización de competiciones, regulaciones internacionales y desarrollo de infraestructuras. El contenido incluye análisis de rendimiento de atletas destacados y equipos exitosos.

                Finalmente, se examina el impacto social y cultural del deporte, incluyendo su rol en la educación, salud pública, integración social y economía del entretenimiento. El artículo incluye estadísticas actualizadas, análisis de tendencias y proyecciones futuras del deporte.`;
                break;
            default:
                content = `Este estudio interdisciplinario comprehensivo sobre ${randomTitle.toLowerCase()} representa una exploración exhaustiva de múltiples dimensiones y perspectivas del tema. Comenzamos con una contextualización amplia, estableciendo marcos conceptuales, definiciones operativas y delimitaciones temáticas.

                Se presentan análisis detallados desde diferentes disciplinas, incluyendo perspectivas teóricas, metodológicas y prácticas. El artículo incluye revisiones sistemáticas de literatura, síntesis de evidencia empírica y análisis comparativos.

                La investigación cubre aplicaciones prácticas en diversos contextos, incluyendo casos de estudio detallados, implementaciones reales y evaluaciones de impacto. Se discuten desafíos contemporáneos, oportunidades emergentes y estrategias de abordaje.

                Se aborda la dimensión ética, social y cultural del tema, incluyendo implicaciones para individuos, organizaciones y sociedades. El contenido incluye consideraciones de sostenibilidad, equidad y responsabilidad social.

                Finalmente, se presentan recomendaciones prácticas, estrategias de implementación y prioridades para el desarrollo futuro. El artículo está respaldado por evidencia empírica, referencias bibliográficas extensas y análisis críticos fundamentados.`;
        }

        recursos.push({
            title: `${randomTitle} - Parte ${i + 1}`,
            content,
            category: randomCategory._id,
            author: randomUser._id,
            tags,
            image: 'https://static.vecteezy.com/system/resources/previews/016/916/479/non_2x/placeholder-icon-design-free-vector.jpg',
            viewCount: Math.floor(Math.random() * 1000),
            lastEditedAt: new Date(),
            lastEditedBy: randomUser._id,
            isPublic: Math.random() > 0.1, // 90% public, 10% private
            allowedUsers: [],
            currentVersion: 1
        });
    }
    return recursos;
};

const generateComments = (users, recursos, count) => {
    const comments = [];
    const commentTexts = [
        'Excelente artículo, muy informativo.',
        'Me ha gustado mucho el contenido.',
        'Buen análisis del tema.',
        'Interesante perspectiva.',
        'Gracias por compartir este conocimiento.',
        'Muy útil para mi investigación.',
        'Claridad en la explicación.',
        'Bien estructurado el contenido.',
        'Aporte valioso al tema.',
        'Recomiendo leerlo.',
        'Excelente redacción.',
        'Contenido de calidad.',
        'Muy didáctico.',
        'Interesante enfoque.',
        'Buena documentación.',
        'Útil para estudiantes.',
        'Profundo análisis.',
        'Bien fundamentado.',
        'Contribuye al debate.',
        'Inspirador contenido.',
        'Clarifica conceptos complejos.',
        'Actualizado y relevante.',
        'Buena selección de fuentes.',
        'Enriquecedor.',
        'Motivador para aprender más.'
    ];

    for (let i = 0; i < count; i++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const randomRecurso = recursos[Math.floor(Math.random() * recursos.length)];
        const randomText = commentTexts[Math.floor(Math.random() * commentTexts.length)];

        // Generate random likes (0-10 likes per comment)
        const numLikes = Math.floor(Math.random() * 11);
        const likes = [];
        for (let j = 0; j < numLikes; j++) {
            const randomLiker = users[Math.floor(Math.random() * users.length)];
            if (!likes.includes(randomLiker._id) && randomLiker._id !== randomUser._id) {
                likes.push(randomLiker._id);
            }
        }

        comments.push({
            recurso: randomRecurso._id,
            author: randomUser._id,
            content: `${randomText} ${i + 1}`,
            likes
        });
    }
    return comments;
};

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Conectado a MongoDB');

        // Clear existing data
        console.log('Limpiando datos existentes...');
        await Usuario.deleteMany({});
        await Category.deleteMany({});
        await Recurso.deleteMany({});
        await Comment.deleteMany({});

        // Generate and seed users (100 users)
        console.log('Generando usuarios...');
        const userData = generateUsers(100);
        const users = await Usuario.insertMany(userData);
        console.log(`✅ ${users.length} usuarios creados`);

        // Generate and seed categories
        console.log('Generando categorías...');
        const categoryData = generateCategories();
        const categories = await Category.insertMany(categoryData);
        console.log(`✅ ${categories.length} categorías creadas`);

        // Generate and seed recursos (150 recursos)
        console.log('Generando recursos...');
        const recursoData = generateRecursos(users, categories, 150);
        const recursos = await Recurso.insertMany(recursoData);
        console.log(`✅ ${recursos.length} recursos creados`);

        // Generate and seed comments (200 comments)
        console.log('Generando comentarios...');
        const commentData = generateComments(users, recursos, 200);
        const comments = await Comment.insertMany(commentData);
        console.log(`✅ ${comments.length} comentarios creados`);

        // Establish following relationships
        console.log('Estableciendo relaciones de seguimiento...');
        for (const user of users) {
            // Each user follows 5-15 random users
            const numFollowing = Math.floor(Math.random() * 11) + 5;
            const following = [];
            for (let i = 0; i < numFollowing; i++) {
                const randomUser = users[Math.floor(Math.random() * users.length)];
                if (randomUser._id !== user._id && !following.includes(randomUser._id)) {
                    following.push(randomUser._id);
                }
            }
            user.following = following;
            await user.save();
        }

        // Update followers count
        for (const user of users) {
            const followersCount = users.filter(u => u.following.includes(user._id)).length;
            user.followers = Array(followersCount).fill(null).map(() =>
                users[Math.floor(Math.random() * users.length)]._id
            );
            await user.save();
        }

        console.log('\n🎉 Seed completado exitosamente!');
        console.log(`📊 Resumen:`);
        console.log(`   👥 ${users.length} usuarios`);
        console.log(`   📂 ${categories.length} categorías`);
        console.log(`   📄 ${recursos.length} recursos`);
        console.log(`   💬 ${comments.length} comentarios`);
        console.log(`   🔗 Relaciones de seguimiento establecidas`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error durante el seed:', error);
        process.exit(1);
    }
}

run();
