// Shared inline styles for the auth email templates (brand: Notifica-MA).
// Email clients ignore external CSS, so every style must stay inline.

export const brand = {
  primary: '#1b5fa8',
  primaryDark: '#12294a',
} as const

export const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  color: '#1a2433',
}

export const container = {
  margin: '0 auto',
  padding: '32px 24px 48px',
  maxWidth: '560px',
}

export const badge = {
  display: 'inline-block',
  backgroundColor: '#eaf1fa',
  color: '#1b5fa8',
  fontSize: '12px',
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase' as const,
  padding: '6px 12px',
  borderRadius: '999px',
  marginBottom: '20px',
}

export const h1 = {
  color: '#12294a',
  fontSize: '22px',
  fontWeight: 700,
  lineHeight: '30px',
  margin: '0 0 16px',
}

export const text = {
  color: '#33445c',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 16px',
}

export const button = {
  backgroundColor: '#1b5fa8',
  borderRadius: '8px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '15px',
  fontWeight: 600,
  padding: '12px 22px',
  textDecoration: 'none',
  margin: '8px 0 20px',
}

export const link = {
  color: '#1b5fa8',
  textDecoration: 'underline',
}

export const code = {
  display: 'inline-block',
  backgroundColor: '#eaf1fa',
  color: '#12294a',
  borderRadius: '8px',
  fontFamily: "'Courier New', Courier, monospace",
  fontSize: '26px',
  fontWeight: 700,
  letterSpacing: '0.18em',
  padding: '14px 22px',
  margin: '8px 0 20px',
}

export const hr = {
  borderColor: '#e3e9f1',
  margin: '28px 0 16px',
}

export const footer = {
  color: '#7a879a',
  fontSize: '12px',
  lineHeight: '18px',
  margin: '0 0 6px',
}
