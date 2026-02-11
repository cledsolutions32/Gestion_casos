import { useNavigate } from "react-router-dom";

import DefaultLayout from "@/layouts/default";
import { CreateCaseForm } from "@/components/CreateCaseForm";
import { useCases } from "@/lib/cases-context";

export default function CreateCasePage() {
  const navigate = useNavigate();
  const { refreshCases } = useCases();

  const handleSuccess = async () => {
    await refreshCases();
    navigate("/cases", { replace: true });
  };

  return (
    <DefaultLayout>
      <section>
        <CreateCaseForm
          onCancel={() => navigate("/cases", { replace: true })}
          onSuccess={handleSuccess}
        />
      </section>
    </DefaultLayout>
  );
}
