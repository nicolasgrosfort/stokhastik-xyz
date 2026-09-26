import type { ModelAnnotation } from "@/components/common/model";

const isVector3 = (value: unknown): value is [number, number, number] =>
  Array.isArray(value) &&
  value.length === 3 &&
  value.every((coordinate) => typeof coordinate === "number");

export const parseAnnotations = (value: unknown): ModelAnnotation[] | null => {
  if (!Array.isArray(value)) return null;

  const annotations: ModelAnnotation[] = [];
  for (const item of value) {
    if (
      typeof item !== "object" ||
      item === null ||
      typeof (item as { text?: unknown }).text !== "string" ||
      !isVector3((item as { point?: unknown }).point)
    ) {
      return null;
    }

    const labelOffset = (item as { labelOffset?: unknown }).labelOffset;
    if (labelOffset !== undefined && !isVector3(labelOffset)) return null;

    const labelModel = (item as { labelModel?: unknown }).labelModel;
    if (labelModel !== undefined && typeof labelModel !== "string") return null;

    const labelModelScale = (item as { labelModelScale?: unknown })
      .labelModelScale;
    if (labelModelScale !== undefined && typeof labelModelScale !== "number")
      return null;

    annotations.push({
      text: (item as { text: string }).text,
      point: (item as { point: [number, number, number] }).point,
      labelOffset: labelOffset as [number, number, number] | undefined,
      labelModel: labelModel as string | undefined,
      labelModelScale: labelModelScale as number | undefined,
    });
  }

  return annotations;
};

// Annotations are copied/pasted with a bare label-model filename (e.g.
// "chaise.glb"); resolve it to a servable asset URL before rendering.
export const resolveAnnotationAssets = (
  annotations: ModelAnnotation[],
): ModelAnnotation[] =>
  annotations.map((annotation) =>
    annotation.labelModel
      ? {
          ...annotation,
          labelModel: `/api/assets/models/${annotation.labelModel}`,
        }
      : annotation,
  );
