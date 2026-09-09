import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { Chip, PageTitle, isColour, mono, resolve, semantic } from "./_tokens";

/**
 * Every semantic colour role, in both themes, side by side.
 *
 * The point of the page is the comparison. A role whose two themes are the same
 * value is a role that has quietly stopped being semantic, and a role missing
 * from one theme is a build failure the token generator already catches. Seeing
 * them in one table is how you notice the first one, which nothing catches.
 */
const meta = {
  title: "Verdict/Foundations/Colour roles",
  tags: ["!autodocs"],
  parameters: {
    layout: "fullscreen",
    /**
     * No addon panel on a documentation page. It has no args and no
     * interactions, so the panel renders Storybook telling the reader "This
     * story has no controls", which was the first sentence of prose this
     * Storybook offered about itself.
     */
    options: { showPanel: false },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const darkRoles = semantic("dark").filter(([, v]) => isColour(v));
const lightMap = new Map(semantic("light"));

const rows = darkRoles.map(([name, darkRaw]) => {
  const lightRaw = lightMap.get(name);
  return {
    name,
    dark: resolve(darkRaw),
    darkAlias: darkRaw,
    light: lightRaw ? resolve(lightRaw) : null,
    lightAlias: lightRaw ?? null,
  };
});

/** Grouped by the first segment, which is how the token source is organised. */
const groups = rows.reduce<Record<string, typeof rows>>((acc, row) => {
  const key = row.name.split(".")[0];
  (acc[key] ??= []).push(row);
  return acc;
}, {});

const identical = rows.filter((r) => r.light && r.dark.final === r.light.final);

function alias(raw: string) {
  return raw.replace(/^\{|\}$/g, "").replace(/^primitive\.color\./, "");
}

export const ColourRoles: Story = {
  name: "Colour roles",
  render: () => (
    <div style={{ maxWidth: 980, lineHeight: 1.6 }}>
      <PageTitle
        kicker="Foundations"
        title="Every colour role, in both themes"
        lede={
          <>
            {rows.length} semantic colour roles, read from{" "}
            <code style={{ fontFamily: mono }}>tokens.json</code> and resolved
            through their aliases as this page renders. The primitive each one
            lands on is shown, because the alias is the part that carries the
            architecture and the part a naive export throws away.
          </>
        }
      />

      <p style={{ margin: "16px 0 0", maxWidth: "66ch", color: "var(--vd-text-secondary)" }}>
        {identical.length === 0
          ? "No role currently resolves to the same value in both themes."
          : `${identical.length} role${identical.length === 1 ? "" : "s"} resolve to the same value in both themes: ${identical
              .map((r) => r.name)
              .join(", ")}. That is worth a look. A role that does not change between themes is usually a role that has stopped being semantic.`}
      </p>

      {Object.entries(groups).map(([group, list]) => (
        <section key={group} style={{ marginTop: 36 }}>
          <h2
            style={{
              fontSize: 13,
              letterSpacing: "0.09em",
              textTransform: "uppercase",
              fontFamily: mono,
              color: "var(--vd-text-tertiary)",
              margin: "0 0 10px",
              fontWeight: 500,
            }}
          >
            {group} <span style={{ opacity: 1 }}>· {list.length}</span>
          </h2>
          <table className="vd-table" style={{ width: "100%", fontSize: 13 }}>
            <thead>
              <tr>
                <th scope="col" style={{ textAlign: "left" }}>Role</th>
                <th scope="col" style={{ textAlign: "left" }} colSpan={2}>Dark</th>
                <th scope="col" style={{ textAlign: "left" }}>Aliases</th>
                <th scope="col" style={{ textAlign: "left" }} colSpan={2}>Light</th>
                <th scope="col" style={{ textAlign: "left" }}>Aliases</th>
              </tr>
            </thead>
            <tbody>
              {list.map((row) => (
                <tr key={row.name}>
                  <td className="vd-mono">{row.name}</td>
                  <td style={{ width: 34 }}>
                    <Chip value={row.dark.final} size={22} title={row.dark.final} />
                  </td>
                  <td className="vd-mono">{row.dark.final}</td>
                  <td className="vd-mono" style={{ color: "var(--vd-text-tertiary)" }}>
                    {alias(row.darkAlias)}
                  </td>
                  <td style={{ width: 34 }}>
                    {row.light ? (
                      <Chip value={row.light.final} size={22} title={row.light.final} />
                    ) : null}
                  </td>
                  <td className="vd-mono">{row.light?.final ?? "missing"}</td>
                  <td className="vd-mono" style={{ color: "var(--vd-text-tertiary)" }}>
                    {row.lightAlias ? alias(row.lightAlias) : "missing"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}

      <p
        style={{
          margin: "40px 0 0",
          paddingTop: 16,
          borderTop: "1px solid var(--vd-border-subtle)",
          fontSize: 13,
          color: "var(--vd-text-tertiary)",
          maxWidth: "66ch",
        }}
      >
        A role defined in one theme and not the other exits the token build
        non-zero, so the missing column above should never appear. It is rendered
        rather than assumed away, because a page that cannot show you its own
        failure state is a page you have to take on trust.
      </p>
    </div>
  ),
};
