# Android client foundation

The Android client can reuse the portable memory envelope and encrypted sync package. The core intentionally has no Android runtime dependency. Recommended implementation: Kotlin + encrypted local database, with all memory operations routed through the same Memory Firewall contracts.
