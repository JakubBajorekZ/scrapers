const {By,Key,Builder} = require('selenium-webdriver');
require('geckodriver');
const fs = require('fs');
const { format } = require('@fast-csv/format');

const BASE_URL = 'https://learngerman.dw.com/en/deutschtrainer/c-56705009';
const FILENAME = 'dw.csv';

async function example(){
    let driver = await new Builder().forBrowser("firefox").build();
    await driver.get(BASE_URL);
    let records = [];
    let lesson_links = [];

    let lesson_links_we = await driver.findElements(By.xpath('//ul[contains(@class, "lesson-list")]/li[contains(@class, "lesson-item")]/a'));
    for (const l of lesson_links_we) {
        lesson_links.push(`${await l.getAttribute('href')}/lv`);
    }
    console.log(lesson_links.length);
    for (const lesson of lesson_links) {
        await driver.get(lesson);
        console.log(`${await driver.getTitle()} -> ${lesson}`);
        let words = await driver.findElements(By.xpath('//div[@class="row vocabulary"]'));
        console.log(`Words: ${words.length}`);
        for (word of words) {
            let entries = await word.findElements(By.xpath('.//div[contains(@class, "vocabulary-entry")]'));
            let de = await entries[0].getText();
            let en = await entries[2].getText();
            console.log(`${entries.length}: ${de} -> ${en}`);
            records.push({de: de, en: en});
            records.push({en: en, de: de});
        }
    }

    console.log(`Total: ${records.length}`);
    await driver.quit();

    const csv_file = fs.createWriteStream(FILENAME);
    const stream = format({headers: true, delimiter: '\t'});
    stream.pipe(csv_file);

    for (record of records) {
        stream.write(record);
    }
    stream.end();
}

example()
