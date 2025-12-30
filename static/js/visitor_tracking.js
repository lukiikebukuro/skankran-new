/**
 * 🛰️ SATELITA v2.0 - SKANKRAN.PL EDITION
 * GDPR/RODO Compliant Visitor Tracking System
 * 
 * SECURITY FEATURES:
 * - IP Hashing (SHA-256)
 * - PII Scrubbing (PESEL, Email, Phone)
 * - Do Not Track Support
 * - Minimal Fingerprinting
 * - Opt-Out Mechanism
 */

/* global io */
/* eslint-disable no-undef */

class VisitorTrackerSkankran {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.entryTime = new Date();
        this.lastActivity = new Date();
        this.queryCount = 0;
        this.visitorData = null;
        this.isTracking = false;
        this.socket = null;
        this.lastQuery = null;  // 🔥 NAPRAWA: Tymczasowe przechowywanie query przed response
        
        // RODO: Sprawdź czy user opt-out
        if (this.checkOptOut()) {
            console.log('🛰️ SATELITA: User opted out - tracking disabled');
            return;
        }
        
        // RODO: Sprawdź Do Not Track
        if (this.checkDoNotTrack()) {
            console.log('🛰️ SATELITA: DNT enabled - anonymous mode');
            this.anonymousMode = true;
        } else {
            this.anonymousMode = false;
        }
        
        console.log('🛰️ SATELITA v2.0 (Skankran): Visitor Tracker initialized (GDPR Compliant)');
        console.log('Session ID:', this.sessionId);
        console.log('Anonymous Mode:', this.anonymousMode);
        
