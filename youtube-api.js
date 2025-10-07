// YouTube API Key Rotation System

class YouTubeAPIKeyRotator {
    constructor() {
        this.apiKeys = [];
        this.currentKeyIndex = 0;
        this.keyUsage = new Map(); // Track API calls per key
        this.quotaLimit = 10000; // Default daily quota limit per key
    }

    // Add a new API key to the rotation
    addAPIKey(key) {
        if (typeof key !== 'string' || !key.trim()) {
            throw new Error('Invalid API key');
        }
        if (this.apiKeys.includes(key)) {
            throw new Error('API key already exists');
        }
        this.apiKeys.push(key);
        this.keyUsage.set(key, 0);
    }

    // Get the current active API key
    getCurrentKey() {
        if (this.apiKeys.length === 0) {
            throw new Error('No API keys available');
        }
        return this.apiKeys[this.currentKeyIndex];
    }

    // Rotate to the next available API key
    rotateKey() {
        if (this.apiKeys.length === 0) {
            throw new Error('No API keys available');
        }
        this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
        return this.getCurrentKey();
    }

    // Track API call for the current key
    trackAPICall(quotaCost = 1) {
        const currentKey = this.getCurrentKey();
        const currentUsage = this.keyUsage.get(currentKey) || 0;
        this.keyUsage.set(currentKey, currentUsage + quotaCost);

        // Rotate key if current key is approaching quota limit
        if (currentUsage + quotaCost >= this.quotaLimit) {
            return this.rotateKey();
        }
        return currentKey;
    }

    // Reset usage counts (should be called daily)
    resetUsage() {
        this.keyUsage.clear();
        this.apiKeys.forEach(key => this.keyUsage.set(key, 0));
    }

    // Get an API key for use, automatically handling rotation
    getKey() {
        try {
            const key = this.getCurrentKey();
            return this.trackAPICall();
        } catch (error) {
            throw new Error('No available API keys');
        }
    }

    // Remove an API key from rotation
    removeKey(key) {
        const index = this.apiKeys.indexOf(key);
        if (index > -1) {
            this.apiKeys.splice(index, 1);
            this.keyUsage.delete(key);
            if (this.currentKeyIndex >= this.apiKeys.length) {
                this.currentKeyIndex = 0;
            }
        }
    }
}

// Create and export a singleton instance
const apiKeyRotator = new YouTubeAPIKeyRotator();

// Export the rotator instance and quota costs for different API operations
export const YouTubeAPIQuotaCost = {
    SEARCH: 100,
    VIDEO_DETAILS: 1,
    CHANNEL_DETAILS: 1
};

export default apiKeyRotator;