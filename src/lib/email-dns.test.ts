import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  evaluateSenderDns,
  checkSenderDnsReady,
  resetSenderDnsCache,
  type DnsResolver,
} from "@/lib/email-templates/dns-check.server";

const TXT_VALUE =
  "lovable_email_verify=12c35913ee4f43861d130a480b82f7c67bbc788d785bfe356d520757ab49b9dd";

function makeResolver(map: {
  txt?: string[];
  ns?: string[];
}): DnsResolver {
  return async (_name, type) =>
    type === "TXT" ? (map.txt ?? []) : (map.ns ?? []);
}

describe("evaluateSenderDns", () => {
  it("bloqueia quando nada está publicado", async () => {
    const s = await evaluateSenderDns(makeResolver({}));
    expect(s.ready).toBe(false);
    expect(s.missing).toHaveLength(3);
    expect(s.records.every((r) => !r.found)).toBe(true);
  });

  it("bloqueia quando falta o TXT de verificação", async () => {
    const s = await evaluateSenderDns(
      makeResolver({ ns: ["ns5.lovable.cloud", "ns6.lovable.cloud"] }),
    );
    expect(s.ready).toBe(false);
    expect(s.missing).toEqual([
      "TXT _lovable-email.consulti.slz.br",
    ]);
  });

  it("bloqueia quando falta um dos NS", async () => {
    const s = await evaluateSenderDns(
      makeResolver({ txt: [TXT_VALUE], ns: ["ns5.lovable.cloud"] }),
    );
    expect(s.ready).toBe(false);
    expect(s.missing).toEqual([
      "NS notify.consulti.slz.br -> ns6.lovable.cloud",
    ]);
  });

  it("libera quando TXT e NS estão publicados", async () => {
    const s = await evaluateSenderDns(
      makeResolver({
        txt: ["outro=valor", TXT_VALUE],
        ns: ["NS5.Lovable.Cloud.", "ns6.lovable.cloud"],
      }),
    );
    expect(s.ready).toBe(true);
    expect(s.missing).toEqual([]);
    expect(s.senderDomain).toBe("notify.consulti.slz.br");
  });
});

describe("checkSenderDnsReady (cache)", () => {
  beforeEach(() => {
    resetSenderDnsCache();
    vi.useRealTimers();
  });

  it("usa cache entre chamadas e reconsulta com force", async () => {
    const resolver = vi.fn(makeResolver({}));
    await checkSenderDnsReady({ resolver });
    await checkSenderDnsReady({ resolver });
    expect(resolver).toHaveBeenCalledTimes(2); // 1 TXT + 1 NS de uma única checagem

    await checkSenderDnsReady({ resolver, force: true });
    expect(resolver).toHaveBeenCalledTimes(4);
  });

  it("resultado negativo expira mais rápido que o positivo", async () => {
    vi.useFakeTimers();
    const resolver = vi.fn(makeResolver({}));
    await checkSenderDnsReady({ resolver });
    vi.advanceTimersByTime(61_000);
    await checkSenderDnsReady({ resolver });
    expect(resolver).toHaveBeenCalledTimes(4);

    resetSenderDnsCache();
    const okResolver = vi.fn(
      makeResolver({
        txt: [TXT_VALUE],
        ns: ["ns5.lovable.cloud", "ns6.lovable.cloud"],
      }),
    );
    await checkSenderDnsReady({ resolver: okResolver });
    vi.advanceTimersByTime(61_000);
    await checkSenderDnsReady({ resolver: okResolver });
    expect(okResolver).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });
});
