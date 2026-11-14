// src/assistant-cli.ts
import { constants } from "node:fs";
import { open, readFile } from "node:fs/promises";

// src/interactions.ts
import { z } from "zod";
import { basicCatalog } from "@a2ui/web_core/v1_0";

// src/protocol.ts
var LIMITS = {
  sourceBytes: 32 * 1024,
  snapshotBytes: 256 * 1024,
  bodyBytes: 64 * 1024,
  components: 64,
  surfaces: 4,
  depth: 16,
  clients: 8,
  events: 1024,
  queuedBytes: 256 * 1024
};
var UiError = class extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
};

// src/inputs.ts
var inputTypes = /* @__PURE__ */ new Set(["TextField", "CheckBox", "ChoicePicker", "Slider", "DateTimeInput", "SearchablePicker"]);
function inputPaths(components) {
  const paths = /* @__PURE__ */ new Map();
  for (const component of components) {
    if (!inputTypes.has(component.component)) continue;
    const value = component.value;
    if (!value || typeof value !== "object" || !("@path" in value)) continue;
    const path = value["@path"];
    const previous = paths.get(path);
    if (previous && (previous.component !== "TextField" || component.component !== "TextField")) throw new UiError(400, "Typed input bindings must not share paths");
    paths.set(path, component);
  }
  return paths;
}
function datePart(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const [year, month, day] = match.slice(1).map(Number);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return year >= 1 && month >= 1 && month <= 12 && day >= 1 && day <= days[month - 1];
}
function dateValue(component, value, empty) {
  if (typeof value !== "string") throw new UiError(400, "Date/time input must be a string");
  if (empty && value === "") return "";
  const date = component.enableDate;
  const time = component.enableTime;
  const parts = date && time ? value.split("T") : [value];
  const valid = date && time ? parts.length === 2 && datePart(parts[0]) && timePart(parts[1]) : date ? datePart(value) : timePart(value);
  if (!valid) throw new UiError(400, "Invalid local calendar date/time");
  return time && (date ? parts[1] : value).length === 8 ? value.slice(0, -3) : value;
}
function timePart(value) {
  return /^(?:[01]\d|2[0-3]):[0-5]\d(?::00)?$/.test(value);
}
function validateInput(component, value) {
  switch (component.component) {
    case "TextField":
      if (typeof value !== "string") throw new UiError(400, "TextField context must be a string");
      break;
    case "CheckBox":
      if (typeof value !== "boolean") throw new UiError(400, "CheckBox value must be a boolean");
      break;
    case "ChoicePicker":
    case "SearchablePicker": {
      const options = component.options;
      const allowed = new Set(options.map((option) => option.value));
      if (allowed.size !== options.length) throw new UiError(400, "Duplicate choice option IDs");
      if (!Array.isArray(value) || value.some((item) => typeof item !== "string" || !allowed.has(item)) || new Set(value).size !== value.length || component.variant !== "multipleSelection" && value.length > 1) throw new UiError(400, "Invalid choice selection");
      break;
    }
    case "Slider": {
      const min = component.min ?? 0;
      const max = component.max;
      if (typeof min !== "number" || typeof max !== "number" || !Number.isFinite(min) || !Number.isFinite(max) || min >= max || !Number.isFinite(max - min)) throw new UiError(400, "Invalid static slider range");
      if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max) throw new UiError(400, "Slider value outside the declared range");
      if (component.steps !== void 0) {
        const steps = component.steps;
        if (typeof steps !== "number" || !Number.isSafeInteger(steps) || steps < 1) throw new UiError(400, "Invalid slider divisions");
        const index = (value - min) / (max - min) * steps;
        if (Math.abs(index - Math.round(index)) > 1e-8) throw new UiError(400, "Slider value is off the declared grid");
      }
      break;
    }
    case "DateTimeInput": {
      if (typeof component.enableDate !== "boolean" || typeof component.enableTime !== "boolean" || !component.enableDate && !component.enableTime) throw new UiError(400, "Date/time flags must be explicit and enable at least one input");
      const current = dateValue(component, value, true);
      const min = component.min === void 0 ? void 0 : dateValue(component, component.min, false);
      const max = component.max === void 0 ? void 0 : dateValue(component, component.max, false);
      if (min !== void 0 && max !== void 0 && min > max || current !== "" && (min !== void 0 && current < min || max !== void 0 && current > max)) throw new UiError(400, "Date/time value outside the declared range");
      break;
    }
  }
}
function validateInputs(components, resolve) {
  const entries = [...components];
  inputPaths(entries);
  for (const component of entries) {
    if (!inputTypes.has(component.component)) continue;
    const value = component.value;
    validateInput(component, value && typeof value === "object" && "@path" in value ? resolve(value["@path"]) : value);
  }
}

