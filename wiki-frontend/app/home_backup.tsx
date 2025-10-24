import React from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    FlatList,
    RefreshControl,
    Alert,
} from 'react-native';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

interface Recurso {
    id: string;
    title: string;
    category: string;
    author: string;
    image: string;
}

function HomeScreen() {
    const [recursos, setRecursos] = React.useState<Recurso[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState('');
    const [refreshing, setRefreshing] = React.useState(false);
    const [selectedFilter, setSelectedFilter] = React.useState('Popular');
    const [searchQuery, setSearchQuery] = React.useState('');
    const filtros = ['Popular', 'Tecnologia', 'Educacion', 'Ciencia', 'Arte', 'Historia', 'Deportes', 'Otro'];

    React.useEffect(() => {
        fetchRecursos();
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            fetchRecursos();
        }, [])
    );

    const fetchRecursos = async () => {
        console.log('1');
        try {
            const response = await fetch('http://localhost:4000/api/recursos', { mode: 'cors' });
            const data: any[] = await response.json();
            if (response.ok) {
                const mapped: Recurso[] = data.map(r => ({
                    id: r._id,
                    title: r.title,
                    category: r.category?.name || 'Sin categoría',
                    author: r.author?.username ? '@' + r.author.username : 'Anónimo',
                    image: r.image || 'https://static.vecteezy.com/system/resources/previews/016/916/479/non_2x/placeholder-icon-design-free-vector.jpg',
                }));
                setRecursos(mapped);
            } else {
                setError('Error al cargar recursos');
            }
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchRecursos();
    };

    const showOptions = (item: Recurso) => {
        Alert.alert(
            'Opciones',
            '¿Qué deseas hacer?',
            [
                { text: 'Editar', onPress: () => router.push(`/create?id=${item.id}`) },
                { text: 'Eliminar', onPress: () => handleDelete(item.id) },
                { text: 'Cancelar', style: 'cancel' },
            ]
        );
    };

    const handleDelete = async (id: string) => {
        Alert.alert('Confirmar', '¿Eliminar este recurso?', [
            {
                text: 'Sí',
                onPress: async () => {
                    try {
                        const response = await fetch(`http://localhost:4000/api/recursos/${id}`, {
                            method: 'DELETE',
                        });
                        if (response.ok) {
                            fetchRecursos();
                        } else {
                            Alert.alert('Error', 'No se pudo eliminar');
                        }
                    } catch (err) {
                        Alert.alert('Error', 'Error de conexión');
                    }
                },
            },
            { text: 'No', style: 'cancel' },
        ]);
    };

    const filteredRecursos = recursos
        .filter((r) => selectedFilter === 'Popular' || r.category === selectedFilter)
        .filter((r) =>
            searchQuery === '' ||
            (r.title && r.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (r.category && r.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (r.author && r.author.toLowerCase().includes(searchQuery.toLowerCase()))
        );

    if (loading) {
        return (
            <SafeAreaView style={styles.centered}>
                <Text>Cargando recursos...</Text>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.centered}>
                <Text>{error}</Text>
                <TouchableOpacity style={styles.buttonPrimary} onPress={fetchRecursos}>
                    <Text style={styles.buttonPrimaryText}>Reintentar</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <View style={styles.searchContainer}>
                <Icon name="search" size={24} color="gray" style={{ marginLeft: 10 }} />
                <TextInput
                    placeholder="Buscar recurso"
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                <TouchableOpacity>
                    <Icon name="mic" size={24} color="gray" style={{ marginRight: 10 }} />
                </TouchableOpacity>
            </View>
            <View>
            </View>

            <View style={styles.filterRow}>
                {filtros.map((filter) => (
                    <TouchableOpacity
                        key={filter}
                        style={[
                            styles.filterButton,
                            selectedFilter === filter && styles.filterButtonSelected,
                        ]}
                        onPress={() => setSelectedFilter(filter)}
                    >
                        <Text
                            style={[
                                styles.filterText,
                                selectedFilter === filter && styles.filterTextSelected,
                            ]}
                        >
                            {filter}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            <FlatList
                data={filteredRecursos}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 10 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.card} onPress={() => router.push(`/detail?id=${item.id}`)} onLongPress={() => showOptions(item)}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.cardTitle}>{item.title}</Text>
                            <Text style={styles.cardSubtitle}>
                                {item.category} / {item.author}
                            </Text>
                        </View>
                        <Image source={{ uri: item.image }} style={styles.cardImage} />
                    </TouchableOpacity>
                )}
            />
        </SafeAreaView>
    );
}

function MainScreen() {
    return (
        <View style={{ flex: 1 }}>
            <HomeScreen />
            <View style={styles.bottomBar}>
                <TouchableOpacity>
                    <Icon name="home" size={28} color="#000" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push('/create')}>
                    <Icon name="add-box" size={28} color="#000" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push('/profile')}>
                    <Icon name="person" size={28} color="#000" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

export default function App() {
    return MainScreen()
}

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    splashTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        marginVertical: 10,
        textAlign: 'center',
    },
    splashSubtitle: {
        fontSize: 18,
        fontStyle: 'italic',
        marginBottom: 40,
        textAlign: 'center',
    },
    buttonPrimary: {
        backgroundColor: '#2e61ff',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 25,
    },
    buttonPrimaryText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    loginContainer: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    loginTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30,
        alignSelf: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 12,
        padding: 12,
        marginBottom: 20,
        fontSize: 16,
    },
    buttonSecondary: {
        backgroundColor: '#eee',
        paddingVertical: 15,
        borderRadius: 25,
    },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#ccc',
    },
    socialRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 40,
    },
    socialButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 25,
        backgroundColor: '#fff',
        elevation: 3,
    },
    searchContainer: {
        margin: 10,
        flexDirection: 'row',
        borderWidth: 1,
        borderRadius: 30,
        borderColor: '#ddd',
        alignItems: 'center',
    },
    searchInput: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 10,
        fontSize: 16,
    },
    filterRow: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginHorizontal: 10,
        marginBottom: 12,
    },
    filterButton: {
        backgroundColor: '#eee',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 6,
        marginRight: 12,
    },
    filterButtonSelected: {
        backgroundColor: '#2e61ff',
    },
    filterText: {
        fontSize: 14,
        color: '#666',
    },
    filterTextSelected: {
        color: '#fff',
        fontWeight: 'bold',
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#eee',
        borderRadius: 15,
        padding: 12,
        marginBottom: 10,
        alignItems: 'center',
    },
    cardTitle: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    cardSubtitle: {
        color: '#666',
        fontSize: 12,
        marginTop: 4,
    },
    cardImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginLeft: 12,
    },
    bottomBar: {
        height: 60,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        borderTopWidth: 1,
        borderColor: '#ddd',
    },
});
