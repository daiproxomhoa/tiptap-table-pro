# Localization

UI labels default to **English**. To translate or reword them, wrap the part of
your tree that contains the editor UI in `TableIntlProvider` and supply
overrides keyed by the message id.

```tsx
import { TableIntlProvider } from "tiptap-ui-pro";

<TableIntlProvider
  messages={{
    insertTable: "Insérer un tableau",
    deleteEntireTable: "Supprimer le tableau",
    cancel: "Annuler",
    save: "Enregistrer",
  }}
>
  {/* TablePicker, TableBubbleMenu, TableContextMenu, … */}
</TableIntlProvider>;
```

Any id you omit falls back to the built-in English default, so you can translate
incrementally.

## How it works

The library ships a tiny internal i18n layer (no `react-intl` dependency). Each
label has a stable, human-readable `id` and an English `defaultMessage`.
`TableIntlProvider` puts your `messages` map in context; components look up by
`id` and fall back to the default.

- `messages?: Record<string, string>` — id → translated string.
- Placeholders use `{name}` syntax and are substituted, e.g. `columnN: "Colonne {n}"`.

## Message id reference

Common ids (see the source `defaultMessage`s for the complete list):

| id | Default |
|---|---|
| `insertTable` | Insert table |
| `pickTableSize` | Choose table size |
| `deleteTable` | Delete table |
| `deleteEntireTable` | Delete entire table |
| `tableProperties` | Table properties |
| `cellProperties` | Cell properties |
| `cellBackground` | Cell background |
| `mergeSelectedCells` | Merge selected cells |
| `splitCell` | Split merged cell |
| `showBorders` / `hideBorders` | Show / Hide borders |
| `insertRowAbove` / `insertRowBelow` | Insert row above / below |
| `insertColumnLeft` / `insertColumnRight` | Insert column left / right |
| `deleteCurrentRow` / `deleteCurrentColumn` | Delete current row / column |
| `sort` / `advancedSort` | Sort / Advanced sort |
| `ascending` / `descending` | Ascending / Descending |
| `alignLeft` / `alignCenter` / `alignRight` | Align left / center / right |
| `left` / `center` / `right` / `top` / `middle` / `bottom` / `none` | axis options |
| `cancel` / `save` / `select` / `default` | Cancel / Save / Select… / Default |
| `link` / `insertEditLink` | Link… / Insert / edit link |

Ids are stable across releases, so translation maps keep working.
