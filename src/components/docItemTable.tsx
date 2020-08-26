import { h } from "preact";
import { getDisplayNameMetadata } from "../decorators/displayName";
import IDocItem from "../interfaces/iDocItem";
import { JSXInternal } from "preact/src/jsx";

export function getDocItemTable(item: IDocItem): JSXInternal.Element {
  let rows: h.JSX.Element[] = [];

  Object.entries(item).forEach(([prop, value]) => {
    const displayName = getDisplayNameMetadata(item, prop);
    if (displayName && value) {
      if (value instanceof Array) {
        if (!value.length) return;
        value = value.join(", ");
      } else if (typeof value === "object") {
        value = Object.values(value).join(", ");
      }

      rows.push(
        <tr>
          <th>{displayName}</th>
          <td>{value}</td>
        </tr>
      );
    }
  });

  return <table>{rows}</table>;
}
