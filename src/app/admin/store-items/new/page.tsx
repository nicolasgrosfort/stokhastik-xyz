import { StoreItemForm } from "@/components/admin/store-item-form";
import { H3 } from "@/components/common/h3";

export default function NewStoreItemPage() {
  return (
    <section className="text-foreground bg-background h-full w-full min-h-0 flex flex-col items-center gap-4 p-4 overflow-y-auto">
      <H3 className="uppercase">Nouvel item</H3>
      <StoreItemForm />
    </section>
  );
}
