const EMAIL_THEME = Object.freeze({
  background: '#fbefdf',
  surface: '#fff8f3',
  surfaceAlt: '#fffff0',
  panel: '#f2e2d5',
  border: '#e4cfc7',
  primary: '#ab192e',
  primaryStrong: '#b71422',
  primaryDark: '#99111f',
  ink: '#17110c',
  inkSoft: '#5a4b42',
  textMuted: '#7a6a60',
  white: '#fffff0'
});

function buildEmailShell(title, bodyHtml) {
  return `
    <div style="margin: 0; padding: 32px 16px; background-color: ${EMAIL_THEME.background}; font-family: Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; border: 1px solid ${EMAIL_THEME.border}; background-color: ${EMAIL_THEME.surface};">
        <div style="background-color: ${EMAIL_THEME.primary}; color: ${EMAIL_THEME.white}; padding: 22px 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; line-height: 1.1;">${title}</h1>
        </div>
        <div style="padding: 30px; border-top: 1px solid ${EMAIL_THEME.border};">
          ${bodyHtml}
        </div>
      </div>
    </div>
  `;
}

function buildEmailButton(label, href) {
  return `
    <a href="${href}" style="background-color: ${EMAIL_THEME.primaryStrong}; border: 1px solid #bf3535; color: ${EMAIL_THEME.white}; padding: 12px 28px; text-decoration: none; border-radius: 4px; display: inline-block; letter-spacing: 0.04em; text-transform: uppercase;">
      ${label}
    </a>
  `;
}

function buildEmailCard(contentHtml, accentColor = EMAIL_THEME.primaryStrong) {
  return `
    <div style="background-color: ${EMAIL_THEME.panel}; border: 1px solid ${EMAIL_THEME.border}; border-left: 4px solid ${accentColor}; padding: 18px 20px; margin: 20px 0;">
      ${contentHtml}
    </div>
  `;
}

function buildEmailFooter(prefix = 'Need help?', linkLabel = 'Contact Support') {
  return `
    <div style="margin-top: 24px; padding-top: 18px; border-top: 1px solid ${EMAIL_THEME.border}; font-size: 12px; line-height: 1.6; color: ${EMAIL_THEME.textMuted}; text-align: center;">
      <p style="margin: 4px 0;">Hotel Booking 2026 | All Rights Reserved</p>
      <p style="margin: 4px 0;">
        ${prefix}
        <a href="mailto:support@hotelbooking.com" style="color: ${EMAIL_THEME.primary}; font-weight: bold; text-decoration: none;">
          ${linkLabel}
        </a>
      </p>
    </div>
  `;
}

function buildTableRow(label, value, isLast = false) {
  const borderStyle = isLast ? '' : ` border-bottom: 1px solid ${EMAIL_THEME.border};`;
  return `
    <tr>
      <td style="padding: 10px 0; vertical-align: top;${borderStyle}">
        <strong>${label}</strong>
      </td>
      <td style="padding: 10px 0; vertical-align: top;${borderStyle}">
        ${value}
      </td>
    </tr>
  `;
}

module.exports = {
  EMAIL_THEME,
  buildEmailShell,
  buildEmailButton,
  buildEmailCard,
  buildEmailFooter,
  buildTableRow
};
