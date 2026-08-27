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

  // tools/importer/import-magazine.js
  var import_magazine_exports = {};
  __export(import_magazine_exports, {
    default: () => import_magazine_default
  });

  // tools/importer/parsers/hero.js
  function parse(element, { document: document2 }) {
    const promoteImg = (img) => {
      if (!img) return;
      const real = img.getAttribute("data-src-lg") || img.getAttribute("data-src") || img.getAttribute("data-src-xs") || img.getAttribute("data-flickity-lazyload");
      if (real && (!img.getAttribute("src") || /BackgroundGradLoad|blank|placeholder/i.test(img.getAttribute("src") || ""))) {
        img.setAttribute("src", real);
      }
    };
    let image = null;
    const textParts = [];
    if (element.classList.contains("whats-inside")) {
      const article = element.closest("article, main.single-article") || element.parentElement;
      if (!article || article.getAttribute("data-hero-done") === "1") {
        element.replaceWith(...element.childNodes);
        return;
      }
      article.setAttribute("data-hero-done", "1");
      image = article.querySelector("figure img, .story-image img, .content img");
      promoteImg(image);
      article.querySelectorAll(":scope .page-title .whats-inside, .page-title .whats-inside").forEach((w) => {
        const p = document2.createElement("p");
        p.append(...Array.from(w.childNodes).map((n) => n.cloneNode(true)));
        if (p.textContent.trim()) textParts.push(p);
      });
      const h1 = article.querySelector(".page-title h1");
      if (h1) textParts.push(h1.cloneNode(true));
      const sub = article.querySelector(".page-title h3");
      if (sub) textParts.push(sub.cloneNode(true));
      const intro = article.querySelector(".content > p");
      if (intro) textParts.push(intro.cloneNode(true));
    } else {
      image = element.querySelector(".has-img img, img");
      promoteImg(image);
      const headStrong = element.querySelector(".has-head strong");
      if (headStrong) {
        const h = document2.createElement("h2");
        const tmp = headStrong.cloneNode(true);
        tmp.querySelectorAll("br").forEach((br) => br.replaceWith(document2.createTextNode(" ")));
        h.textContent = tmp.textContent.replace(/\s+/g, " ").trim();
        textParts.push(h);
      }
      const date = element.querySelector(".is-date");
      if (date) {
        const p = document2.createElement("p");
        p.textContent = date.textContent.trim();
        textParts.push(p);
      }
      const ctaHref = (element.querySelector(".has-head a[href], .has-img a[href], a.btn-arrow[href]") || {}).getAttribute ? element.querySelector(".has-head a[href], .has-img a[href], a.btn-arrow[href]").getAttribute("href") : null;
      if (ctaHref) {
        const cta = document2.createElement("a");
        cta.setAttribute("href", ctaHref);
        const ctaEl = element.querySelector(".has-cta a, a.btn-arrow");
        const ctaLabel = ctaEl ? ctaEl.textContent.replace(/\s+/g, " ").trim() : "";
        cta.textContent = ctaLabel || "Preview This Month\u2019s Issue";
        const p = document2.createElement("p");
        p.appendChild(cta);
        textParts.push(p);
      }
    }
    if (!image && textParts.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    const imageCell = document2.createDocumentFragment();
    if (image) {
      imageCell.appendChild(document2.createComment(" field:image "));
      imageCell.appendChild(image);
      cells.push([imageCell]);
    }
    if (textParts.length) {
      const textCell = document2.createDocumentFragment();
      textCell.appendChild(document2.createComment(" field:text "));
      textParts.forEach((n) => textCell.appendChild(n));
      cells.push([textCell]);
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards.js
  function parse2(element, { document: document2 }) {
    const promoteImg = (img) => {
      if (!img) return null;
      const real = img.getAttribute("data-src-lg") || img.getAttribute("data-src") || img.getAttribute("data-src-xs") || img.getAttribute("data-flickity-lazyload");
      if (real && (!img.getAttribute("src") || /BackgroundGradLoad|blank|placeholder/i.test(img.getAttribute("src") || ""))) {
        img.setAttribute("src", real);
      }
      if (!img.getAttribute("src") || /BackgroundGradLoad|blank|placeholder/i.test(img.getAttribute("src") || "")) {
        return null;
      }
      const alt = img.getAttribute("alt");
      if (alt) {
        const clean = alt.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
        img.setAttribute("alt", clean);
      }
      ["data-src-lg", "data-src", "data-src-xs", "data-flickity-lazyload", "width", "height", "class"].forEach((a) => img.removeAttribute(a));
      return img;
    };
    const cells = [];
    const consumed = [];
    const linkedHeading = (level, href, text) => {
      const h = document2.createElement(level);
      if (href) {
        const a = document2.createElement("a");
        a.setAttribute("href", href);
        a.textContent = text;
        h.appendChild(a);
      } else {
        h.textContent = text;
      }
      return h;
    };
    const textPara = (text, href) => {
      const p = document2.createElement("p");
      if (href) {
        const a = document2.createElement("a");
        a.setAttribute("href", href);
        a.textContent = text;
        p.appendChild(a);
      } else {
        p.textContent = text;
      }
      return p;
    };
    const pushCard = (img, textNodes) => {
      const kept = textNodes.filter((n) => n && n.textContent && n.textContent.trim());
      if (!img && !kept.length) return;
      const imageCell = document2.createDocumentFragment();
      if (img) {
        imageCell.appendChild(document2.createComment(" field:image "));
        imageCell.appendChild(img);
      }
      const textCell = document2.createDocumentFragment();
      if (kept.length) {
        textCell.appendChild(document2.createComment(" field:text "));
        kept.forEach((n) => textCell.appendChild(n));
      }
      cells.push([imageCell, textCell]);
    };
    const articleCard = (item) => {
      const headingLink = item.querySelector("h3 a, h2 a");
      const heading = item.querySelector("h3, h2");
      const href = headingLink ? headingLink.getAttribute("href") : (item.querySelector("a.article-link") || {}).getAttribute ? item.querySelector("a.article-link").getAttribute("href") : null;
      const img = promoteImg(item.querySelector("img"));
      const tag = item.querySelector("a.tag, .tag.btn, a.article-tag");
      const desc = item.querySelector("p.clamp-me");
      const author = item.querySelector("p.author-name");
      const nodes = [];
      if (tag) nodes.push(textPara(tag.textContent.replace(/\s+/g, " ").trim(), tag.getAttribute("href")));
      if (heading) {
        nodes.push(linkedHeading(
          heading.tagName.toLowerCase(),
          headingLink ? headingLink.getAttribute("href") : href,
          (headingLink || heading).textContent.replace(/\s+/g, " ").trim()
        ));
      }
      if (desc) nodes.push(textPara(desc.textContent.replace(/\s+/g, " ").trim()));
      if (author) nodes.push(textPara(author.textContent.replace(/\s+/g, " ").trim()));
      pushCard(img, nodes);
    };
    const magazineCard = (item) => {
      const mainLink = item.querySelector("a.main-link") || item.querySelector("a[href]");
      const href = mainLink ? mainLink.getAttribute("href") : null;
      const img = promoteImg(item.querySelector("img"));
      const title = item.querySelector(".content h3, h3, h6");
      const cta = item.querySelector(".content .btn, .btn.reverse, .mobile-links a.btn, a.btn");
      const nodes = [];
      if (title) nodes.push(linkedHeading("h3", href, title.textContent.replace(/\s+/g, " ").trim()));
      if (cta) nodes.push(textPara(cta.textContent.replace(/\s+/g, " ").trim(), href));
      pushCard(img, nodes);
    };
    const watchTile = (item) => {
      const titleLink = item.querySelector("h3 a, h2 a");
      const title = item.querySelector("h3, h2");
      const desc = item.querySelector(".content > p, p");
      const cta = item.querySelector("a.btn, a.reverse");
      const nodes = [];
      if (title) {
        nodes.push(linkedHeading(
          title.tagName.toLowerCase(),
          titleLink ? titleLink.getAttribute("href") : null,
          (titleLink || title).textContent.replace(/\s+/g, " ").trim()
        ));
      }
      if (desc) nodes.push(textPara(desc.textContent.replace(/\s+/g, " ").trim()));
      if (cta) nodes.push(textPara(cta.textContent.replace(/\s+/g, " ").trim(), cta.getAttribute("href")));
      pushCard(null, nodes);
    };
    const moreInsideRow = (row) => {
      const img = promoteImg(row.querySelector("img"));
      const heading = row.querySelector("h1, h2, h3, h4, h5");
      const desc = row.querySelector("p");
      const nodes = [];
      if (heading) nodes.push(heading.cloneNode(true));
      if (desc) nodes.push(desc.cloneNode(true));
      pushCard(img, nodes);
    };
    const isWatch = element.classList.contains("caro") || element.classList.contains("feature");
    const isMoreInside = element.classList.contains("more-inside");
    const isMagRow = element.classList.contains("has-prods") || element.classList.contains("has-mags") || /getmagazine|specialinterest/i.test(element.id || "");
    if (isMoreInside) {
      element.querySelectorAll(":scope > .row").forEach((row) => {
        moreInsideRow(row);
        consumed.push(row);
      });
    } else if (isWatch) {
      element.querySelectorAll(".caro-item").forEach((it) => {
        watchTile(it);
        consumed.push(it);
      });
    } else if (isMagRow) {
      element.querySelectorAll(".grid-item").forEach((it) => {
        magazineCard(it);
        consumed.push(it);
      });
    } else {
      const items = element.querySelectorAll(":scope > .grid-item, .grid-item");
      items.forEach((item) => {
        if (item.classList.contains("is-sidebar")) return;
        if (item.querySelector(".mini-promo, .is-fixed")) return;
        articleCard(item);
        consumed.push(item);
      });
    }
    if (!cells.length) {
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards", cells });
    const anchor = consumed[0];
    if (anchor && anchor.parentNode) {
      anchor.parentNode.insertBefore(block, anchor);
      consumed.forEach((n) => {
        if (n.parentNode) n.remove();
      });
    } else {
      element.replaceWith(block);
    }
  }

  // tools/importer/parsers/columns.js
  function parse3(element, { document: document2 }) {
    const promoteImg = (img) => {
      if (!img) return;
      const real = img.getAttribute("data-src") || img.getAttribute("data-src-lg") || img.getAttribute("data-src-xs") || img.getAttribute("data-flickity-lazyload");
      if (real && (!img.getAttribute("src") || /BackgroundGradLoad|blank|placeholder/i.test(img.getAttribute("src") || ""))) {
        img.setAttribute("src", real);
      }
    };
    const columnEls = Array.from(element.querySelectorAll(":scope > div")).filter((d) => d.textContent.trim() || d.querySelector("img"));
    if (columnEls.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const row = columnEls.map((col) => {
      col.querySelectorAll("img").forEach(promoteImg);
      const frag = document2.createDocumentFragment();
      Array.from(col.childNodes).forEach((n) => frag.appendChild(n.cloneNode(true)));
      return frag;
    });
    const cells = [row];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns", cells });
    element.replaceWith(block);
  }

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

  // tools/importer/import-magazine.js
  var parsers = {
    hero: parse,
    cards: parse2,
    columns: parse3
  };
  var transformers = [transform, transform2, transform3];
  var PAGE_TEMPLATE = {
    name: "magazine",
    targetPath: "/magazine/bowhunter-current-issue",
    blocks: [
      { name: "hero", instances: ["main.single-article .whats-inside"] },
      { name: "cards", instances: ["main.single-article .more-inside"] },
      { name: "section-magazine-sub", instances: ["section.has-promo.is-magazine-sub"], section: "highlight" },
      { name: "columns", instances: ["section.has-promo.is-magazine-sub .row", "section.wrapper.buy-issue .row.middle-sm"] }
    ]
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
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      if (!parsers[blockDef.name]) return;
      blockDef.instances.forEach((selector) => {
        const elements = document2.querySelectorAll(selector);
        if (elements.length === 0) console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        elements.forEach((element) => pageBlocks.push({ name: blockDef.name, selector, element, section: blockDef.section || null }));
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_magazine_default = {
    transform: (payload) => {
      const { document: document2, url, params } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
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
        report: { title: document2.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) }
      }];
    }
  };
  return __toCommonJS(import_magazine_exports);
})();

