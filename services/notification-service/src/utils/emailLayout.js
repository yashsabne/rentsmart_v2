
export const escapeHtml = (value = "") => {
  return String(value).replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[char];
  });
};

export const emailLayout = ({ title, preheader = "", content }) => {
  const safeTitle = escapeHtml(title);

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${safeTitle}</title>
      </head>

      <body style="
        margin:0;
        padding:0;
        background-color:#f1f5f9;
        font-family:Arial,Helvetica,sans-serif;
      ">

        <div style="
          display:none;
          max-height:0;
          overflow:hidden;
          opacity:0;
        ">
          ${escapeHtml(preheader)}
        </div>

        <table
          role="presentation"
          width="100%"
          cellpadding="0"
          cellspacing="0"
          style="background-color:#f1f5f9;padding:30px 12px;"
        >
          <tr>
            <td align="center">

              <table
                role="presentation"
                width="100%"
                cellpadding="0"
                cellspacing="0"
                style="
                  max-width:640px;
                  background:#ffffff;
                  border:1px solid #e2e8f0;
                  border-radius:14px;
                  overflow:hidden;
                "
              >

                <tr>
                  <td style="
                    padding:25px 35px;
                    background:#2563eb;
                    color:#ffffff;
                  ">
                    <h1 style="
                      margin:0;
                      font-size:25px;
                      font-weight:700;
                    ">
                      RentSmart
                    </h1>

                    <p style="
                      margin:5px 0 0;
                      font-size:13px;
                      color:#dbeafe;
                    ">
                      Find your perfect place
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="
                    padding:35px;
                    color:#1e293b;
                    font-size:16px;
                    line-height:1.7;
                  ">
                    ${content}
                  </td>
                </tr>

                <tr>
                  <td style="
                    padding:22px 35px;
                    background:#f8fafc;
                    border-top:1px solid #e2e8f0;
                  ">
                    <p style="
                      margin:0;
                      font-size:13px;
                      color:#64748b;
                      line-height:1.6;
                    ">
                      This is an automated email from RentSmart.
                      Please do not reply directly to this message.
                    </p>

                    <p style="
                      margin:8px 0 0;
                      font-size:12px;
                      color:#94a3b8;
                    ">
                      &copy; ${new Date().getFullYear()} RentSmart.
                      All rights reserved.
                    </p>
                  </td>
                </tr>

              </table>

            </td>
          </tr>
        </table>

      </body>
    </html>
  `;
};

export const emailButton = (url, label, color = "#2563eb") => {
  const safeUrl = escapeHtml(url);
  const safeLabel = escapeHtml(label);

  return `
    <a
      href="${safeUrl}"
      style="
        display:inline-block;
        padding:13px 25px;
        background:${color};
        color:#ffffff;
        text-decoration:none;
        border-radius:8px;
        font-weight:600;
        margin:16px 0;
      "
    >
      ${safeLabel}
    </a>
  `;
};
