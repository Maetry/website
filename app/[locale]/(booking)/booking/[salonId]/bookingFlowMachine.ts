import { assign, setup } from "xstate";

import type { SlotInterval, Step } from "@/lib/public-booking-screen";

type BookingFlowContext = {
  clientName: string;
  clientPhone: string;
  expandedCategoryIds: string[];
  formErrors: {
    name?: string;
    phone?: string;
  };
  globalError: string | null;
  selectedDateKey: string | null;
  selectedGroupId: string | null;
  selectedProcedureKey: string | null;
  selectedSlot: SlotInterval | null;
};

type BookingFlowEvent =
  | {
      type: "SELECT_GROUP";
      autoProcedureKey?: string | null;
      groupId: string;
    }
  | {
      type: "HYDRATE";
      step: Step;
      value: BookingFlowContext;
    }
  | {
      type: "SET_GROUP_ID";
      value: string | null;
    }
  | {
      type: "SELECT_PROCEDURE";
      procedureKey: string;
    }
  | {
      type: "SET_PROCEDURE_KEY";
      value: string | null;
    }
  | {
      type: "SELECT_SLOT";
      slot: SlotInterval;
    }
  | {
      type: "SET_SLOT";
      value: SlotInterval | null;
    }
  | {
      type: "SET_DATE";
      value: string | null;
    }
  | {
      type: "SET_EXPANDED_CATEGORY";
      value: string[];
    }
  | {
      type: "SET_CLIENT_NAME";
      value: string;
    }
  | {
      type: "SET_CLIENT_PHONE";
      value: string;
    }
  | {
      type: "SET_FORM_ERRORS";
      value: {
        name?: string;
        phone?: string;
      };
    }
  | {
      type: "SET_GLOBAL_ERROR";
      value: string | null;
    }
  | {
      type: "SUBMIT";
    }
  | {
      type: "SUBMIT_FAILURE";
      error: string;
    }
  | {
      type: "SUBMIT_SUCCESS";
    };

