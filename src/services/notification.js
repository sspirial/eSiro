export class NotificationService {
    static showNotification(message, type = 'success', duration = 3000) {
        // Create a notification element
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background-color: ${this.getBackgroundColor(type)};
            color: white;
            padding: 12px 20px;
            border-radius: var(--border-radius);
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 1000;
            animation: fadeIn 0.3s, fadeOut 0.3s ${(duration - 300) / 1000}s;
            max-width: 300px;
        `;
        
        // Add animation styles
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeOut {
                    from { opacity: 1; transform: translateY(0); }
                    to { opacity: 0; transform: translateY(20px); }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Add notification to body
        document.body.appendChild(notification);
        
        // Remove after specified duration
        setTimeout(() => {
            document.body.removeChild(notification);
        }, duration);
    }
    
    static getBackgroundColor(type) {
        switch(type) {
            case 'success':
                return '#38a169';
            case 'error':
                return '#e53e3e';
            case 'warning':
                return '#dd6b20';
            case 'info':
                return '#3182ce';
            default:
                return '#38a169';
        }
    }

    static success(message, duration = 3000) {
        this.showNotification(message, 'success', duration);
    }
    
    static error(message, duration = 3000) {
        this.showNotification(message, 'error', duration);
    }
    
    static warning(message, duration = 3000) {
        this.showNotification(message, 'warning', duration);
    }
    
    static info(message, duration = 3000) {
        this.showNotification(message, 'info', duration);
    }
}