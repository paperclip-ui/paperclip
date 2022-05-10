Tandm workspace for managing assets under a workspace by a specific user

TODOs:

- light CLI tool for opening within in a directory
- detect whether in GIT repository

```javascript
import express from "express";
import { TandemWorkspace } from "tandem-workspace";

const workspace = new TandemWorkspace();

const project = await workspace.loadProject(process.cwd());
```

REST endpoints:

- /designer/:projectId
- /assets/:assetId // using asset ID since the path may be outside of the project scope
