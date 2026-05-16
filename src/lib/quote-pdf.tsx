import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  renderToBuffer,
} from "@react-pdf/renderer";
import type { QuotePdfLetterhead } from "@/lib/quote-pdf-letterhead";
import type { QuoteRequestStatus, SiteQuotePayload } from "@/types/galana-firestore";

const palette = {
  blue: "#0e6f8a",
  blueMid: "#148eb2",
  bluePale: "#e8f4f8",
  gold: "#c9a852",
  goldDark: "#5c4218",
  text: "#0f1b24",
  muted: "#5c6f80",
  border: "#b8c5d4",
  panel: "#f4f7f9",
  white: "#ffffff",
  ink: "#0a1620",
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 0,
    paddingHorizontal: 0,
    paddingBottom: 56,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: palette.text,
    backgroundColor: "#ffffff",
  },
  goldRule: {
    height: 4,
    backgroundColor: palette.gold,
    width: "100%",
  },
  letterhead: {
    backgroundColor: palette.ink,
    paddingTop: 18,
    paddingBottom: 16,
    paddingHorizontal: 40,
  },
  letterheadRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 108,
    height: 36,
    objectFit: "contain",
  },
  brandFallback: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: palette.white,
    letterSpacing: 0.5,
  },
  brandCol: {
    flex: 1,
    marginLeft: 14,
    marginRight: 12,
  },
  brandTitle: {
    fontSize: 15,
    fontFamily: "Helvetica-Bold",
    color: palette.white,
  },
  brandTag: {
    fontSize: 8,
    color: palette.gold,
    marginTop: 3,
    fontStyle: "italic",
  },
  contactCol: {
    width: 200,
    alignItems: "flex-end",
  },
  contactLine: {
    fontSize: 7.5,
    color: "#c8d8e4",
    textAlign: "right",
    marginBottom: 2,
  },
  contactBold: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: palette.white,
    textAlign: "right",
    marginBottom: 3,
  },
  heroBanner: {
    backgroundColor: palette.blueMid,
    paddingVertical: 14,
    paddingHorizontal: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heroTitle: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: palette.white,
    letterSpacing: 0.4,
  },
  heroSub: {
    fontSize: 8,
    color: "#d4eef6",
    marginTop: 4,
  },
  heroRight: {
    alignItems: "flex-end",
  },
  heroMeta: {
    fontSize: 8,
    color: palette.white,
    fontFamily: "Helvetica-Bold",
  },
  bodyPad: {
    paddingHorizontal: 40,
    paddingTop: 22,
  },
  statusRow: {
    flexDirection: "row",
    marginBottom: 16,
    flexWrap: "wrap",
  },
  chip: {
    backgroundColor: palette.bluePale,
    borderWidth: 1,
    borderColor: palette.blueMid,
    paddingVertical: 5,
    paddingHorizontal: 11,
    borderRadius: 14,
    marginRight: 10,
    marginBottom: 8,
  },
  chipLabel: {
    fontSize: 6.5,
    color: palette.muted,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: 2,
  },
  chipVal: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: palette.blue,
  },
  statusChip: {
    backgroundColor: "#fdf8e8",
    borderColor: palette.gold,
  },
  statusText: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: palette.goldDark,
    textTransform: "uppercase",
  },
  card: {
    backgroundColor: palette.panel,
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: palette.gold,
    padding: 14,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: palette.blueMid,
    marginBottom: 10,
  },
  kvRow: {
    flexDirection: "row",
    marginBottom: 5,
  },
  k: { width: 92, fontSize: 8.5, color: palette.muted },
  v: { flex: 1, fontSize: 8.5, color: palette.text },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: palette.blueMid,
    marginTop: 8,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 2,
    borderBottomColor: palette.gold,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  line: {
    fontSize: 9,
    marginBottom: 4,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: palette.blueMid,
  },
  emptyHint: {
    fontSize: 9,
    color: palette.muted,
    fontStyle: "italic",
  },
  prose: {
    fontSize: 9,
    lineHeight: 1.45,
    color: palette.text,
  },
  tableHead: {
    flexDirection: "row",
    backgroundColor: palette.blue,
    paddingVertical: 7,
    paddingHorizontal: 8,
    marginTop: 6,
  },
  th: { fontSize: 8, fontFamily: "Helvetica-Bold", color: palette.white },
  thName: { width: "38%" },
  thCat: { width: "24%" },
  thQty: { width: "12%", textAlign: "right" },
  thNote: { width: "26%" },
  tr: {
    flexDirection: "row",
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  td: { fontSize: 8, color: palette.text },
  tdName: { width: "38%" },
  tdCat: { width: "24%" },
  tdQty: { width: "12%", textAlign: "right" },
  tdNote: { width: "26%" },
  footer: {
    position: "absolute",
    bottom: 22,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: palette.border,
    paddingTop: 10,
  },
  footerLine: {
    fontSize: 7,
    color: palette.muted,
    marginBottom: 2,
    textAlign: "center",
  },
  footerBrand: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: palette.blueMid,
    textAlign: "center",
    marginBottom: 4,
  },
});

