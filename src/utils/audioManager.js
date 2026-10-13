import { assetPath } from './assetPath.js';

// Audio Manager: Pre-carga y reproducción con latencia cero de efectos de sonido de Outlast

const SOUND_FILES = {
  ambience: assetPath('assets/sounds/ambiencesound.wav'),
  camera_pickup: assetPath('assets/sounds/camera_pickup.wav'),
  camera_turn: assetPath('assets/sounds/camera_turn.wav'),
  nightvision_on: assetPath('assets/sounds/nightvision_on.wav'),
  nightvision_off: assetPath('assets/sounds/nightvision_off.wav'),
  battery_reload: assetPath('assets/sounds/battery_reload.wav'),
  low_battery: assetPath('assets/sounds/low_battery.wav'),
  terminal_beep: assetPath('assets/sounds/terminal_beep.wav'),
  key1: assetPath('assets/sounds/Key1.wav'),
  key2: assetPath('assets/sounds/key2.wav'),
  key3: assetPath('assets/sounds/key3.wav'),
  space: assetPath('assets/sounds/Space.wav'),
  xp_click: assetPath('assets/sounds/xp_click.mp3'),
  xp_startup: assetPath('assets/sounds/xp_startup.mp3'),
};

// Caché de elementos Audio pre-cargados
const audioPool = {};
let isAudioPreloaded = false;

export const preloadAllSounds = () => {
  if (typeof window === 'undefined' || isAudioPreloaded) return;
  isAudioPreloaded = true;

  Object.entries(SOUND_FILES).forEach(([key, src]) => {
    try {
      const audio = new Audio(src);
      audio.preload = 'auto';
      // Pre-cargar en memoria sin reproducir
      audio.load();
      audioPool[key] = audio;
    } catch (e) {
      // Ignorar errores de carga inicial silenciosamente
    }
  });
};

// Reproducir un sonido con latencia cero reutilizando instancias de audio
export const playSound = (name, volume = 0.7) => {
  if (typeof window === 'undefined') return;

  try {
    const src = SOUND_FILES[name];
    if (!src) return;

    // Si ya existe en la caché y no está reproduciéndose, rebobinarlo
    let audio = audioPool[name];
    if (audio) {
      // Si ya está sonando, clonar un nodo rápido para permitir disparos múltiples
      if (!audio.paused && audio.currentTime > 0) {
        const clone = audio.cloneNode();
        clone.volume = Math.max(0, Math.min(1, volume));
        clone.play().catch(() => {});
        return;
      }
      audio.currentTime = 0;
      audio.volume = Math.max(0, Math.min(1, volume));
      audio.play().catch(() => {});
    } else {
      const newAudio = new Audio(src);
      newAudio.volume = Math.max(0, Math.min(1, volume));
      audioPool[name] = newAudio;
      newAudio.play().catch(() => {});
    }
  } catch (err) {}
};

// Disparador de teclas con variación analógica aleatoria
export const playKeyboardSound = (isSpace = false) => {
  if (isSpace) {
    playSound('space', 0.55);
  } else {
    const keys = ['key1', 'key2', 'key3'];
    const chosen = keys[Math.floor(Math.random() * keys.length)];
    playSound(chosen, 0.45);
  }
};

// Iniciar pre-carga en cliente inmediatamente
if (typeof window !== 'undefined') {
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    preloadAllSounds();
  } else {
    window.addEventListener('DOMContentLoaded', preloadAllSounds, { once: true });
  }
}
