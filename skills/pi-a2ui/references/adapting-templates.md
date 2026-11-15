# Adapt a template to the request

Use a known example first. Keep display labels, internal binding paths and submitted field names separate. Changing a label does not rename either the path or the Button's Event context.

For example, a request wants Name, Accept and a Submit button, and Pi must receive exactly `{name: string, accept: boolean}`. The existing `validated-form` example uses an internal checkbox path `$/ok` and submits the example key `ok`. Keep that working path if useful, but change the submitted key to `accept`.

| Requested meaning | Existing value path | Declared Event context |
| --- | --- | --- |
| Name string | `$/name` | `name:$/name` |
| Accept boolean | `$/ok` | `accept:$/ok` |

## Executable adaptation of validated-form

With Node24.x selected, replace the absolute skill directory supplied by Pi below. This pipeline reads the original packaged example without editing it, adapts its submitted key/button text, removes the unrequested Cancel button and checks the resulting source. It writes no source files:

```sh
node "<absolute-skill-path>/scripts/a2ui.mjs" example validated-form |
  sed -e 's#{name:$/name,ok:$/ok}#{name:$/name,accept:$/ok}#' \
      -e 's#Text(text="Save form")#Text(text="Submit")#' \
      -e '/^cancel = /d' \
      -e 's#validation,submit,cancel#validation,submit#' |
  node "<absolute-skill-path>/scripts/a2ui.mjs" check --surface-id custom-form -
```

The successful stdout is exactly `{surfaceId,source}` for `a2ui_render`; pass it as the tool arguments. These substitutions match this packaged template, not arbitrary DSL. For a different request, edit a new unique temporary file or prepare source on stdin; inspect the actual template rather than blindly reusing substitutions. If a property is uncertain, use `component NAME`.

Before render, verify the UI has the requested controls, guarded buttons and validation, then compare the Event context's exact keys and typed bindings with the request. Here the correct context is `{name:$/name,accept:$/ok}`. `{name:$/name,ok:$/ok}` is valid DSL but is the wrong submitted contract for this request. Do not add aliases or literal copies to conceal the mismatch. Preflight proves compiler/project constraints, not that the UI meets the request or that tests have run.

After the browser action, handle the actually submitted context as data; do not infer its keys from the labels, invent a successful acknowledgement or re-render to poll. A full surface replacement discards unsent drafts.
