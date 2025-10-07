// YouTube API Configuration
const YOUTUBE_API_KEYS = [
    'AIzaSyBRB8bXp-UFdoNFhTqh9n2hWdthpm--gXk',
    'AIzaSyBi9XME_hKIdmFyKT2sX9Qzq-YW4uwaPGc',
    'AIzaSyAaT_fn6jzNLUjee7n7hQIJAdjvQiKHSTU',
    'AIzaSyD0ZhRR292c95yMkSx-ZPWtsGL-FkwEH2Y',
    'AIzaSyB0z2xXRZX5dh8tMw3PZh9oqfSGgwiWx-U',
    'AIzaSyByQDjEkBdrbJqi3O35UUyOEgGrEqImoXU',
    'AIzaSyA4iPnRBOkNcVnG6i2Osdplr-6KOOidJso',
    'AIzaSyBp1KT6xYFkP5pkq5vldiS5M-275Jyhk1o',
    'AIzaSyBSUK5rvC9NUIfGg7Ol-c5fByZDLxkV4MA',
    'AIzaSyBBN1oCDauSMk_QdRMKfriv3KsP--jGgIE',
    'AIzaSyBzD1zDrYqVl-RH3vTwfmXDkGqjdH3Zlr0',
    'AIzaSyDzoPLaJUFjAB0kSSPRGQfUwiMlywWIO4I',
    'AIzaSyCSMlS_3EpigNZYoyxU7L6mnLPfpFbJ6vA',
    'AIzaSyAvw2xoR4eaQOzsyEBjthCQSFo5x60jNV8',
    'AIzaSyDOd-fwjmHblCWYZWFtu6V0QNGHNBMb0Tw',
    'AIzaSyDKye_UeYzygyeo7H35-bKrM3wgCXb3wPs',
    'AIzaSyBg_4VpFdldAYh4eyEOdJKibMS1HeM7wZQ',
    'AIzaSyDIhTB0yw5Qkbdp3Wpu1n0djdJQXvELGlc',
    'AIzaSyCCgPxoUbeo3yiKo-2i8FTDyMO2MEhVS5Q',
    'AIzaSyDc-OSidO2qU5QAiXi7Ad1qASH3rPGZB3w',
    'AIzaSyA1KrCE-nCrnw_6lCrm0WK3n5iE5LlOpoQ',
    'AIzaSyCHby00rzviTneGRsYoaXPDSTNZ5mByYRs',
    'AIzaSyANh88_Ut5RXlGkw8TgbpgCcHHXTPqgN74',
    'AIzaSyCjgMk3Q_D-545I-slLdpOkcsi5rhUbwLg',
    'AIzaSyBRGmaiOgS9Ma0d6X6GqDxLbfJLFolkgCs',
    'AIzaSyBwQVmWudUVfBSA-Xd0Py3dWaBdubjEKDk',
    'AIzaSyAohDXe4nuKALD07eQGXG7WiCPC9u4j-No',
    'AIzaSyDEDWKHYGpjRJHM_xvgwzqUgCUgTI4BP24'
];

let currentKeyIndex = 0;
let lastUsedKeyIndex = -1;
let lastKeyUsageTime = 0;
const MIN_KEY_USAGE_INTERVAL = 200; // Reduced to 200ms for better performance
let keyUsageStats = new Map(); // Track usage per key
let failedKeys = new Set(); // Track failed keys

export const YOUTUBE_CONFIG = {
    async getAPIKey() {
        const now = Date.now();
        
        // Skip failed keys
        while (failedKeys.has(currentKeyIndex)) {
            currentKeyIndex = (currentKeyIndex + 1) % YOUTUBE_API_KEYS.length;
            if (currentKeyIndex === lastUsedKeyIndex) {
                // All keys failed, reset failed keys and try again
                console.warn('All keys have failed, resetting failed keys list');
                failedKeys.clear();
                break;
            }
        }
        
        // If we've used all keys, start over
        if (currentKeyIndex === lastUsedKeyIndex) {
            currentKeyIndex = 0;
        }
        
        // If we're using the same key too quickly, wait
        if (now - lastKeyUsageTime < MIN_KEY_USAGE_INTERVAL) {
            await new Promise(resolve => setTimeout(resolve, MIN_KEY_USAGE_INTERVAL));
        }
        
        const key = YOUTUBE_API_KEYS[currentKeyIndex];
        lastUsedKeyIndex = currentKeyIndex;
        lastKeyUsageTime = now;
        
        // Track usage stats
        const usageCount = keyUsageStats.get(currentKeyIndex) || 0;
        keyUsageStats.set(currentKeyIndex, usageCount + 1);
        
        // Log the key rotation with usage stats
        console.log(`Using API key index: ${currentKeyIndex} (Total keys: ${YOUTUBE_API_KEYS.length}, Usage: ${usageCount + 1})`);
        
        // Rotate to next key
        currentKeyIndex = (currentKeyIndex + 1) % YOUTUBE_API_KEYS.length;
        return key;
    },
    
    rotateKey() {
        // Force rotation to next key
        currentKeyIndex = (currentKeyIndex + 1) % YOUTUBE_API_KEYS.length;
        console.log(`Manually rotating to API key index: ${currentKeyIndex}`);
        return YOUTUBE_API_KEYS[currentKeyIndex];
    },
    
    // Get total number of available keys
    getKeyCount() {
        return YOUTUBE_API_KEYS.length;
    },
    
    // Get current key index (for debugging)
    getCurrentKeyIndex() {
        return currentKeyIndex;
    },
    
    // Mark a key as failed (for quota exceeded, etc.)
    markKeyAsFailed(keyIndex) {
        failedKeys.add(keyIndex);
        console.log(`Marked key ${keyIndex} as failed. Failed keys: ${Array.from(failedKeys).join(', ')}`);
    },
    
    // Get usage statistics
    getUsageStats() {
        const stats = {};
        for (let i = 0; i < YOUTUBE_API_KEYS.length; i++) {
            stats[i] = {
                usageCount: keyUsageStats.get(i) || 0,
                isFailed: failedKeys.has(i)
            };
        }
        return stats;
    },
    
    // Reset failed keys (useful for daily reset)
    resetFailedKeys() {
        failedKeys.clear();
        console.log('Reset all failed keys');
    },
    
    // Get available keys count
    getAvailableKeysCount() {
        return YOUTUBE_API_KEYS.length - failedKeys.size;
    }
};
