import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref([]);

  function notify({ title, message, type = 'info', duration = 4000 }) {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    const item = { id, title, message, type };
    notifications.value.push(item);

    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
    return id;
  }

  function success(message, title = 'Success') {
    return notify({ title, message, type: 'success' });
  }

  function error(message, title = 'Error') {
    return notify({ title, message, type: 'error', duration: 6000 });
  }

  function warning(message, title = 'Warning') {
    return notify({ title, message, type: 'warning', duration: 5000 });
  }

  function info(message, title = 'Notice') {
    return notify({ title, message, type: 'info' });
  }

  function removeNotification(id) {
    notifications.value = notifications.value.filter(n => n.id !== id);
  }

  return {
    notifications,
    notify,
    success,
    error,
    warning,
    info,
    removeNotification
  };
});
