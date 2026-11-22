# Security Policy

## Supported release line

Luna is currently a private internal package. Only the latest validated
milestone and explicitly identified emergency patch line receive security
fixes. Support for an older archive must be agreed by the repository owner; the
existence of a Git tag alone is not a support commitment.

## Reporting a vulnerability

Do not open a public GitHub issue for a suspected vulnerability, credential,
exploit, or private consumer detail.

Use GitHub private vulnerability reporting for this repository when it is
enabled. Include:

- the affected Luna version, tag, or commit;
- the affected component or package entry point;
- impact and realistic attack prerequisites;
- minimal reproduction steps or a private proof of concept; and
- any known mitigation.

If private vulnerability reporting is unavailable, contact the repository
owner through the organization's established private communication channel.
Do not send vulnerability details through a public fallback. Repository
administrators must confirm and record a functioning private reporting path
before Luna can be approved for public package publication.

## Response and release handling

Maintainers should acknowledge a private report, limit access to people needed
for remediation, add focused regression coverage, and follow the emergency
patch procedure in [RELEASING.md](RELEASING.md). Existing release tags must not
be deleted or rewritten. Publish disclosure details only after affected
consumers have a reviewed remediation path.
