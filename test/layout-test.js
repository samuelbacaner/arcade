// Basic layout and compatibility tests
const puppeteer = require('puppeteer');

async function runTests() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    // Test different viewport sizes
    const viewports = [
        { width: 375, height: 667 },  // Mobile
        { width: 768, height: 1024 }, // Tablet
        { width: 1366, height: 768 }  // Desktop
    ];

    await page.goto('file://' + process.cwd() + '/index.html');

    for (const viewport of viewports) {
        await page.setViewport(viewport);
        
        // Check if all main elements are present
        const elements = await page.evaluate(() => {
            return {
                header: !!document.querySelector('.site-header'),
                nav: !!document.querySelector('.main-nav'),
                gameContainer: !!document.querySelector('.game-container'),
                gameSections: document.querySelectorAll('.game-section').length,
                footer: !!document.querySelector('.site-footer')
            };
        });

        console.log(`Viewport ${viewport.width}x${viewport.height}:`, elements);
    }

    await browser.close();
}

runTests().catch(console.error);
