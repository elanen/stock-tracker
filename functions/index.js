const functions = require('firebase-functions');
const puppeteer = require('puppeteer');
const admin = require('firebase-admin');
admin.initializeApp();

const scraper = async (symbol) => {
    // [START Puppeteer]
    const browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.goto(`https://www.marketwatch.com/investing/stock/${symbol}`);
    await page.waitFor(3000);
    await page.reload();
    await page.waitForSelector('bg-quote.value');

    const result = await page.evaluate(() => {
        // overview data
        const currentPrice = document.querySelector('bg-quote.value').textContent;
        const company = document.querySelector('h1.company__name').textContent;
        const status = document.querySelector('div.status').textContent;
        const closePrice = document.querySelector('tr.table__row td.table__cell.u-semi').textContent;
        let volume = '';
        if (status === 'Open') {
            volume = document.querySelector('div.range__header span.primary').textContent;
        } else if (status === 'Premarket') {
            volume = document.querySelector('span.volume__value bg-quote').textContent;
        } else {
            volume = '';
        }

        // key data
        const openPrice = document.querySelectorAll('ul.list.list--kv.list--col50 li.kv__item span.primary')[0].textContent;
        const dayRange = document.querySelectorAll('ul.list.list--kv.list--col50 li.kv__item span.primary')[1].textContent;
        const fiftyTwoWeekRange = document.querySelectorAll('ul.list.list--kv.list--col50 li.kv__item span.primary')[2].textContent;
        const marketCap = document.querySelectorAll('ul.list.list--kv.list--col50 li.kv__item span.primary')[3].textContent;
        const sharesOutstanding = document.querySelectorAll('ul.list.list--kv.list--col50 li.kv__item span.primary')[4].textContent;
        const publicFloat = document.querySelectorAll('ul.list.list--kv.list--col50 li.kv__item span.primary')[5].textContent;
        const beta = document.querySelectorAll('ul.list.list--kv.list--col50 li.kv__item span.primary')[6].textContent;
        const revenuePerEmployee = document.querySelectorAll('ul.list.list--kv.list--col50 li.kv__item span.primary')[7].textContent;
        const peRatio =  document.querySelectorAll('ul.list.list--kv.list--col50 li.kv__item span.primary')[8].textContent;
        const eps = document.querySelectorAll('ul.list.list--kv.list--col50 li.kv__item span.primary')[9].textContent;
        const shortInterest = document.querySelectorAll('ul.list.list--kv.list--col50 li.kv__item span.primary')[13].textContent;
        const percentOfFloatShorted = document.querySelectorAll('ul.list.list--kv.list--col50 li.kv__item span.primary')[14].textContent;
        const averageVolume = document.querySelectorAll('ul.list.list--kv.list--col50 li.kv__item span.primary')[15].textContent;

        // performance data
        const fiveDay = document.querySelectorAll('tbody tr.table__row td.table__cell ul.content li.content__item.value')[0].textContent;
        const oneMonth = document.querySelectorAll('tbody tr.table__row td.table__cell ul.content li.content__item.value')[1].textContent;
        const threeMonth = document.querySelectorAll('tbody tr.table__row td.table__cell ul.content li.content__item.value')[2].textContent;
        const ytd = document.querySelectorAll('tbody tr.table__row td.table__cell ul.content li.content__item.value')[3].textContent;
        const oneYear = document.querySelectorAll('tbody tr.table__row td.table__cell ul.content li.content__item.value')[4].textContent;

        return {
            currentPrice: currentPrice,
            company: company,
            status: status,
            closePrice: closePrice,
            volume: volume,
            openPrice: openPrice,
            dayRange: dayRange,
            fiftyTwoWeekRange: fiftyTwoWeekRange,
            marketCap: marketCap,
            sharesOutstanding: sharesOutstanding,
            publicFloat: publicFloat,
            beta: beta,
            revenuePerEmployee: revenuePerEmployee,
            peRatio: peRatio,
            eps: eps,
            shortInterest: shortInterest,
            percentOfFloatShorted: percentOfFloatShorted,
            averageVolume: averageVolume,
            fiveDay: fiveDay,
            oneMonth: oneMonth,
            threeMonth: threeMonth,
            ytd: ytd,
            oneYear: oneYear
        };
    });

    await browser.close();

    return result;
    // [END Puppeteer]
};

exports.marketwatchScraper = functions.runWith({ memory: '1GB' }).pubsub.schedule('*/30 * * * *').timeZone('Europe/London').onRun(async (context) => {
    const ts = admin.firestore.FieldValue.serverTimestamp();
    const db = admin.firestore();
    
    const updateDB = async (symbol, result) => {
        return db.collection('marketwatch').add({
            ...result,
            symbol: symbol,
            createdAt: ts
        }).catch(e => {
            console.log('ERROR WRITING TO FIRESTORE: ', e);
        });
    };

    await scraper('nio').then(res => {
        return updateDB('nio', res);
    }).catch(e => {
        console.log('ERROR RUNNING SCRAPER: ', e);
    });

    await scraper('tsla').then(res => {
        return updateDB('tsla', res);
    }).catch(e => {
        console.log('ERROR RUNNING SCRAPER: ', e);
    });

    return;
});

exports.retrieveOpeningData = functions.https.onCall(async (data, context) => {

    const db = admin.firestore().collection('marketwatch');
    let rawArray = [];

    // retrieve docs with symbol from client (24x the amount needed)
    await db.orderBy('createdAt', 'desc').where("symbol", "==", data.symbol).get().then(snap => {
        return snap.docs.map(doc => {
            return rawArray.push(doc.data());
        });
    });

    // function to return docs in array with specific time of day
    const extractTimeAndPrice = async (array, time) => {
        // eslint-disable-next-line
        const tpArray = await array.filter(obj => {
            const ts = obj.createdAt.toDate();
            const dtString = ts.toISOString();
            if (dtString.includes(time)) {
                return obj;
            }
        });
        return tpArray;
    };

    // array containing docs scraped at market open
    const openTimeArray = await extractTimeAndPrice(rawArray, '15:30');
    // array containing docs scraped at market open + 30 mins
    const openTimePlusThirtyArray = await extractTimeAndPrice(rawArray, '16:00');

    // function to return date in format mm/dd/yyyy
    const extractDate = async (obj) => {
        const ts = obj.createdAt.toDate();
        const dd = String(ts.getDate()).padStart(2, '0');
        const mm = String(ts.getMonth() + 1).padStart(2, '0');
        const yyyy = ts.getFullYear();
        return `${mm}/${dd}/${yyyy}`;
    };

    // function to calculate percent difference between two numbers
    const calculateDifference = async (numOne, numTwo) => {
        const n1 = Number(numOne);
        const n2 = Number(numTwo);
        return 100 * Math.abs( (n1 - n2) / ( (n1 + n2) / 2 ) );
    };

    // create array with { x: date, y: %increase }
    const coordArray = openTimeArray.map(async objOne => {
        const firstDate = await extractDate(objOne);
        // eslint-disable-next-line
        const arr = openTimePlusThirtyArray.map(async objTwo => {
            const secondDate = await extractDate(objTwo);
            if (firstDate === secondDate) {
                // calculate % between
                const p1 = objOne.currentPrice;
                const p2 = objTwo.currentPrice;
                const percentDifference = await calculateDifference(p1, p2);
                return {
                    x: objOne.createdAt,
                    y: percentDifference
                };
            }
        });
        const fa = await Promise.all(arr);
        return fa;
    });

    const finalArray = await Promise.all(coordArray);
    return { data: finalArray };

});


