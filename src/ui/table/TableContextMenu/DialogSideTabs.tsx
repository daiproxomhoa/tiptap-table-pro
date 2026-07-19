import { FormattedMessage } from "../../../lib/intl";
import { cn } from "../../../lib/utils";

export type DialogTab = "general" | "advanced";

/** Tabs dọc (Chung / Nâng cao) dùng chung cho dialog thuộc tính bảng và ô. */
export function DialogSideTabs({
  tab,
  onChange,
}: {
  tab: DialogTab;
  onChange: (tab: DialogTab) => void;
}) {
  return (
    <div className="flex shrink-0 flex-col gap-1">
      {(["general", "advanced"] as const).map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onChange(t)}
          className={cn(
            "rounded px-2 py-1 text-left text-sm",
            tab === t
              ? "font-medium text-primary underline underline-offset-4"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {t === "general" ? (
            <FormattedMessage defaultMessage="Chung" id="5o5PeN" />
          ) : (
            <FormattedMessage defaultMessage="Nâng cao" id="m3OPAl" />
          )}
        </button>
      ))}
    </div>
  );
}
