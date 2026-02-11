import DefaultLayout from "@/layouts/default";
import { ListUsers } from "@/components/ListUsers";

export default function UsersPage() {
  return (
    <DefaultLayout>
      <section>
        <ListUsers />
      </section>
    </DefaultLayout>
  );
}
