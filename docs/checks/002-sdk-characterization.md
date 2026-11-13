# SDK characterization — 2026-11-13

Exploration only, before implementation. Executed in /tmp/pi-a2ui-sdk.5yQ4jb against registry-published packages, not guessed main-branch APIs.

- Installed @a2ui/agent@0.1.0, @a2ui/web_core@0.15.0, @a2ui/lit@0.15.0, lit@3.3.3 without force/legacy peer overrides. 21 packages installed.
- Optional @a2ui/markdown-it@0.2.2 conflicts with core 0.15.0 because it declares ^0.14.0. Excluded; plain text is the scope.
- Node successfully imports official agent and core. basicCatalog.derive with six allowed components, functions:[], replacement instructions yields usable catalog. No extra model or framework required.
- A2uiGenerator([new CatalogConfig(catalog)], undefined, new ExpressFormatFactory({surfaceId:'form'})), createProcessor({'1.0':{supportedCatalogIds:[catalog.id]}}), parseResponse(source,{wrapped:false,state}) successfully compiled a Card/Column/Text/TextField/Button form.
- Hand-checked result: Text('Plan'), bound TextField value {'@path':'/form/name'}, button event submit with context name binding and literal type 'plan'; all children flattened with IDs and one complete createSurface.
- SDK state's getSurface().componentsModel.getAll() componentTree and dataModel.get('/') expose full current state for canonical snapshot materialization.
- Core v1_0 basicCatalog is implementation-backed via universal web components. @a2ui/lit A2uiSurface delegates node rendering to core universal renderer. Browser rendering still needs actual browser acceptance; imports alone do not establish that.
- Pi local binary version 1.5.0; registry latest 1.5.2. Existing provider configuration exists. No credentials read or printed. Live provider readiness not yet established.

This is API feasibility evidence, not TDD RED or product validation. Independent review and implementation gates remain separate.
