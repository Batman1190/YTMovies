const fs = require('fs');
const https = require('https');
const path = require('path');

const images = [
    {
        url: 'https://cdn-icons-png.flaticon.com/512/3176/3176272.png',
        filename: 'support.png'
    },
    {
        url: 'https://cdn-icons-png.flaticon.com/512/3176/3176273.png',
        filename: 'coffee.png'
    },
    {
        url: 'https://cdn-icons-png.flaticon.com/512/3176/3176274.png',
        filename: 'movies.png'
    }
];

// Create images directory if it doesn't exist
if (!fs.existsSync('images')) {
    fs.mkdirSync('images');
}

// Download each image
images.forEach(image => {
    const file = fs.createWriteStream(path.join('images', image.filename));
    https.get(image.url, response => {
        response.pipe(file);
        file.on('finish', () => {
            file.close();
            console.log(`Downloaded ${image.filename}`);
        });
    }).on('error', err => {
        fs.unlink(path.join('images', image.filename));
        console.error(`Error downloading ${image.filename}:`, err.message);
    });
}); 