// src/interactions.ts
var choice = basicCatalog.components.get("ChoicePicker").schema;
var searchablePickerApi = { name: "SearchablePicker", schema: z.object({ label: z.string().min(1).max(128), options: z.array(z.object({ label: z.string().min(1).max(128), value: z.string().min(1).max(128) }).strict()).max(200), value: choice.shape.value, variant: z.enum(["mutuallyExclusive", "multipleSelection"]).default("mutuallyExclusive") }).strict() };
var ruleSchema = z.object({ fieldId: z.string().min(1).max(128), message: z.string().min(1).max(256), required: z.boolean().optional(), minLength: z.number().int().min(0).max(4096).optional(), maxLength: z.number().int().min(0).max(4096).optional() }).strict();
var formValidationApi = { name: "FormValidation", schema: z.object({ title: z.string().min(1).max(128).default("Check these fields"), buttons: z.array(z.string().min(1).max(128)).min(1).max(16), rules: z.array(ruleSchema).min(1).max(16) }).strict() };
var interactionApis = [searchablePickerApi, formValidationApi];
function bindingPath(value) {
  return value && typeof value === "object" && !Array.isArray(value) && "@path" in value && typeof value["@path"] === "string" ? value["@path"] : void 0;
}
function declaration(component) {
  return component?.action?.event?.context ?? {};
}
function validateInteractions(message, _initial = false) {
  const components = message.createSurface.components;
  let validations = 0;
  for (const c of components) {
    if (c.component === "SearchablePicker") {
      const { id: _, component: __, ...props } = c;
      const parsed = searchablePickerApi.schema.parse(props);
      if (!bindingPath(parsed.value)) throw new UiError(400, "SearchablePicker requires an initialized absolute value binding");
      Object.assign(c, parsed);
    }
    if (c.component === "FormValidation") {
      if (++validations > 1) throw new UiError(400, "Only one FormValidation per surface");
      const { id: _, component: __, ...props } = c;
      const data = formValidationApi.schema.parse(props);
      if (new Set(data.buttons).size !== data.buttons.length) throw new UiError(400, "FormValidation buttons must be distinct");
      const fields = /* @__PURE__ */ new Set();
      const paths = /* @__PURE__ */ new Set();
      for (const rule of data.rules) {
        const field = components.find((n) => n.id === rule.fieldId);
        const path = bindingPath(field?.value);
        if (!field || !["TextField", "CheckBox", "ChoicePicker", "SearchablePicker", "Slider", "DateTimeInput"].includes(field.component) || !path) throw new UiError(400, "Validation field must be a reachable bound input");
        if (fields.has(rule.fieldId) || paths.has(path)) throw new UiError(400, "Validation rules must not share fields or paths");
        fields.add(rule.fieldId);
        paths.add(path);
        if (rule.required !== true && !(rule.minLength !== void 0 && rule.minLength > 0) && rule.maxLength === void 0) throw new UiError(400, "Validation rule needs a meaningful constraint");
        if (rule.minLength !== void 0 || rule.maxLength !== void 0) {
          if (!["TextField", "ChoicePicker", "SearchablePicker"].includes(field.component)) throw new UiError(400, "Length rules require text or choices");
          if ((rule.minLength ?? 0) > (rule.maxLength ?? 4096)) throw new UiError(400, "Reversed validation lengths");
        }
      }
      for (const id of data.buttons) {
        const button = components.find((n) => n.id === id);
        if (button?.component !== "Button") throw new UiError(400, "Validation guard must name a reachable Button");
        const values = Object.values(declaration(button));
        for (const path of paths) if (!values.some((value) => bindingPath(value) === path)) throw new UiError(400, "Guarded Button must bind every ruled input path");
      }
      Object.assign(c, data);
    }
  }
}

// src/live.ts
import { z as z2 } from "zod";
var logStates = ["idle", "running", "completed", "error", "paused", "interrupted"];
var logViewApi = { name: "LogView", schema: z2.object({ stream: z2.literal("tools").default("tools"), text: z2.string().default(""), omitted: z2.boolean().default(false), state: z2.enum(logStates).default("idle") }).strict() };
var seriesSchema = z2.array(z2.object({ name: z2.string().min(1).max(128), points: z2.array(z2.object({ label: z2.string().max(128), value: z2.number().finite() }).strict()).max(200) }).strict()).max(4);
var chartApi = { name: "Chart", schema: z2.object({ kind: z2.enum(["line", "bar"]), series: seriesSchema }).strict() };
var liveApis = [logViewApi, chartApi];
function trimLog(input, bytes = 65536, maxLines = 1e3) {
  let text2 = input;
  let omitted = false;
  if (text2.length > 65536) {
    text2 = text2.slice(-65536);
    omitted = true;
  }
  const rows = text2.split("\n");
  if (rows.length > maxLines) {
    text2 = rows.slice(-maxLines).join("\n");
    omitted = true;
  }
  while (new TextEncoder().encode(JSON.stringify(text2)).byteLength > bytes) {
    text2 = text2.slice(Math.max(1, Math.ceil(text2.length / 8)));
    omitted = true;
  }
  if (text2.length && /[\uDC00-\uDFFF]/.test(text2[0])) {
    text2 = text2.slice(1);
    omitted = true;
  }
  return { text: JSON.parse(JSON.stringify(text2)), omitted };
}
function validateSeries(input) {
  const series = seriesSchema.parse(input);
  const names = /* @__PURE__ */ new Set();
  for (const item of series) {
    if (names.has(item.name)) throw new UiError(400, "Chart series names must be unique");
    names.add(item.name);
    if (item.points.length !== series[0].points.length || item.points.some((point, index) => point.label !== series[0].points[index].label)) throw new UiError(400, "Chart series labels must align");
  }
  return series;
}
function validateLive(message, initial = false) {
  let logs = 0;
  for (const component of message.createSurface.components) {
    if (component.component === "Chart") validateSeries(component.series);
    if (component.component === "LogView") {
      if (++logs > 1) throw new UiError(400, "Only one LogView per surface");
      const { id: _, component: __, ...props } = component;
      const data = logViewApi.schema.parse(props);
      if (initial && (data.text !== "" || data.omitted || data.state !== "idle")) throw new UiError(400, "LogView initial output is server-controlled");
      if (trimLog(data.text).text !== data.text) throw new UiError(413, "Saved LogView exceeds its text/line budget");
      Object.assign(component, data);
    }
  }
}

// src/workbench.ts
import { z as z3 } from "zod";
import { basicCatalog as basicCatalog2 } from "@a2ui/web_core/v1_0";
var identity = z3.string().regex(/^[A-Za-z0-9_-]{1,64}$/);
var dataTableApi = { name: "DataTable", schema: z3.object({ caption: z3.string().min(1).max(256), columns: z3.array(z3.object({ id: identity, label: z3.string().min(1).max(128) }).strict()).min(1).max(12), rows: z3.array(z3.object({ id: identity, cells: z3.array(z3.union([z3.string().max(256), z3.number().finite(), z3.boolean(), z3.null()])).max(12) }).strict()).max(200), state: z3.enum(["ready", "loading", "error"]).default("ready"), message: z3.string().max(512).default("") }).strict() };
var codeBlockApi = { name: "CodeBlock", schema: z3.object({ code: z3.string(), language: z3.string().max(32).default("text"), copyable: z3.boolean().default(true) }).strict() };
var markdownApi = { name: "MarkdownView", schema: z3.object({ text: z3.string() }).strict() };
var detailsApi = { name: "Details", schema: z3.object({ title: z3.string().min(1).max(256), child: basicCatalog2.components.get("Card").schema.shape.child, open: z3.boolean().default(false) }).strict() };
var statusBadgeApi = { name: "StatusBadge", schema: z3.object({ label: z3.string().min(1).max(256), status: z3.enum(["info", "success", "warning", "error", "running"]), provenance: z3.literal("reported").default("reported") }).strict() };
var taskProgressApi = { name: "TaskProgress", schema: z3.object({ stream: z3.literal("tools").default("tools"), state: z3.enum(logStates).default("idle"), started: z3.number().int().min(0).max(1024).default(0), settled: z3.number().int().min(0).max(1024).default(0), failed: z3.number().int().min(0).max(1024).default(0), omitted: z3.boolean().default(false) }).strict() };
var artifactUrl = z3.string().regex(/^\/api\/artifacts\/[a-f0-9]{32}$/);
var artifactPreviewApi = { name: "ArtifactPreview", schema: z3.object({ src: artifactUrl, kind: z3.enum(["image", "video", "audio"]), label: z3.string().min(1).max(256) }).strict() };
var workbenchApis = [dataTableApi, codeBlockApi, markdownApi, detailsApi, statusBadgeApi, taskProgressApi, artifactPreviewApi];
function validateWorkbench(message, initial = false) {
  let progressCount = 0, modalCount = 0;
  for (const c of message.createSurface.components) {
    if (["Image", "Video", "AudioPlayer"].includes(c.component)) {
      artifactUrl.parse(c.url);
      if (c.posterUrl !== void 0) artifactUrl.parse(c.posterUrl);
      for (const prop of ["description", "fit", "variant"]) if (c[prop] !== void 0 && typeof c[prop] !== "string") throw new UiError(400, "Artifact media props must be static");
    }
    if (c.component === "Icon" && !["check", "close", "error", "info", "warning", "folder", "help", "refresh", "play", "pause", "search", "settings"].includes(c.name)) throw new UiError(400, "Icon name must be a static approved local icon");
    if (c.component === "Modal") {
      if (++modalCount > 1) throw new UiError(400, "Only one Modal per surface");
      const trigger = message.createSurface.components.find((node) => node.id === c.trigger);
      if (!trigger || !["Text", "Icon"].includes(trigger.component)) throw new UiError(400, "Modal trigger must be Text or Icon");
    }
    if (c.component === "StatusBadge") {
      const { id: _, component: __, ...props } = c;
      Object.assign(c, statusBadgeApi.schema.parse(props));
    }
    if (c.component === "TaskProgress") {
      const { id: _, component: __, ...props } = c;
      const p = taskProgressApi.schema.parse(props);
      if (++progressCount > 1 || p.failed > p.settled || p.settled > p.started) throw new UiError(400, "Invalid native tool progress counters");
      if (initial && (p.state !== "idle" || p.started !== 0 || p.settled !== 0 || p.failed !== 0 || p.omitted)) throw new UiError(400, "TaskProgress initial values are server-controlled");
      Object.assign(c, p);
    }
    if (c.component === "CodeBlock" || c.component === "MarkdownView") {
      const { id: _, component: __, ...props } = c;
      const p = (c.component === "CodeBlock" ? codeBlockApi : markdownApi).schema.parse(props);
      const value = "code" in p ? p.code : p.text;
      if (new TextEncoder().encode(value).byteLength > 16384 || value.split(/\r\n|\r|\n/).length > 512) throw new UiError(413, "Text block exceeds16KiB/512 lines");
      Object.assign(c, p);
    }
    if (c.component === "DataTable") {
      const { id: _, component: __, ...props } = c;
      const p = dataTableApi.schema.parse(props);
      if (new Set(p.columns.map((x) => x.id)).size !== p.columns.length || new Set(p.rows.map((x) => x.id)).size !== p.rows.length || p.rows.some((x) => x.cells.length !== p.columns.length)) throw new UiError(400, "Table requires unique IDs and one cell per column");
      Object.assign(c, p);
    }
  }
}

