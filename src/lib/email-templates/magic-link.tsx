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

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({ siteName, confirmationUrl }: MagicLinkEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Seu link de acesso ao {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={badge}>{siteName}</Text>
        <Heading style={h1}>Seu link de acesso</Heading>
        <Text style={text}>Use o botão abaixo para entrar no sistema:</Text>
        <Button style={button} href={confirmationUrl}>
          Entrar agora
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
          O link expira em pouco tempo e só pode ser usado uma vez. Se não foi você que
          solicitou, ignore esta mensagem.
        </Text>
        <Text style={footer}>Desenvolvido por GERTEC/ConsulTI · +55 (98) 98600-1270</Text>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail
