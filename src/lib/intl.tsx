/**
 * Minimal drop-in replacement for the slice of `react-intl` used by the table
 * UI. Keeps the original call sites (`useIntl().formatMessage({ defaultMessage })`
 * and `<FormattedMessage defaultMessage="..." />`) intact so no component code
 * had to change when this package was extracted.
 *
 * By default it renders the `defaultMessage` (English) verbatim. Consumers that
 * want to localize can wrap the editor in <TableIntlProvider messages={{...}}>
 * and provide overrides keyed by the readable message `id` (e.g. "insertTable").
 */
import { createContext, useContext, type ReactNode } from "react";

export type IntlMessages = Record<string, string>;

const MessagesContext = createContext<IntlMessages>({});

export function TableIntlProvider({
  messages = {},
  children,
}: {
  messages?: IntlMessages;
  children: ReactNode;
}) {
  return (
    <MessagesContext.Provider value={messages}>
      {children}
    </MessagesContext.Provider>
  );
}

interface MessageDescriptor {
  id?: string;
  defaultMessage: string;
}

function resolve(
  messages: IntlMessages,
  descriptor: MessageDescriptor,
  values?: Record<string, string | number>,
): string {
  const raw =
    (descriptor.id && messages[descriptor.id]) || descriptor.defaultMessage;
  if (!values) return raw;
  return raw.replace(/\{(\w+)\}/g, (_, key) =>
    key in values ? String(values[key]) : `{${key}}`,
  );
}

export function useIntl() {
  const messages = useContext(MessagesContext);
  return {
    formatMessage: (
      descriptor: MessageDescriptor,
      values?: Record<string, string | number>,
    ) => resolve(messages, descriptor, values),
  };
}

export function FormattedMessage({
  id,
  defaultMessage,
  values,
}: {
  id?: string;
  defaultMessage: string;
  values?: Record<string, string | number>;
}) {
  const messages = useContext(MessagesContext);
  return <>{resolve(messages, { id, defaultMessage }, values)}</>;
}