// src/compiler.ts
import { A2uiGenerator, CatalogConfig, ExpressFormatFactory, RendererState } from "@a2ui/agent";

// src/coding.ts
import { z as z4 } from "zod";
var identity2 = z4.string().regex(/^[A-Za-z0-9_-]{1,64}$/);
var text = z4.string().min(1).max(512);
var codeDiffApi = { name: "CodeDiff", schema: z4.object({ proposalId: identity2, filename: text, baseRevision: text, before: z4.string(), after: z4.string() }).strict() };
var testResultsApi = { name: "TestResults", schema: z4.object({ resultId: identity2, command: text, evidence: text, cases: z4.array(z4.object({ id: identity2, name: text, status: z4.enum(["pass", "fail", "skip", "error"]), details: z4.string().max(4096).optional() }).strict()).max(128), summary: z4.object({ pass: z4.number().int().min(0).max(128), fail: z4.number().int().min(0).max(128), skip: z4.number().int().min(0).max(128), error: z4.number().int().min(0).max(128) }).strict() }).strict() };
var codingApis = [codeDiffApi, testResultsApi];
function lines(value) {
  if (new TextEncoder().encode(value).byteLength > 16384) throw new UiError(413, "CodeDiff source exceeds16KiB per side");
  const result = value === "" ? [] : value.split("\n");
  if (result.length > 512) throw new UiError(413, "CodeDiff source exceeds512 lines per side");
  return result;
}
function diffLines(before, after) {
  const old = lines(before), next = lines(after);
  let prefix = 0, suffix = 0;
  while (prefix < old.length && prefix < next.length && old[prefix] === next[prefix]) prefix++;
  while (suffix < old.length - prefix && suffix < next.length - prefix && old[old.length - 1 - suffix] === next[next.length - 1 - suffix]) suffix++;
  const result = [];
  for (let i = 0; i < prefix; i++) result.push({ kind: "context", text: old[i], before: i + 1, after: i + 1 });
  for (let i = prefix; i < old.length - suffix; i++) result.push({ kind: "remove", text: old[i], before: i + 1 });
  for (let i = prefix; i < next.length - suffix; i++) result.push({ kind: "add", text: next[i], after: i + 1 });
  for (let i = 0; i < suffix; i++) result.push({ kind: "context", text: old[old.length - suffix + i], before: old.length - suffix + i + 1, after: next.length - suffix + i + 1 });
  return result;
}
function validateCoding(message) {
  let proposal, result;
  for (const component of message.createSurface.components) {
    if (component.component === "CodeDiff") {
      if (proposal !== void 0) throw new UiError(400, "Only one CodeDiff per surface");
      proposal = component.proposalId;
      diffLines(component.before, component.after);
    }
    if (component.component === "TestResults") {
      if (result !== void 0) throw new UiError(400, "Only one TestResults per surface");
      result = component.resultId;
      const rows = component.cases;
      const counts = { pass: 0, fail: 0, skip: 0, error: 0 };
      const ids = /* @__PURE__ */ new Set();
      for (const row of rows) {
        if (ids.has(row.id)) throw new UiError(400, "Duplicate test case ID");
        ids.add(row.id);
        counts[row.status]++;
      }
      const summary = component.summary;
      if (Object.keys(counts).some((key) => counts[key] !== summary[key])) throw new UiError(400, "Test summary does not match case records");
    }
  }
  for (const component of message.createSurface.components) {
    if (component.component !== "Button") continue;
    const context = component.action?.event?.context;
    if ((proposal !== void 0 || result !== void 0) && (context?.proposalId !== proposal || context?.resultId !== result)) throw new UiError(400, "Coding actions must reference current literal record IDs");
  }
}

