const express = require('express');
const fs = require('fs');
const path = require('path');
const helmet = require('helmet');
const app = express();

// Security middleware with CORS configuration
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

// CORS and security headers
app.use((req, res, next) => {
    // Force HTTPS
    if (req.headers['x-forwarded-proto'] !== 'https' && process.env.NODE_ENV === 'production') {
        return res.redirect(['https://', req.get('Host'), req.url].join(''));
    }
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// Environment variables
const PORT = process.env.PORT || 3000; // Changed to port 3000 for local development
const NODE_ENV = process.env.NODE_ENV || 'development'; // Changed to development mode

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

// Format log entry with enhanced domain info
function formatLogEntry(req) {
    const timestamp = new Date().toISOString();
    const ip = req.headers['x-forwarded-for'] || 
               req.connection.remoteAddress || 
               req.socket.remoteAddress || 
               'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    const host = req.headers.host || 'unknown';
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const path = req.path;
    const referer = req.headers.referer || 'direct';
    
    // Log to console
    console.log('\n=== New Visit Detected ===');
    console.log(`Time: ${new Date(timestamp).toLocaleString()}`);
    console.log(`Protocol: ${protocol}`);
    console.log(`Domain: ${host}`);
    console.log(`IP: ${ip}`);
    console.log(`Path: ${path}`);
    console.log(`Referer: ${referer}`);
    console.log('========================\n');
    
    return `[${timestamp}] Protocol: ${protocol} | Domain: ${host} | IP: ${ip} | Path: ${path} | Referer: ${referer} | Agent: ${userAgent}\n`;
}

// Middleware to log visitors
app.use((req, res, next) => {
    // Log all requests except static files and API calls
    if (!req.path.includes('.') && !req.path.includes('/api/')) {
        const logFile = path.join(logsDir, `visitors_${new Date().toISOString().split('T')[0]}.log`);
        const logEntry = formatLogEntry(req);
        
        fs.appendFile(logFile, logEntry, (err) => {
            if (err) {
                console.error('Error logging visitor:', err);
            } else {
                // Read all log files and count visits
                const files = fs.readdirSync(logsDir).filter(f => f.startsWith('visitors_'));
                let totalVisits = 0;
                let domainVisits = {};
                let protocolVisits = { http: 0, https: 0 };
                
                files.forEach(file => {
                    const content = fs.readFileSync(path.join(logsDir, file), 'utf8');
                    const lines = content.split('\n').filter(Boolean);
                    totalVisits += lines.length;
                    
                    lines.forEach(line => {
                        // Count domain visits
                        const domainMatch = line.match(/Domain: ([^\s|]+)/);
                        if (domainMatch) {
                            const domain = domainMatch[1];
                            domainVisits[domain] = (domainVisits[domain] || 0) + 1;
                        }
                        
                        // Count protocol visits
                        const protocolMatch = line.match(/Protocol: (\w+)/);
                        if (protocolMatch) {
                            const protocol = protocolMatch[1].toLowerCase();
                            protocolVisits[protocol] = (protocolVisits[protocol] || 0) + 1;
                        }
                    });
                });
                
                // Display current statistics
                console.log('=== Current Statistics ===');
                console.log(`Total Visits: ${totalVisits}`);
                console.log('\nProtocol Distribution:');
                Object.entries(protocolVisits).forEach(([protocol, count]) => {
                    console.log(`${protocol.toUpperCase()}: ${count} visits`);
                });
                console.log('\nVisits by Domain:');
                Object.entries(domainVisits)
                    .sort(([,a], [,b]) => b - a)
                    .forEach(([domain, count]) => {
                        console.log(`${domain}: ${count} visits`);
                    });
                console.log('========================\n');
            }
        });
    }
    next();
});

// Serve static files
app.use(express.static(path.join(__dirname)));

// Serve index.html for all routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n=== Server Started ===`);
    console.log(`Mode: ${NODE_ENV}`);
    console.log(`Protocol: HTTP`);
    console.log(`Port: ${PORT}`);
    console.log(`Logs Directory: ${logsDir}`);
    console.log('===================\n');
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Error: Port ${PORT} is already in use`);
        console.error('Please try running: taskkill /F /IM node.exe');
    } else {
        console.error('Server error:', err);
    }
    process.exit(1);
});
