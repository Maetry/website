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

export type BundleProcedureSelection = {
  executionId?: string | null;
  procedureId: string;
};

export type BundleProcedureMasterOption = {
  duration?: number | null;
  executionId?: string | null;
  masterAvatar?: string | null;
  masterId?: string | null;
  masterNickname?: string | null;
  masterPosition?: string | null;
  price?: {
    amount: number;
    currency: string;
  };
};

export type BundleProcedureItem = {
  duration?: number | null;
  masterOptions: BundleProcedureMasterOption[];
  price?: {
    amount: number;
    currency: string;
  };
  procedureId: string;
  selectedMasterOption?: BundleProcedureMasterOption | null;
  title: string;
};

export type Procedure = {
  alias?: string;
  bundleDefinition?: NonNullable<PublicSalonCatalog>["bundles"][number];
  bundleItems?: BundleProcedureSelection[];
  bundleLabel?: string;
  bundleProcedureItems?: BundleProcedureItem[];
  bundleSize?: number;
  bundleSpecialistCount?: number;
  duration?: number;
  executionId?: string | null;
  id: string;
  kind: "bundle" | "procedure";
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
  /** Название процедуры из каталога (procedure.title). */
  title?: string;
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

export function buildBundlePrice(
  bundle: NonNullable<PublicSalonCatalog>["bundles"][number],
  selections: BundleProcedureSelection[],
) {
  const currency = bundle.procedures[0]?.currency ?? null;
  if (!currency) {
    return undefined;
  }

  const procedureById = new Map(
    bundle.procedures.map((procedure) => [procedure.id, procedure] as const),
  );

  const baseAmount = selections.reduce((total, selection) => {
    const procedure = procedureById.get(selection.procedureId);
    if (!procedure) {
      return total;
    }

    const executionPrice = selection.executionId
      ? procedure.executions.find((item) => item.id === selection.executionId)
          ?.price
      : null;

    if (typeof executionPrice === "number") {
      return total + executionPrice;
    }

    return total + procedure.minor / 100;
  }, 0);

  switch (bundle.price.kind) {
    case "free":
      return { amount: 0, currency };
    case "percentDiscount":
      return {
        amount: baseAmount * (1 - bundle.price.percent / 100),
        currency,
      };
    case "specialPrice":
      return {
        amount: bundle.price.minor / 100,
        currency,
      };
    case "totalServices":
    default:
      return {
        amount: baseAmount,
        currency,
      };
  }
}

function buildBundleProcedureItem(
  procedure: NonNullable<PublicSalonCatalog>["bundles"][number]["procedures"][number],
  mastersById: Map<string, PublicSalonMaster>,
): BundleProcedureItem {
  const masterOptions = (procedure.executions ?? []).map((execution) => {
    const master = execution.masterId
      ? mastersById.get(execution.masterId)
      : undefined;
    const masterWithPosition = master as
      | (PublicSalonMaster & { position?: string | null })
      | undefined;

    return {
      duration: execution.duration ?? procedure.minDuration,
      executionId: execution.id ?? null,
      masterAvatar: toNullableString(master?.logo ?? execution.masterAvatar),
      masterId: toNullableString(execution.masterId),
      masterNickname: toNullableString(
        master?.nickname ?? execution.masterName,
      ),
      masterPosition: toNullableString(masterWithPosition?.position),
      price:
        execution.price !== undefined && execution.price !== null
          ? {
              amount: execution.price,
              currency: procedure.currency,
            }
          : {
              amount: procedure.minor / 100,
              currency: procedure.currency,
            },
    } satisfies BundleProcedureMasterOption;
  });

  return {
    duration: procedure.minDuration,
    masterOptions,
    price: {
      amount: procedure.minor / 100,
      currency: procedure.currency,
    },
    procedureId: procedure.id,
    selectedMasterOption: null,
    title:
      procedure.title?.trim() || procedure.serviceTitle?.trim() || procedure.id,
  };
}

function buildBundleProcedure(
  bundle: NonNullable<PublicSalonCatalog>["bundles"][number],
  mergedBundleTags: ServiceTagUi[],
  procedureItems: BundleProcedureItem[],
  selections: BundleProcedureSelection[],
): Procedure {
  const duration = procedureItems.reduce(
    (total, item) => total + (item.duration ?? 0),
    0,
  );
  const specialistCount = new Set(
    procedureItems.flatMap((item) =>
      item.masterOptions
        .map((option) => option.masterId)
        .filter((masterId): masterId is string => Boolean(masterId)),
    ),
  ).size;

  return {
    alias: bundle.title,
    bundleDefinition: bundle,
    bundleItems: selections,
    bundleLabel: "bundle",
    bundleProcedureItems: procedureItems,
    bundleSize: procedureItems.length,
    bundleSpecialistCount: specialistCount,
    duration,
    executionId: null,
    id: bundle.id,
    kind: "bundle",
    masterAvatar: null,
    masterId: null,
    masterNickname: null,
    masterPosition: null,
    parameters: [],
    price: buildBundlePrice(bundle, selections),
    serviceDescription: bundle.description,
    serviceTags: mergedBundleTags,
    serviceTitle: bundle.title,
    title: bundle.title,
  };
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
    .filter((procedure) => procedure.id)
    .flatMap((procedure) => {
      const executions = procedure.executions ?? [];
      const procedureTagList = dedupeServiceTags(procedure.serviceTags ?? []);

      if (!executions.length) {
        return [
          {
            alias: procedure.title,
            bundleItems: undefined,
            bundleSize: undefined,
            duration: procedure.minDuration,
            executionId: null,
            id: procedure.id,
            kind: "procedure" as const,
            masterAvatar: null,
            masterId: null,
            masterNickname: null,
            masterPosition: null,
            parameters: [],
            price: toUiPrice(procedure.minPrice),
            serviceDescription: procedure.description,
            serviceTags: procedureTagList,
            serviceTitle: procedure.serviceTitle,
            title: procedure.title,
          } satisfies Procedure,
        ];
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
            alias: procedure.title,
            bundleItems: undefined,
            bundleSize: undefined,
            duration: execution.duration ?? procedure.minDuration,
            executionId: execution.id,
            id: procedure.id,
            kind: "procedure",
            masterAvatar: toNullableString(
              master?.logo ?? execution.masterAvatar,
            ),
            masterId: toNullableString(execution.masterId),
            masterNickname: toNullableString(
              master?.nickname ?? execution.masterName,
            ),
            masterPosition: toNullableString(masterWithPosition?.position),
            parameters: [],
            price:
              execution.price !== undefined && execution.price !== null
                ? {
                    amount: execution.price,
                    currency: procedure.currency,
                  }
                : toUiPrice(procedure.minPrice),
            serviceDescription: procedure.description,
            serviceTags: procedureTagList,
            serviceTitle: procedure.serviceTitle,
            title: procedure.title,
          };
        });
    })
    .concat(
      (catalog.bundles ?? [])
        .filter((bundle) => bundle.id && (bundle.procedures?.length ?? 0) > 0)
        .map((bundle) => {
          const procedures = bundle.procedures ?? [];
          const mergedBundleTags = dedupeServiceTags(
            procedures.flatMap((procedure) => procedure.serviceTags ?? []),
          );
          const procedureItems = procedures.map((procedure) =>
            buildBundleProcedureItem(procedure, mastersById),
          );
          const selections = procedureItems.map(
            (procedureItem): BundleProcedureSelection => ({
              executionId: null,
              procedureId: procedureItem.procedureId,
            }),
          );

          return buildBundleProcedure(
            bundle,
            mergedBundleTags,
            procedureItems,
            selections,
          );
        }),
    );
}
