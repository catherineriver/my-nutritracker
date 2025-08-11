"use client";
import { useState, useEffect } from "react";

// Компонент прогресс-бара
function ProgressBar({
    label,
    current,
    target,
    unit = "",
    isReverse = false // для показателей, где меньше = лучше (холестерин, насыщенные жиры)
}: {
    label: string;
    current: number;
    target: number;
    unit?: string;
    color?: string;
    isReverse?: boolean;
}) {
    const percentage = Math.min((current / target) * 100, 100);
    const isOver = current > target;

    const getBarColor = () => {
        if (isReverse) {
            // Для "плохих" показателей: зеленый когда мало, красный когда много
            if (percentage <= 50) return "bg-green-500";
            if (percentage <= 80) return "bg-yellow-500";
            return "bg-red-500";
        } else {
            // Для "хороших" показателей: красный когда мало, зеленый когда достаточно
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

export default function Home() {
    const [dayData, setDayData] = useState<any>(null);
    const [selectedDate, setSelectedDate] = useState(() => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return yesterday.toISOString().slice(0, 10);
    });
    const [auth, setAuth] = useState<string | null>(null);

    useEffect(() => {
        const p = new URLSearchParams(location.search).get("auth");
        if (p) setAuth(p);
    }, []);

    const loadDay = async () => {
        const res = await fetch(`/api/diary?date=${selectedDate}`);
        if (!res.ok) {
            const error = await res.text();
            alert("Auth required or error: " + error);
            return;
        }
        const json: any = await res.json();
        console.log('API response:', json);

        // Handle food_entries.get.v2 response structure
        if (json.food_entries?.food_entry) {
            const entries = Array.isArray(json.food_entries.food_entry)
                ? json.food_entries.food_entry
                : [json.food_entries.food_entry];
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
                // Примечание: Омега-3 и растительность не всегда доступны в FatSecret API
                omega3: acc.omega3 + Number(entry.omega3 || 0),
                plant_based: acc.plant_based + (entry.plant_based ? 1 : 0),
                avocado: acc.avocado + (entry.food_entry_name?.toLowerCase().includes('avocado') || entry.food_entry_name?.toLowerCase().includes('авокадо') ? 1 : 0)
            }), {
                calories: 0, protein: 0, fat: 0, carbohydrate: 0,
                saturated_fat: 0, cholesterol: 0, fiber: 0, calcium: 0,
                omega3: 0, plant_based: 0, avocado: 0
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
            setDayData({ date: selectedDate, calories: 0, protein: 0, fat: 0, carbohydrate: 0, entries: [] });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="container mx-auto px-4 py-8">

                {/* Панель управления */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                        <div className="flex items-center gap-3">
                            <label className="text-sm font-medium text-gray-700">📅 Выберите дату:</label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                max={new Date().toISOString().slice(0, 10)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={loadDay}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                📊 Загрузить день
                            </button>
                            <a
                                href="/api/fatsecret/auth/start"
                                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                            >
                                🔗 Подключить FatSecret
                            </a>
                        </div>
                    </div>

                </div>

                {dayData && (
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
                                    label="🌱 Растительность (порции)"
                                    current={dayData.plant_based || 0}
                                    target={5}
                                    unit=" порций"
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
                                    target={1000}
                                    unit="мг"
                                />
                                <ProgressBar
                                    label="🐟 Омега-3"
                                    current={dayData.omega3 || 0}
                                    target={2}
                                    unit="г"
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
                                    target={25}
                                    unit="г"
                                />
                            </div>
                        </div>
                    </div>

                        {dayData.entries.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">🍽️ Дневник питания</h2>

                                {/* Группируем по приемам пищи */}
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
            </div>
        </div>
    );
}