export interface QuotePdfInput {
  id: string;
  status: QuoteRequestStatus;
  kind: string;
  fromEmail: string;
  pageUrl: string;
  payload: SiteQuotePayload;
  createdAtLabel: string;
  letterhead: QuotePdfLetterhead;
}

function statusTitle(s: QuoteRequestStatus): string {
  switch (s) {
    case "processing":
      return "Processing";
    case "quoted":
      return "Quoted";
    case "confirmed":
      return "Confirmed";
    case "declined":
      return "Declined";
    case "archived":
      return "Archived";
    default:
      return String(s);
  }
}

function dash(v: string | undefined): string {
  const t = v?.trim();
  return t || "—";
}

export function QuotePdfDocument(props: QuotePdfInput) {
  const { payload, letterhead } = props;
  const lines = payload.calculator?.lines ?? [];
  const cart = payload.cart ?? [];
  const tab = payload.calculator?.activeMainTab ?? "—";

  return (
    <Document
      title={`Galana quote ${props.id}`}
      subject="Quotation summary"
      author={letterhead.companyName}
    >
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.goldRule} fixed />
        <View style={styles.letterhead}>
          <View style={styles.letterheadRow}>
            {letterhead.logoDataUri ? (
              // react-pdf Image has no alt prop — decorative logo in PDF
              // eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer Image
              <Image style={styles.logo} src={letterhead.logoDataUri} />
            ) : (
              <Text style={styles.brandFallback}>{letterhead.companyName}</Text>
            )}
            <View style={styles.brandCol}>
              <Text style={styles.brandTitle}>{letterhead.companyName}</Text>
              <Text style={styles.brandTag}>{letterhead.tagline}</Text>
            </View>
            <View style={styles.contactCol}>
              <Text style={styles.contactBold}>{letterhead.address}</Text>
              <Text style={styles.contactLine}>Tel: {letterhead.phone}</Text>
              {letterhead.altPhone ? (
                <Text style={styles.contactLine}>Alt: {letterhead.altPhone}</Text>
              ) : null}
              <Text style={styles.contactLine}>{letterhead.email}</Text>
              <Text style={styles.contactLine}>
                Quotes: {letterhead.quoteEmail}
              </Text>
              <Text style={styles.contactLine}>{letterhead.hours}</Text>
            </View>
          </View>
        </View>

        <View style={styles.heroBanner}>
          <View>
            <Text style={styles.heroTitle}>Quotation summary</Text>
            <Text style={styles.heroSub}>
              Provisional document · Not a tax invoice
            </Text>
          </View>
          <View style={styles.heroRight}>
            <Text style={styles.heroMeta}>Ref · {props.id}</Text>
            <Text style={[styles.heroMeta, { marginTop: 4 }]}>
              {props.createdAtLabel}
            </Text>
          </View>
        </View>

        <View style={styles.bodyPad}>
          <View style={styles.statusRow}>
            <View style={styles.chip}>
              <Text style={styles.chipLabel}>Reference</Text>
              <Text style={styles.chipVal}>{props.id}</Text>
            </View>
            <View style={styles.chip}>
              <Text style={styles.chipLabel}>Type</Text>
              <Text style={styles.chipVal}>{props.kind}</Text>
            </View>
            <View style={[styles.chip, styles.statusChip]}>
              <Text style={styles.chipLabel}>Status</Text>
              <Text style={styles.statusText}>{statusTitle(props.status)}</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Your details</Text>
            <View style={styles.kvRow}>
              <Text style={styles.k}>Name</Text>
              <Text style={styles.v}>{dash(payload.fullName)}</Text>
            </View>
            <View style={styles.kvRow}>
              <Text style={styles.k}>Company</Text>
              <Text style={styles.v}>{dash(payload.company)}</Text>
            </View>
            <View style={styles.kvRow}>
              <Text style={styles.k}>Email</Text>
              <Text style={styles.v}>{dash(props.fromEmail)}</Text>
            </View>
            <View style={styles.kvRow}>
              <Text style={styles.k}>Phone</Text>
              <Text style={styles.v}>{dash(payload.fromPhone)}</Text>
            </View>
            <View style={styles.kvRow}>
              <Text style={styles.k}>Location</Text>
              <Text style={styles.v}>{dash(payload.location)}</Text>
            </View>
            <View style={styles.kvRow}>
              <Text style={styles.k}>Source page</Text>
              <Text style={styles.v}>{dash(props.pageUrl)}</Text>
            </View>
            {payload.inquiryCategory ? (
              <View style={styles.kvRow}>
                <Text style={styles.k}>Interest</Text>
                <Text style={styles.v}>{payload.inquiryCategory}</Text>
              </View>
            ) : null}
            {payload.inquiryMessage ? (
              <View style={{ marginTop: 8 }}>
                <Text style={[styles.k, { width: "100%", marginBottom: 4 }]}>
                  Message
                </Text>
                <Text style={styles.prose}>{payload.inquiryMessage}</Text>
              </View>
            ) : null}
          </View>

          <Text style={styles.sectionTitle}>
            Materials calculator · {String(tab)}
          </Text>
          {lines.length === 0 ? (
            <Text style={styles.emptyHint}>No calculator lines for this quote.</Text>
          ) : (
            lines.map((line, i) => (
              <Text key={i} style={styles.line}>
                {line}
              </Text>
            ))
          )}

          <Text style={styles.sectionTitle}>Requested products</Text>
          {cart.length === 0 ? (
            <Text style={styles.emptyHint}>No line items in cart.</Text>
          ) : (
            <>
              <View style={styles.tableHead} fixed>
                <Text style={[styles.th, styles.thName]}>Product</Text>
                <Text style={[styles.th, styles.thCat]}>Category</Text>
                <Text style={[styles.th, styles.thQty]}>Qty</Text>
                <Text style={[styles.th, styles.thNote]}>Note</Text>
              </View>
              {cart.map((row, i) => (
                <View style={styles.tr} key={`${row.productId}-${i}`}>
                  <Text style={[styles.td, styles.tdName]}>{row.name}</Text>
                  <Text style={[styles.td, styles.tdCat]}>{row.category}</Text>
                  <Text style={[styles.td, styles.tdQty]}>{row.qty}</Text>
                  <Text style={[styles.td, styles.tdNote]}>
                    {row.lineNote || "—"}
                  </Text>
                </View>
              ))}
            </>
          )}
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerBrand}>{letterhead.companyName}</Text>
          <Text style={styles.footerLine}>
            {letterhead.address} · {letterhead.phone} · {letterhead.quoteEmail}
          </Text>
          <Text style={styles.footerLine}>
            Figures are estimates; official pricing, stock and delivery are
            confirmed after review by our team.
          </Text>
        </View>
      </Page>
    </Document>
  );
}

export async function renderQuotePdfBuffer(input: QuotePdfInput): Promise<Buffer> {
  return renderToBuffer(<QuotePdfDocument {...input} />);
}
