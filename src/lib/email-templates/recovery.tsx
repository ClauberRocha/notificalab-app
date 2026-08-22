import * as React from 'react'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Text,
} from '@react-email/components'

import { badge, button, container, footer, h1, hr, link, main, text } from './styles'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

export const RecoveryEmail = ({ siteName, confirmationUrl }: RecoveryEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Redefinição de senha do {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={badge}>{siteName}</Text>
        <Heading style={h1}>Redefinir sua senha</Heading>
        <Text style={text}>
          Recebemos um pedido para redefinir a senha da sua conta. Clique no botão abaixo
          para cadastrar uma nova senha:
        </Text>
        <Button style={button} href={confirmationUrl}>
          Redefinir senha
        </Button>
        <Text style={text}>
          Se o botão não funcionar, copie e cole este endereço no navegador:
          <br />
          <Link href={confirmationUrl} style={link}>
            {confirmationUrl}
          </Link>
        </Text>
        <Hr style={hr} />
        <Text style={footer}>
          Se você não pediu a redefinição, ignore esta mensagem — sua senha atual continua
          válida.
        </Text>
        <Text style={footer}>Desenvolvido por GERTEC/ConsulTI · +55 (98) 98600-1270</Text>
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail
