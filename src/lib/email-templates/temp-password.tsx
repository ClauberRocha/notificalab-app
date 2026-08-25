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
}

const Email = ({ fullName, loginUrl }: Props) => {
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
          <Text style={text}>
            Por segurança, a senha temporária é entregue diretamente pelo
            administrador responsável — ela nunca é enviada por e-mail. No
            primeiro acesso, o sistema exigirá que você defina uma nova senha
            pessoal antes de continuar.
          </Text>
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
  },
} satisfies TemplateEntry
