import type {
  PublicPrice,
  PublicSalonCatalog,
  PublicSalonMaster,
} from "@/lib/api/public-booking";

export type Step = "service" | "master" | "time" | "details";

/** Теги услуги из каталога (локализованная подпись + код). */
export type ServiceTagUi = {
  tag: string;
  translate: string;
};

export type Procedure = {
  alias?: string;
  bundleSize?: number;
  complexProcedureIds?: string[];
  duration?: number;
  id: string;
  kind: "complex" | "procedure";
  masterAvatar?: string | null;
  masterId?: string | null;
  masterNickname?: string | null;
  /** Должность / специализация мастера из профиля салона. */
  masterPosition?: string | null;
  parameters?: Array<{
    cases?: Array<{
      id: string;
      price?: {
        amount: number;
        currency: string;
      };
      title: string;
    }>;
    id: string;
    title: string;
  }>;
  price?: {
    amount: number;
    currency: string;
  };
  serviceDescription?: string;
  /** Теги сервиса (SPA, массаж и т.д.) — для группировки в шаге выбора услуги. */
  serviceTags?: ServiceTagUi[];
  serviceTitle?: string;
};

export type ProcedureGroup = {
  currency?: string | null;
  description?: string;
  duration?: number | null;
  id: string;
  maxPrice?: number | null;
  minPrice?: number | null;
  procedures: Procedure[];
  title: string;
};

export type SlotInterval = {
  end: string;
  start: string;
};

function toUiPrice(value?: PublicPrice | null) {
  if (!value) {
    return undefined;
  }

  return {
    amount: value.amount,
    currency: value.currency,
  };
}

function toNullableString(value?: string | null): string | null {
  return value ?? null;
}

function buildMasterMap(masters: PublicSalonMaster[]) {
  return new Map(
    masters
      .filter((master): master is PublicSalonMaster & { id: string } =>
        Boolean(master.id),
      )
      .map((master) => [master.id, master] as const),
  );
}

function dedupeServiceTags(
  tags: Array<{ tag: string; translate: string }>,
): ServiceTagUi[] {
  const seen = new Set<string>();
  const out: ServiceTagUi[] = [];
  for (const item of tags) {
    if (seen.has(item.tag)) {
      continue;
    }
    seen.add(item.tag);
    out.push({ tag: item.tag, translate: item.translate });
  }
  return out;
}

export function adaptCatalogToProcedures(
  catalog: PublicSalonCatalog | null,
  masters: PublicSalonMaster[],
): Procedure[] {
  if (!catalog) {
    return [];
  }

  const mastersById = buildMasterMap(masters);

  return (catalog.procedures ?? [])
    .filter((procedure) => procedure.id && !procedure.archived)
    .filter((procedure) => procedure.onlineBookingEnabled !== false)
    .flatMap((procedure) => {
      const executions = procedure.executions ?? [];
      const procedureTagList = dedupeServiceTags(procedure.serviceTags ?? []);

      if (!executions.length) {
        return [{
          id: procedure.id,
          alias: procedure.title,
          bundleSize: undefined,
          complexProcedureIds: undefined,
          duration: procedure.minDuration,
          kind: "procedure" as const,
          price: toUiPrice(procedure.minPrice),
          serviceTitle: procedure.serviceTitle,
          serviceDescription: procedure.description,
          masterId: null,
          masterNickname: null,
          masterAvatar: null,
          masterPosition: null,
          parameters: [],
          serviceTags: procedureTagList,
        } satisfies Procedure];
      }

      return executions
        .filter((execution) => execution.masterId || execution.masterName)
        .map((execution): Procedure => {
          const master = execution.masterId
            ? mastersById.get(execution.masterId)
            : undefined;
          const masterWithPosition = master as
            | (PublicSalonMaster & { position?: string | null })
            | undefined;

          return {
            id: procedure.id,
            alias: procedure.title,
            bundleSize: undefined,
            complexProcedureIds: undefined,
            duration: execution.duration ?? procedure.minDuration,
            kind: "procedure",
            price:
              execution.price !== undefined && execution.price !== null
                ? {
                    amount: execution.price,
                    currency: execution.currency,
                  }
                : toUiPrice(procedure.minPrice),
            serviceTitle: procedure.serviceTitle,
            serviceDescription: procedure.description,
            masterId: toNullableString(execution.masterId),
            masterNickname: toNullableString(
              master?.nickname ?? execution.masterName,
            ),
            masterAvatar: toNullableString(master?.logo ?? execution.masterAvatar),
            masterPosition: toNullableString(masterWithPosition?.position),
            parameters: [],
            serviceTags: procedureTagList,
          };
        });
    })
    .concat(
      (catalog.complexes ?? [])
        .filter((complex) => complex.id && (complex.procedures?.length ?? 0) > 0)
        .flatMap((complex) => {
          const procedures = complex.procedures ?? [];
          const duration = procedures.reduce<number>(
            (total, procedure) => total + (procedure.minDuration ?? 0),
            0,
          );
          const procedureIds = procedures.map((procedure) => procedure.id);
          const mergedComplexTags = dedupeServiceTags(
            procedures.flatMap((p) => p.serviceTags ?? []),
          );
          const sharedMasterIds = procedures.reduce<string[]>((acc, procedure, index) => {
            const ids = (procedure.executions ?? [])
              .map((execution) => execution.masterId)
              .filter((id): id is string => Boolean(id));

            if (index === 0) {
              return ids;
            }

            return acc.filter((id) => ids.includes(id));
          }, []);

          const masterVariants: Procedure[] = sharedMasterIds
            .map((masterId): Procedure => {
              const execution = procedures[0]?.executions?.find(
                (item) => item.masterId === masterId,
              );
              const master = mastersById.get(masterId);

              const masterWithPosition = master as
                | (PublicSalonMaster & { position?: string | null })
                | undefined;

              return {
                id: complex.id,
                alias: complex.title,
                bundleSize: procedures.length,
                complexProcedureIds: procedureIds,
                duration,
                kind: "complex" as const,
                masterAvatar: toNullableString(master?.logo ?? execution?.masterAvatar),
                masterId,
                masterNickname: toNullableString(
                  master?.nickname ?? execution?.masterName,
                ),
                masterPosition: toNullableString(masterWithPosition?.position),
                parameters: [],
                price: undefined,
                serviceDescription: complex.description,
                serviceTitle: complex.title,
                serviceTags: mergedComplexTags,
              };
            })
            .filter((item) => item.masterNickname || item.masterId);

          if (masterVariants.length) {
            return masterVariants;
          }

          return [{
            id: complex.id,
            alias: complex.title,
            bundleSize: procedures.length,
            complexProcedureIds: procedureIds,
            duration,
            kind: "complex" as const,
            masterAvatar: null,
            masterId: null,
            masterNickname: null,
            masterPosition: null,
            parameters: [],
            price: undefined,
            serviceDescription: complex.description,
            serviceTitle: complex.title,
            serviceTags: mergedComplexTags,
          } satisfies Procedure];
        }),
    );
}
