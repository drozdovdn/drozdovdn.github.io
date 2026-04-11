import { visit } from 'unist-util-visit';

/**
 * Remark plugin: converts ```mermaid code blocks to <div class="mermaid">
 * so Shiki doesn't touch them and Mermaid.js can render them client-side.
 */
export function remarkMermaid() {
  return (tree) => {
    visit(tree, 'code', (node, index, parent) => {
      if (node.lang !== 'mermaid') return;
      parent.children[index] = {
        type: 'html',
        value: `<div class="mermaid">${node.value}</div>`,
      };
    });
  };
}
