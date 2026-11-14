#!/usr/bin/env node
import {runCli} from '../../../dist/assistant-cli.mjs';
process.exitCode=await runCli(process.argv.slice(2));
