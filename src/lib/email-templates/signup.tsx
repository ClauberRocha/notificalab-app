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

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Confirme seu e-mail para acessar o {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={badge}>{siteName}</Text>
        <Heading style={h1}>Confirme seu e-mail</Heading>
        <Text style={text}>
          Sua conta no{' '}
          <Link href={siteUrl} style={link}>
            <strong>{siteName}</strong>
          </Link>{' '}
          foi criada.
        </Text>
        <Text style={text}>
          Para ativar o acesso, confirme o endereço <strong>{recipient}</strong> clicando no
          botão abaixo:
        </Text>
        <Button style={button} href={confirmationUrl}>
          Confirmar e-mail
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
          Se você não solicitou este acesso, ignore esta mensagem.
        </Text>
        <Text style={footer}>Desenvolvido por GERTEC/ConsulTI · +55 (98) 98600-1270</Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail
