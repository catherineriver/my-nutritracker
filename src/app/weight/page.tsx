"use client";
import { useState, useEffect } from "react";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import Link from "next/link";

export default function WeightPage() {
    const [weightData, setWeightData] = useState<any[]>([]);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/diary?method=profile');
            if (res.ok) {
                const json = await res.json();
                console.log('Profile data:', json);
                setProfile(json.profile);
                
                // Генерируем примерные данные истории веса (в реальном приложении это будет API)
                generateSampleWeightData(json.profile);
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        }
        setLoading(false);
    };

    const generateSampleWeightData = (profileData: any) => {
        if (!profileData) return;
        
        const currentWeight = parseFloat(profileData.last_weight_kg);
        const goalWeight = parseFloat(profileData.goal_weight_kg);
        
        // Генерируем данные за последние 30 дней
        const data = [];
        const today = new Date();
        
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            
            // Добавляем небольшие случайные колебания веса
            const variation = (Math.random() - 0.5) * 2; // ±1 кг
            const weight = currentWeight + variation;
            
            data.push({
                date: date.toISOString().split('T')[0],
                dateFormatted: date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
                weight: Math.round(weight * 10) / 10,
                goal: goalWeight
            });
        }
        
        setWeightData(data);
    };

    const formatWeight = (weight: number) => `${weight} кг`;

    const currentWeight = profile?.last_weight_kg ? parseFloat(profile.last_weight_kg) : 0;
    const goalWeight = profile?.goal_weight_kg ? parseFloat(profile.goal_weight_kg) : 0;
    const weightDiff = currentWeight - goalWeight;
    const height = profile?.height_cm ? parseFloat(profile.height_cm) : 0;
    const bmi = height > 0 ? (currentWeight / Math.pow(height / 100, 2)) : 0;

    const getBMICategory = (bmi: number) => {
        if (bmi < 18.5) return { text: 'Недостаток веса', color: 'text-blue-600' };
        if (bmi < 25) return { text: 'Нормальный вес', color: 'text-green-600' };
        if (bmi < 30) return { text: 'Избыточный вес', color: 'text-yellow-600' };
        return { text: 'Ожирение', color: 'text-red-600' };
    };

    const bmiCategory = getBMICategory(bmi);

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
            <div className="container mx-auto px-4 py-8">
                {/* Заголовок и навигация */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">⚖️ История веса</h1>
                    <p className="text-gray-600">Отслеживайте изменения веса во времени</p>
                    <div className="mt-4">
                        <Link 
                            href="/" 
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            ← Назад к питанию
                        </Link>
                    </div>
                </div>

                {loading && (
                    <div className="text-center py-8">
                        <div className="text-2xl">⏳ Загрузка данных...</div>
                    </div>
                )}

                {profile && (
                    <div className="space-y-6">
                        {/* Текущие показатели */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">📊 Текущие показатели</h2>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl text-center">
                                    <div className="text-3xl font-bold text-blue-600 mb-1">{currentWeight}</div>
                                    <div className="text-sm font-medium text-blue-700">⚖️ Текущий вес (кг)</div>
                                </div>
                                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl text-center">
                                    <div className="text-3xl font-bold text-green-600 mb-1">{goalWeight}</div>
                                    <div className="text-sm font-medium text-green-700">🎯 Целевой вес (кг)</div>
                                </div>
                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl text-center">
                                    <div className="text-3xl font-bold text-purple-600 mb-1">{height}</div>
                                    <div className="text-sm font-medium text-purple-700">📏 Рост (см)</div>
                                </div>
                                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl text-center">
                                    <div className="text-3xl font-bold text-orange-600 mb-1">{bmi.toFixed(1)}</div>
                                    <div className="text-sm font-medium text-orange-700">📈 ИМТ</div>
                                    <div className={`text-xs ${bmiCategory.color} mt-1`}>{bmiCategory.text}</div>
                                </div>
                            </div>
                            
                            {/* Прогресс до цели */}
                            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                                <div className="text-center">
                                    <div className="text-lg font-semibold text-gray-800 mb-2">
                                        Прогресс до цели: 
                                        <span className={weightDiff > 0 ? 'text-red-600' : 'text-green-600'}>
                                            {weightDiff > 0 ? '+' : ''}{weightDiff.toFixed(1)} кг
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {weightDiff > 0 ? 'Осталось сбросить' : weightDiff < 0 ? 'Цель превышена на' : 'Цель достигнута!'}
                                        {weightDiff !== 0 && ` ${Math.abs(weightDiff).toFixed(1)} кг`}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* График веса */}
                        {weightData.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">📈 Динамика веса за 30 дней</h2>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={weightData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="dateFormatted" />
                                            <YAxis 
                                                domain={['dataMin - 2', 'dataMax + 2']}
                                                tickFormatter={formatWeight}
                                            />
                                            <Tooltip formatter={(value: number) => [formatWeight(value)]} />
                                            <Legend />
                                            <Line 
                                                type="monotone" 
                                                dataKey="weight" 
                                                stroke="#3B82F6" 
                                                strokeWidth={3}
                                                name="Вес" 
                                                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                                            />
                                            <Line 
                                                type="monotone" 
                                                dataKey="goal" 
                                                stroke="#10B981" 
                                                strokeWidth={2}
                                                strokeDasharray="5 5"
                                                name="Цель"
                                                dot={false}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {/* Статистика */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">📋 Дополнительная информация</h2>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="font-medium text-gray-700">Последнее взвешивание:</span>
                                    <span className="text-gray-600">
                                        {profile.last_weight_date_int ? 
                                            new Date(profile.last_weight_date_int * 86400000).toLocaleDateString('ru-RU') : 
                                            'Не указано'
                                        }
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="font-medium text-gray-700">Единицы измерения:</span>
                                    <span className="text-gray-600">{profile.weight_measure || 'Кг'}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="font-medium text-gray-700">Комментарий:</span>
                                    <span className="text-gray-600">{profile.last_weight_comment || 'Нет комментария'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {!loading && !profile && (
                    <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                        <div className="text-6xl mb-4">🔒</div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">Необходима авторизация</h3>
                        <p className="text-gray-500 mb-4">Подключите FatSecret для просмотра данных о весе</p>
                        <Link 
                            href="/api/fatsecret/auth/start"
                            className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                        >
                            🔗 Подключить FatSecret
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}