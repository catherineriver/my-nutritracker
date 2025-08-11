"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

// Компонент настройки целей
function GoalsModal({ 
    isOpen, 
    onClose, 
    goals, 
    onSave,
    profile 
}: {
    isOpen: boolean;
    onClose: () => void;
    goals: any;
    onSave: (goals: any) => void;
    profile: any;
}) {
    const [localGoals, setLocalGoals] = useState(goals);

    useEffect(() => {
        setLocalGoals(goals);
    }, [goals]);

    const calculateBMR = () => {
        if (!profile) return 0;
        
        const weight = parseFloat(profile.last_weight_kg || 0);
        const height = parseFloat(profile.height_cm || 0);
        const age = 25; // По умолчанию, так как возраст не всегда доступен в профиле
        
        // Формула Mifflin-St Jeor (для женщин, можно добавить выбор пола)
        const bmr = 10 * weight + 6.25 * height - 5 * age - 161;
        return Math.round(bmr * 1.6); // Умеренная активность
    };

    const handleAutoCalculate = () => {
        const calculatedCalories = calculateBMR();
        setLocalGoals({
            ...localGoals,
            calories: calculatedCalories
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-96 overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-gray-800">🎯 Настройка целей</h3>
                        <button 
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 text-2xl"
                        >
                            ×
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                🔥 Калории в день
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    value={localGoals.calories || ''}
                                    onChange={(e) => setLocalGoals({
                                        ...localGoals,
                                        calories: parseInt(e.target.value) || 0
                                    })}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="2000"
                                />
                                <button
                                    onClick={handleAutoCalculate}
                                    className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm"
                                    title="Рассчитать автоматически"
                                >
                                    🧮
                                </button>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                Рекомендуемая норма: {calculateBMR()} ккал/день
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                💪 Белки (г)
                            </label>
                            <input
                                type="number"
                                value={localGoals.protein || ''}
                                onChange={(e) => setLocalGoals({
                                    ...localGoals,
                                    protein: parseInt(e.target.value) || 0
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="150"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                🥑 Жиры (г)
                            </label>
                            <input
                                type="number"
                                value={localGoals.fat || ''}
                                onChange={(e) => setLocalGoals({
                                    ...localGoals,
                                    fat: parseInt(e.target.value) || 0
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="70"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                🍞 Углеводы (г)
                            </label>
                            <input
                                type="number"
                                value={localGoals.carbohydrate || ''}
                                onChange={(e) => setLocalGoals({
                                    ...localGoals,
                                    carbohydrate: parseInt(e.target.value) || 0
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="250"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button
                            onClick={() => onSave(localGoals)}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                        >
                            💾 Сохранить
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium"
                        >
                            Отмена
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Home() {
    const [dayData, setDayData] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [goals, setGoals] = useState<any>({ calories: 2000, protein: 150, fat: 70, carbohydrate: 250 });
    const [showGoalsModal, setShowGoalsModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(() => {
        const today = new Date();
        return today.toISOString().slice(0, 10);
    });
    const [auth, setAuth] = useState<string | null>(null);

    useEffect(() => {
        const p = new URLSearchParams(location.search).get("auth");
        if (p) setAuth(p);
        
        // Загружаем сохраненные цели
        const savedGoals = localStorage.getItem('nutrition_goals');
        if (savedGoals) {
            setGoals(JSON.parse(savedGoals));
        }
        
        loadProfile();
        loadDay();
    }, []);

    // Обновляем цели при загрузке профиля, если есть данные из FatSecret
    useEffect(() => {
        if (profile && !localStorage.getItem('nutrition_goals')) {
            const profileGoals = { ...goals };
            
            // Проверяем возможные поля для целей калорий в профиле
            if (profile.daily_calories || profile.calorie_goal || profile.target_calories || profile.goal_calories) {
                profileGoals.calories = parseFloat(
                    profile.daily_calories || 
                    profile.calorie_goal || 
                    profile.target_calories || 
                    profile.goal_calories
                ) || goals.calories;
            }
            
            // Проверяем другие возможные цели
            if (profile.protein_goal) {
                profileGoals.protein = parseFloat(profile.protein_goal) || goals.protein;
            }
            if (profile.fat_goal) {
                profileGoals.fat = parseFloat(profile.fat_goal) || goals.fat;
            }
            if (profile.carb_goal || profile.carbohydrate_goal) {
                profileGoals.carbohydrate = parseFloat(profile.carb_goal || profile.carbohydrate_goal) || goals.carbohydrate;
            }
            
            setGoals(profileGoals);
            console.log('Updated goals from profile:', profileGoals);
        }
    }, [profile]);

    const loadProfile = async () => {
        try {
            const res = await fetch('/api/diary?method=profile');
            if (res.ok) {
                const json = await res.json();
                console.log('Full profile response:', json);
                if (json.profile) {
                    console.log('Profile fields:', Object.keys(json.profile));
                    console.log('Profile data:', json.profile);
                    setProfile(json.profile);
                }
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        }
    };


    const loadDay = async () => {
        const res = await fetch(`/api/diary?date=${selectedDate}`);
        if (!res.ok) {
            // Не показываем alert на главном дашборде
            return;
        }
        const json: any = await res.json();
        console.log('API response:', json);

        // Handle food_entries.get.v2 response structure
        if (json.food_entries?.food_entry) {
            const entries = Array.isArray(json.food_entries.food_entry)
                ? json.food_entries.food_entry
                : [json.food_entries.food_entry];
            // Функция для определения растительных продуктов и их веса
            const getPlantWeight = (entry: any): number => {
                const name = entry.food_entry_name?.toLowerCase() || '';
                const description = entry.food_entry_description?.toLowerCase() || '';
                
                // Ключевые слова для растительных продуктов
                const plantKeywords = [
                    'apple', 'banana', 'orange', 'tomato', 'cucumber', 'carrot', 'onion', 'lettuce', 'spinach',
                    'broccoli', 'pepper', 'potato', 'cabbage', 'grape', 'berry', 'cherry', 'peach', 'pear',
                    'авокадо', 'яблоко', 'банан', 'апельсин', 'помидор', 'огурец', 'морковь', 'лук', 'салат',
                    'шпинат', 'брокколи', 'перец', 'картофель', 'капуста', 'виноград', 'ягода', 'вишня', 
                    'персик', 'груша', 'овощ', 'фрукт', 'зелень', 'vegetable', 'fruit', 'greens'
                ];
                
                const isPlantBased = plantKeywords.some(keyword => 
                    name.includes(keyword) || description.includes(keyword)
                );
                
                if (!isPlantBased) return 0;
                
                // Попытка извлечь вес из описания (например, "100 g Apple" или "1 cup chopped")
                const gramMatch = description.match(/(\d+)\s*г|(\d+)\s*g\b/i);
                if (gramMatch) {
                    return Number(gramMatch[1] || gramMatch[2]);
                }
                
                // Конверсия стандартных порций в граммы (приблизительно)
                const cupMatch = description.match(/(\d*\.?\d+)\s*cup/i);
                if (cupMatch) {
                    const cups = Number(cupMatch[1]);
                    return cups * 100; // примерно 100г на чашку овощей/фруктов
                }
                
                // Если вес не определен, считаем как среднюю порцию (80г)
                return 80;
            };

            // Calculate totals for the day
            const totals = entries.reduce((acc: any, entry: any) => ({
                calories: acc.calories + Number(entry.calories || 0),
                protein: acc.protein + Number(entry.protein || 0),
                fat: acc.fat + Number(entry.fat || 0),
                carbohydrate: acc.carbohydrate + Number(entry.carbohydrate || 0),
                saturated_fat: acc.saturated_fat + Number(entry.saturated_fat || 0),
                cholesterol: acc.cholesterol + Number(entry.cholesterol || 0),
                fiber: acc.fiber + Number(entry.fiber || 0),
                calcium: acc.calcium + Number(entry.calcium || 0),
                // Примечание: Омега-3 не всегда доступна в FatSecret API
                omega3: acc.omega3 + Number(entry.omega3 || 0),
                plant_weight: acc.plant_weight + getPlantWeight(entry), // Вес растительных продуктов в граммах
                avocado: acc.avocado + (entry.food_entry_name?.toLowerCase().includes('avocado') || entry.food_entry_name?.toLowerCase().includes('авокадо') ? 1 : 0)
            }), {
                calories: 0, protein: 0, fat: 0, carbohydrate: 0,
                saturated_fat: 0, cholesterol: 0, fiber: 0, calcium: 0,
                omega3: 0, plant_weight: 0, avocado: 0
            });

            setDayData({
                date: selectedDate,
                ...totals,
                entries: entries.map((entry: any) => ({
                    name: entry.food_entry_name,
                    description: entry.food_entry_description,
                    meal: entry.meal,
                    calories: Number(entry.calories || 0),
                    protein: Number(entry.protein || 0),
                    fat: Number(entry.fat || 0),
                    carbohydrate: Number(entry.carbohydrate || 0),
                }))
            });
        } else {
            setDayData({ 
                date: selectedDate, 
                calories: 0, protein: 0, fat: 0, carbohydrate: 0,
                saturated_fat: 0, cholesterol: 0, fiber: 0, calcium: 0,
                omega3: 0, plant_weight: 0, avocado: 0,
                entries: [] 
            });
        }
    };

    const handleSaveGoals = (newGoals: any) => {
        setGoals(newGoals);
        localStorage.setItem('nutrition_goals', JSON.stringify(newGoals));
        setShowGoalsModal(false);
    };

    const currentWeight = profile?.last_weight_kg ? parseFloat(profile.last_weight_kg) : 0;
    const goalWeight = profile?.goal_weight_kg ? parseFloat(profile.goal_weight_kg) : 0;
    const caloriesProgress = dayData ? (dayData.calories / goals.calories) * 100 : 0;
    

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="container mx-auto px-4 py-8">
                {/* Заголовок дашборда */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">🏠 Дашборд здоровья</h1>
                    <p className="text-gray-600">Ваш персональный трекер питания и веса</p>
                </div>

                {/* Основные карточки */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Калории сегодня */}
                    <Link href="/nutrition" className="block bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-200 hover:scale-[1.02] cursor-pointer">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">🔥 Калории</h3>
                            <div className="flex gap-2">
                                <span className="text-blue-600 hover:text-blue-800 text-sm">📊</span>
                                <button 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setShowGoalsModal(true);
                                    }}
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                >
                                    ⚙️
                                </button>
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-red-600 mb-2">
                            {dayData?.calories || 0}
                        </div>
                        <div className="text-sm text-gray-600 mb-3">
                            из {goals.calories} ккал
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                                className="bg-red-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${Math.min(caloriesProgress, 100)}%` }}
                            ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                            {caloriesProgress.toFixed(0)}% от цели
                        </div>
                    </Link>

                    {/* Текущий вес */}
                    <Link href="/weight" className="block bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-200 hover:scale-[1.02] cursor-pointer">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">⚖️ Текущий вес</h3>
                            <span className="text-purple-600 hover:text-purple-800 text-sm">📊</span>
                        </div>
                        <div className="text-3xl font-bold text-blue-600 mb-2">
                            {currentWeight ? currentWeight.toFixed(1) : '—'}
                        </div>
                        <div className="text-sm text-gray-600 mb-3">
                            цель: {goalWeight || '—'} кг
                        </div>
                        {currentWeight && goalWeight && (
                            <div className="text-xs">
                                <span className={(currentWeight - goalWeight) > 0 ? 'text-red-600' : 'text-green-600'}>
                                    {(currentWeight - goalWeight) > 0 ? '+' : ''}{(currentWeight - goalWeight).toFixed(1)} кг {(currentWeight - goalWeight) > 0 ? 'до цели' : 'от цели'}
                                </span>
                            </div>
                        )}
                    </Link>

                    {/* Белки */}
                    <Link href="/nutrition" className="block bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-200 hover:scale-[1.02] cursor-pointer">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">💪 Белки</h3>
                            <span className="text-blue-600 hover:text-blue-800 text-sm">📊</span>
                        </div>
                        <div className="text-3xl font-bold text-blue-600 mb-2">
                            {dayData?.protein?.toFixed(0) || 0}
                        </div>
                        <div className="text-sm text-gray-600 mb-3">
                            из {goals.protein} г
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${Math.min((dayData?.protein || 0) / goals.protein * 100, 100)}%` }}
                            ></div>
                        </div>
                    </Link>

                    {/* Растительность */}
                    <Link href="/nutrition" className="block bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-200 hover:scale-[1.02] cursor-pointer">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">🌱 Растительность</h3>
                            <span className="text-green-600 hover:text-green-800 text-sm">📊</span>
                        </div>
                        <div className="text-3xl font-bold text-green-600 mb-2">
                            {dayData?.plant_weight || 0}
                        </div>
                        <div className="text-sm text-gray-600 mb-3">
                            из 700 г
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${Math.min((dayData?.plant_weight || 0) / 700 * 100, 100)}%` }}
                            ></div>
                        </div>
                    </Link>
                </div>

                {/* Дополнительные показатели питания */}
                {dayData && (
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">📊 Дополнительные показатели</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Авокадо */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-700">🥑 Авокадо</span>
                                    <span className="text-sm text-gray-600">
                                        {dayData.avocado || 0} / 1 порция
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className="bg-yellow-500 h-3 rounded-full transition-all duration-300"
                                        style={{ width: `${Math.min((dayData.avocado || 0) * 100, 100)}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Кальций */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-700">🦴 Кальций</span>
                                    <span className="text-sm text-gray-600">
                                        {(dayData.calcium || 0).toFixed(0)} / 1300 мг
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                                        style={{ width: `${Math.min((dayData.calcium || 0) / 1300 * 100, 100)}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Пищевые волокна */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-700">🌾 Пищевые волокна</span>
                                    <span className="text-sm text-gray-600">
                                        {(dayData.fiber || 0).toFixed(1)} / 28 г
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className="bg-green-500 h-3 rounded-full transition-all duration-300"
                                        style={{ width: `${Math.min((dayData.fiber || 0) / 28 * 100, 100)}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Насыщенные жиры */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-700">🧈 Насыщенные жиры</span>
                                    <span className="text-sm text-gray-600">
                                        {(dayData.saturated_fat || 0).toFixed(1)} / 20 г
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className={`h-3 rounded-full transition-all duration-300 ${
                                            (dayData.saturated_fat || 0) / 20 <= 0.5 ? 'bg-green-500' : 
                                            (dayData.saturated_fat || 0) / 20 <= 0.8 ? 'bg-yellow-500' : 'bg-red-500'
                                        }`}
                                        style={{ width: `${Math.min((dayData.saturated_fat || 0) / 20 * 100, 100)}%` }}
                                    ></div>
                                </div>
                                {(dayData.saturated_fat || 0) > 20 && (
                                    <div className="text-xs text-orange-600">
                                        Превышение на {((dayData.saturated_fat || 0) - 20).toFixed(1)}г
                                    </div>
                                )}
                            </div>

                            {/* Холестерин */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-700">🍳 Холестерин</span>
                                    <span className="text-sm text-gray-600">
                                        {(dayData.cholesterol || 0).toFixed(0)} / 300 мг
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className={`h-3 rounded-full transition-all duration-300 ${
                                            (dayData.cholesterol || 0) / 300 <= 0.5 ? 'bg-green-500' : 
                                            (dayData.cholesterol || 0) / 300 <= 0.8 ? 'bg-yellow-500' : 'bg-red-500'
                                        }`}
                                        style={{ width: `${Math.min((dayData.cholesterol || 0) / 300 * 100, 100)}%` }}
                                    ></div>
                                </div>
                                {(dayData.cholesterol || 0) > 300 && (
                                    <div className="text-xs text-orange-600">
                                        Превышение на {((dayData.cholesterol || 0) - 300).toFixed(0)}мг
                                    </div>
                                )}
                            </div>

                            {/* Омега-3 */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-700">🐟 Омега-3</span>
                                    <span className="text-sm text-gray-600">
                                        {((dayData.omega3 || 0) * 1000).toFixed(0)} / 250 мг
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className="bg-cyan-500 h-3 rounded-full transition-all duration-300"
                                        style={{ width: `${Math.min((dayData.omega3 || 0) * 1000 / 250 * 100, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="text-center mt-6">
                            <Link 
                                href="/nutrition"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
                            >
                                📊 Подробный анализ питания
                            </Link>
                        </div>
                    </div>
                )}

                {/* Быстрые действия */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">⚡ Быстрые действия</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <a
                            href="/api/fatsecret/auth/start"
                            className="flex flex-col items-center p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
                        >
                            <div className="text-3xl mb-2">🔗</div>
                            <div className="text-sm font-medium text-gray-700 text-center">Подключить FatSecret</div>
                        </a>
                        
                        <Link
                            href="/nutrition"
                            className="flex flex-col items-center p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
                        >
                            <div className="text-3xl mb-2">🍽️</div>
                            <div className="text-sm font-medium text-gray-700 text-center">Дневник питания</div>
                        </Link>
                        
                        <Link
                            href="/weight"
                            className="flex flex-col items-center p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors"
                        >
                            <div className="text-3xl mb-2">⚖️</div>
                            <div className="text-sm font-medium text-gray-700 text-center">История веса</div>
                        </Link>
                        
                        <button
                            onClick={() => setShowGoalsModal(true)}
                            className="flex flex-col items-center p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors"
                        >
                            <div className="text-3xl mb-2">🎯</div>
                            <div className="text-sm font-medium text-gray-700 text-center">Настроить цели</div>
                        </button>
                    </div>
                </div>


                {/* Модальное окно настроек */}
                <GoalsModal
                    isOpen={showGoalsModal}
                    onClose={() => setShowGoalsModal(false)}
                    goals={goals}
                    onSave={handleSaveGoals}
                    profile={profile}
                />
            </div>
        </div>
    );
}