// src/catalog.ts
import { basicCatalog as basicCatalog3 } from "@a2ui/web_core/v1_0";
var official = basicCatalog3.derive({
  catalogId: basicCatalog3.id,
  components: ["Text", "Column", "Row", "Card", "Button", "TextField", "CheckBox", "ChoicePicker", "Slider", "DateTimeInput", "Tabs", "Divider"],
  functions: [],
  instructions: "Use only the twelve declared components. Text is literal escaped plain text. Use event actions only. No functions, checks, templates, URLs, media or executable expressions. Bind event context only to absolute value paths of reachable inputs. Initialize TextField with strings, CheckBox booleans, Slider bounded finite numbers, ChoicePicker string arrays. Use explicit enableDate/enableTime flags and local YYYY-MM-DD / HH:mm / YYYY-MM-DDTHH:mm date/time strings, optional :00 seconds. Declare static ranges/options."
});
var base = official;
var legacyCatalog = base.derive({ catalogId: official.id, functions: [], instructions: official.instructions, components: [...official.components.values()].map(({ element: _element, tagName: _tagName, ...api }) => api) });
var codingCatalog = legacyCatalog.derive({ catalogId: "https://jackallink.github.io/pi-a2ui/catalogs/coding-v1.json", functions: [], components: [...legacyCatalog.components.values(), ...codingApis], instructions: legacyCatalog.instructions?.replace("Use only the twelve declared components.", "Use only the declared components/signatures.") + " CodeDiff and TestResults are static read-only records. Each surface has at most one of each; every Button must include current literal proposalId/resultId. IDs are immutable within a session. Test results are supplied tool evidence, not independently certified by the browser." });
var restrictedCatalog = codingCatalog.derive({ catalogId: "https://jackallink.github.io/pi-a2ui/catalogs/live-v1.json", functions: [], components: [...codingCatalog.components.values(), ...liveApis], instructions: codingCatalog.instructions + ' LogView(stream="tools") is server-controlled native tool output; omit its text/state/omitted initial values. Never place it inside a Button. Chart supports only static line/bar aligned finite series. Use a2ui_update_chart to update an existing Chart without replacing inputs. No model call per output chunk.' });
var workbenchCatalog = restrictedCatalog.derive({ catalogId: "https://jackallink.github.io/pi-a2ui/catalogs/workbench-v1.json", functions: [], components: [...restrictedCatalog.components.values(), ...workbenchApis, ...["List", "Modal", "Icon", "Image", "Video", "AudioPlayer"].map((name) => {
  const { element: _, tagName: __, ...api } = basicCatalog3.components.get(name);
  return api;
})], instructions: restrictedCatalog.instructions?.replace("No functions, checks, templates, URLs, media or executable expressions.", "No functions, checks, templates or executable expressions. URLs only in registered artifact media props.") + ' List has static children. DataTable contains bounded primitive cells and unique row/column IDs. Table sorting and filtering are browser-local. CodeBlock preserves literal code with a local copy button; never nest it or DataTable in Button. MarkdownView explicitly renders a safe limited subset; no links/images/HTML. Text stays literal. Details(title,child,open?) is a local disclosure; Accordion is multiple Details. Never place local interactive widgets inside Button. StatusBadge is reported/unverified. TaskProgress(stream="tools") is native-server controlled; omit counters/state/omitted initial values, never fabricate a planned percentage. Modal(trigger,content) has a local Text/Icon-only trigger; at most one per surface. Image/Video/AudioPlayer.url (Video.posterUrl too) and ArtifactPreview.src must be the exact opaque src returned by a2ui_register_artifact. No external/file/data/blob URLs or SVG. Native media controls are local; no autoplay/microphone. Video supports WebM/MP4, AudioPlayer WAV; browser codec failures are visible. Artifacts expire on reset/pause; label is not verified metadata. Icon names are static local check/close/error/info/warning/folder/help/refresh/play/pause/search/settings.' });
var interactionsCatalog = workbenchCatalog.derive({ catalogId: "https://jackallink.github.io/pi-a2ui/catalogs/interactions-v1.json", functions: [], components: [...workbenchCatalog.components.values(), ...interactionApis], instructions: workbenchCatalog.instructions + " SearchablePicker(label,options,value,variant?) has static label/options and an initialized absolute string-array value binding. Single mutuallyExclusive or multipleSelection; query/filter/removal is browser-local and never submits arbitrary text. At most200 distinct option values; never nest in a Button. FormValidation(title?,buttons,rules) names reachable input field IDs and guarded Button IDs. Every guard must bind every ruled path; only required/minLength/maxLength constraints, no functions/checks. Initial business-invalid drafts are allowed; only guarded submits require valid values. Never nest validation in a Button." });
var catalogs = [legacyCatalog, codingCatalog, restrictedCatalog, workbenchCatalog, interactionsCatalog];

