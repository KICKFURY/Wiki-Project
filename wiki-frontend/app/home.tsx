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
    useWindowDimensions,
    ScrollView,
} from 'react-native';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Recurso {
    id: string;
    title: string;
    category: string;
    author: string;
    image: string;
}

function HomeScreen() {
    const { width } = useWindowDimensions();
    const isMobile = width < 600;
    const [recursos, setRecursos] = React.useState<Recurso[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState('');
    const [refreshing, setRefreshing] = React.useState(false);
    const [selectedFilter, setSelectedFilter] = React.useState('Popular');
    const [searchQuery, setSearchQuery] = React.useState('');
    const filtros = ['Popular', 'Tecnologia', 'Educacion', 'Ciencia', 'Arte', 'Historia', 'Deportes', 'Otro'];
    // const navigation = useNavigation(); // Not needed with expo-router

    React.useEffect(() => {
        checkLoginStatus();
        fetchRecursos();
    }, []);

    const checkLoginStatus = async () => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) {
                router.replace('/');
            }
        } catch (error) {
            console.error('Error checking login status:', error);
        }
    };

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
                <Text style={styles.loadingText}>Cargando recursos...</Text>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.centered}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchRecursos}>
                    <Text style={styles.retryButtonText}>Reintentar</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header Section */}
            <View style={styles.header}>
                <Text style={styles.welcomeText}>Bienvenido a Wiki Project</Text>
                <Text style={styles.subtitleText}>Descubre y comparte conocimientos</Text>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Icon name="search" size={24} color="#666" style={styles.searchIcon} />
                <TextInput
                    placeholder="Buscar recursos..."
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor="#999"
                />
                <TouchableOpacity style={styles.voiceButton}>
                    <Icon name="mic" size={24} color="#666" />
                </TouchableOpacity>
            </View>

            {/* Filters */}
            <View style={styles.filtersContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
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
                </ScrollView>
            </View>

            {/* Resources List */}
            <FlatList
                data={filteredRecursos}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => router.push(`/detail?id=${item.id}`)}
                        onLongPress={() => showOptions(item)}
                        activeOpacity={0.8}
                    >
                        <Image source={{ uri: item.image }} style={styles.cardImage} />
                        <View style={styles.cardContent}>
                            <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                            <Text style={styles.cardCategory}>{item.category}</Text>
                            <Text style={styles.cardAuthor}>{item.author}</Text>
                        </View>
                        <Icon name="chevron-right" size={24} color="#ccc" />
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Icon name="article" size={64} color="#ddd" />
                        <Text style={styles.emptyText}>No se encontraron recursos</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#f8f9fa',
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    subtitleText: {
        fontSize: 16,
        color: '#666',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20,
        marginVertical: 12,
        backgroundColor: '#f1f3f4',
        borderRadius: 25,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    voiceButton: {
        padding: 4,
    },
    filtersContainer: {
        marginVertical: 8,
    },
    filtersScroll: {
        paddingHorizontal: 20,
    },
    filterButton: {
        backgroundColor: '#e9ecef',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
    },
    filterButtonSelected: {
        backgroundColor: '#007bff',
    },
    filterText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    filterTextSelected: {
        color: '#fff',
    },
    listContainer: {
        padding: 20,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        alignItems: 'center',
    },
    cardImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 12,
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    cardCategory: {
        fontSize: 14,
        color: '#007bff',
        marginBottom: 2,
    },
    cardAuthor: {
        fontSize: 12,
        color: '#666',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        marginTop: 16,
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
    },
    errorText: {
        fontSize: 16,
        color: '#666',
        marginBottom: 16,
    },
    retryButton: {
        backgroundColor: '#007bff',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
    bottomBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: '#e9ecef',
        paddingBottom: 20,
    },
});

export default HomeScreen;
