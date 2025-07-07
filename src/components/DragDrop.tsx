import React, { useState } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export interface TreeItem {
  id: string;
  title: string;
  children: TreeItem[];
}

const initialData: TreeItem[] = [
  {
    id: "a",
    title: "Item A",
    children: [
      { id: "a1", title: "Item A1", children: [] },
      {
        id: "a2",
        title: "Item A2",
        children: [
          { id: "a21", title: "Item A2.1", children: [] },
          { id: "a22", title: "Item A2.2", children: [] },
        ],
      },
    ],
  },
  { id: "b", title: "Item B", children: [] },
  {
    id: "c",
    title: "Item C",
    children: [
      { id: "c1", title: "Item C1", children: [] },
      { id: "c2", title: "Item C2", children: [] },
    ],
  },
];

interface FlatItem {
  id: string;
  title: string;
  depth: number;
  parentId: string | null;
  children: TreeItem[];
}

const flatten = (
  items: TreeItem[],
  parentId: string | null = null,
  depth = 0
): FlatItem[] =>
  items.flatMap((item) => [
    { ...item, depth, parentId } as FlatItem,
    ...flatten(item.children, item.id, depth + 1),
  ]);

const isDescendant = (
  tree: TreeItem[],
  ancestorId: string,
  childId: string
): boolean => {
  const dfs = (nodes: TreeItem[]): boolean => {
    for (const n of nodes) {
      if (n.id === ancestorId) return contains(n, childId);
      if (dfs(n.children)) return true;
    }
    return false;
  };
  const contains = (node: TreeItem, target: string): boolean => {
    for (const c of node.children) {
      if (c.id === target) return true;
      if (contains(c, target)) return true;
    }
    return false;
  };
  return dfs(tree);
};

const removeItem = (
  tree: TreeItem[],
  id: string
): [TreeItem | null, TreeItem[]] => {
  const out: TreeItem[] = [];
  let removed: TreeItem | null = null;
  for (const n of tree) {
    if (n.id === id) {
      removed = n;
      continue;
    }
    const [r, newChildren] = removeItem(n.children, id);
    if (r) removed = r;
    out.push({ ...n, children: newChildren });
  }
  return [removed, out];
};

const insertItem = (
  tree: TreeItem[],
  node: TreeItem,
  parentId: string | null,
  index: number
): TreeItem[] => {
  if (parentId === null) {
    const rootCopy = [...tree];
    rootCopy.splice(index, 0, node);
    return rootCopy;
  }
  return tree.map((n) =>
    n.id === parentId
      ? {
          ...n,
          children: [
            ...n.children.slice(0, index),
            node,
            ...n.children.slice(index),
          ],
        }
      : { ...n, children: insertItem(n.children, node, parentId, index) }
  );
};

function Row({ item }: { item: FlatItem }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const dynamicStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    marginLeft: item.depth * 24,
  };

  return (
    <div
      ref={setNodeRef}
      style={dynamicStyle}
      className={`row ${isDragging ? "dragging" : ""}`}
      {...attributes}
      {...listeners}
    >
      {item.depth > 0 && <span className={"depthLine"} />}
      <span className={"dragHandle"}>≡</span>
      <span className={"label"}>{item.title}</span>
    </div>
  );
}

export default function DragDrop() {
  const [tree, setTree] = useState<TreeItem[]>(initialData);
  const sensors = useSensors(useSensor(PointerSensor));
  const flat = flatten(tree);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const overItem = flat.find((f) => f.id === over.id)!;
    if (isDescendant(tree, active.id as string, over.id as string)) return;

    const [removed, treeWithout] = removeItem(tree, active.id as string);
    if (!removed) return;

    const siblingGroup = flat.filter((f) => f.parentId === overItem.parentId);
    const newIndex = siblingGroup.findIndex((f) => f.id === overItem.id);

    const updated = insertItem(
      treeWithout,
      removed,
      overItem.parentId,
      newIndex
    );
    setTree(updated);
  };

  return (
    <div className="container">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={flat.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          {flat.map((i) => (
            <Row key={i.id} item={i} />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}
