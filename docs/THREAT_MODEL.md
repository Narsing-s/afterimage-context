# Afterimage Threat Model

## Scope
The memory layer protects personal memory content, vault credentials, context signals, agent permissions, connector data and audit history.

## Controls
- Memory Firewall authorizes agent operations before memory access or mutation.
- Agent namespaces prevent an agent from requesting another agent's namespace directly.
- Sensitive-content detection runs before external/AI extraction.
- AI extraction produces proposals; approval is required before durable creation.
- AES-GCM encrypts vault snapshots; passphrases are never stored.
- HMAC event signatures provide tamper-evidence when an application supplies a signing secret.
- Retention policies provide explicit age/count controls.
- Encrypted sync packages contain ciphertext only.

## Remaining operational responsibility
Production deployments must protect secrets, browser profiles, recovery keys and connector OAuth credentials. The local-first design does not protect a device that is already compromised.
