import React from 'react'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import type { TemplateEntry } from './registry'
import {
  badge,
  button,
  container,
  footer,
  h1,
  hr,
  main,
  text,
} from './styles'

interface Props {
  fullName?: string
  loginUrl?: string
  tempPassword?: string
}

const Email = ({ fullName, loginUrl, tempPassword }: Props) => {
  const url = loginUrl || 'https://consulti.slz.br/auth'
  return (
    <Html lang="pt-BR" dir="ltr">
      <Head />
      <Preview>Uma senha temporária foi gerada para o seu acesso</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section>
            <Text style={badge}>Notifica-MA Intelligence</Text>
          </Section>
          <Heading style={h1}>Senha temporária gerada</Heading>
          <Text style={text}>
            {fullName ? `Olá, ${fullName},` : 'Olá,'}
          </Text>
          <Text style={text}>
            Um administrador gerou uma <strong>senha temporária</strong> para a sua
            conta na Plataforma Estadual de Monitoramento e Decisão em Saúde.
          </Text>
          {tempPassword ? (
            <>
              <Text style={text}>
                Sua senha temporária de acesso é:
              </Text>
              <Section style={{
                backgroundColor: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '14px 18px',
                textAlign: 'center',
                margin: '16px 0',
              }}>
                <Text style={{
                  fontFamily: 'monospace',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  letterSpacing: '1px',
                  color: '#0f172a',
                  margin: 0,
                }}>
                  {tempPassword}
                </Text>
              </Section>
              <Text style={text}>
                No primeiro acesso, você deverá utilizar esta senha temporária e o sistema exigirá que você defina uma nova senha pessoal antes de continuar.
              </Text>
            </>
          ) : (
            <Text style={text}>
              No primeiro acesso, o sistema exigirá que você defina uma nova senha pessoal antes de continuar.
            </Text>
          )}
          <Button href={url} style={button}>
            Acessar a plataforma
          </Button>
          <Text style={text}>
            Se você não solicitou esta alteração, entre em contato imediatamente
            com a equipe responsável pelo sistema.
          </Text>
          <Hr style={hr} />
          <Text style={footer}>
            Ministério da Saúde — Secretaria de Vigilância em Saúde e Ambiente (SVSA)
          </Text>
          <Text style={footer}>Desenvolvido por GERTEC/ConsulTI</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: Email,
  subject: 'Senha temporária gerada — troque no primeiro acesso',
  displayName: 'Senha temporária gerada',
  previewData: {
    fullName: 'Maria Silva',
    loginUrl: 'https://consulti.slz.br/auth',
    tempPassword: 'AbCdE-fGhJk!42',
  },
} satisfies TemplateEntry
