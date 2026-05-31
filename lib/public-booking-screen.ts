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
  /** Название процедуры из каталога (procedure.title). */
  title?: string;
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

const HOTFIX_SALON_PROCEDURE_ORDER_SALON_ID = "rs3l1d2Ec9";

const HOTFIX_SALON_PROCEDURE_ORDER = new Map<string, number>([
  ["92c31d71-c6c9-490e-b565-627f0110c70e", 0], // Classic Haircut
  ["1e11fa3e-6fc7-4e9c-b732-e4c5c2c83583", 1], // Beard Trim
  ["5d8da97a-de45-44f8-adf9-4b1b6cf2e11d", 2], // Classic Haircut & Beard Trim
  ["a4c50e39-2279-4fd6-9382-58dc48c5386c", 3], // Line-up
  ["08a56111-006d-454a-afdd-1bf315531326", 4], // Royal Shave
  ["4ff3e3e0-7804-493a-8506-c5ca52fc6b98", 5], // Bald Shave
  ["e034d3c8-ec52-473c-a7ba-b4abaec50e2e", 6], // Nose Wax
  ["896d7887-c87d-4907-a7eb-e41c2a2fe81c", 7], // Ear Wax
  ["b88f8b4b-79e5-45fc-9702-1dcaca29fe55", 8], // Middle Brow Wax
  ["0aabac72-b0dd-48ed-be14-c8a19a528445", 9], // Black Mask
]);

function orderCatalogProceduresForHotfix(
  procedures: NonNullable<PublicSalonCatalog["procedures"]>,
  salonId?: string,
) {
  if (salonId !== HOTFIX_SALON_PROCEDURE_ORDER_SALON_ID) {
    return procedures;
  }

  return procedures
    .map((procedure, index) => ({ index, procedure }))
    .sort((left, right) => {
      const leftRank = HOTFIX_SALON_PROCEDURE_ORDER.get(left.procedure.id);
      const rightRank = HOTFIX_SALON_PROCEDURE_ORDER.get(right.procedure.id);

      if (leftRank === undefined && rightRank === undefined) {
        return left.index - right.index;
      }

      if (leftRank === undefined) {
        return 1;
      }

      if (rightRank === undefined) {
        return -1;
      }

      if (leftRank !== rightRank) {
        return leftRank - rightRank;
      }

      return left.index - right.index;
    })
    .map(({ procedure }) => procedure);
}

export function adaptCatalogToProcedures(
  catalog: PublicSalonCatalog | null,
  masters: PublicSalonMaster[],
  salonId?: string,
): Procedure[] {
  if (!catalog) {
    return [];
  }

  const mastersById = buildMasterMap(masters);

  return orderCatalogProceduresForHotfix(catalog.procedures ?? [], salonId)
    .filter((procedure) => procedure.id && !procedure.archived)
    .filter((procedure) => procedure.onlineBookingEnabled !== false)
    .flatMap((procedure) => {
      const executions = procedure.executions ?? [];
      const procedureTagList = dedupeServiceTags(procedure.serviceTags ?? []);

      if (!executions.length) {
        return [{
          id: procedure.id,
          alias: procedure.title,
          title: procedure.title,
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
            title: procedure.title,
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
                title: complex.title,
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
            title: complex.title,
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
