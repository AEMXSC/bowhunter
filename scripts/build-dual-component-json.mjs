/**
 * This project authors blocks for BOTH DA (Document Authoring) and
 * Crosswalk/Universal Editor. Each mode has its own source tree
 * (ue/models/* for DA, blocks/*\/_*.json for Crosswalk) and its own
 * merge-json-cli build (see package.json build:json:da /
 * build:json:xwalk). merge-json-cli only resolves "..." glob refs and
 * concatenates arrays — it can't combine two DEFINITIONS for the same
 * block id (one with plugins.da, one with plugins.xwalk) into one.
 *
 * This script runs both builds into temp files, then merges their
 * "blocks" group definitions by id: a block present in only one mode
 * keeps its single definition; a block present in both gets a single
 * definition with plugins.da AND plugins.xwalk combined. component-
 * models.json and component-filters.json are effectively backend-
 * agnostic (same model/filter shape regardless of authoring mode), so
 * those just get a union-by-id.
 */
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const TMP_DA_DEF = '.tmp-da-component-definition.json';
const TMP_XWALK_DEF = '.tmp-xwalk-component-definition.json';
const TMP_DA_MODELS = '.tmp-da-component-models.json';
const TMP_XWALK_MODELS = '.tmp-xwalk-component-models.json';
const TMP_DA_FILTERS = '.tmp-da-component-filters.json';
const TMP_XWALK_FILTERS = '.tmp-xwalk-component-filters.json';

function run(cmd) {
  execSync(cmd, { stdio: 'inherit' });
}

run(`npx merge-json-cli -i "ue/models/component-definition.json" -o "${TMP_DA_DEF}"`);
run(`npx merge-json-cli -i "models/_component-definition.json" -o "${TMP_XWALK_DEF}"`);
run(`npx merge-json-cli -i "ue/models/component-models.json" -o "${TMP_DA_MODELS}"`);
run(`npx merge-json-cli -i "models/_component-models.json" -o "${TMP_XWALK_MODELS}"`);
run(`npx merge-json-cli -i "ue/models/component-filters.json" -o "${TMP_DA_FILTERS}"`);
run(`npx merge-json-cli -i "models/_component-filters.json" -o "${TMP_XWALK_FILTERS}"`);

const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'));

// --- component-definition.json: merge "blocks" group by id, union other groups ---
const daDef = readJson(TMP_DA_DEF);
const xwalkDef = readJson(TMP_XWALK_DEF);

function mergeGroups(daGroups, xwalkGroups) {
  const byId = new Map();
  const order = [];
  for (const g of daGroups) {
    order.push(g.id);
    byId.set(g.id, { ...g, components: [...g.components] });
  }
  for (const g of xwalkGroups) {
    if (!byId.has(g.id)) {
      order.push(g.id);
      byId.set(g.id, { ...g, components: [] });
    }
    const target = byId.get(g.id);
    const compById = new Map(target.components.map((c) => [c.id, c]));
    for (const comp of g.components) {
      if (compById.has(comp.id)) {
        const existing = compById.get(comp.id);
        existing.plugins = { ...existing.plugins, ...comp.plugins };
        // prefer whichever side declares a "model"/"filter" key when only one does
        if (comp.model && !existing.model) existing.model = comp.model;
        if (comp.filter && !existing.filter) existing.filter = comp.filter;
      } else {
        compById.set(comp.id, comp);
        target.components.push(comp);
      }
    }
  }
  return order.map((id) => byId.get(id));
}

const mergedDef = { groups: mergeGroups(daDef.groups, xwalkDef.groups) };
writeFileSync('component-definition.json', JSON.stringify(mergedDef, null, 2) + '\n');

// --- component-models.json: union by id (same schema either mode) ---
const daModels = readJson(TMP_DA_MODELS);
const xwalkModels = readJson(TMP_XWALK_MODELS);
const modelsById = new Map(daModels.map((m) => [m.id, m]));
for (const m of xwalkModels) if (!modelsById.has(m.id)) modelsById.set(m.id, m);
writeFileSync('component-models.json', JSON.stringify([...modelsById.values()], null, 2) + '\n');

// --- component-filters.json: union by id, merge "components" arrays ---
const daFilters = readJson(TMP_DA_FILTERS);
const xwalkFilters = readJson(TMP_XWALK_FILTERS);
const filtersById = new Map(daFilters.map((f) => [f.id, { ...f, components: [...(f.components || [])] }]));
for (const f of xwalkFilters) {
  if (!filtersById.has(f.id)) {
    filtersById.set(f.id, { ...f, components: [...(f.components || [])] });
  } else {
    const target = filtersById.get(f.id);
    const set = new Set(target.components);
    for (const c of f.components || []) set.add(c);
    target.components = [...set];
  }
}
writeFileSync('component-filters.json', JSON.stringify([...filtersById.values()], null, 2) + '\n');

for (const f of [TMP_DA_DEF, TMP_XWALK_DEF, TMP_DA_MODELS, TMP_XWALK_MODELS, TMP_DA_FILTERS, TMP_XWALK_FILTERS]) {
  execSync(`node -e "require('fs').unlinkSync('${f}')"`);
}

console.log('Built component-definition.json, component-models.json, component-filters.json (DA + Crosswalk merged)');
