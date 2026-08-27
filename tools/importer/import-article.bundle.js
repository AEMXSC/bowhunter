/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-article.js
  var import_article_exports = {};
  __export(import_article_exports, {
    default: () => import_article_default
  });

  // tools/importer/transformers/bowhunter-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#ketch-banner",
        // ketch cookie/consent banner (fixed overlay)
        "#ketch-consent-banner",
        "#currentSubscribers",
        // .lity-hide modal
        "#sub-modal-container",
        // .lity-hide modal
        "#newsletter-modal-container"
        // .lity-hide modal
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        // top promo lanyard + main navigation panel
        "#lanyard_root",
        "#MainNav_MainNavigationControl_magazineMainNavPanel",
        // header / masthead
        "header",
        // navigation (main dropdown, breadcrumb sub-nav, article pagination)
        "nav",
        // search bar
        ".wrapper.search-bar",
        "#cludo_search_form",
        // advertising slots (adpos_top / adpos_right* / adpos_bottom* etc. + wrappers)
        '[id^="adpos_"]',
        ".ad-wrapper",
        // article related-articles sidebar (non-authorable; NOT present on home)
        ".related-articles",
        // social share widgets
        ".social-links",
        // footer + footer nav panel + legal disclaimer
        "footer",
        "#FooterNavigation_magazineFooterPanel",
        ".disclaimer-text",
        "#dfpid",
        // script/style noise
        "script",
        "noscript"
      ]);
      element.querySelectorAll("[data-ga], [onclick], [data-page]").forEach((el) => {
        el.removeAttribute("data-ga");
        el.removeAttribute("onclick");
        el.removeAttribute("data-page");
      });
    }
  }

  // tools/importer/transformers/bowhunter-images.js
  var TransformHook2 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  var PLACEHOLDER = "BackgroundGradLoad";
  var SRC_ATTRS = ["data-src-lg", "data-src", "data-src-xs", "data-flickity-lazyload"];
  function resolveRealUrl(el) {
    for (let i = 0; i < SRC_ATTRS.length; i += 1) {
      const val = el.getAttribute(SRC_ATTRS[i]);
      if (val && !val.includes(PLACEHOLDER)) return val;
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    if (hookName === TransformHook2.beforeTransform) {
      const candidates = element.querySelectorAll(
        'img.lazy, iframe.lazy, img[src*="BackgroundGradLoad"], img[data-src-lg], img[data-src], img[data-flickity-lazyload]'
      );
      candidates.forEach((el) => {
        const currentSrc = el.getAttribute("src") || "";
        const needsFix = !currentSrc || currentSrc.includes(PLACEHOLDER);
        if (!needsFix) return;
        const realUrl = resolveRealUrl(el);
        if (!realUrl) return;
        el.setAttribute("src", realUrl);
        SRC_ATTRS.forEach((attr) => el.removeAttribute(attr));
        el.classList.remove("lazy");
      });
    }
  }

  // tools/importer/transformers/bowhunter-sections.js
  var TransformHook3 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function getStyledSections(payload) {
    const template = payload && payload.template || {};
    if (Array.isArray(template.sections) && template.sections.length) {
      return template.sections.filter((s) => s && s.selector && s.style).map((s, idx) => ({ id: s.id || `section-${idx}`, selector: s.selector, style: s.style }));
    }
    const blocks = Array.isArray(template.blocks) ? template.blocks : [];
    return blocks.filter((b) => b && b.section && Array.isArray(b.instances) && b.instances.length).map((b) => ({ id: b.name, selector: b.instances[0], style: b.section }));
  }
  function transform3(hookName, element, payload) {
    const sections = getStyledSections(payload);
    if (!sections.length) return;
    if (hookName === TransformHook3.beforeTransform) {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        const sectionEl = element.querySelector(section.selector);
        if (!sectionEl) continue;
        if (sectionEl.nextElementSibling && sectionEl.nextElementSibling.tagName !== "HR") {
          sectionEl.after(document.createElement("hr"));
        }
        const marker = document.createElement("hr");
        marker.setAttribute(SECTION_MARKER_ATTR, section.id);
        sectionEl.before(marker);
      }
    }
    if (hookName === TransformHook3.afterTransform) {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || element.querySelector(section.selector);
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (!marker.previousElementSibling) marker.remove();
        }
      }
    }
  }

  // tools/importer/import-article.js
  var transformers = [transform, transform2, transform3];
  var PAGE_TEMPLATE = {
    name: "article",
    targetPath: "/editorial/10-acre-property-wisconsin-giant",
    blocks: []
  };
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  var import_article_default = {
    transform: (payload) => {
      const { document: document2, url, params } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(PAGE_TEMPLATE.targetPath);
      return [{
        element: main,
        path,
        report: { title: document2.title, template: PAGE_TEMPLATE.name, blocks: [] }
      }];
    }
  };
  return __toCommonJS(import_article_exports);
})();

