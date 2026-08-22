import * as React from 'react'

import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Text,
} from '@react-email/components'

import { badge, code, container, footer, h1, hr, main, text } from './styles'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Seu código de verificação</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={badge}>Notifica-MA</Text>
        <Heading style={h1}>Seu código de verificação</Heading>
        <Text style={text}>Use o código abaixo para confirmar a operação solicitada:</Text>
        <Text style={code}>{token}</Text>
        <Hr style={hr} />
        <Text style={footer}>
          O código expira em poucos minutos. Nunca compartilhe este código com outras
          pessoas.
        </Text>
        <Text style={footer}>Desenvolvido por GERTEC/ConsulTI · +55 (98) 98600-1270</Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail
