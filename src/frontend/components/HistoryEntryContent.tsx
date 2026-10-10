import Linkify from "linkify-react";
import React, { FunctionComponent, ReactNode } from "react";
import { FormattedDate, FormattedTime } from "react-intl";

import { HistoryEntry } from "../../types.js";

type HistoryEntryContentProps = {
  entry: HistoryEntry;
};

const HistoryEntryContent: FunctionComponent<HistoryEntryContentProps> = ({
  entry,
}) => {
  const parts: ReactNode[] = [
    <FormattedDate key="date" value={entry.createdAt} />,
    " ",
    <FormattedTime key="time" value={entry.createdAt} />,
  ];

  if (entry.type === "comment") {
    parts.push(
      " — ",
      <Linkify options={{ target: "_blank", rel: "noopener noreferrer" }}>
        {entry.text}
      </Linkify>,
    );
  }

  return parts;
};

HistoryEntryContent.displayName = "HistoryEntryContent";

export default HistoryEntryContent;
