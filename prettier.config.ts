import sortImportsPlugin from "@trivago/prettier-plugin-sort-imports";

export default {
  importOrder: ["^@ostoslista/(.*)$", "^[./]"],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  plugins: [sortImportsPlugin],
};
