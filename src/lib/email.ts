import nodemailer from 'nodemailer'
import { findEmailConfig } from './db'

interface EmailOptions {
  to: string
  subject: string
  html: string
}

async function getTransporter() {
  const config = await findEmailConfig()

  if (!config || !config.enabled) return null

  return nodemailer.createTransport({
    host: config.host as string,
    port: config.port as number,
    secure: (config.port as number) === 465,
    auth: {
      user: config.user as string,
      pass: config.password as string,
    },
  })
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const transporter = await getTransporter()
    if (!transporter) return false

    const config = await findEmailConfig()

    await transporter.sendMail({
      from: (config?.from as string) || options.to,
      to: options.to,
      subject: options.subject,
      html: options.html,
    })

    return true
  } catch (error) {
    console.error('Error sending email:', error)
    return false
  }
}

export function buildTicketEmail(ticket: {
  title: string
  description: string
  priority: string
  company?: string | null
  phone?: string | null
  creatorName: string
  creatorEmail: string
}): string {
  const priorityColors: Record<string, string> = {
    LOW: '#059669',
    MEDIUM: '#2563EB',
    HIGH: '#EA580C',
    CRITICAL: '#DC2626',
  }

  const priorityLabels: Record<string, string> = {
    LOW: 'Baja',
    MEDIUM: 'Media',
    HIGH: 'Alta',
    CRITICAL: 'Crítica',
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Poppins', 'Helvetica Neue', Arial, sans-serif; background: #FAFAFA; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; overflow: hidden; border: 1px solid #E8E8E8; }
        .header { background: #0D0D0D; padding: 24px 32px; }
        .header h1 { color: #FFFFFF; font-size: 18px; font-weight: 500; margin: 0; }
        .header p { color: #9a9a9a; font-size: 13px; margin: 4px 0 0; }
        .content { padding: 32px; }
        .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; }
        .field { margin-bottom: 20px; }
        .field-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #9a9a9a; margin-bottom: 4px; }
        .field-value { font-size: 14px; color: #0D0D0D; line-height: 1.5; }
        .description { background: #FAFAFA; border-radius: 12px; padding: 16px; font-size: 14px; color: #5a5a5a; line-height: 1.6; white-space: pre-wrap; }
        .footer { padding: 20px 32px; border-top: 1px solid #E8E8E8; font-size: 12px; color: #9a9a9a; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>TicketApp - Nuevo Ticket</h1>
          <p>Se ha creado un nuevo ticket de soporte</p>
        </div>
        <div class="content">
          <div class="field">
            <div class="field-label">Título</div>
            <div class="field-value" style="font-weight: 500; font-size: 16px;">${ticket.title}</div>
          </div>
          <div style="display: flex; gap: 12px; margin-bottom: 20px;">
            <div class="field" style="margin-bottom: 0;">
              <div class="field-label">Prioridad</div>
              <span class="badge" style="background: ${priorityColors[ticket.priority]}20; color: ${priorityColors[ticket.priority]};">
                ${priorityLabels[ticket.priority] || ticket.priority}
              </span>
            </div>
            ${ticket.company ? `
            <div class="field" style="margin-bottom: 0;">
              <div class="field-label">Empresa</div>
              <div class="field-value">${ticket.company}</div>
            </div>
            ` : ''}
          </div>
          <div class="field">
            <div class="field-label">Descripción</div>
            <div class="description">${ticket.description}</div>
          </div>
          <div style="display: flex; gap: 24px;">
            <div class="field" style="margin-bottom: 0;">
              <div class="field-label">Creado por</div>
              <div class="field-value">${ticket.creatorName}</div>
            </div>
            <div class="field" style="margin-bottom: 0;">
              <div class="field-label">Email</div>
              <div class="field-value">${ticket.creatorEmail}</div>
            </div>
            ${ticket.phone ? `
            <div class="field" style="margin-bottom: 0;">
              <div class="field-label">Teléfono</div>
              <div class="field-value">${ticket.phone}</div>
            </div>
            ` : ''}
          </div>
        </div>
        <div class="footer">
          TicketApp - Sistema de Gestión de Tickets
        </div>
      </div>
    </body>
    </html>
  `
}
