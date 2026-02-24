import type { Meta, StoryObj } from "@storybook/react";
import { HourByHourGrossProfitWidget } from "@joyus/ui-components";

const meta: Meta<typeof HourByHourGrossProfitWidget> = {
  title: "Widgets/Hour By Hour Gross Profit",
  component: HourByHourGrossProfitWidget,
  parameters: {
    docs: {
      description: {
        component:
          "Purpose: show hour-level GP72 thresholds for selected store scope. Data Source: hourly profile snapshot + dashboard state controls."
      }
    }
  }
};

export default meta;

type Story = StoryObj<typeof HourByHourGrossProfitWidget>;

export const SingleLocation: Story = {
  args: {
    title: "Hour-by-Hour GP72",
    rows: [
      { hourLabel: "12 PM", gp72: 392, trend: "high" },
      { hourLabel: "1 PM", gp72: 224, trend: "medium" },
      { hourLabel: "2 PM", gp72: 131, trend: "low" },
      { hourLabel: "3 PM", gp72: -14, trend: "negative" }
    ]
  }
};

export const CombinedLocation: Story = {
  args: {
    title: "Hour-by-Hour GP72 (Both Stores)",
    rows: [
      { hourLabel: "12 PM", gp72: 768, trend: "high" },
      { hourLabel: "1 PM", gp72: 530, trend: "high" },
      { hourLabel: "2 PM", gp72: 301, trend: "medium" },
      { hourLabel: "3 PM", gp72: 88, trend: "low" }
    ]
  }
};
