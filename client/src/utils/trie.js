const normalize = (value) => String(value || "").trim().toLowerCase();

const createNode = () => ({
  children: new Map(),
  indices: new Set(),
});

export const createTrieIndex = (items = [], keySelector = (item) => item) => {
  const root = createNode();

  items.forEach((item, index) => {
    const key = normalize(keySelector(item));
    if (!key) return;

    let node = root;
    node.indices.add(index);

    for (const ch of key) {
      if (!node.children.has(ch)) {
        node.children.set(ch, createNode());
      }
      node = node.children.get(ch);
      node.indices.add(index);
    }
  });

  return { root, items };
};

export const searchPrefix = (index, query, limit = 50) => {
  if (!index || !index.root || !Array.isArray(index.items)) return [];

  const normalizedQuery = normalize(query);
  if (!normalizedQuery) {
    return index.items.slice(0, limit);
  }

  let node = index.root;
  for (const ch of normalizedQuery) {
    if (!node.children.has(ch)) return [];
    node = node.children.get(ch);
  }

  const results = [];
  for (const itemIndex of node.indices) {
    results.push(index.items[itemIndex]);
    if (results.length >= limit) break;
  }
  return results;
};

