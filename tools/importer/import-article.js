/* eslint-disable */
/* global WebImporter */

// Article template is ALL DEFAULT CONTENT — no block parsers, only page transformers.

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/bowhunter-cleanup.js';
import imagesTransformer from './transformers/bowhunter-images.js';
import sectionsTransformer from './transformers/bowhunter-sections.js';

const transformers = [cleanupTransformer, imagesTransformer, sectionsTransformer];

// PAGE TEMPLATE (embedded from page-templates.json — "article")
const PAGE_TEMPLATE = {
  name: 'article',
  targetPath: '/editorial/10-acre-property-wisconsin-giant',
  blocks: [],
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

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    executeTransformers('beforeTransform', main, payload);
    // No block parsing — article body is default content.
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
      report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: [] },
    }];
  },
};
