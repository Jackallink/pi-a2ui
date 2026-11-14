const original = globalThis.fetch;
globalThis.fetch = (input, ...args) => { const url = new URL(typeof input === 'string' || input instanceof URL ? input : input.url); if (!['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname))
    throw new Error('External HTTP denied in startup-only acceptance'); return original(input, ...args); };
