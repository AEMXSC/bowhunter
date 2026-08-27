/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import sectionTitleParser from './parsers/section-title.js';
import cardsParser from './parsers/cards.js';
import columnsParser from './parsers/columns.js';
import carouselParser from './parsers/carousel.js';
import formParser from './parsers/form.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/bowhunter-cleanup.js';
import imagesTransformer from './transformers/bowhunter-images.js';
import sectionsTransformer from './transformers/bowhunter-sections.js';

const parsers = {
  'section-title': sectionTitleParser,
  cards: cardsParser,
  columns: columnsParser,
  carousel: carouselParser,
  form: formParser,
};

const transformers = [cleanupTransformer, imagesTransformer, sectionsTransformer];

// PAGE TEMPLATE (embedded from page-templates.json — "listing")
const PAGE_TEMPLATE = {
  name: 'listing',
  targetPath: '/listing/bowhunting',
  blocks: [
    { name: 'section-title', instances: ['section.wrapper.has-grid.lastest-articles.no-padding-top.clearfix .col-xs-12.col-sm-8.col-md-9 > div.row h2.subhead'] },
    { name: 'cards', instances: ['section.wrapper.has-grid.lastest-articles.no-padding-top.clearfix .col-xs-12.col-sm-8.col-md-9 > div.row', 'section#FooterMagazineGlobal_getmagazineSection .row.has-prods.has-mags', '#FooterMagazineGlobal_specialinterestSection .row.has-prods.has-mags'] },
    { name: 'section-magazine-sub', instances: ['section.has-promo.is-magazine-sub'], section: 'highlight' },
    { name: 'columns', instances: ['section.has-promo.is-magazine-sub .row', 'section.wrapper.buy-issue .row.middle-sm'] },
    { name: 'carousel', instances: ['section.has-logos.has-carousel .caro.multi'] },
    { name: 'section-newsletter', instances: ['section.full-width-container.is-newsletter.has-promo'], section: 'dark' },
    { name: 'form', instances: ['section.is-newsletter .row'] },
  ],
};

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    // Skip entries that have no parser (section-metadata like section-magazine-sub,
    // section-newsletter). Real block parsers — including section-title — are kept.
    if (!parsers[blockDef.name]) return;
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      elements.forEach((element) => pageBlocks.push({ name: blockDef.name, selector, element, section: blockDef.section || null }));
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    executeTransformers('beforeTransform', main, payload);

    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    executeTransformers('afterTransform', main, payload);

    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    const path = WebImporter.FileUtils.sanitizePath(PAGE_TEMPLATE.targetPath);

    return [{
      element: main,
      path,
      report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) },
    }];
  },
};

