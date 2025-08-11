"use client";
import { useEffect, useState } from "react";

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const [loading, setLoading] = useState(0);
  const [showLogo, setShowLogo] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Показываем лого через короткую задержку
    const logoTimer = setTimeout(() => {
      setShowLogo(true);
    }, 300);

    // Анимация загрузки
    const interval = setInterval(() => {
      setLoading(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          // Начинаем исчезновение
          setTimeout(() => {
            setFadeOut(true);
          }, 500);
          // Вызываем callback после анимации исчезновения
          setTimeout(() => {
            onFinish();
          }, 1000);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => {
      clearTimeout(logoTimer);
      clearInterval(interval);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center z-50 transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="text-center">
        {/* Логотип и название */}
        <div
          className={`transform transition-all duration-700 ${
            showLogo ? 'scale-100 opacity-100 translate-y-0' : 'scale-75 opacity-0 translate-y-4'
          }`}
        >
          {/* Иконка приложения */}
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-300">
            <div className="text-4xl animate-pulse">🏠</div>
          </div>

          {/* Название приложения */}
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            FS Tracker
          </h1>
          <p className="text-lg text-gray-600 mb-8 font-light">
            Дашборд здоровья
          </p>
        </div>

        {/* Прогресс бар загрузки */}
        <div
          className={`w-64 mx-auto transition-all duration-700 delay-500 ${
            showLogo ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4 overflow-hidden">
            <div
              className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-100 ease-out"
              style={{ width: `${loading}%` }}
            ></div>
          </div>
          
          {/* Текст загрузки */}
          <div className="text-sm text-gray-500">
            {loading < 30 && "Инициализация..."}
            {loading >= 30 && loading < 60 && "Загружаем данные..."}
            {loading >= 60 && loading < 90 && "Подготавливаем интерфейс..."}
            {loading >= 90 && "Почти готово..."}
          </div>
          
          {/* Процент */}
          <div className="text-xs text-gray-400 mt-2 font-mono">
            {Math.round(loading)}%
          </div>
        </div>

        {/* Анимированные частицы */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-2 h-2 bg-blue-300 rounded-full opacity-60 animate-pulse"></div>
          <div className="absolute top-32 right-32 w-1 h-1 bg-indigo-400 rounded-full opacity-40 animate-pulse" style={{animationDelay: '0.5s'}}></div>
          <div className="absolute bottom-40 left-40 w-1.5 h-1.5 bg-blue-400 rounded-full opacity-50 animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-20 right-20 w-1 h-1 bg-indigo-300 rounded-full opacity-30 animate-pulse" style={{animationDelay: '1.5s'}}></div>
          <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-blue-200 rounded-full opacity-50 animate-bounce" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-3/4 right-1/4 w-1.5 h-1.5 bg-indigo-200 rounded-full opacity-40 animate-bounce" style={{animationDelay: '2.5s'}}></div>
          
          {/* Плавающие иконки */}
          <div className="absolute top-16 right-16 text-2xl opacity-20 animate-bounce" style={{animationDelay: '1s'}}>🍎</div>
          <div className="absolute bottom-32 left-16 text-xl opacity-20 animate-bounce" style={{animationDelay: '1.8s'}}>⚖️</div>
          <div className="absolute top-1/3 left-8 text-lg opacity-15 animate-bounce" style={{animationDelay: '2.3s'}}>🏃‍♀️</div>
          <div className="absolute bottom-1/3 right-8 text-lg opacity-15 animate-bounce" style={{animationDelay: '0.8s'}}>💪</div>
        </div>
      </div>

      {/* Версия приложения в углу */}
      <div className="absolute bottom-6 right-6 text-xs text-gray-400 font-mono">
        v1.0.0
      </div>
    </div>
  );
}