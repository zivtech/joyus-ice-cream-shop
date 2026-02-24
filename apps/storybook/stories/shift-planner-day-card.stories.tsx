import type { Meta, StoryObj } from "@storybook/react";
import { ShiftPlannerDayCardWidget } from "@joyus/ui-components";

const meta: Meta<typeof ShiftPlannerDayCardWidget> = {
  title: "Widgets/Shift Planner Day Card",
  component: ShiftPlannerDayCardWidget,
  args: {
    dayLabel: "Friday",
    weatherSummary: "Warmer than baseline, add one support slot near close.",
    viability: {
      expectedRevenue: 4900,
      plannedLabor: 1420,
      plannedLaborPct: 29,
      expectedGp72: 2108
    },
    onRequestStateChange: () => {}
  },
  parameters: {
    docs: {
      description: {
        component:
          "Purpose: day-level planning anatomy with viability/weather/request state controls. Data Source: planner day state + weather + PTO context."
      }
    }
  }
};

export default meta;

type Story = StoryObj<typeof ShiftPlannerDayCardWidget>;

export const DefaultState: Story = {
  args: {
    requestState: "default"
  }
};

export const PendingRequest: Story = {
  args: {
    requestState: "pending_request"
  }
};

export const ApprovedRequest: Story = {
  args: {
    requestState: "approved_request"
  }
};
