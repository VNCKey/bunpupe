import { resolve } from "bun";
import puppeteer from "puppeteer";

(async () => {
  const urlPage =
    "https://www.wong.pe/11961?gad_source=1&gclid=EAIaIQobChMI5d2IypCXjAMVzCpECB3bLxlcEAAYASAAEgL77PD_BwE&initialMap=productClusterIds&initialQuery=11961&map=category-2,productclusternames&query=/galletas-snacks-y-golosinas/todo-supermercado&searchState";

  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto(urlPage, { waitUntil: "networkidle2" });

  const title = await page.title();
  console.log(`El titulo de la pagina es: ${title}`);

  //ESPERAR A QUE LA PAGINA EL BTN PORQUE SOLO RECOJE LOS 5 PRIMEROS :C
  await page.waitForSelector(".vtex-search-result-3-x-buttonShowMore", {
    visible: true,
  });

  let products: any[] = [];
  let nextP = true;
  while (nextP) {
    const evaluateProducts = await page.evaluate(() => {
      const products = Array.from(
        document.querySelectorAll(
          ".wongio-cmedia-integration-cencosud-1-x-galleryItem"
        )
      );

      return products.map((i) => {
        const nameProduct =
          i
            .querySelector(
              ".vtex-product-summary-2-x-productBrand.vtex-product-summary-2-x-brandName.t-body"
            )
            ?.textContent?.trim() || "No tiene nombre";

        const priceProduct =
          i
            .querySelector(".vtex-product-price-1-x-sellingPrice")
            ?.textContent?.trim() || "No tiene precio";

        return { nameProduct, priceProduct };
      });
    });
    console.log(evaluateProducts);
    products = [...products, ...evaluateProducts];
    nextP = await page.evaluate(() => {
      const btnPageWong = document.querySelector(
        ".vtex-search-result-3-x-buttonShowMore"
      );
      if (btnPageWong) {
        btnPageWong.click();
        console.log("Si existe el btn");
        return true;
      }
      console.log("No existe el btn");
      return false;
    });
    await new Promise((resolve) => setTimeout(resolve, 3000));
    console.log(products.length);
  }
})();
