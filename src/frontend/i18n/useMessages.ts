import { useCallback } from "react";
import { useIntl, type MessageDescriptor } from "react-intl";
import type { ItemStatus } from "../../types.js";
import {
  itemStatusMessageKeys,
  messages,
  type MessageKey,
} from "./messages.js";

type MessageValues = Record<
  string,
  string | number | boolean | Date | null | undefined
>;

export function useMessages() {
  const intl = useIntl();

  const t = useCallback(
    (id: MessageKey, values?: MessageValues) =>
      intl.formatMessage(messages[id], values),
    [intl],
  );

  const itemStatusLabel = useCallback(
    (status: ItemStatus) => t(itemStatusMessageKeys[status]),
    [t],
  );

  const formatDescriptor = useCallback(
    (descriptor: MessageDescriptor, values?: MessageValues) =>
      intl.formatMessage(descriptor, values),
    [intl],
  );

  return { t, itemStatusLabel, intl, formatDescriptor };
}
