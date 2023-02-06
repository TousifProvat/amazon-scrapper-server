import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { load } from 'cheerio';

const app = express();

app.use(express.json());
app.use(cors({}));

const SCRAPE_URL = 'https://www.amazon.com/s?k=';

const getProducstFromAmazon = async (req, res) => {
  const { product } = req.query;

  console.log({ product: SCRAPE_URL + product });
  try {
    const products = [];

    const { data } = await axios.get(SCRAPE_URL + product);
    const $ = load(data);

    $('div.s-result-item.s-asin', data).each((index, element) => {
      const product = $(element);

      const title = product
        .find('span.a-color-base.a-text-normal')
        .text()
        .split(',')[0];

      const productLink = product
        .find(
          'a.a-link-normal.s-underline-text.s-underline-link-text.s-link-style.a-text-normal'
        )
        .attr('href');

      const link = `https://www.amazon.com${productLink}`;

      const image = product.find('img.s-image').attr('src');
      const price = product
        .find('span.a-price')
        .children('span.a-offscreen')
        .text();

      products.push({ title, link, image, price });
    });

    res.status(200).json(products);
  } catch (err) {
    console.error(err);
    res.status(200).json({ message: 'Something went wrong' });
  }
};

app.use('/scrape/amazon', getProducstFromAmazon);
app.use('/health-check', (req, res) => {
  res.status(200).send('working');
});

export default app;
