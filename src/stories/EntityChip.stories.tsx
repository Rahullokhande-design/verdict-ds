import type { Meta, StoryObj } from "@storybook/react-vite";
import { EntityChip } from "@/components/domain";
import { Matrix, Stack, State } from "./_harness";

/**
 * A device, card, email or address that this case shares with others. The count
 * is the reason the chip exists: one card on one case is a fact, the same card
 * on six is a pattern.
 */
const meta = {
  title: "Verdict/Domain/EntityChip",
  component: EntityChip,
  args: { entity: { kind: "card", label: "•••• 4417", cases: 1, band: 2 } },
} satisfies Meta<typeof EntityChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const States: Story = {
  render: () => (
    <Matrix>
      <State name="all four kinds">
        <Stack gap={8}>
          <EntityChip entity={{ kind: "device", label: "d41f · Windows", cases: 3, band: 4 }} />
          <EntityChip entity={{ kind: "card", label: "•••• 4417", cases: 1, band: 2 }} />
          <EntityChip entity={{ kind: "email", label: "m.okafor@fastmail.com", cases: 2, band: 3 }} />
          <EntityChip entity={{ kind: "address", label: "Unit 4, Bramley Rd", cases: 1, band: 1 }} />
        </Stack>
      </State>
      <State name="long label" note="an email is as long as it wants to be">
        <div style={{ width: 220 }}>
          <EntityChip
            entity={{
              kind: "email",
              label: "a.very.long.address.someone.actually.uses@subdomain.example.co.uk",
              cases: 6,
              band: 4,
            }}
          />
        </div>
      </State>
    </Matrix>
  ),
};
