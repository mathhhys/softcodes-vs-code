---
title: Overview
description: Softcodes can be deeply customized
keywords: [custom, slash commands, models, context providers]
---

# Overview

Softcodes can be deeply customized by editing `config.json` and `config.ts` on your machine. You can find these files in the `~/.softcodes/` directory on MacOS and the `%userprofile%\.softcodes` directory on Windows. These files are created the first time you run Softcodes.

Currently, you can customize the following:

- [Models](../setup/select-model.md) and [Model Providers](../setup/model-providers.md)
- [Context Providers](./context-providers.md)
- [Slash Commands](./slash-commands.md)
- [Other configuration options](../reference/config.mdx)

If you'd like to share Softcodes configuration with others, you can add a `.softcodesrc.json` to the root of your project. It has the same JSON Schema definition as `config.json`, and will automatically be applied on top of the local `config.json`.
