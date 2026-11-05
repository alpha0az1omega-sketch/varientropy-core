import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import type { FieldShieldHandle } from "fieldshield";
import "fieldshield/style";

const FieldShieldInput = dynamic(
  () => import("fieldshield").then((m) => m.FieldShieldInput),
  { ssr: false }
);

export function SecureKeyInput() {
  const ref = useRef<FieldShieldHandle>(null);
  const [redacted, setRedacted] = useState<string | null>(null);

  const handleSubmit = () => {
    const raw = ref.current?.getValue() ?? "";
    setRedacted(raw.replace(/./g, "\u2588"));
    // Never send `raw` to an LLM; only `redacted`
  };

  return (
    <div>
      <FieldShieldInput ref={ref} />
      {redacted && <pre aria-label="redacted preview">{redacted}</pre>}
      <button onClick={handleSubmit}>Redact and Submit</button>
    </div>
  );
}
