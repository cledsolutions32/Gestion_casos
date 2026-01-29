import DefaultLayout from "@/layouts/default";
import { title } from "@/components/primitives";

export default function IndexPage() {
  return (
    <DefaultLayout>
      <section>
        <h1 className={title({ size: "sm"})}>I'm a case page</h1>
      </section>
    </DefaultLayout>
  );
}
