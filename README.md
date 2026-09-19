# CI — Continuous Integration (Azure)

Azure Jenkins pipeline for:

```text
GitHub (OIO-TIMBER-CI-Aure)
  → Jenkins
  → Test
  → Docker Build (backend, frontend, admin)
  → Push to ACR (oioazureregistry.azurecr.io)
  → Update OIO-TIMBER-CD-azure image tags
  → git commit + git push
```

## Files

| Path | Purpose |
|------|---------|
| `Jenkinsfile` | Full Azure CI pipeline |
| `scripts/ci-local.sh` | Local tests without push |
| `scripts/update-cd-tags.sh` | Manual CD tag bump helper |

## Jenkins credentials (UI only)

| ID | Type | Purpose |
|----|------|---------|
| `acr-oio` | Username/password | ACR admin login |
| `github-oio` | Secret text / PAT | Optional checkout / webhooks |
| `git-cd-push` | Username/password (PAT) | Push to CD repo |

## Image names

- `oioazureregistry.azurecr.io/oio/backend:<tag>`
- `oioazureregistry.azurecr.io/oio/frontend:<tag>`
- `oioazureregistry.azurecr.io/oio/admin:<tag>`

PostgreSQL is **not** built by CI (`postgres:16-alpine` from public registry).

## Git remote (CI repo)

Intended remote for the published CI repository:

`https://github.com/omarzaki222/OIO-TIMBER-CI-Aure.git`

(Note: spelling **Aure** matches the requested Azure lab repo name.)

This monorepo workspace keeps `CI/` + `application/` together for editing.
When publishing to `OIO-TIMBER-CI-Aure`, include at least:

```text
Jenkinsfile          # copy of CI/Jenkinsfile at repo root (or keep path CI/Jenkinsfile)
application/
CI/scripts/
```

## Blockers until apply / credentials

- Terraform has **not** applied `helm_release.jenkins` yet
- Jenkins credentials must be created manually after install
- GitHub repos must exist and accept pushes with a PAT
