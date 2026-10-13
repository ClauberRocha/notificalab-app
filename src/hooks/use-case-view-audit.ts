import { useEffect, useRef } from "react";
import { logAction } from "@/lib/log-service";

export function useCaseViewAudit(table: string, id: string, loaded: boolean) {
  const recorded = useRef("");
  useEffect(() => {
    const key = `${table}:${id}`;
    if (!loaded || recorded.current === key) return;
    recorded.current = key;
    void logAction({ action: "view_case", entity_type: table, entity_id: id, description: "Visualização de ficha" });
  }, [table, id, loaded]);
}