        this.initializeTracking();
    }
    
    /**
     * RODO: Check if user opted out
     */
    checkOptOut() {
        return localStorage.getItem('skankran_tracking_opt_out') === 'true';
    }
    
    /**
     * RODO: Check Do Not Track header
     */
    checkDoNotTrack() {
        const dnt = navigator.doNotTrack || 
                    window.doNotTrack || 
                    navigator.msDoNotTrack;
        
        return dnt === '1' || dnt === 'yes';
    }
    
    /**
     * RODO: Public opt-out method
     */
    static optOut() {
        localStorage.setItem('skankran_tracking_opt_out', 'true');
        console.log('🛰️ SATELITA: Opted out successfully');
        window.location.reload();
    }
    
    /**
     * RODO: Public opt-in method
     */
    static optIn() {
        localStorage.removeItem('skankran_tracking_opt_out');
        console.log('🛰️ SATELITA: Opted in successfully');
        window.location.reload();
    }
    
    /**
     * Generate unique session ID
     */
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    /**
     * Initialize tracking
     */
    async initializeTracking() {
        try {
            // Gather initial visitor data
            await this.gatherVisitorData();
            
            // Initialize WebSocket connection for Live Feed
            this.initializeWebSocket();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Enable tracking
            this.isTracking = true;
            
            // Send 'visitor_connected' event
            this.sendVisitorConnectedEvent();
            
            // Send session start event
            await this.sendVisitorEvent('session_start', {
                entry_time: this.entryTime.toISOString(),
                anonymous_mode: this.anonymousMode,
                ...this.visitorData
            });
            
            console.log('🛰️ SATELITA: Tracking started');
            
        } catch (error) {
            console.error('🛰️ SATELITA: Failed to initialize tracking:', error);
        }
    }
    
    /**
     * Send 'visitor_connected' event through WebSocket
     */
    sendVisitorConnectedEvent() {
        const maxWait = 3000;
        const startTime = Date.now();
        
        const attemptSend = () => {
            if (this.socket && this.socket.connected) {
                const eventData = {
                    session_id: this.sessionId,
                    timestamp: new Date().toISOString(),
                    city: this.visitorData?.city || 'Unknown',
                    country: this.visitorData?.country || 'Unknown',
                    organization: this.visitorData?.org || 'Unknown',
                    referrer: this.visitorData?.referrer || 'direct',
                    user_agent: navigator.userAgent,
                    anonymous: this.anonymousMode
                };
                
                this.socket.emit('visitor_connected', eventData);
                console.log('🛰️ SATELITA: visitor_connected sent', eventData);
            } else if (Date.now() - startTime < maxWait) {
                setTimeout(attemptSend, 100);
            } else {
                console.warn('🛰️ SATELITA: WebSocket not connected - skipped visitor_connected');
            }
        };
        
        attemptSend();
    }
    
    /**
     * Initialize WebSocket connection
     */
    initializeWebSocket() {
        try {
            const socketURL = window.location.hostname === 'localhost' 
                ? 'http://localhost:5000' 
                : window.location.origin;
            
            this.socket = io(socketURL, {
                transports: ['polling', 'websocket'],
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionAttempts: 5,
                timeout: 20000,
                path: '/socket.io/',
                secure: true,
                rejectUnauthorized: false
            });
            
            // Export socket to window for global access
            window.skankranSocket = this.socket;
            
            this.socket.on('connect', () => {
                console.log('🛰️ SATELITA: WebSocket connected');
            });
            
            this.socket.on('disconnect', () => {
                console.log('🛰️ SATELITA: WebSocket disconnected');
            });
            
        } catch (error) {
            console.error('🛰️ SATELITA: Failed to initialize WebSocket:', error);
        }
    }
    
    /**
     * RODO: Hash IP Address using SHA-256
     */
    async hashIP(ip) {
        try {
            const encoder = new TextEncoder();
            const data = encoder.encode(ip);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            return `hash_${hashHex.substring(0, 16)}`;
        } catch (error) {
            console.error('🛰️ SATELITA: IP hashing failed:', error);
            return 'hash_unknown';
        }
    }
    
    /**
     * RODO: Maskowanie IP
     */
    maskIP(ip) {
        if (!ip) return 'masked';
        
        // IPv4: 192.168.1.123 -> 192.168.1.xxx
        if (ip.includes('.')) {
            const parts = ip.split('.');
            return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`;
        }
        
        // IPv6
        if (ip.includes(':')) {
            const parts = ip.split(':');
            return parts.slice(0, -2).join(':') + '::xxxx';
        }
        
        return 'masked';
    }
    
    /**
     * RODO: Sanityzacja PII (PESEL, Email, Telefon, Karty)
     */
    scrubPII(text) {
        if (!text || typeof text !== 'string') return text;
        
        let scrubbed = text;
        
        // Email
        scrubbed = scrubbed.replace(
            /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
            '[REDACTED_EMAIL]'
        );
        
        // Polski telefon
        scrubbed = scrubbed.replace(
            /(\+48\s?)?(\d{3}[\s\-]?\d{3}[\s\-]?\d{3})/g,
            '[REDACTED_PHONE]'
        );
        
        // PESEL
        scrubbed = scrubbed.replace(
            /\b\d{11}\b/g,
            '[REDACTED_PESEL]'
        );
        
        // Karta kredytowa
        scrubbed = scrubbed.replace(
            /\b\d{4}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{4}\b/g,
            '[REDACTED_CARD]'
        );
        
        // IBAN
        scrubbed = scrubbed.replace(
            /\bPL\d{26}\b/gi,
            '[REDACTED_IBAN]'
        );
        
        // NIP
        scrubbed = scrubbed.replace(
            /\b\d{3}[\-]?\d{3}[\-]?\d{2}[\-]?\d{2}\b/g,
            '[REDACTED_NIP]'
        );
        
        return scrubbed;
    }
    
    /**
     * RODO: Minimalizacja fingerprinting
     */
    getMinimalDeviceInfo() {
        const ua = navigator.userAgent;
        
        const isMobile = /Mobile|Android|iPhone|iPad|iPod/i.test(ua);
        const isTablet = /iPad|Android(?!.*Mobile)/i.test(ua);
        
        let deviceType = 'Desktop';
        if (isTablet) deviceType = 'Tablet';
        else if (isMobile) deviceType = 'Mobile';
        
        let os = 'Unknown';
        if (ua.includes('Windows')) os = 'Windows';
        else if (ua.includes('Mac')) os = 'MacOS';
        else if (ua.includes('Linux')) os = 'Linux';
        else if (ua.includes('Android')) os = 'Android';
        else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
        
        let browser = 'Unknown';
        if (ua.includes('Chrome') && !ua.includes('Edge')) browser = 'Chrome';
        else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
        else if (ua.includes('Firefox')) browser = 'Firefox';
        else if (ua.includes('Edge')) browser = 'Edge';
        else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';
        
        return {
            device_type: deviceType,
            os: os,
            browser: browser,
            viewport_category: this.categorizeViewport(window.innerWidth, window.innerHeight)
        };
    }
    
    /**
     * RODO: Kategoryzacja viewportu
     */
    categorizeViewport(width, height) {
        if (width < 768) return 'mobile';
        if (width < 1024) return 'tablet';
        if (width < 1440) return 'laptop';
        return 'desktop';
    }
    
    /**
     * Gather visitor data (GDPR-compliant)
     */
    async gatherVisitorData() {
        const deviceInfo = this.getMinimalDeviceInfo();
        
        this.visitorData = {
            ...deviceInfo,
            language: navigator.language.split('-')[0],
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            page_url: window.location.pathname,
            page_title: document.title,
            utm_source: this.getUrlParameter('utm_source'),
            utm_medium: this.getUrlParameter('utm_medium'),
            utm_campaign: this.getUrlParameter('utm_campaign'),
            referrer: this.sanitizeReferrer(document.referrer)
        };
        
        // RODO: W trybie anonymous - nie pobieraj IP/Location
        if (this.anonymousMode) {
            console.log('🛰️ SATELITA: Anonymous mode - skipping IP/location');
            return;
        }
        
        // Try to get IP and location data
        try {
            const ipData = await this.getIPData();
            if (ipData) {
                this.visitorData = { ...this.visitorData, ...ipData };
            }
        } catch (error) {
            console.warn('🛰️ SATELITA: Could not fetch IP data:', error);
        }
    }
    
    /**
     * RODO: Sanitize referrer
     */
    sanitizeReferrer(referrer) {
        if (!referrer) return 'direct';
        
        try {
            const url = new URL(referrer);
            return `${url.protocol}//${url.hostname}${url.pathname}`;
        } catch (error) {
            return 'invalid_referrer';
        }
    }
    
    /**
     * Get IP and location data (GDPR-compliant)
     */
    async getIPData() {
        try {
            const services = [
                'https://api.ipify.org?format=json',
                'https://httpbin.org/ip'
            ];
            
            for (const service of services) {
                try {
                    const response = await fetch(service, { 
                        signal: AbortSignal.timeout(3000)
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        const rawIP = data.ip || data.origin;
                        
                        if (rawIP) {
                            const locationData = await this.getLocationData(rawIP);
                            const hashedIP = await this.hashIP(rawIP);
                            const maskedIP = this.maskIP(rawIP);
                            
                            console.log('🛰️ SATELITA: IP processed');
                            console.log('  Raw IP:', rawIP, '(not stored)');
                            console.log('  Hashed:', hashedIP);
                            console.log('  Masked:', maskedIP);
                            
                            return {
                                ip_hash: hashedIP,
                                ip_masked: maskedIP,
                                ...locationData
                            };
                        }
                    }
                } catch (serviceError) {
                    console.warn(`🛰️ SATELITA: Service ${service} failed:`, serviceError);
                    continue;
                }
            }
        } catch (error) {
            console.warn('🛰️ SATELITA: IP detection failed:', error);
        }
        
        return null;
    }
    
    /**
     * Get location data for IP
     */
    async getLocationData(ip) {
        try {
            const response = await fetch(`https://ipapi.co/${ip}/json/`, {
                signal: AbortSignal.timeout(3000)
            });
            
            if (response.ok) {
                const data = await response.json();
                
                return {
                    country: data.country_name,
                    country_code: data.country_code,
                    city: data.city,
                    region: data.region,
                    timezone: data.timezone,
                    org: data.org,
                    asn: data.asn
                };
            }
        } catch (error) {
            console.warn('🛰️ SATELITA: Location lookup failed:', error);
        }
        
        return {};
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Track page visibility
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.sendVisitorEvent('page_hidden', {
                    time_visible: Date.now() - this.lastActivity.getTime()
                });
            } else {
                this.lastActivity = new Date();
                this.sendVisitorEvent('page_visible', {});
            }
        });
        
        // Track scroll depth
        let maxScrollDepth = 0;
        window.addEventListener('scroll', this.throttle(() => {
            const scrollDepth = Math.round(
                (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
            );
            
            if (scrollDepth > maxScrollDepth && scrollDepth % 25 === 0) {
                maxScrollDepth = scrollDepth;
                this.sendVisitorEvent('scroll_depth', {
                    scroll_depth: scrollDepth
                });
            }
        }, 1000));
        
        // Track clicks on important elements
        document.addEventListener('click', (event) => {
            const target = event.target;
            
            if (target.matches('button, a, .cta-primary, .cta-secondary, .aquabot-hero-btn')) {
                this.sendVisitorEvent('element_click', {
                    element_type: target.tagName.toLowerCase(),
                    element_class: target.className.substring(0, 50),
                    element_id: target.id
                });
            }
        });
        
        // Track input focus
        document.addEventListener('focusin', (event) => {
            if (event.target.matches('input[type="text"], textarea')) {
                this.sendVisitorEvent('input_focus', {
                    input_type: event.target.type || 'text',
                    input_id: event.target.id
                });
            }
        });
        
        // Track AquaBot interactions
        this.trackAquaBotInteractions();
        
        // Track page unload
        window.addEventListener('beforeunload', () => {
            const sessionDuration = Date.now() - this.entryTime.getTime();
            
            // Send via WebSocket
            if (this.socket && this.socket.connected) {
                this.socket.emit('visitor_disconnected', {
                    session_id: this.sessionId,
                    timestamp: new Date().toISOString(),
                    session_duration: sessionDuration,
                    query_count: this.queryCount
                });
                console.log('🛰️ SATELITA: visitor_disconnected sent');
            }
            
            // Fallback: sendBeacon
            navigator.sendBeacon('/api/visitor-tracking', JSON.stringify({
                session_id: this.sessionId,
                event_type: 'session_end',
                timestamp: new Date().toISOString(),
                session_duration: sessionDuration,
                query_count: this.queryCount
            }));
        });
        
        console.log('🛰️ SATELITA: Event listeners configured');
    }
    
    /**
     * Track AquaBot interactions
     */
    trackAquaBotInteractions() {
        // Czekaj aż AquaBot się załaduje
        const checkAquaBot = () => {
            // Sprawdź czy istnieje send button AquaBota
            const aquabotSendBtn = document.getElementById('aqua-bot-skin-send');
            const aquabotInput = document.getElementById('aqua-bot-skin-input');
            
            if (aquabotSendBtn && aquabotInput) {
                console.log('🛰️ SATELITA: AquaBot detected - attaching listener');
                
                // Wstrzyknij session_id do window (dla debugowania)
                window.skankranSessionId = this.sessionId;
                
                // Interceptuj wysyłanie wiadomości
                aquabotSendBtn.addEventListener('click', () => {
                    setTimeout(() => {
                        const query = aquabotInput.value.trim();
                        if (query) {
                            this.handleAquaBotQuery(query);
                        }
                    }, 100);
                });
                
                // Interceptuj Enter key
                aquabotInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        setTimeout(() => {
                            const query = aquabotInput.value.trim();
                            if (query) {
                                this.handleAquaBotQuery(query);
                            }
                        }, 100);
                    }
                });
                
                console.log('🛰️ SATELITA: AquaBot tracking enabled');
            } else {
                // Retry za 1s
                setTimeout(checkAquaBot, 1000);
            }
        };
        
        checkAquaBot();
    }
    
    /**
     * Handle AquaBot query
     */
    async handleAquaBotQuery(query) {
        this.queryCount++;
        
        // RODO: Sanitize query
        const sanitizedQuery = this.scrubPII(query);
        
        if (sanitizedQuery !== query) {
            console.warn('🛰️ SATELITA: PII detected and scrubbed from query');
        }
        
        // 🔥 NAPRAWA: Zapisz query tymczasowo, nie wysyłaj jeszcze
        this.lastQuery = sanitizedQuery;
        
        const sessionInfo = this.getVisitorSummary();
        
        // Send to tracking endpoint (bez odpowiedzi)
        await this.sendVisitorEvent('aquabot_query', {
            query: sanitizedQuery,
            query_count: this.queryCount,
            time_since_entry: Date.now() - this.entryTime.getTime(),
            city: sessionInfo.city || 'Unknown',
            country: sessionInfo.country || 'Unknown',
            organization: sessionInfo.organization || 'Unknown'
        });
    }
    
    /**
     * Handle AquaBot Response (wywoływana PO otrzymaniu odpowiedzi)
     */
    async handleAquaBotResponse(query, botResponse) {
        const sessionInfo = this.getVisitorSummary();
        
        // Send via WebSocket Z ODPOWIEDZIĄ (użyj this.lastQuery jeśli query jest undefined)
        if (this.socket && this.socket.connected) {
            const eventData = {
                query: this.lastQuery || query,
                bot_response: botResponse,
                timestamp: new Date().toISOString(),
                city: sessionInfo.city || 'Unknown',
                country: sessionInfo.country || 'Unknown',
                organization: sessionInfo.organization || 'Unknown',
                session_id: this.sessionId,
                anonymous: this.anonymousMode,
                query_count: this.queryCount,
                time_since_entry: Date.now() - this.entryTime.getTime()
            };
            
            this.socket.emit('aquabot_query', eventData);
            console.log('🛰️ SATELITA: aquabot_response sent', eventData);
            
            // Wyczyść tymczasowe query
            this.lastQuery = null;
        }
    }
    
    /**
     * Send visitor event to backend
     */
    async sendVisitorEvent(eventType, data) {
        if (!this.isTracking) return;
        
        try {
            const payload = {
                session_id: this.sessionId,
                event_type: eventType,
                timestamp: new Date().toISOString(),
                anonymous_mode: this.anonymousMode,
                ...data
            };
            
            const response = await fetch('/api/visitor-tracking', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload),
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
        } catch (error) {
            console.error('🛰️ SATELITA: Failed to send visitor event:', error);
        }
    }
    
    /**
     * Get visitor location string
     */
    getVisitorLocation() {
        if (!this.visitorData || this.anonymousMode) return 'Anonymous';
        
        const parts = [];
        if (this.visitorData.city) parts.push(this.visitorData.city);
        if (this.visitorData.country) parts.push(this.visitorData.country);
        
        return parts.length > 0 ? parts.join(', ') : 'Unknown Location';
    }
    
    /**
     * Get URL parameter
     */
    getUrlParameter(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }
    
    /**
     * Throttle function
     */
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }
    
    /**
     * Get session summary
     */
    getVisitorSummary() {
        const now = new Date();
        const sessionDuration = now - this.entryTime;
        
        return {
            sessionId: this.sessionId,
            entry_time: this.entryTime.toISOString(),
            session_duration: Math.round(sessionDuration / 1000),
            query_count: this.queryCount,
            location: this.getVisitorLocation(),
            city: this.visitorData?.city || 'Unknown',
            country: this.visitorData?.country || 'Unknown',
            organization: this.visitorData?.org || 'Unknown',
            referrer: this.visitorData?.referrer || 'direct',
            anonymous: this.anonymousMode
        };
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.visitorTrackerSkankran = new VisitorTrackerSkankran();
    
    // Debug commands
    window.getSkankranVisitorSummary = () => {
        if (window.visitorTrackerSkankran) {
            console.table(window.visitorTrackerSkankran.getVisitorSummary());
        }
    };
    
    // RODO: Public opt-out/opt-in methods
    window.skankranOptOut = () => VisitorTrackerSkankran.optOut();
    window.skankranOptIn = () => VisitorTrackerSkankran.optIn();
    
    // 🛰️ EXPOSE TRACKER: Dla integracji z aquaBot.js
    window.skankranTracker = window.visitorTrackerSkankran;
    
    console.log('🛰️ SATELITA v2.0 (Skankran): Visitor tracking active (GDPR Compliant)');
    console.log('Commands:');
    console.log('  getSkankranVisitorSummary() - Show session info');
    console.log('  skankranOptOut() - Disable tracking');
    console.log('  skankranOptIn() - Enable tracking');
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VisitorTrackerSkankran;
}
