import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  EntityChip,
  EventTimeline,
  RiskBadge,
  VerdictStamp,
} from "@/components/domain";
import { BAND_RANGES, type RiskBand } from "@/lib/types";
import { Matrix, Row, Stack, State } from "./_harness";

/**
 * Tier 4: domain. These speak the vocabulary of risk review and are
 * deliberately not reusable, which is the point of the category rather than a
 * shortcoming of it.
 */
const meta = {
  title: "Verdict/4 Domain/RiskBadge",
  component: RiskBadge,
  args: { band: 3 },
} satisfies Meta<typeof RiskBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

const BANDS: RiskBand[] = [1, 2, 3, 4];

/**
 * The case's central argument, rendered.
 *
 * Risk is ordinal, so it is not a traffic light. It is one ember hue climbing
 * in lightness and chroma across four steps, and colour is never the only
 * carrier: every badge ships a rank and a band label as well.
 *
 * The test is the greyscale story below. If the ramp still reads with the hue
 * removed, the encoding is doing its job.
 */
export const Bands: Story = {
  render: () => (
    <Stack gap={24}>
      <State name="full" note="colour, rank and word, always all three">
        <Row>
          {BANDS.map((b) => (
            <RiskBadge key={b} band={b} />
          ))}
        </Row>
      </State>
      <State name="compact" note="inside a table row">
        <Row>
          {BANDS.map((b) => (
            <RiskBadge key={b} band={b} compact />
          ))}
        </Row>
      </State>
      <State name="with their printed ranges">
        <Row>
          {BANDS.map((b) => (
            <span key={b} style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
              <RiskBadge band={b} />
              <span className="vd-mono" style={{ color: "var(--vd-text-tertiary)", fontSize: 12 }}>
                {BAND_RANGES[b][0]}–{BAND_RANGES[b][1]}
              </span>
            </span>
          ))}
        </Row>
      </State>
    </Stack>
  ),
};

/**
 * The proof, not an illustration of it.
 *
 * A CSS greyscale filter over the real components. If a reviewer with any form
 * of colour vision deficiency, or a shared ops-room projector, strips the hue
 * out, the rank and the word are still there and the order still climbs.
 */
export const Greyscale: Story = {
  name: "Bands, hue removed",
  render: () => (
    <Stack gap={16}>
      <p style={{ margin: 0, color: "var(--vd-text-secondary)", maxWidth: 520 }}>
        The same four badges with the hue filtered out. Rank and label survive,
        and so does the lightness climb, which is what makes a sequential ramp
        different from a traffic light.
      </p>
      <div style={{ filter: "grayscale(1)" }}>
        <Row>
          {BANDS.map((b) => (
            <RiskBadge key={b} band={b} />
          ))}
        </Row>
      </div>
    </Stack>
  ),
};

export const Stamps: StoryObj = {
  name: "Verdict stamp",
  render: () => (
    <Row>
      <VerdictStamp decision="approve" />
      <VerdictStamp decision="decline" />
      <VerdictStamp decision="escalate" />
    </Row>
  ),
};

export const Entities: StoryObj = {
  name: "Entity chip",
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

export const Timeline: StoryObj = {
  name: "Event timeline",
  render: () => (
    <Matrix>
      <State name="mixed tones">
        <EventTimeline
          events={[
            { at: "11:02", label: "Account opened", detail: "Email verified", tone: "reassuring" },
            { at: "11:14", label: "Card added", detail: "First card on file" },
            { at: "11:16", label: "Shipping address changed", tone: "concerning" },
            { at: "11:17", label: "Order placed", detail: "£3,240" },
          ]}
        />
      </State>
      <State name="single event" note="the connector must not draw from nowhere">
        <EventTimeline events={[{ at: "09:41", label: "Order placed" }]} />
      </State>
      <State name="empty" note="a case with no history">
        <EventTimeline events={[]} />
      </State>
    </Matrix>
  ),
};
