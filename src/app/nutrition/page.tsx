"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

// Компонент прогресс-бара
function ProgressBar({
    label,
    current,
    target,
    unit = "",
    isReverse = false
}: {
    label: string;
    current: number;
    target: number;
    unit?: string;
    isReverse?: boolean;
}) {
    const percentage = Math.min((current / target) * 100, 100);
    const isOver = current > target;

    const getBarColor = () => {
        if (isReverse) {
            if (percentage <= 50) return "bg-green-500";
            if (percentage <= 80) return "bg-yellow-500";
            return "bg-red-500";
        } else {
            if (percentage <= 30) return "bg-red-500";
            if (percentage <= 70) return "bg-yellow-500";
            return "bg-green-500";
        }
    };

    return (
        <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">{label}</span>
                <span className="text-sm text-gray-600">
                    {current.toFixed(1)}{unit} / {target}{unit}
                </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                    className={`h-3 rounded-full transition-all duration-300 ${getBarColor()}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                ></div>
            </div>
            {isOver && (
                <div className="text-xs text-orange-600 mt-1">
                    Превышение на {(current - target).toFixed(1)}{unit}
                </div>
            )}
        </div>
    );
}

export default function NutritionPage() {
    const [dayData, setDayData] = useState<any>(null);
    const [selectedDate, setSelectedDate] = useState(() => {
        const today = new Date();
        return today.toISOString().slice(0, 10);
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadDay();
    }, [selectedDate]);

    const loadDay = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/diary?date=${selectedDate}`);
            if (!res.ok) {
                console.error("API error:", await res.text());
                return;
            }
            const json: any = await res.json();
            console.log('API response:', json);

            if (json.food_entries?.food_entry) {
                const entries = Array.isArray(json.food_entries.food_entry)
                    ? json.food_entries.food_entry
                    : [json.food_entries.food_entry];
                
                const getPlantWeight = (entry: any): number => {
                    const name = entry.food_entry_name?.toLowerCase() || '';
                    const description = entry.food_entry_description?.toLowerCase() || '';
                    
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
                    
                    const gramMatch = description.match(/(\d+)\s*г|(\d+)\s*g\b/i);
                    if (gramMatch) {
                        return Number(gramMatch[1] || gramMatch[2]);
                    }
                    
                    const cupMatch = description.match(/(\d*\.?\d+)\s*cup/i);
                    if (cupMatch) {
                        const cups = Number(cupMatch[1]);
                        return cups * 100;
                    }
                    
                    return 80;
                };

                const totals = entries.reduce((acc: any, entry: any) => ({
                    calories: acc.calories + Number(entry.calories || 0),
                    protein: acc.protein + Number(entry.protein || 0),
                    fat: acc.fat + Number(entry.fat || 0),
                    carbohydrate: acc.carbohydrate + Number(entry.carbohydrate || 0),
                    saturated_fat: acc.saturated_fat + Number(entry.saturated_fat || 0),
                    cholesterol: acc.cholesterol + Number(entry.cholesterol || 0),
                    fiber: acc.fiber + Number(entry.fiber || 0),
                    calcium: acc.calcium + Number(entry.calcium || 0),
                    omega3: acc.omega3 + Number(entry.omega3 || 0),
                    plant_weight: acc.plant_weight + getPlantWeight(entry),
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
        } catch (error) {
            console.error("Error loading day data:", error);
        } finally {
            setLoading(false);
        }
    };

    // Функции для работы с датами
    const getDateString = (daysAgo: number) => {
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        return date.toISOString().slice(0, 10);
    };

    const getDateLabel = (daysAgo: number) => {
        const labels = {
            0: 'Сегодня',
            1: 'Вчера',
            2: 'Позавчера'
        };
        return labels[daysAgo as keyof typeof labels] || '';
    };

    const quickDates = [
        { daysAgo: 2, label: 'Позавчера', emoji: '📅' },
        { daysAgo: 1, label: 'Вчера', emoji: '🕐' },
        { daysAgo: 0, label: 'Сегодня', emoji: '⭐' }
    ];

    const isToday = selectedDate === getDateString(0);
    const isYesterday = selectedDate === getDateString(1);
    const isDayBeforeYesterday = selectedDate === getDateString(2);

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
            <div className="container mx-auto px-4 py-8">
                {/* Заголовок */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">🍽️ Дневник питания</h1>
                    <p className="text-gray-600">Детальный анализ питания по дням</p>
                    <div className="mt-4">
                        <Link 
                            href="/" 
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            ← Назад к дашборду
                        </Link>
                    </div>
                </div>

                {/* Выбор даты */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                    <div className="flex flex-col space-y-4">
                        {/* Быстрые кнопки дат */}
                        <div className="flex justify-center">
                            <div className="flex bg-gray-100 rounded-xl p-1">
                                {quickDates.map(({ daysAgo, label, emoji }) => {
                                    const dateString = getDateString(daysAgo);
                                    const isActive = selectedDate === dateString;
                                    
                                    return (
                                        <button
                                            key={daysAgo}
                                            onClick={() => setSelectedDate(dateString)}
                                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 min-w-[100px] ${
                                                isActive
                                                    ? 'bg-white text-green-700 shadow-md'
                                                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                                            }`}
                                        >
                                            <div className="flex flex-col items-center">
                                                <span className="text-lg">{emoji}</span>
                                                <span className="text-sm">{label}</span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        
                        {/* Дополнительные опции */}
                        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center border-t pt-4">
                            <div className="flex items-center gap-3">
                                <label className="text-sm font-medium text-gray-700">📅 Другая дата:</label>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    max={new Date().toISOString().slice(0, 10)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                                />
                            </div>
                            
                            <div className="flex gap-3">
                                <a
                                    href="/api/fatsecret/auth/start"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                                >
                                    🔗 Подключить FatSecret
                                </a>
                            </div>
                        </div>
                        
                        {/* Показываем выбранную дату */}
                        <div className="text-center">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-800 rounded-lg">
                                <span className="text-lg">📊</span>
                                <span className="font-medium">
                                    {isToday && 'Сегодня'}
                                    {isYesterday && 'Вчера'} 
                                    {isDayBeforeYesterday && 'Позавчера'}
                                    {!isToday && !isYesterday && !isDayBeforeYesterday && 
                                        new Date(selectedDate).toLocaleDateString('ru-RU', { 
                                            weekday: 'long', 
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric' 
                                        })
                                    }
                                </span>
                                {loading && <span className="animate-spin">⏳</span>}
                            </div>
                        </div>
                    </div>
                </div>

                {loading && (
                    <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                        <div className="animate-spin text-4xl mb-4">⏳</div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Загружаем данные</h3>
                        <p className="text-gray-500">Получаем информацию о питании...</p>
                    </div>
                )}

                {!loading && dayData && (
                    <div className="space-y-6">
                        {/* Основные показатели */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                                📈 Итоги дня: {new Date(dayData.date).toLocaleDateString('ru-RU')}
                            </h2>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-xl text-center">
                                    <div className="text-3xl font-bold text-red-600 mb-1">{dayData.calories}</div>
                                    <div className="text-sm font-medium text-red-700">🔥 Калории</div>
                                </div>
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl text-center">
                                    <div className="text-3xl font-bold text-blue-600 mb-1">{dayData.protein.toFixed(1)}</div>
                                    <div className="text-sm font-medium text-blue-700">💪 Белки (г)</div>
                                </div>
                                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl text-center">
                                    <div className="text-3xl font-bold text-yellow-600 mb-1">{dayData.fat.toFixed(1)}</div>
                                    <div className="text-sm font-medium text-yellow-700">🥑 Жиры (г)</div>
                                </div>
                                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl text-center">
                                    <div className="text-3xl font-bold text-green-600 mb-1">{dayData.carbohydrate.toFixed(1)}</div>
                                    <div className="text-sm font-medium text-green-700">🍞 Углеводы (г)</div>
                                </div>
                            </div>
                        </div>

                        {/* Прогресс-бары дополнительных показателей */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">🎯 Дополнительные показатели</h2>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div>
                                    <ProgressBar
                                        label="🌱 Свежие овощи и фрукты"
                                        current={dayData.plant_weight || 0}
                                        target={700}
                                        unit="г"
                                    />
                                    <ProgressBar
                                        label="🥑 Авокадо (порции)"
                                        current={dayData.avocado || 0}
                                        target={1}
                                        unit=" порций"
                                    />
                                    <ProgressBar
                                        label="🦴 Кальций"
                                        current={dayData.calcium || 0}
                                        target={1300}
                                        unit="мг"
                                    />
                                    <ProgressBar
                                        label="🐟 Омега-3"
                                        current={(dayData.omega3 || 0) * 1000}
                                        target={250}
                                        unit="мг"
                                    />
                                </div>
                                <div>
                                    <ProgressBar
                                        label="🧈 Насыщенные жиры"
                                        current={dayData.saturated_fat || 0}
                                        target={20}
                                        unit="г"
                                        isReverse={true}
                                    />
                                    <ProgressBar
                                        label="🍳 Холестерин"
                                        current={dayData.cholesterol || 0}
                                        target={300}
                                        unit="мг"
                                        isReverse={true}
                                    />
                                    <ProgressBar
                                        label="🌾 Пищевые волокна"
                                        current={dayData.fiber || 0}
                                        target={28}
                                        unit="г"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Дневник питания */}
                        {dayData.entries.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">🍽️ Приемы пищи</h2>

                                {['breakfast', 'lunch', 'dinner', 'other'].map(mealType => {
                                    const mealEntries = dayData.entries.filter((entry: any) =>
                                        entry.meal?.toLowerCase() === mealType
                                    );

                                    if (mealEntries.length === 0) return null;

                                    const mealLabels = {
                                        breakfast: { name: 'Завтрак', icon: '🌅', color: 'from-orange-50 to-orange-100 border-orange-200' },
                                        lunch: { name: 'Обед', icon: '☀️', color: 'from-yellow-50 to-yellow-100 border-yellow-200' },
                                        dinner: { name: 'Ужин', icon: '🌙', color: 'from-indigo-50 to-indigo-100 border-indigo-200' },
                                        other: { name: 'Перекус', icon: '🍎', color: 'from-green-50 to-green-100 border-green-200' }
                                    };

                                    const mealInfo = mealLabels[mealType as keyof typeof mealLabels];
                                    const mealTotal = mealEntries.reduce((sum: number, entry: any) => sum + entry.calories, 0);

                                    return (
                                        <div key={mealType} className="mb-6 last:mb-0">
                                            <div className={`bg-gradient-to-r ${mealInfo.color} border-2 rounded-xl p-4 mb-3`}>
                                                <div className="flex justify-between items-center">
                                                    <h3 className="text-lg font-bold text-gray-800">
                                                        {mealInfo.icon} {mealInfo.name}
                                                    </h3>
                                                    <div className="text-sm font-semibold text-gray-700">
                                                        {mealTotal} ккал
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-3 pl-2">
                                                {mealEntries.map((entry: any, i: number) => (
                                                    <div key={i} className="bg-gray-50 rounded-lg p-4 border-l-4 border-gray-300">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <h4 className="font-semibold text-gray-800">{entry.name}</h4>
                                                            <span className="bg-white px-3 py-1 rounded-full text-sm font-medium text-gray-700 shadow-sm">
                                                                {entry.calories} ккал
                                                            </span>
                                                        </div>

                                                        <p className="text-sm text-gray-600 mb-2">{entry.description}</p>

                                                        <div className="grid grid-cols-3 gap-3 text-xs">
                                                            <div className="bg-blue-50 px-2 py-1 rounded text-center">
                                                                <span className="text-blue-700 font-medium">💪 {entry.protein}г</span>
                                                            </div>
                                                            <div className="bg-yellow-50 px-2 py-1 rounded text-center">
                                                                <span className="text-yellow-700 font-medium">🥑 {entry.fat}г</span>
                                                            </div>
                                                            <div className="bg-green-50 px-2 py-1 rounded text-center">
                                                                <span className="text-green-700 font-medium">🍞 {entry.carbohydrate}г</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {dayData.entries.length === 0 && (
                            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                                <div className="text-6xl mb-4">🤷‍♀️</div>
                                <h3 className="text-xl font-semibold text-gray-700 mb-2">Нет записей за выбранный день</h3>
                                <p className="text-gray-500">Попробуйте выбрать другую дату или добавить записи в FatSecret</p>
                            </div>
                        )}
                    </div>
                )}

                {!loading && !dayData && (
                    <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                        <div className="text-6xl mb-4">🔒</div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">Необходима авторизация</h3>
                        <p className="text-gray-500 mb-4">Подключите FatSecret для просмотра данных о питании</p>
                        <a
                            href="/api/fatsecret/auth/start"
                            className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                        >
                            🔗 Подключить FatSecret
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}