export const bookingFlowMachine = setup({
  types: {} as {
    context: BookingFlowContext;
    events: BookingFlowEvent;
  },
}).createMachine({
  context: {
    clientName: "",
    clientPhone: "",
    expandedCategoryIds: [],
    formErrors: {},
    globalError: null,
    selectedDateKey: null,
    selectedGroupId: null,
    selectedProcedureKey: null,
    selectedSlot: null,
  },
  id: "bookingFlow",
  initial: "service",
  on: {
    HYDRATE: [
      {
        actions: assign(({ event }) => event.value),
        guard: ({ event }) => event.step === "details",
        target: ".details",
      },
      {
        actions: assign(({ event }) => event.value),
        guard: ({ event }) => event.step === "time",
        target: ".time",
      },
      {
        actions: assign(({ event }) => event.value),
        guard: ({ event }) => event.step === "master",
        target: ".master",
      },
      {
        actions: assign(({ event }) => event.value),
        target: ".service",
      },
    ],
    SET_CLIENT_NAME: {
      actions: assign({
        clientName: ({ event }) => event.value,
      }),
    },
    SET_CLIENT_PHONE: {
      actions: assign({
        clientPhone: ({ event }) => event.value,
      }),
    },
    SET_DATE: {
      actions: assign({
        selectedDateKey: ({ event }) => event.value,
        selectedSlot: null,
      }),
    },
    SET_EXPANDED_CATEGORY: {
      actions: assign({
        expandedCategoryIds: ({ event }) => event.value,
      }),
    },
    SET_FORM_ERRORS: {
      actions: assign({
        formErrors: ({ event }) => event.value,
      }),
    },
    SET_GLOBAL_ERROR: {
      actions: assign({
        globalError: ({ event }) => event.value,
      }),
    },
    SET_GROUP_ID: [
      {
        actions: assign({
          globalError: null,
          selectedDateKey: null,
          selectedGroupId: ({ event }) => event.value,
          selectedProcedureKey: null,
          selectedSlot: null,
        }),
        guard: ({ event }) => event.value === null,
        target: ".service",
      },
      {
        actions: assign({
          globalError: null,
          selectedDateKey: null,
          selectedGroupId: ({ event }) => event.value,
          selectedProcedureKey: null,
          selectedSlot: null,
        }),
        target: ".master",
      },
    ],
    SET_PROCEDURE_KEY: [
      {
        actions: assign({
          globalError: null,
          selectedDateKey: null,
          selectedProcedureKey: null,
          selectedSlot: null,
        }),
        guard: ({ event }) => event.value === null,
        target: ".master",
      },
      {
        actions: assign({
          globalError: null,
          selectedDateKey: null,
          selectedProcedureKey: ({ event }) => event.value,
          selectedSlot: null,
        }),
        target: ".time",
      },
    ],
    SET_SLOT: [
      {
        actions: assign({
          selectedSlot: null,
        }),
        guard: ({ event }) => event.value === null,
        target: ".time",
      },
      {
        actions: assign({
          formErrors: {},
          globalError: null,
          selectedSlot: ({ event }) => event.value,
        }),
        target: ".details",
      },
    ],
  },
  states: {
    service: {
      on: {
        SELECT_GROUP: [
          {
            actions: assign({
              globalError: null,
              selectedDateKey: null,
              selectedGroupId: ({ event }) => event.groupId,
              selectedProcedureKey: ({ event }) => event.autoProcedureKey ?? null,
              selectedSlot: null,
            }),
            guard: ({ event }) => Boolean(event.autoProcedureKey),
            target: "time",
          },
          {
            actions: assign({
              globalError: null,
              selectedDateKey: null,
              selectedGroupId: ({ event }) => event.groupId,
              selectedProcedureKey: null,
              selectedSlot: null,
            }),
            target: "master",
          },
        ],
      },
    },
    master: {
      on: {
        SELECT_GROUP: [
          {
            actions: assign({
              globalError: null,
              selectedDateKey: null,
              selectedGroupId: ({ event }) => event.groupId,
              selectedProcedureKey: ({ event }) => event.autoProcedureKey ?? null,
              selectedSlot: null,
            }),
            guard: ({ event }) => Boolean(event.autoProcedureKey),
            target: "time",
          },
          {
            actions: assign({
              globalError: null,
              selectedDateKey: null,
              selectedGroupId: ({ event }) => event.groupId,
              selectedProcedureKey: null,
              selectedSlot: null,
            }),
          },
        ],
        SELECT_PROCEDURE: {
          actions: assign({
            globalError: null,
            selectedDateKey: null,
            selectedProcedureKey: ({ event }) => event.procedureKey,
            selectedSlot: null,
          }),
          target: "time",
        },
      },
    },
    time: {
      on: {
        SELECT_GROUP: [
          {
            actions: assign({
              globalError: null,
              selectedDateKey: null,
              selectedGroupId: ({ event }) => event.groupId,
              selectedProcedureKey: ({ event }) => event.autoProcedureKey ?? null,
              selectedSlot: null,
            }),
            guard: ({ event }) => Boolean(event.autoProcedureKey),
          },
          {
            actions: assign({
              globalError: null,
              selectedDateKey: null,
              selectedGroupId: ({ event }) => event.groupId,
              selectedProcedureKey: null,
              selectedSlot: null,
            }),
            target: "master",
          },
        ],
        SELECT_PROCEDURE: {
          actions: assign({
            globalError: null,
            selectedDateKey: null,
            selectedProcedureKey: ({ event }) => event.procedureKey,
            selectedSlot: null,
          }),
        },
        SELECT_SLOT: {
          actions: assign({
            formErrors: {},
            globalError: null,
            selectedSlot: ({ event }) => event.slot,
          }),
          target: "details",
        },
      },
    },
    details: {
      on: {
        SELECT_GROUP: [
          {
            actions: assign({
              globalError: null,
              selectedDateKey: null,
              selectedGroupId: ({ event }) => event.groupId,
              selectedProcedureKey: ({ event }) => event.autoProcedureKey ?? null,
              selectedSlot: null,
            }),
            guard: ({ event }) => Boolean(event.autoProcedureKey),
            target: "time",
          },
          {
            actions: assign({
              globalError: null,
              selectedDateKey: null,
              selectedGroupId: ({ event }) => event.groupId,
              selectedProcedureKey: null,
              selectedSlot: null,
            }),
            target: "master",
          },
        ],
        SELECT_PROCEDURE: {
          actions: assign({
            globalError: null,
            selectedDateKey: null,
            selectedProcedureKey: ({ event }) => event.procedureKey,
            selectedSlot: null,
          }),
          target: "time",
        },
        SELECT_SLOT: {
          actions: assign({
            formErrors: {},
            globalError: null,
            selectedSlot: ({ event }) => event.slot,
          }),
        },
        SUBMIT: {
          target: "submitting",
        },
      },
    },
    submitting: {
      on: {
        SELECT_GROUP: {
          actions: assign({
            globalError: null,
            selectedDateKey: null,
            selectedGroupId: ({ event }) => event.groupId,
            selectedProcedureKey: null,
            selectedSlot: null,
          }),
          target: "master",
        },
        SUBMIT_FAILURE: {
          actions: assign({
            globalError: ({ event }) => event.error,
          }),
          target: "details",
        },
        SUBMIT_SUCCESS: {
          target: "details",
        },
      },
    },
  },
});
