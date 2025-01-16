import { NextRequest, NextResponse } from "next/server";
import * as puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import puppeteerCore from 'puppeteer-core';
import { executablePath } from 'puppeteer';

export async function POST(request: NextRequest) {
  let browser: puppeteer.Browser | null = null;
  const { url } = await request.json();
  console.log('Target URL:', url);

  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('Development environment detected.');
      browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: true,
        executablePath:executablePath()
      });
    } 
    if (process.env.NODE_ENV === 'production') {
      console.log('Production environment detected.');
      const executablePath = await chromium.executablePath();
      console.log('Chromium executablePath:', executablePath);  // Log the executablePath

      if (!executablePath) {
        throw new Error("Failed to retrieve Chromium executable path. Please ensure that @sparticuz/chromium is properly configured.");
      }

      browser = await puppeteerCore.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: executablePath,  // Ensure executablePath is correctly fetched
        headless: chromium.headless,
        
      });
    }

    const page = await browser!.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36');
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

    const headlines = await page.evaluate((): string[] => {
      const titles: string[] = [];
      const elements = document.querySelectorAll('h2, .post-card__title, .article-card__title');
      elements.forEach((el) => titles.push(el?.textContent?.trim() ?? ''));
      return titles;
    });

    await browser!.close();
    return NextResponse.json({
      msg: "Successful",
      headlines: headlines,
      status: 200
    });
  } catch (error) {
    console.error('Error occurred:', error);
    if (browser) {
      await browser.close();  // Ensure browser is closed in case of error
    }
    return NextResponse.json({ message: "something went wrong", error: error});
  }
}
