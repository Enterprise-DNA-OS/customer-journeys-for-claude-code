# Evidence purpose and retention checks

Sources checked 1 November 2026. These checks flag records for a person to review. They are not a legal opinion, compliance certificate or a full privacy programme.

| Rule | Check in this build | Source and scope |
|---|---|---|
| PURPOSE | Active personal evidence with an empty purpose | [NZ Privacy Principle 1](https://www.privacy.org.nz/privacy-principles/1/): collection needs a lawful purpose connected to the organisation and must be necessary for that purpose. A nonempty field alone does not establish necessity. |
| RETENTION | Active personal evidence whose review date has passed | [NZ Privacy Principle 9](https://www.privacy.org.nz/privacy-principles/9/): assess whether keeping the information remains necessary for its permitted purpose. |
| AU-RETENTION | The same overdue personal evidence, separately flagged for Australian applicability | [OAIC APP 11](https://www.oaic.gov.au/privacy/australian-privacy-principles/australian-privacy-principles-guidelines/chapter-11-app-11-security-of-personal-information): covered entities must assess destruction or de-identification when information is no longer needed, subject to exceptions including required retention. Check whether the organisation is covered. |

Review dates are operator policy. No fixed legal retention duration is encoded. /review-evidence records the operator's purpose and next review date, or withdraws evidence from decisions. Withdrawal does not erase the record or its audit history. If deletion is required, an authorised operator must handle the working records, audit copies, imports, exports, drafts and backups together under the applicable retention plan.

Use de-identified summaries and references rather than raw participant transcripts. The personal marker is supplied by the operator; the software cannot establish whether an apparently anonymous quote identifies someone. Imported original columns can contain personal information too. Review the entire file before import; these field checks do not inspect arbitrary source_data, exports or files. Security controls and access policy must be configured separately.