// src/compiler.ts
function record(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value) && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
}
function exactKeys(value, required, optional = []) {
  if (required.some((key) => !Object.hasOwn(value, key)) || Object.keys(value).some((key) => !required.includes(key) && !optional.includes(key))) throw new UiError(400, "Unexpected or missing fields");
}
function boundedJson(value, bytes = LIMITS.snapshotBytes) {
  const ancestors = /* @__PURE__ */ new Set();
  let entries = 0;
  function visit(item, depth) {
    if (++entries > 4096) throw new UiError(413, "JSON total entries limit exceeded");
    if (typeof item === "string" && Buffer.byteLength(item, "utf8") > bytes) throw new UiError(413, "JSON byte limit exceeded");
    if (depth > LIMITS.depth) throw new UiError(413, "JSON nesting exceeds limit");
    if (item === null || typeof item === "string" || typeof item === "boolean" || typeof item === "number" && Number.isFinite(item)) return;
    if (!Array.isArray(item) && !record(item)) throw new UiError(400, "Expected JSON data");
    if ((Array.isArray(item) ? item.length : Object.keys(item).length) > 256) throw new UiError(413, "JSON collection cardinality limit exceeded");
    if (ancestors.has(item)) throw new UiError(400, "Cyclic JSON data");
    ancestors.add(item);
    for (const [key, child] of Object.entries(item)) {
      if (["__proto__", "prototype", "constructor"].includes(key)) throw new UiError(400, "Unsafe data key");
      visit(child, depth + 1);
    }
    ancestors.delete(item);
  }
  visit(value, 0);
  if (Buffer.byteLength(JSON.stringify(value), "utf8") > bytes) throw new UiError(413, "JSON byte limit exceeded");
}
function isBinding(value) {
  return record(value) && Object.keys(value).length === 1 && typeof value["@path"] === "string" && /^(?:\/(?:[^~/\x00-\x1f\x7f]|~[01])+)+$/.test(value["@path"]);
}
function noExpressions(value) {
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    if (key === "checks" || key === "path" || key.startsWith("@") && key !== "@path" || key === "call" || key === "callFunction") throw new UiError(400, "Executable expressions and checks are unavailable");
    if (key === "@path" && !isBinding(value)) throw new UiError(400, "Only absolute data bindings are supported");
    noExpressions(child);
  }
}
function processor(surfaceId) {
  return new A2uiGenerator([new CatalogConfig(interactionsCatalog)], void 0, new ExpressFormatFactory({ surfaceId })).createProcessor({ "1.0": { supportedCatalogIds: [interactionsCatalog.id] } });
}
function validateSurface(input) {
  try {
    let walk2 = function(id, depth, insideButton = false) {
      if (depth > LIMITS.depth) throw new UiError(413, "Tree depth exceeded");
      if (reachable.has(id)) throw new UiError(400, "Components must form a tree without repeated children");
      const component = components.get(id);
      if (!component) throw new UiError(400, "Missing root or child");
      if (insideButton && ["LogView", "DataTable", "CodeBlock", "Details", "TaskProgress", "Modal", "Image", "ArtifactPreview", "Video", "AudioPlayer", "SearchablePicker", "FormValidation"].includes(component.component)) throw new UiError(400, component.component + " must not be nested in a Button");
      reachable.add(id);
      const children = component.component === "Modal" ? [component.trigger, component.content] : component.component === "Tabs" && Array.isArray(component.tabs) ? component.tabs.map((tab) => tab.child) : Array.isArray(component.children) ? component.children : typeof component.child === "string" ? [component.child] : [];
      for (const child of children) {
        if (typeof child !== "string") throw new UiError(400, "Expected static child ID");
        walk2(child, depth + 1, insideButton || component.component === "Button");
      }
    }, checkBindings2 = function(value) {
      if (isBinding(value)) {
        dataModel.get(value["@path"]);
      } else if (value && typeof value === "object") {
        for (const child of Object.values(value)) checkBindings2(child);
      }
    };
    var walk = walk2, checkBindings = checkBindings2;
    boundedJson(input);
    if (!record(input)) throw new UiError(400, "Expected surface message");
    exactKeys(input, ["version", "createSurface"]);
    if (input.version !== "1.0" || !record(input.createSurface)) throw new UiError(400, "Unsupported surface message");
    const create = input.createSurface;
    exactKeys(create, ["surfaceId", "catalogId", "components"], ["dataModel"]);
    if (typeof create.surfaceId !== "string" || !/^[A-Za-z0-9_-]{1,64}$/.test(create.surfaceId) || !catalogs.some((catalog) => catalog.id === create.catalogId) || !Array.isArray(create.components) || !create.components.length) throw new UiError(400, "Invalid surface or empty root");
    if (create.components.length > LIMITS.components) throw new UiError(413, "Component limit exceeded");
    noExpressions(create);
    for (const component of create.components) {
      if (!record(component) || typeof component.component !== "string" || !catalogs.find((catalog) => catalog.id === create.catalogId).components.has(component.component)) throw new UiError(400, "Unsupported component");
      if ("children" in component && !Array.isArray(component.children)) throw new UiError(400, "Dynamic children are unavailable");
    }
    const message = structuredClone(input);
    const state = new RendererState(catalogs);
    state.apply(message);
    state.checkTopology([create.surfaceId]);
    const components = new Map(message.createSurface.components.map((component) => [component.id, component]));
    const reachable = /* @__PURE__ */ new Set();
    walk2("root", 1);
    if (reachable.size !== components.size) throw new UiError(400, "Unreachable component");
    const dataModel = state.getSurface(create.surfaceId).dataModel;
    checkBindings2(message.createSurface.components);
    for (const component of components.values()) {
      const properties = component.component === "Text" ? ["text"] : component.component === "TextField" ? ["label", "value", "placeholder"] : ["CheckBox", "ChoicePicker", "Slider", "DateTimeInput"].includes(component.component) ? ["label"] : [];
      const strings = properties.map((property) => [property, component[property]]);
      if (component.component === "Tabs") for (const tab of component.tabs) strings.push(["tabs.title", tab.title]);
      if (component.component === "ChoicePicker") for (const option of component.options) strings.push(["options.label", option.label]);
      if (record(component.accessibility)) {
        strings.push(["accessibility.label", component.accessibility.label], ["accessibility.description", component.accessibility.description]);
      }
      for (const [property, binding] of strings) {
        if (isBinding(binding) && typeof dataModel.get(binding["@path"]) !== "string") throw new UiError(400, `Bound ${component.component}.${property} must resolve to an initialized string`);
      }
    }
    validateInputs(components.values(), (path) => dataModel.get(path));
    const fields = inputPaths(components.values());
    for (const component of components.values()) {
      if (component.component !== "Button") continue;
      const action = component.action;
      if (!record(action) || !record(action.event)) throw new UiError(400, "Only event actions are supported");
      exactKeys(action, ["event"]);
      exactKeys(action.event, ["name"], ["context"]);
      const context = action.event.context ?? {};
      if (!record(context)) throw new UiError(400, "Expected event context");
      for (const value of Object.values(context)) {
        if (isBinding(value)) {
          if (!fields.has(value["@path"])) throw new UiError(400, "Context must bind to a reachable input");
        } else if (JSON.stringify(value).includes('"@path"')) throw new UiError(400, "Nested context bindings are unavailable");
      }
    }
    validateCoding(message);
    validateLive(message);
    validateWorkbench(message);
    validateInteractions(message);
    return message;
  } catch (error) {
    if (error instanceof UiError) throw error;
    throw new UiError(400, "Invalid A2UI surface: " + (error instanceof Error ? error.message : "validation failed"));
  }
}
function preflightSource(source) {
  let tokens = 0;
  const delimiters = [];
  for (let index = 0; index < source.length; ) {
    if (/\s/.test(source[index])) {
      index++;
      continue;
    }
    if (source[index] === "#" || source.startsWith("//", index)) {
      while (index < source.length && source[index] !== "\n" && source[index] !== "\r") index++;
      continue;
    }
    if (source.startsWith("/*", index)) {
      const end = source.indexOf("*/", index + 2);
      if (end < 0) throw new UiError(400, "Unterminated source comment");
      index = end + 2;
      continue;
    }
    if (++tokens > 4096) throw new UiError(413, "Source token limit exceeded");
    if (source[index] === '"') {
      const triple = source.startsWith('"""', index);
      const delimiter = triple ? '"""' : '"';
      const raw = index > 0 && /[rR]/.test(source[index - 1]);
      index += delimiter.length;
      while (index < source.length) {
        if (!raw && source[index] === "\\") {
          index += 2;
          continue;
        }
        if (source.startsWith(delimiter, index)) {
          index += delimiter.length;
          break;
        }
        index++;
      }
    } else if ("([{".includes(source[index])) {
      delimiters.push(source[index]);
      if (delimiters.length > 64) throw new UiError(413, "Source delimiter nesting limit exceeded");
      index++;
    } else if (")]}".includes(source[index])) {
      if (delimiters.pop() !== "([{".charAt(")]}".indexOf(source[index]))) throw new UiError(400, "Unmatched source delimiter");
      index++;
    } else if (/[A-Za-z0-9_.~@-]/.test(source[index])) {
      do {
        index++;
      } while (index < source.length && /[A-Za-z0-9_.~@-]/.test(source[index]));
    } else index++;
  }
}
function compile(surfaceId, source) {
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(surfaceId)) throw new UiError(400, "Invalid surface ID");
  if (typeof source !== "string" || !source.trim()) throw new UiError(400, "Source must be nonempty");
  if (Buffer.byteLength(source, "utf8") > LIMITS.sourceBytes) throw new UiError(413, "Source byte limit exceeded");
  preflightSource(source);
  try {
    const state = new RendererState([interactionsCatalog]);
    const parts = processor(surfaceId).parseResponse(source, { wrapped: false, state });
    let creates = 0;
    for (const part of parts) {
      if (part.type !== "a2ui") throw new UiError(400, "Expected only UI content");
      for (const message2 of part.a2ui) {
        const wire = message2;
        const command = wire.createSurface ?? wire.updateComponents ?? wire.updateDataModel;
        if (!command || command.surfaceId !== surfaceId) throw new UiError(400, "Only the requested surface may be changed");
        if (wire.createSurface) creates++;
      }
    }
    if (creates !== 1 || state.surfaceIds.length !== 1 || state.surfaceIds[0] !== surfaceId) throw new UiError(400, "Exactly one complete surface is required");
    state.checkTopology([surfaceId]);
    const surface = state.getSurface(surfaceId);
    const message = { version: "1.0", createSurface: { surfaceId, catalogId: interactionsCatalog.id, components: [...surface.componentsModel.getAll().values()].map((component) => component.componentTree), dataModel: surface.dataModel.get("/") } };
    validateLive(message, true);
    validateWorkbench(message, true);
    validateInteractions(message, true);
    return validateSurface(message);
  } catch (error) {
    if (error instanceof UiError) throw error;
    throw new UiError(400, "Invalid Express source: " + (error instanceof Error ? error.message : "compilation failed"));
  }
}

