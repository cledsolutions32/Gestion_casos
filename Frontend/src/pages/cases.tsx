import DefaultLayout from "@/layouts/default";
import { ListCases } from "@/components/ListCases";

export default function IndexPage() {
  return (
    <DefaultLayout>
      <section>
        <ListCases />
      </section>
    </DefaultLayout>
  );
}
