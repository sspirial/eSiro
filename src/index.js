import { ThemeService } from './services/theme.js';
import { RouterService } from './services/router.js';
import { initializeDatabase } from './db.js';

async function init() {
    try {
        await initializeDatabase();
        ThemeService.init();
        RouterService.init();
    } catch (error) {
        console.error('Initialization error:', error);
    }
}

init();