// src/assistant-cli.ts
var help = "Usage: node SKILL/scripts/a2ui.mjs catalog | examples | example NAME | check --surface-id ID FILE_OR_-\nRead-only preflight; rendering still requires a2ui_render. Requires Node24.x.\n";
async function sourceFile(path) {
  const chunks = [];
  let size = 0;
  if (path === "-") {
    if (process.stdin.isTTY) throw new Error("Pipe Express source to stdin or provide a source file");
    for await (const value of process.stdin) {
      const chunk = Buffer.isBuffer(value) ? value : Buffer.from(value);
      size += chunk.length;
      if (size > LIMITS.sourceBytes) throw new Error("Source byte limit exceeded");
      chunks.push(chunk);
    }
  } else {
    const handle = await open(path, constants.O_RDONLY | constants.O_NONBLOCK);
    try {
      const stat = await handle.stat();
      if (!stat.isFile()) throw new Error("Expected a regular source file");
      if (stat.size > LIMITS.sourceBytes) throw new Error("Source byte limit exceeded");
      const buffer = Buffer.alloc(LIMITS.sourceBytes + 1);
      while (size < buffer.length) {
        const read = await handle.read(buffer, size, buffer.length - size, size);
        if (!read.bytesRead) break;
        size += read.bytesRead;
      }
      if (size > LIMITS.sourceBytes) throw new Error("Source byte limit exceeded");
      chunks.push(buffer.subarray(0, size));
    } finally {
      await handle.close();
    }
  }
  return new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(Buffer.concat(chunks));
}
async function runCli(args) {
  const usage = () => {
    process.stderr.write(JSON.stringify({ error: "Invalid command or arguments", usage: help }) + "\n");
    return 2;
  };
  if (Number(process.versions.node.split(".")[0]) !== 24) {
    process.stderr.write(JSON.stringify({ error: "Node24.x is required; run nvm use 24" }) + "\n");
    return 2;
  }
  if (args.length === 1 && args[0] === "--help") {
    process.stdout.write(help);
    return 0;
  }
  const [command, ...rest] = args;
  if (!["catalog", "examples", "example", "check"].includes(command) || ["catalog", "examples"].includes(command) && rest.length || command === "example" && rest.length !== 1 || command === "check" && (rest.length !== 3 || rest[0] !== "--surface-id")) return usage();
  try {
    const probe = compile("preflight", 'root = Text(text="preflight")');
    const catalog = catalogs.find((c) => c.id === probe.createSurface.catalogId);
    if (command === "catalog") {
      const metadata = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
      process.stdout.write(JSON.stringify({ packageVersion: metadata.version, nodeMajor: 24, catalogId: catalog.id, components: [...catalog.components.keys()].sort(), scope: "This helper package, not an arbitrary running Pi instance" }) + "\n");
      return 0;
    }
    if (command === "examples" || command === "example") {
      const examples = JSON.parse(await readFile(new URL("../skills/pi-a2ui/examples/manifest.json", import.meta.url), "utf8"));
      if (command === "examples") {
        process.stdout.write(JSON.stringify(examples.map((e) => ({ ...e, available: e.requires.every((name) => catalog.components.has(name)) }))) + "\n");
        return 0;
      }
      const selected = examples.find((e) => e.name === rest[0]);
      if (!selected) throw new Error("Unknown example; use examples to list allowed names");
      const missing = selected.requires.filter((name) => !catalog.components.has(name));
      if (missing.length) throw new Error("Example unavailable in this package catalog: " + missing.join(", "));
      const source2 = await readFile(new URL("../skills/pi-a2ui/examples/" + selected.name + ".express", import.meta.url), "utf8");
      compile("preflight", source2);
      process.stdout.write(source2);
      return 0;
    }
    const source = await sourceFile(rest[2]);
    compile(rest[1], source);
    process.stdout.write(JSON.stringify({ surfaceId: rest[1], source }) + "\n");
    return 0;
  } catch (error) {
    process.stderr.write(JSON.stringify({ error: error instanceof Error ? error.message : "Preflight failed" }) + "\n");
    return 1;
  }
}
export {
  runCli
};
